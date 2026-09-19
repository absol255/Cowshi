"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { centsToMb, formatCents, formatMb } from "@/lib/format";
import type { MarketView, Position, Side } from "@/lib/types";

export function TradeTicket({
  market,
  position,
}: {
  market: MarketView;
  position: Position | null;
}) {
  const router = useRouter();
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [side, setSide] = useState<Side>("yes");
  const [qty, setQty] = useState(10);
  const [limit, setLimit] = useState(side === "yes" ? market.yes_price_cents : market.no_price_cents);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const cost = useMemo(() => centsToMb(limit, qty), [limit, qty]);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: market.ticker,
        action,
        side,
        price_cents: limit,
        quantity: qty,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Trade failed");
      return;
    }
    router.refresh();
  }

  return (
    <aside className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="mb-3 grid grid-cols-2 rounded-xl bg-[#f4f8fc] p-1 text-sm font-medium">
        {(["buy", "sell"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setAction(item)}
            className={`rounded-lg py-2 capitalize ${action === item ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setSide("yes");
            setLimit(market.yes_price_cents);
          }}
          className={`rounded-xl border px-3 py-3 text-left ${
            side === "yes" ? "border-yes bg-[#e7f6fd]" : "border-line"
          }`}
        >
          <div className="text-xs text-slate-500">Yes</div>
          <div className="text-lg font-semibold text-yes-deep">{formatCents(market.yes_price_cents)}</div>
        </button>
        <button
          type="button"
          onClick={() => {
            setSide("no");
            setLimit(market.no_price_cents);
          }}
          className={`rounded-xl border px-3 py-3 text-left ${
            side === "no" ? "border-no bg-[#fde8f1]" : "border-line"
          }`}
        >
          <div className="text-xs text-slate-500">No</div>
          <div className="text-lg font-semibold text-no-deep">{formatCents(market.no_price_cents)}</div>
        </button>
      </div>
      <label className="mb-3 block text-sm">
        Limit
        <div className="mt-1 flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={99}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full accent-[#e46d9a]"
          />
          <span className="w-12 font-mono">{formatCents(limit)}</span>
        </div>
      </label>
      <label className="mb-3 block text-sm">
        Contracts
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">{action === "buy" ? "Cost" : "Proceeds"}</span>
        <span className="font-semibold">{formatMb(cost)}</span>
      </div>
      {position ? (
        <div className="mb-4 rounded-lg bg-[#f7fbff] px-3 py-2 text-xs text-slate-600">
          Position: {position.yes_contracts} Yes · {position.no_contracts} No
        </div>
      ) : null}
      {error ? <div className="mb-3 text-sm text-no-deep">{error}</div> : null}
      <button
        type="button"
        disabled={busy || market.status !== "open"}
        onClick={submit}
        className={`w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${
          side === "yes" ? "bg-yes-deep" : "bg-no-deep"
        }`}
      >
        {busy ? "Working…" : `${action === "buy" ? "Buy" : "Sell"} ${side === "yes" ? "Yes" : "No"}`}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Winning contracts pay 1.00 Macho Buck. Prices are cents of one Macho Buck.
      </p>
    </aside>
  );
}
