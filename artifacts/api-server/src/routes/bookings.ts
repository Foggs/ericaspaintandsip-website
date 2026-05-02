import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  ListBookingsQueryParams,
  CreateBookingBody,
  GetBookingParams,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";

const router = Router();

// GET /bookings
router.get("/bookings", async (req, res) => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;
  const eventId = parsed.success ? parsed.data.eventId : undefined;
  const status = parsed.success ? parsed.data.status : undefined;

  const offset = (page - 1) * limit;

  let query = db.select().from(bookingsTable).$dynamic();

  if (eventId) query = query.where(eq(bookingsTable.eventId, eventId));
  if (status) query = query.where(eq(bookingsTable.status, status as "pending" | "paid" | "cancelled"));

  const all = await query;
  const total = all.length;
  const data = all.slice(offset, offset + limit).map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// POST /bookings
router.post("/bookings", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [booking] = await db.insert(bookingsTable).values(parsed.data).returning();
  res.status(201).json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

// GET /bookings/:id
router.get("/bookings/:id", async (req, res) => {
  const parsed = GetBookingParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parsed.data.id));
  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

// PATCH /bookings/:id
router.patch("/bookings/:id", async (req, res) => {
  const idParsed = UpdateBookingStatusParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: idParsed.error.flatten() });
    return;
  }
  const bodyParsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set({ status: bodyParsed.data.status })
    .where(eq(bookingsTable.id, idParsed.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

export default router;
