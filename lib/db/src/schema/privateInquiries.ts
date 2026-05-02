import { pgTable, serial, text, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const privateInquiriesTable = pgTable("private_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  preferredDate: date("preferred_date"),
  guestCount: integer("guest_count"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrivateInquirySchema = createInsertSchema(privateInquiriesTable).omit({ id: true, createdAt: true });
export type InsertPrivateInquiry = z.infer<typeof insertPrivateInquirySchema>;
export type PrivateInquiry = typeof privateInquiriesTable.$inferSelect;
