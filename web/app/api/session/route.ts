import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/auth";
import { withStore } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: number };
  const user = await withStore((store) => store.users.find((u) => u.id === body.userId));
  if (!user || user.username === "market_maker") {
    return NextResponse.json({ error: "Unknown trader" }, { status: 400 });
  }
  const jar = await cookies();
  jar.set(USER_COOKIE, String(user.id), { httpOnly: true, sameSite: "lax", path: "/" });
  return NextResponse.json({ ok: true, user });
}
