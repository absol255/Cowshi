import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { USER_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { clearFailures, lockedFor, recordFailure } from "@/lib/rate-limit";
import { toPublicUser, withStore } from "@/lib/store";

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Sign a bettor in. The password is the `User`'s bank_account_number.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" || typeof body.password === "number" ? String(body.password).trim() : "";

  const key = `user:${username.toLowerCase()}`;
  const wait = lockedFor(key);
  if (wait > 0) {
    return NextResponse.json({ error: `Too many attempts. Try again in ${wait}s.` }, { status: 429 });
  }

  const user = await withStore(
    (store) =>
      store.users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.username !== "market_maker") ??
      null,
  );
  const ok = user !== null && /^\d+$/.test(password) && sameText(password, String(user.bank_account_number));
  if (!ok || !user) {
    recordFailure(key);
    return NextResponse.json({ error: "Wrong username or account number" }, { status: 401 });
  }

  clearFailures(key);
  const jar = await cookies();
  jar.set(USER_COOKIE, signValue(String(user.id)), sessionCookieOptions());
  return NextResponse.json({ ok: true, user: toPublicUser(user) });
}

// Sign out.
export async function DELETE() {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
  return NextResponse.json({ ok: true });
}
