/**
 * Admin-only routes: return ALL records regardless of published status.
 * Every endpoint here requires the requireAdmin middleware.
 */
import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, postsTable, bookingsTable } from "@workspace/db";
import { asc, desc, sql, eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import { getAuth } from "@clerk/express";

const router = Router();

// GET /admin/me — returns any authenticated user's Clerk user ID (no admin check).
// Intentionally open so you can find your user ID BEFORE adding it to ADMIN_USER_IDS.
router.get("/admin/me", (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized — sign in first" });
    return;
  }
  res.json({ userId: auth.userId });
});

// GET /admin/events/:id — single event regardless of published status (admin only)
router.get("/admin/events/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
  if (!event) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...event,
    price: event.price ? Number(event.price) : null,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
  });
});

// GET /admin/posts/:id — single post regardless of published status (admin only)
router.get("/admin/posts/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...post,
    createdAt: post.createdAt.toISOString(),
  });
});

// GET /admin/events — all events including unpublished
router.get("/admin/events", requireAdmin, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const all = await db.select().from(eventsTable).orderBy(asc(eventsTable.date));

  const total = all.length;
  const data = all.slice(offset, offset + limit).map((e) => ({
    ...e,
    price: e.price ? Number(e.price) : null,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }));

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// GET /admin/posts — all posts including unpublished
router.get("/admin/posts", requireAdmin, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const all = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));

  const total = all.length;
  const data = all.slice(offset, offset + limit).map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export default router;
