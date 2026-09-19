import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { toPublicUser, withStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const payload = await withStore((store) => {
    const positions = store.positions.filter(
      (p) => p.user_id === user.id && (p.yes_contracts > 0 || p.no_contracts > 0),
    );
    const openOrders = store.orders.filter((o) => o.user_id === user.id && o.status === "open");
    const trades = store.trades.filter((t) => t.user_id === user.id).slice(-30).reverse();
    const fresh = store.users.find((u) => u.id === user.id);
    return { user: fresh ? toPublicUser(fresh) : null, positions, openOrders, trades, markets: store.markets };
  });
  return NextResponse.json(payload);
}
