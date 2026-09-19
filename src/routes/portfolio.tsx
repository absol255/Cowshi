import { Link, createFileRoute } from "@tanstack/react-router";
import { getPortfolio } from "@/lib/cowshi/api";
import { formatCents, formatMb } from "@/lib/cowshi/format";
import { BankLoginForm } from "@/components/bank-login";

export const Route = createFileRoute("/portfolio")({
  loader: () => getPortfolio(),
  component: PortfolioPage,
});

function PortfolioPage() {
  const data = Route.useLoaderData();
  if (!data.user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-5">
        <h1 className="mb-2 text-2xl font-semibold">Portfolio</h1>
        <p className="mb-4 text-sm text-muted">
          Log in with your bank account number to see Macho Bucks, positions, and fills.
        </p>
        <BankLoginForm />
      </div>
    );
  }
  const { user, positions, openOrders, trades, markets } = data;
  const titleFor = (ticker: string) => markets.find((m) => m.ticker === ticker)?.title ?? ticker;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <Card label="Macho Bucks" value={formatMb(user.macho_bucks)} />
        <Card label="Bank account" value={String(user.bank_account_number)} />
        <Card label="Open orders" value={String(openOrders.length)} />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-semibold">Positions</h2>
        {positions.length === 0 ? (
          <p className="text-sm text-muted">No contracts yet. Buy Yes or No from any market.</p>
        ) : (
          <div className="space-y-2">
            {positions.map((p) => (
              <Link
                key={p.id}
                to="/markets/$ticker"
                params={{ ticker: p.ticker }}
                className="flex flex-wrap items-center justify-between rounded-xl border border-line px-3 py-3 hover:bg-surface-2"
              >
                <div>
                  <div className="font-medium">{titleFor(p.ticker)}</div>
                  <div className="font-mono text-xs text-muted-2">{p.ticker}</div>
                </div>
                <div className="text-sm">
                  <span className="mr-4 text-yes-text tabular-nums">
                    {p.yes_contracts} Yes @ {formatCents(Math.round(p.avg_yes_cents))}
                  </span>
                  <span className="text-no-text tabular-nums">
                    {p.no_contracts} No @ {formatCents(Math.round(p.avg_no_cents))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-semibold">Working orders</h2>
        {openOrders.length === 0 ? (
          <p className="text-sm text-muted">No resting bids.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {openOrders.map((o) => (
              <li key={o.id} className="flex justify-between border-b border-line py-2">
                <span>
                  {o.side.toUpperCase()} {o.ticker}
                </span>
                <span className="font-mono tabular-nums">
                  {o.remaining} @ {formatCents(o.price_cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-semibold">Recent fills</h2>
        {trades.length === 0 ? (
          <p className="text-sm text-muted">No trades yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {trades.map((t) => (
              <li key={t.id} className="flex justify-between border-b border-line py-2">
                <span>
                  {t.side.toUpperCase()} {t.ticker}
                </span>
                <span className="font-mono tabular-nums">
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
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
