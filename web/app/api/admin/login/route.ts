import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearFailures, lockedFor, recordFailure } from "@/lib/rate-limit";
import { withStore } from "@/lib/store";

const nextAdminId = (admins: { id: number }[]) => Math.max(0, ...admins.map((a) => a.id)) + 1;

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Signs in an `Admin` record (see models.Admin). Bettors (`User`) can't use this route.
//
// Admins are rows in the `admins` table (models.Admin); their password_hash is checked as-is.
// On top of that, when ADMIN_PASSWORD is set it is the password for the ADMIN_USERNAME account
// (default "admin"): the row is created or refreshed to match it, so changing the variable
// (and redeploying) changes the password.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const envPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
  const envAdmin = (process.env.ADMIN_USERNAME ?? "").trim() || "admin";

  const key = `admin:${username.toLowerCase()}`;
  const wait = lockedFor(key);
  if (wait > 0) {
    return NextResponse.json({ error: `Too many attempts. Try again in ${wait}s.` }, { status: 429 });
  }

  const outcome = await withStore((store) => {
    const existing = store.admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
    if (envPassword && username.toLowerCase() === envAdmin.toLowerCase()) {
      if (!sameText(password.trim(), envPassword)) return { failure: "wrong ADMIN_PASSWORD" } as const;
      if (!existing) {
        const created = { id: nextAdminId(store.admins), username: envAdmin, password_hash: hashPassword(envPassword) };
        store.admins.push(created);
        return { id: created.id };
      }
      if (!verifyPassword(envPassword, existing.password_hash)) {
        existing.password_hash = hashPassword(envPassword);
      }
      return { id: existing.id };
    }
    if (!existing) return { failure: `no admin named "${username}" in the admins table` } as const;
    if (!password || !verifyPassword(password, existing.password_hash)) {
      return { failure: "password does not match password_hash" } as const;
    }
    return { id: existing.id };
  });

  if ("failure" in outcome) {
    // Only server logs (Vercel -> Logs) say why; the browser just gets a generic message.
    console.warn(`[cowshi] admin sign-in failed for "${username}": ${outcome.failure}`);
    recordFailure(key);
    return NextResponse.json({ error: "Wrong admin username or password" }, { status: 401 });
  }
  clearFailures(key);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signValue(String(outcome.id)), sessionCookieOptions());
  return NextResponse.json({ ok: true });
}

// Sign out.
export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
