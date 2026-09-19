"use client";

import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { centsToMb, formatCents, formatMb } from "@/lib/cowshi/format";
import {
  MIN_BET_MB,
  contractsForAmount,
  digitsOnlyInput,
  validateBetAmount,
  validateContracts,
} from "@/lib/cowshi/rules";
import { placeTrade } from "@/lib/cowshi/api";
import type { MarketView, Position, Side, User } from "@/lib/cowshi/types";
import { BankLoginForm } from "./bank-login";

type Action = "buy" | "sell";

/** Where the limit starts: the quoted price when buying, the best bid when selling. */
function defaultLimit(market: MarketView, action: Action, side: Side): number {
  const price = side === "yes" ? market.yes_price_cents : market.no_price_cents;
  if (action === "buy") return price;
  const bids = side === "yes" ? market.yes_bids : market.no_bids;
  return bids[0]?.price_cents ?? price;
}

export function TradeTicket({
  market,
  position,
  user,
}: {
  market: MarketView;
  position: Position | null;
  user: User | null;
}) {
  const router = useRouter();
  const [action, setAction] = useState<Action>("buy");
  const [side, setSide] = useState<Side>("yes");
  const [amountText, setAmountText] = useState(String(MIN_BET_MB * 5));
  const [qtyText, setQtyText] = useState("1");
  const [limit, setLimit] = useState(defaultLimit(market, "buy", "yes"));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const amount = amountText === "" ? NaN : Number(amountText);
  const qty = qtyText === "" ? NaN : Number(qtyText);

  const inputProblem = action === "buy" ? validateBetAmount(amount) : validateContracts(qty);
  const contracts = action === "buy" && !inputProblem ? contractsForAmount(amount, limit) : 0;
  const tooSmall = action === "buy" && !inputProblem && contracts < 1;
  const cost = centsToMb(limit, action === "buy" ? contracts : qty);
  const valid = !inputProblem && !tooSmall;
  const signedIn = Boolean(user);

  function pick(nextAction: Action, nextSide: Side) {
    setAction(nextAction);
    setSide(nextSide);
    setLimit(defaultLimit(market, nextAction, nextSide));
    setError("");
    setNotice("");
  }

  async function submit() {
    if (!signedIn) {
      setError("Log in with your bank account number to bet");
      return;
    }
    if (!valid) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await placeTrade({
        data: {
          ticker: market.ticker,
          action,
          side,
          price_cents: limit,
          ...(action === "buy" ? { amount } : { quantity: qty }),
        },
      });
      setNotice(
        action === "buy"
          ? `Order placed for ${data.filled} contracts (${formatMb(data.spent)}).`
          : `Sold ${data.filled} contracts for ${formatMb(data.proceeds ?? 0)}.`,
      );
      window.dispatchEvent(new Event("cowshi:refresh"));
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setBusy(false);
    }
  }

  const yesLabel = defaultLimit(market, action, "yes");
  const noLabel = defaultLimit(market, action, "no");

  return (
    <aside className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-3 grid grid-cols-2 rounded-xl bg-background p-1 text-sm font-medium">
        {(["buy", "sell"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => pick(item, side)}
            className={`rounded-lg py-2 capitalize ${action === item ? "bg-surface-2 shadow-sm" : "text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => pick(action, "yes")}
          className={`rounded-xl border px-3 py-3 text-left ${
            side === "yes" ? "border-yes bg-yes-soft" : "border-line"
          }`}
        >
          <div className="text-xs text-muted">Yes</div>
          <div className="text-lg font-semibold text-yes-text tabular-nums">{formatCents(yesLabel)}</div>
        </button>
        <button
          type="button"
          onClick={() => pick(action, "no")}
          className={`rounded-xl border px-3 py-3 text-left ${
            side === "no" ? "border-no bg-no-soft" : "border-line"
          }`}
        >
          <div className="text-xs text-muted">No</div>
          <div className="text-lg font-semibold text-no-text tabular-nums">{formatCents(noLabel)}</div>
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
            className="w-full accent-no-text"
          />
          <span className="w-12 font-mono tabular-nums">{formatCents(limit)}</span>
        </div>
      </label>

      {action === "buy" ? (
        <label className="mb-3 block text-sm">
          Bet (Macho Bucks)
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={amountText}
            onChange={(e) => setAmountText(digitsOnlyInput(e.target.value, 9))}
            aria-invalid={Boolean(inputProblem)}
            aria-describedby="bet-hint"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono tabular-nums"
          />
          <span id="bet-hint" className={`mt-1 block text-xs ${inputProblem ? "text-no-text" : "text-muted"}`}>
            {inputProblem ?? `Whole numbers only. Minimum bet is ${MIN_BET_MB} Macho Buck.`}
          </span>
        </label>
      ) : (
        <label className="mb-3 block text-sm">
          Contracts to sell
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={qtyText}
            onChange={(e) => setQtyText(digitsOnlyInput(e.target.value, 9))}
            aria-invalid={Boolean(inputProblem)}
            aria-describedby="qty-hint"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono tabular-nums"
          />
          <span id="qty-hint" className={`mt-1 block text-xs ${inputProblem ? "text-no-text" : "text-muted"}`}>
            {inputProblem ?? "Whole contracts only."}
          </span>
        </label>
      )}

      {action === "buy" ? (
        <div className="mb-4 space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Contracts</span>
            <span className="font-mono tabular-nums">{valid ? contracts : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Max cost</span>
            <span className="font-semibold tabular-nums">{valid ? formatMb(cost) : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Pays if {side === "yes" ? "Yes" : "No"} wins</span>
            <span className="font-semibold tabular-nums">{valid ? formatMb(contracts) : "—"}</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-muted">Proceeds</span>
          <span className="font-semibold tabular-nums">{valid ? formatMb(cost) : "—"}</span>
        </div>
      )}

      {position ? (
        <div className="mb-4 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
          Position: {position.yes_contracts} Yes · {position.no_contracts} No
        </div>
      ) : null}
      {tooSmall ? <div className="mb-3 text-sm text-no-text">That bet is too small at this price.</div> : null}
      {error ? <div className="mb-3 text-sm text-no-text">{error}</div> : null}
      {notice ? <div className="mb-3 text-sm text-yes-text">{notice}</div> : null}

      {signedIn ? (
        <button
          type="button"
          disabled={busy || !valid || market.status !== "open"}
          onClick={submit}
          className={`min-h-11 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${
            side === "yes" ? "bg-yes-deep" : "bg-no-deep"
          }`}
        >
          {busy ? "Working…" : `${action === "buy" ? "Bet on" : "Sell"} ${side === "yes" ? "Yes" : "No"}`}
        </button>
      ) : (
        <div className="rounded-xl border border-line bg-background p-3">
          <BankLoginForm compact />
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-muted">
        Winning contracts pay 1.00 Macho Buck. Prices are cents of one Macho Buck. Bets are whole Macho Bucks, minimum{" "}
        {MIN_BET_MB}. You have to be signed in with a bank account number to place one.
      </p>
    </aside>
  );
}
