import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, sessionCookieOptions, signValue } from "@/lib/auth";
import { withStore } from "@/lib/store";


// Signs a bettor in as one of the `User` records (see models.User).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { userId?: number };
  const user = await withStore((store) => store.users.find((u) => u.id === body.userId));
  if (!user || user.username === "market_maker") {
    return NextResponse.json({ error: "Unknown trader" }, { status: 400 });
  }
  const jar = await cookies();
  jar.set(USER_COOKIE, signValue(String(user.id)), sessionCookieOptions());
  return NextResponse.json({ ok: true, user });
}
