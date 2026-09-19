import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { adminError } from "@/lib/login-errors";
import { hashKind, hashPassword, verifyPassword } from "@/lib/password";
import { clearFailures, lockedFor, recordFailure } from "@/lib/rate-limit";
import { withStore } from "@/lib/store";

const nextAdminId = (admins: { id: number }[]) => Math.max(0, ...admins.map((a) => a.id)) + 1;

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

type Outcome = { id: number } | { failure: "unknown" | "password" | "unsupported"; detail: string };

// Signs in an `Admin` (a row in the `admins` table). Bettors can't use this route.
//
// The password is checked against admins.password_hash. Werkzeug hashes (scrypt / pbkdf2) work.
// If the column holds a plain-text password it is accepted once and replaced with a proper hash.
//
// On top of that, when ADMIN_PASSWORD is set it is the password for the ADMIN_USERNAME account
// (default "admin"): that row is created or refreshed to match, so this is always a way in.
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

  const outcome: Outcome = await withStore((store): Outcome => {
    const existing = store.admins.find((a) => a.username.toLowerCase() === username.toLowerCase());

    // The ADMIN_PASSWORD account.
    if (envPassword && username.toLowerCase() === envAdmin.toLowerCase() && sameText(password.trim(), envPassword)) {
      if (!existing) {
        const created = { id: nextAdminId(store.admins), username: envAdmin, password_hash: hashPassword(envPassword) };
        store.admins.push(created);
        return { id: created.id };
      }
      if (hashKind(existing.password_hash) === "plain" || !verifyPassword(envPassword, existing.password_hash)) {
        existing.password_hash = hashPassword(envPassword);
      }
      return { id: existing.id };
    }

    // Everyone else: whatever is in the admins table.
    if (!existing) return { failure: "unknown", detail: `no admin named "${username}" in the admins table` };
    const kind = hashKind(existing.password_hash);
    if (kind === "unsupported") {
      return { failure: "unsupported", detail: "password_hash is in a format this app can't read (not scrypt/pbkdf2)" };
    }
    if (kind === "plain") {
      if (password && sameText(password, existing.password_hash)) {
        existing.password_hash = hashPassword(password);
        console.warn(`[cowshi] admin "${existing.username}" had a plain-text password_hash; replaced it with a hash`);
        return { id: existing.id };
      }
      return { failure: "password", detail: "password does not match (password_hash holds plain text)" };
    }
    if (password && verifyPassword(password, existing.password_hash)) return { id: existing.id };
    return { failure: "password", detail: "password does not match password_hash" };
  });

  if ("failure" in outcome) {
    // The server log always says why. The browser gets adminError()'s message.
    console.warn(`[cowshi] admin sign-in failed for "${username}": ${outcome.detail}`);
    recordFailure(key);
    return NextResponse.json({ error: adminError(username, outcome.failure) }, { status: 401 });
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
