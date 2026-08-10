import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

/**
 * Admin allowlist — comma-separated Clerk user IDs in ADMIN_USER_IDS.
 * If the env var is empty or missing, NO user is granted admin access (fail-secure).
 *
 * After signing in to the admin panel for the first time, copy your Clerk
 * user ID from the /admin/me endpoint and add it to the ADMIN_USER_IDS secret.
 */
const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (adminUserIds.length === 0 || !adminUserIds.includes(userId)) {
    res.status(403).json({ error: "Forbidden — not in admin allowlist" });
    return;
  }

  next();
}
