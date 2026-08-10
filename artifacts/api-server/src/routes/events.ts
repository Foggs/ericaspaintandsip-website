import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, bookingsTable } from "@workspace/db";
import { eq, asc, count, sql } from "drizzle-orm";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  GetEventBySlugParams,
  GetUpcomingEventsQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

function serializeEvent(event: typeof eventsTable.$inferSelect, seatsAvailable?: number | null) {
  return {
    ...event,
    price: event.price ? Number(event.price) : null,
    seatsAvailable: seatsAvailable ?? null,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
  };
}

async function getSeatsAvailable(eventId: number, capacity: number | null): Promise<number | null> {
  if (capacity == null) return null;
  const [row] = await db
    .select({ total: sql<string>`COALESCE(SUM(seats), 0)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.eventId, eventId));
  return capacity - Number(row?.total ?? 0);
}

// GET /events/upcoming — must come before /events/:id
router.get("/events/upcoming", async (req, res) => {
  const parsed = GetUpcomingEventsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 3) : 3;
  const now = new Date();

  const events = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.isPublished, true))
    .orderBy(asc(eventsTable.date));

  const upcoming = events.filter((e) => e.date >= now).slice(0, limit);
  const enriched = await Promise.all(
    upcoming.map(async (e) => serializeEvent(e, await getSeatsAvailable(e.id, e.capacity))),
  );
  res.json(enriched);
});

// GET /events/summary
// GET /events/summary — admin only (exposes business revenue/booking totals)
router.get("/events/summary", requireAdmin, async (_req, res) => {
  const now = new Date();
  const [totalRow] = await db.select({ count: count() }).from(eventsTable).where(eq(eventsTable.isPublished, true));
  const allEvents = await db.select().from(eventsTable).where(eq(eventsTable.isPublished, true));
  const upcomingCount = allEvents.filter((e) => e.date >= now).length;
  const [totalBookingsRow] = await db.select({ count: count() }).from(bookingsTable);

  const revenueRows = await db
    .select({
      price: eventsTable.price,
      seats: bookingsTable.seats,
    })
    .from(bookingsTable)
    .innerJoin(eventsTable, eq(bookingsTable.eventId, eventsTable.id))
    .where(eq(bookingsTable.status, "paid"));

  const totalRevenue = revenueRows.reduce(
    (sum, r) => sum + (r.price ? Number(r.price) * r.seats : 0),
    0,
  );

  res.json({
    totalEvents: Number(totalRow.count),
    upcomingEvents: upcomingCount,
    totalBookings: Number(totalBookingsRow.count),
    totalRevenue,
  });
});

// GET /events
router.get("/events", async (req, res) => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 12;
  const upcomingOnly = parsed.success ? parsed.data.upcoming : undefined;
  const offset = (page - 1) * limit;
  const now = new Date();

  let allEvents = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.isPublished, true))
    .orderBy(asc(eventsTable.date));

  if (upcomingOnly) {
    allEvents = allEvents.filter((e) => e.date >= now);
  }

  const total = allEvents.length;
  const page_events = allEvents.slice(offset, offset + limit);

  const enriched = await Promise.all(
    page_events.map(async (e) =>
      serializeEvent(e, await getSeatsAvailable(e.id, e.capacity)),
    ),
  );

  res.json({ data: enriched, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// POST /events — admin only
router.post("/events", requireAdmin, async (req, res) => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { title, date, price, ...rest } = parsed.data;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const [event] = await db
    .insert(eventsTable)
    .values({
      title,
      slug,
      date: new Date(date),
      price: price != null ? String(price) : null,
      ...rest,
    })
    .returning();

  res.status(201).json(serializeEvent(event, await getSeatsAvailable(event.id, event.capacity)));
});

// GET /events/:slug/by-slug — public, published events only
router.get("/events/:slug/by-slug", async (req, res) => {
  const parsed = GetEventBySlugParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.slug, parsed.data.slug))
    .limit(1);
  if (!event || !event.isPublished) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeEvent(event, await getSeatsAvailable(event.id, event.capacity)));
});

// GET /events/:id
// GET /events/:id — public, published events only
router.get("/events/:id", async (req, res) => {
  const parsed = GetEventParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, parsed.data.id))
    .limit(1);
  if (!event || !event.isPublished) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeEvent(event, await getSeatsAvailable(event.id, event.capacity)));
});

// PUT /events/:id — admin only
router.put("/events/:id", requireAdmin, async (req, res) => {
  const idParsed = GetEventParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: idParsed.error.flatten() });
    return;
  }
  const bodyParsed = CreateEventBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const { date, price, ...rest } = bodyParsed.data;
  const [event] = await db
    .update(eventsTable)
    .set({ date: new Date(date), price: price != null ? String(price) : null, ...rest })
    .where(eq(eventsTable.id, idParsed.data.id))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeEvent(event, await getSeatsAvailable(event.id, event.capacity)));
});

// DELETE /events/:id — admin only
router.delete("/events/:id", requireAdmin, async (req, res) => {
  const parsed = GetEventParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await db.delete(eventsTable).where(eq(eventsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
