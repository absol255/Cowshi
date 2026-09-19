import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { toMarketView, withStore } from "@/lib/store";
import { PriceChart } from "@/components/charts";
import { OrderBook } from "@/components/order-book";
import { TradeTicket } from "@/components/trade-ticket";
import { formatCents, formatVolume } from "@/lib/format";

export default async function MarketPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const user = await currentUser();
  const data = await withStore((store) => {
    const market = toMarketView(store, ticker.toUpperCase());
    if (!market) return null;
    const position =
      store.positions.find((p) => p.user_id === user?.id && p.ticker === market.ticker) ?? null;
    const related = store.markets.filter((m) => m.event_id === market.event_id && m.ticker !== market.ticker);
    return { market, position, related };
  });
  if (!data) notFound();
  const { market, position, related } = data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="text-sm text-slate-500">
            {market.event.category} · {market.event.title}
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{market.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-[#e7f6fd] px-3 py-1 font-semibold text-yes-deep">
              Yes {formatCents(market.yes_price_cents)}
            </span>
            <span className="rounded-full bg-[#fde8f1] px-3 py-1 font-semibold text-no-deep">
              No {formatCents(market.no_price_cents)}
            </span>
            <span className="text-slate-500">{formatVolume(market.volume_macho_bucks)} vol</span>
            <span className="font-mono text-slate-400">{market.ticker}</span>
          </div>
          <div className="mt-4">
            <PriceChart history={market.history} />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 font-semibold">Order book</h2>
          <OrderBook yes={market.yes_bids} no={market.no_bids} />
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-2 font-semibold">Market rules</h2>
          <p className="text-sm leading-6 text-slate-600">{market.rules}</p>
          <p className="mt-3 text-xs text-slate-500">
            Closes {new Date(market.close_at).toLocaleString()}. Status: {market.status}
            {market.resolved_outcome ? ` · resolved ${market.resolved_outcome}` : ""}.
          </p>
          {related.length ? (
            <div className="mt-4 text-sm">
              Related:{" "}
              {related.map((r) => (
                <Link key={r.ticker} href={`/markets/${r.ticker}`} className="mr-3 text-yes-deep underline">
                  {r.ticker}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <TradeTicket market={market} position={position} />
    </div>
  );
}
