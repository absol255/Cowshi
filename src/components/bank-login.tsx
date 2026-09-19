"use client";

import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { loginBettor, openBettingAccount } from "@/lib/cowshi/api";
import {
  NEW_ACCOUNT_MB,
  digitsOnlyInput,
  parseBankAccountNumber,
  validateBankAccountNumber,
  validateUsername,
} from "@/lib/cowshi/rules";

function pingRefresh() {
  window.dispatchEvent(new Event("cowshi:refresh"));
}

export function BankLoginForm({
  compact = false,
  onSuccess,
}: {
  compact?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "open">("in");
  const [bankText, setBankText] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const bank = parseBankAccountNumber(bankText);
  const bankProblem = bankText === "" ? "Enter your bank account number." : validateBankAccountNumber(bank);
  const nameProblem = mode === "open" ? validateUsername(username) : null;
  const valid = !bankProblem && !nameProblem;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "open") {
        await openBettingAccount({ data: { username, bank_account_number: bank } });
      } else {
        await loginBettor({ data: { bank_account_number: bank } });
      }
      pingRefresh();
      await router.invalidate();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={compact ? "space-y-3" : "space-y-3"}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {!compact ? (
        <p className="text-sm text-muted">
          Bettors sign in with a <code className="font-mono text-foreground">User.bank_account_number</code>. You
          can't place a bet until that session is set.
        </p>
      ) : (
        <p className="text-sm text-muted">Log in with your bank account number to bet.</p>
      )}
      {mode === "open" ? (
        <label className="block text-sm">
          Handle
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="cowboy"
            autoComplete="username"
            aria-invalid={Boolean(nameProblem && username)}
          />
        </label>
      ) : null}
      <label className="block text-sm">
        Bank account number
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={bankText}
          onChange={(e) => setBankText(digitsOnlyInput(e.target.value))}
          placeholder="1001"
          aria-invalid={Boolean(bankProblem && bankText)}
          aria-describedby="bank-hint"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono tabular-nums"
        />
        <span id="bank-hint" className={`mt-1 block text-xs ${bankText && bankProblem ? "text-no-text" : "text-muted"}`}>
          {bankText && bankProblem
            ? bankProblem
            : "Whole numbers only, at least 4 digits. Demo: cowboy 1001 · milo 1002 · daisy 1003."}
        </span>
      </label>
      {mode === "open" ? (
        <p className="text-xs text-muted">
          New accounts start with {NEW_ACCOUNT_MB} Macho Bucks. The number has to be unique on the book.
        </p>
      ) : null}
      {error ? <p className="text-sm text-no-text">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !valid}
        className="min-h-11 w-full rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Working…" : mode === "open" ? "Open account" : "Log in to bet"}
      </button>
      <button
        type="button"
        className="w-full text-center text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
        onClick={() => {
          setMode(mode === "in" ? "open" : "in");
          setError("");
        }}
      >
        {mode === "in" ? "No account? Open one with a bank account number." : "Already on the book? Sign in instead."}
      </button>
    </form>
  );
}
