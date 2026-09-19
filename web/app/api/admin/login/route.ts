import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clearFailures, lockedFor, recordFailure } from "@/lib/rate-limit";
import { withStore } from "@/lib/store";

// Signs in an `Admin` record (see models.Admin). Bettors (`User`) can't use this route.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
  const key = `admin:${String(body.username ?? "").toLowerCase()}`;
  const wait = lockedFor(key);
  if (wait > 0) {
    return NextResponse.json({ error: `Too many attempts. Try again in ${wait}s.` }, { status: 429 });
  }
  const admin = await withStore((store) => store.admins.find((a) => a.username === body.username) ?? null);
  const ok = Boolean(admin && body.password && verifyPassword(body.password, admin.password_hash));
  if (!ok || !admin) {
    recordFailure(key);
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }
  clearFailures(key);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signValue(String(admin.id)), sessionCookieOptions());
  return NextResponse.json({ ok: true });
}
