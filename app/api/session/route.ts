import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { clearFailures, lockedFor, recordFailure } from "@/lib/rate-limit";
import { bettorError } from "@/lib/login-errors";
import { toPublicUser, withStore } from "@/lib/store";

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
  // Spaces and dashes are ignored, so "1001 " and "1-0-0-1" both work. Compared as numbers.
  const typed = password.replace(/[\s-]/g, "");
  const stored = user ? Number(String(user.bank_account_number).trim()) : NaN;
  const ok = user !== null && /^\d{1,15}$/.test(typed) && Number.isInteger(stored) && Number(typed) === stored;
  if (!ok || !user) {
    console.warn(
      `[cowshi] sign-in failed for "${username}": ${user ? "bank_account_number does not match" : "no such username in the users table"}`,
    );
    recordFailure(key);
    return NextResponse.json({ error: bettorError(username, user !== null) }, { status: 401 });
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
