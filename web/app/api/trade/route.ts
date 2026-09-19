import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { matchBuy, matchSell } from "@/lib/engine";
import { toMarketView, withStore } from "@/lib/store";
import type { Side } from "@/lib/types";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Pick a trader first" }, { status: 401 });
  const body = (await request.json()) as {
    ticker?: string;
    side?: Side;
    action?: "buy" | "sell";
    price_cents?: number;
    quantity?: number;
  };
  try {
    const result = await withStore((store) => {
      if (!body.ticker || !body.side || !body.price_cents || !body.quantity) {
        throw new Error("Missing trade fields");
      }
      const outcome =
        body.action === "sell"
          ? matchSell(store, user.id, body.ticker, body.side, body.price_cents, body.quantity)
          : matchBuy(store, user.id, body.ticker, body.side, body.price_cents, body.quantity);
      const fresh = store.users.find((u) => u.id === user.id);
      return { ...outcome, user: fresh, market: toMarketView(store, body.ticker) };
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trade failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
