import { Link, createFileRoute } from "@tanstack/react-router";
import { getMarkets } from "@/lib/cowshi/api";
import { MarketTable } from "@/components/market-table";
import { formatCents, formatVolume } from "@/lib/cowshi/format";
import type { Category } from "@/lib/cowshi/types";

const categories: Array<Category | "All"> = [
  "All",
  "Politics",
  "Sports",
  "Culture",
  "Campus",
  "Economics",
  "Weather",
];

type Search = { q?: string; cat?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
    cat: typeof search.cat === "string" ? search.cat : undefined,
  }),
  loader: () => getMarkets(),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const cat = search.cat ?? "All";
  const markets = Route.useLoaderData();
  const filtered = markets.filter((market) => {
    const hay = `${market.title} ${market.ticker} ${market.event.title}`.toLowerCase();
    const queryOk = !q || hay.includes(q.toLowerCase());
    const catOk = cat === "All" || market.event.category === cat;
    return queryOk && catOk;
  });
  const featured = markets.slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-line bg-surface px-6 py-8 md:px-10">
        <p className="text-sm font-medium text-yes-text">Prediction markets · settled in Macho Bucks</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Trade what happens next. Pay with Macho Bucks, not dollars.
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Cowshi is a Kalshi-style book for campus, sports, and culture. Yes prints in light blue. No prints in pink.
          Log in with your bank account number before you bet.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Top events</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {featured.map((market) => (
            <Link
              key={market.ticker}
              to="/markets/$ticker"
              params={{ ticker: market.ticker }}
              className="rounded-2xl border border-line bg-surface p-4 hover:border-yes"
            >
              <div className="text-xs text-muted">{market.event.category}</div>
              <div className="mt-1 line-clamp-2 min-h-12 font-medium">{market.title}</div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-yes-text tabular-nums">
                  Yes {formatCents(market.yes_price_cents)}
                </span>
                <span className="text-muted tabular-nums">{formatVolume(market.volume_macho_bucks)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link
              key={item}
              to="/"
              search={{ q, cat: item }}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                cat === item ? "border-transparent bg-no font-medium text-background" : "border-line bg-surface"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>
        <MarketTable markets={filtered} />
      </section>
    </div>
  );
}
