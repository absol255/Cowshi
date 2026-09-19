import { NextResponse } from "next/server";
import { toMarketView, withStore } from "@/lib/store";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const user = await currentUser();
  const payload = await withStore((store) => {
    const market = toMarketView(store, ticker.toUpperCase());
    if (!market) return null;
    const position =
      store.positions.find((p) => p.user_id === user?.id && p.ticker === market.ticker) ?? null;
    const trades = store.trades.filter((t) => t.ticker === market.ticker).slice(-20).reverse();
    return { market, position, trades, user };
  });
  if (!payload) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(payload);
}
