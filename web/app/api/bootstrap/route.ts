import { NextResponse } from "next/server";
import { listMarketViews, withStore } from "@/lib/store";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  const payload = await withStore((store) => ({
    user,
    users: store.users
      .filter((u) => u.username !== "market_maker")
      .map((u) => ({ id: u.id, username: u.username })),
    markets: listMarketViews(store),
  }));
  return NextResponse.json(payload);
}
