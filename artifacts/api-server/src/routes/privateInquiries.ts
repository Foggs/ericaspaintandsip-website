import { Router } from "express";
import { db } from "@workspace/db";
import { privateInquiriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListPrivateInquiriesQueryParams,
  CreatePrivateInquiryBody,
  GetPrivateInquiryParams,
  DeletePrivateInquiryParams,
} from "@workspace/api-zod";

const router = Router();

function serialize(i: typeof privateInquiriesTable.$inferSelect) {
  return { ...i, createdAt: i.createdAt.toISOString() };
}

// GET /private-inquiries
router.get("/private-inquiries", async (req, res) => {
  const parsed = ListPrivateInquiriesQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;
  const offset = (page - 1) * limit;

  const all = await db.select().from(privateInquiriesTable);
  const total = all.length;
  const data = all.slice(offset, offset + limit).map(serialize);

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// POST /private-inquiries
router.post("/private-inquiries", async (req, res) => {
  const parsed = CreatePrivateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { preferredDate, ...rest } = parsed.data;
  const [inquiry] = await db
    .insert(privateInquiriesTable)
    .values({
      ...rest,
      preferredDate: preferredDate instanceof Date
        ? preferredDate.toISOString().split("T")[0]
        : preferredDate ?? null,
    })
    .returning();
  res.status(201).json(serialize(inquiry));
});

// GET /private-inquiries/:id
router.get("/private-inquiries/:id", async (req, res) => {
  const parsed = GetPrivateInquiryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [inquiry] = await db
    .select()
    .from(privateInquiriesTable)
    .where(eq(privateInquiriesTable.id, parsed.data.id));
  if (!inquiry) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(inquiry));
});

// DELETE /private-inquiries/:id
router.delete("/private-inquiries/:id", async (req, res) => {
  const parsed = DeletePrivateInquiryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await db.delete(privateInquiriesTable).where(eq(privateInquiriesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
