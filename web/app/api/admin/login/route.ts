import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { nextId } from "@/lib/engine";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearFailures, lockedFor, recordFailure } from "@/lib/rate-limit";
import { withStore } from "@/lib/store";

const SEEDED_ADMIN = "admin";

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Signs in an `Admin` record (see models.Admin). Bettors (`User`) can't use this route.
//
// When ADMIN_PASSWORD is set it is the password for the "admin" account, always: the stored
// hash is created or refreshed to match it, so changing the variable (and redeploying) changes
// the password even if the database was seeded earlier with a different one.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const envPassword = (process.env.ADMIN_PASSWORD ?? "").trim();

  const key = `admin:${username.toLowerCase()}`;
  const wait = lockedFor(key);
  if (wait > 0) {
    return NextResponse.json({ error: `Too many attempts. Try again in ${wait}s.` }, { status: 429 });
  }

  const adminId = await withStore((store) => {
    const existing = store.admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
    if (envPassword && username.toLowerCase() === SEEDED_ADMIN) {
      if (!sameText(password.trim(), envPassword)) return null;
      if (!existing) {
        const created = { id: nextId(store), username: SEEDED_ADMIN, password_hash: hashPassword(envPassword) };
        store.admins.push(created);
        return created.id;
      }
      if (!verifyPassword(envPassword, existing.password_hash)) {
        existing.password_hash = hashPassword(envPassword);
      }
      return existing.id;
    }
    return existing && password && verifyPassword(password, existing.password_hash) ? existing.id : null;
  });

  if (adminId === null) {
    recordFailure(key);
    return NextResponse.json({ error: "Wrong admin username or password" }, { status: 401 });
  }
  clearFailures(key);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signValue(String(adminId)), sessionCookieOptions());
  return NextResponse.json({ ok: true });
}

// Sign out.
export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
