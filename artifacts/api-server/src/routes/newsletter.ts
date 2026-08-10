import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListNewsletterSubscribersQueryParams,
  SubscribeNewsletterBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// POST /newsletter/subscribe
router.post("/newsletter/subscribe", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, parsed.data.email))
    .limit(1);

  if (existing[0]) {
    res.status(409).json({ error: "Email already subscribed" });
    return;
  }

  const [subscriber] = await db
    .insert(newsletterSubscribersTable)
    .values(parsed.data)
    .returning();

  res.status(201).json({
    ...subscriber,
    subscribedAt: subscriber.subscribedAt.toISOString(),
  });
});

// GET /newsletter/subscribers
// GET /newsletter/subscribers — admin only (subscriber PII)
router.get("/newsletter/subscribers", requireAdmin, async (req, res) => {
  const parsed = ListNewsletterSubscribersQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 50;
  const offset = (page - 1) * limit;

  const all = await db.select().from(newsletterSubscribersTable);
  const total = all.length;
  const data = all
    .slice(offset, offset + limit)
    .map((s) => ({ ...s, subscribedAt: s.subscribedAt.toISOString() }));

  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export default router;
