import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListPostsQueryParams,
  CreatePostBody,
  GetRecentPostsQueryParams,
  GetPostParams,
  GetPostBySlugParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

function serialize(p: typeof postsTable.$inferSelect) {
  return { ...p, createdAt: p.createdAt.toISOString() };
}

// GET /posts/recent — must come before /posts/:id
router.get("/posts/recent", async (req, res) => {
  const parsed = GetRecentPostsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 3) : 3;

  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.isPublished, true))
    .orderBy(desc(postsTable.publishedDate))
    .limit(limit);

  res.json(posts.map(serialize));
});

// GET /posts
router.get("/posts", async (req, res) => {
  const parsed = ListPostsQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 10;
  const offset = (page - 1) * limit;

  const all = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.isPublished, true))
    .orderBy(desc(postsTable.publishedDate));

  const total = all.length;
  const data = all.slice(offset, offset + limit).map(serialize);

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// POST /posts — admin only
router.post("/posts", requireAdmin, async (req, res) => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { publishedDate, ...rest } = parsed.data;
  const slug = rest.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const [post] = await db
    .insert(postsTable)
    .values({
      ...rest,
      slug,
      publishedDate: publishedDate instanceof Date
        ? publishedDate.toISOString().split("T")[0]
        : publishedDate ?? null,
    })
    .returning();
  res.status(201).json(serialize(post));
});

// GET /posts/:slug/by-slug
// GET /posts/:slug/by-slug — public, published posts only
router.get("/posts/:slug/by-slug", async (req, res) => {
  const parsed = GetPostBySlugParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.slug, parsed.data.slug))
    .limit(1);
  if (!post || !post.isPublished) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(post));
});

// GET /posts/:id
// GET /posts/:id — public, published posts only
router.get("/posts/:id", async (req, res) => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, parsed.data.id));
  if (!post || !post.isPublished) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(post));
});

// PUT /posts/:id — admin only
router.put("/posts/:id", requireAdmin, async (req, res) => {
  const idParsed = GetPostParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: idParsed.error.flatten() });
    return;
  }
  const bodyParsed = CreatePostBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const { publishedDate, ...rest } = bodyParsed.data;
  const [post] = await db
    .update(postsTable)
    .set({
      ...rest,
      publishedDate: publishedDate instanceof Date
        ? publishedDate.toISOString().split("T")[0]
        : publishedDate ?? null,
    })
    .where(eq(postsTable.id, idParsed.data.id))
    .returning();
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(post));
});

// DELETE /posts/:id — admin only
router.delete("/posts/:id", requireAdmin, async (req, res) => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await db.delete(postsTable).where(eq(postsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
