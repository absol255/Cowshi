import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { hashPassword } from "@/lib/seed";
import { withStore } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const ok = await withStore((store) => {
    const admin = store.admins.find((a) => a.username === body.username);
    return Boolean(admin && body.password && admin.password_hash === hashPassword(body.password));
  });
  if (!ok) return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/" });
  return NextResponse.json({ ok: true });
}
