import { Router } from "express";
import { db } from "@workspace/db";
import { galleryPhotosTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import {
  ListGalleryPhotosQueryParams,
  CreateGalleryPhotoBody,
  GetFeaturedGalleryPhotosQueryParams,
  GetGalleryPhotoParams,
  UpdateGalleryPhotoParams,
  UpdateGalleryPhotoBody,
  DeleteGalleryPhotoParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// GET /gallery/featured — must come before /gallery/:id
router.get("/gallery/featured", async (req, res) => {
  const parsed = GetFeaturedGalleryPhotosQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 6) : 6;

  const photos = await db
    .select()
    .from(galleryPhotosTable)
    .orderBy(asc(galleryPhotosTable.sortOrder))
    .limit(limit);

  res.json(photos.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })));
});

// GET /gallery/categories
router.get("/gallery/categories", async (_req, res) => {
  const rows = await db
    .selectDistinct({ category: galleryPhotosTable.category })
    .from(galleryPhotosTable)
    .where(sql`${galleryPhotosTable.category} IS NOT NULL`);

  res.json(rows.map((r) => r.category).filter(Boolean));
});

// GET /gallery
router.get("/gallery", async (req, res) => {
  const parsed = ListGalleryPhotosQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 24;
  const category = parsed.success ? parsed.data.category : undefined;
  const offset = (page - 1) * limit;

  let all = await db
    .select()
    .from(galleryPhotosTable)
    .orderBy(asc(galleryPhotosTable.sortOrder));

  if (category) {
    all = all.filter((p) => p.category === category);
  }

  const total = all.length;
  const data = all
    .slice(offset, offset + limit)
    .map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// POST /gallery — admin only
router.post("/gallery", requireAdmin, async (req, res) => {
  const parsed = CreateGalleryPhotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [photo] = await db.insert(galleryPhotosTable).values(parsed.data).returning();
  res.status(201).json({ ...photo, createdAt: photo.createdAt.toISOString() });
});

// GET /gallery/:id
router.get("/gallery/:id", async (req, res) => {
  const parsed = GetGalleryPhotoParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [photo] = await db
    .select()
    .from(galleryPhotosTable)
    .where(eq(galleryPhotosTable.id, parsed.data.id));
  if (!photo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...photo, createdAt: photo.createdAt.toISOString() });
});

// PUT /gallery/:id — admin only
router.put("/gallery/:id", requireAdmin, async (req, res) => {
  const idParsed = UpdateGalleryPhotoParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: idParsed.error.flatten() });
    return;
  }
  const bodyParsed = UpdateGalleryPhotoBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const [photo] = await db
    .update(galleryPhotosTable)
    .set(bodyParsed.data)
    .where(eq(galleryPhotosTable.id, idParsed.data.id))
    .returning();
  if (!photo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...photo, createdAt: photo.createdAt.toISOString() });
});

// DELETE /gallery/:id — admin only
router.delete("/gallery/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteGalleryPhotoParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await db.delete(galleryPhotosTable).where(eq(galleryPhotosTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
