import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { matchBuy, matchSell } from "@/lib/engine";
import { contractsForAmount, validateBetAmount, validateContracts } from "@/lib/rules";
import { toMarketView, withStore } from "@/lib/store";
import type { Side } from "@/lib/types";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Pick a trader first" }, { status: 401 });

  let body: {
    ticker?: string;
    side?: Side;
    action?: "buy" | "sell";
    price_cents?: number;
    /** Buys: whole Macho Bucks to bet (minimum 1). */
    amount?: number;
    /** Sells: whole contracts to sell. */
    quantity?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { ticker, side, price_cents } = body;
  const action = body.action === "sell" ? "sell" : "buy";
  if (!ticker || (side !== "yes" && side !== "no")) {
    return NextResponse.json({ error: "Missing trade fields" }, { status: 400 });
  }
  if (!Number.isInteger(price_cents) || (price_cents as number) < 1 || (price_cents as number) > 99) {
    return NextResponse.json({ error: "Limit price must be a whole number of cents from 1 to 99" }, { status: 400 });
  }
  const limit = price_cents as number;

  // Betting rules: a buy is a bet of a whole number of Macho Bucks, at least 1.
  let quantity: number;
  if (action === "buy") {
    const problem = validateBetAmount(body.amount);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    quantity = contractsForAmount(body.amount as number, limit);
    if (quantity < 1) return NextResponse.json({ error: "That bet is too small at this price" }, { status: 400 });
  } else {
    const problem = validateContracts(body.quantity);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    quantity = body.quantity as number;
  }

  try {
    const result = await withStore((store) => {
      const outcome =
        action === "sell"
          ? matchSell(store, user.id, ticker, side, limit, quantity)
          : matchBuy(store, user.id, ticker, side, limit, quantity);
      const fresh = store.users.find((u) => u.id === user.id);
      return { ...outcome, user: fresh, market: toMarketView(store, ticker) };
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trade failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
