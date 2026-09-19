import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { getMarketPage } from "@/lib/cowshi/api";
import { PriceChart } from "@/components/charts";
import { OrderBook } from "@/components/order-book";
import { TradeTicket } from "@/components/trade-ticket";
import { formatCents, formatVolume } from "@/lib/cowshi/format";

export const Route = createFileRoute("/markets/$ticker")({
  loader: async ({ params }) => {
    const data = await getMarketPage({ data: { ticker: params.ticker } });
    if (!data) throw notFound();
    return data;
  },
  notFoundComponent: MarketNotFound,
  component: MarketPage,
});

function MarketNotFound() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-10 text-center">
      <h1 className="text-2xl font-semibold">Market not found</h1>
      <p className="mt-2 text-muted">That ticker is not on the Cowshi book.</p>
    </div>
  );
}

function MarketPage() {
  const { market, position, related, user } = Route.useLoaderData();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-sm text-muted">
            {market.event.category} · {market.event.title}
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{market.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-yes-soft px-3 py-1 font-semibold text-yes-text tabular-nums">
              Yes {formatCents(market.yes_price_cents)}
            </span>
            <span className="rounded-full bg-no-soft px-3 py-1 font-semibold text-no-text tabular-nums">
              No {formatCents(market.no_price_cents)}
            </span>
            <span className="text-muted tabular-nums">{formatVolume(market.volume_macho_bucks)} vol</span>
            <span className="font-mono text-muted-2">{market.ticker}</span>
          </div>
          <div className="mt-4">
            <PriceChart history={market.history} />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-semibold">Order book</h2>
          <OrderBook yes={market.yes_bids} no={market.no_bids} />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-2 font-semibold">Market rules</h2>
          <p className="text-sm leading-6 text-muted">{market.rules}</p>
          <p className="mt-3 text-xs text-muted">
            Closes {new Date(market.close_at).toLocaleString()}. Status: {market.status}
            {market.resolved_outcome ? ` · resolved ${market.resolved_outcome}` : ""}.
          </p>
          {related.length ? (
            <div className="mt-4 text-sm">
              Related:{" "}
              {related.map((r) => (
                <Link
                  key={r.ticker}
                  to="/markets/$ticker"
                  params={{ ticker: r.ticker }}
                  className="mr-3 text-yes-text underline"
                >
                  {r.ticker}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <TradeTicket market={market} position={position} user={user} />
    </div>
  );
}
