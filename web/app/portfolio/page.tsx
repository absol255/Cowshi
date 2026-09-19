import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { withStore } from "@/lib/store";
import { formatCents, formatMb } from "@/lib/format";

export default async function PortfolioPage() {
  const session = await currentUser();
  const data = await withStore((store) => {
    const user = store.users.find((u) => u.id === session?.id);
    if (!user) return null;
    const positions = store.positions.filter(
      (p) => p.user_id === user.id && (p.yes_contracts > 0 || p.no_contracts > 0),
    );
    const openOrders = store.orders.filter((o) => o.user_id === user.id && o.status === "open");
    const trades = store.trades.filter((t) => t.user_id === user.id).slice(-20).reverse();
    return { user, positions, openOrders, trades, markets: store.markets };
  });
  if (!data) return null;
  const { user, positions, openOrders, trades, markets } = data;
  const titleFor = (ticker: string) => markets.find((m) => m.ticker === ticker)?.title ?? ticker;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <Card label="Macho Bucks" value={formatMb(user.macho_bucks)} />
        <Card label="Bank account" value={String(user.bank_account_number)} />
        <Card label="Open orders" value={String(openOrders.length)} />
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 font-semibold">Positions</h2>
        {positions.length === 0 ? (
          <p className="text-sm text-slate-500">No contracts yet. Buy Yes or No from any market.</p>
        ) : (
          <div className="space-y-2">
            {positions.map((p) => (
              <Link
                key={p.id}
                href={`/markets/${p.ticker}`}
                className="flex flex-wrap items-center justify-between rounded-xl border border-line px-3 py-3 hover:bg-[#f4fbff]"
              >
                <div>
                  <div className="font-medium">{titleFor(p.ticker)}</div>
                  <div className="font-mono text-xs text-slate-400">{p.ticker}</div>
                </div>
                <div className="text-sm">
                  <span className="mr-4 text-yes-deep">{p.yes_contracts} Yes @ {formatCents(Math.round(p.avg_yes_cents))}</span>
                  <span className="text-no-deep">{p.no_contracts} No @ {formatCents(Math.round(p.avg_no_cents))}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 font-semibold">Working orders</h2>
        {openOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No resting bids.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {openOrders.map((o) => (
              <li key={o.id} className="flex justify-between border-b border-line py-2">
                <span>
                  {o.side.toUpperCase()} {o.ticker}
                </span>
                <span className="font-mono">
                  {o.remaining} @ {formatCents(o.price_cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 font-semibold">Recent fills</h2>
        {trades.length === 0 ? (
          <p className="text-sm text-slate-500">No trades yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {trades.map((t) => (
              <li key={t.id} className="flex justify-between border-b border-line py-2">
                <span>
                  {t.side.toUpperCase()} {t.ticker}
                </span>
                <span className="font-mono">
                  {t.quantity} @ {formatCents(t.price_cents)} · {formatMb(t.macho_bucks)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
