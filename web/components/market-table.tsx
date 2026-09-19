import Link from "next/link";
import { formatCents, formatVolume } from "@/lib/format";
import type { MarketView } from "@/lib/types";
import { Sparkline } from "./charts";

export function MarketTable({ markets }: { markets: MarketView[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="hidden grid-cols-[1.6fr_90px_90px_110px_120px_90px] gap-3 border-b border-line px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 md:grid">
        <div>Market</div>
        <div>Yes</div>
        <div>No</div>
        <div>Volume</div>
        <div>24h</div>
        <div>Close</div>
      </div>
      {markets.map((market) => (
        <Link
          key={market.ticker}
          href={`/markets/${market.ticker}`}
          className="grid grid-cols-1 gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-[#f4fbff] md:grid-cols-[1.6fr_90px_90px_110px_120px_90px] md:items-center"
        >
          <div>
            <div className="text-xs text-slate-500">
              {market.event.category} · {market.event.title}
            </div>
            <div className="font-medium">{market.title}</div>
            <div className="font-mono text-xs text-slate-400">{market.ticker}</div>
          </div>
          <PriceChip side="yes" cents={market.yes_price_cents} />
          <PriceChip side="no" cents={market.no_price_cents} />
          <div className="text-sm text-slate-600">{formatVolume(market.volume_macho_bucks)}</div>
          <Sparkline history={market.history} className="h-9 w-[120px]" />
          <div className="text-sm text-slate-500">
            {new Date(market.close_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PriceChip({ side, cents }: { side: "yes" | "no"; cents: number }) {
  const yes = side === "yes";
  return (
    <div
      className={`inline-flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold ${
        yes ? "bg-[#e7f6fd] text-yes-deep" : "bg-[#fde8f1] text-no-deep"
      }`}
    >
      <span>{yes ? "Yes" : "No"}</span>
      <span>{formatCents(cents)}</span>
    </div>
  );
}
