import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { withStore } from "@/lib/store";

// Signs in an `Admin` record (see models.Admin). Bettors (`User`) can't use this route.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
  const admin = await withStore((store) => store.admins.find((a) => a.username === body.username) ?? null);
  const ok = Boolean(admin && body.password && verifyPassword(body.password, admin.password_hash));
  if (!ok || !admin) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signValue(String(admin.id)), sessionCookieOptions());
  return NextResponse.json({ ok: true });
}
