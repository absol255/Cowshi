import { NextResponse } from "next/server";
import { listMarketViews, withStore } from "@/lib/store";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  const payload = await withStore((store) => ({
    user,
    markets: listMarketViews(store),
  }));
  return NextResponse.json(payload);
}
