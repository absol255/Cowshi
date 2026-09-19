"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, MarketView } from "@/lib/types";

const categories: Category[] = ["Politics", "Sports", "Culture", "Campus", "Economics", "Weather"];

type Bettor = { id: number; username: string; macho_bucks: number; bank_account_number: number };

const inputClass = "w-full rounded-lg border border-line px-3 py-2";
const digits = (value: string) => value.replace(/\D/g, "").slice(0, 15);

function inTwoWeeks() {
  const d = new Date(Date.now() + 14 * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [markets, setMarkets] = useState<MarketView[]>([]);
  const [bettors, setBettors] = useState<Bettor[]>([]);

  // New market
  const [title, setTitle] = useState("");
  const [rules, setRules] = useState("");
  const [category, setCategory] = useState<Category>("Campus");
  const [startYes, setStartYes] = useState("50");
  const [closes, setCloses] = useState(inTwoWeeks());

  // New bettor
  const [newName, setNewName] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newBalance, setNewBalance] = useState("1000");

  // Edits to existing bettors, keyed by id
  const [edits, setEdits] = useState<Record<number, { account?: string; balance?: string }>>({});

  async function load() {
    const [boot, admin] = await Promise.all([
      fetch("/api/bootstrap").then((r) => r.json()),
      fetch("/api/admin").then((r) => r.json()),
    ]);
    setMarkets(boot.markets ?? []);
    setAuthed(Boolean(admin.admin));
    setBettors(admin.users ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function login() {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not sign in");
      return;
    }
    setPassword("");
    await load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setBettors([]);
  }

  /** Sends an admin action; returns true on success. */
  async function act(payload: Record<string, unknown>, done?: string): Promise<boolean> {
    setError("");
    setNote("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return false;
    }
    if (done) setNote(done);
    await load();
    router.refresh();
    return true;
  }

  async function createMarket() {
    const ok = await act(
      {
        action: "create",
        title,
        rules,
        category,
        yes: Number(startYes),
        close_at: closes ? new Date(`${closes}T23:59:59`).toISOString() : undefined,
      },
      "Market listed.",
    );
    if (ok) {
      setTitle("");
      setRules("");
      setStartYes("50");
      setCloses(inTwoWeeks());
    }
  }

  async function removeMarket(m: MarketView) {
    const msg =
      m.status === "resolved"
        ? `Remove "${m.title}"?`
        : `Remove "${m.title}"? Bettors get back what they paid for open orders and contracts.`;
    if (window.confirm(msg)) await act({ action: "remove_market", ticker: m.ticker }, "Market removed.");
  }

  async function removeAll() {
    if (
      window.confirm(
        "Remove ALL markets? Bettors get back what they paid for open orders and contracts. This can't be undone.",
      )
    ) {
      await act({ action: "remove_all_markets" }, "All markets removed.");
    }
  }

  async function addBettor() {
    const ok = await act(
      { action: "create_user", username: newName, bank_account_number: newAccount, macho_bucks: newBalance },
      "Bettor added.",
    );
    if (ok) {
      setNewName("");
      setNewAccount("");
      setNewBalance("1000");
    }
  }

  async function saveBettor(b: Bettor) {
    const edit = edits[b.id] ?? {};
    const ok = await act(
      { action: "update_user", id: b.id, bank_account_number: edit.account, macho_bucks: edit.balance },
      `${b.username} updated.`,
    );
    if (ok) setEdits((prev) => ({ ...prev, [b.id]: {} }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Admin</h1>
        {authed ? (
          <button type="button" onClick={logout} className="rounded-full px-3 py-2 text-sm text-muted hover:bg-surface-2">
            Sign out
          </button>
        ) : null}
      </div>

      {!authed ? (
        <form
          className="rounded-2xl border border-line bg-surface p-5"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <p className="mb-4 text-sm text-muted">
            Sign in with an <code>Admin</code> account. Bettors can’t use this page.
          </p>
          <input
            className={`mb-2 ${inputClass}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
          />
          <input
            type="password"
            className={`mb-3 ${inputClass}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
          />
          {error ? <p className="mb-2 text-sm text-no-text">{error}</p> : null}
          <button className="rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white" type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <>
          {error ? <p className="rounded-xl bg-no-soft px-4 py-3 text-sm text-no-text">{error}</p> : null}
          {note ? <p className="rounded-xl bg-yes-soft px-4 py-3 text-sm text-yes-text">{note}</p> : null}

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-semibold">List a market</h2>
            <input
              className={`mb-2 ${inputClass}`}
              placeholder="Will spicy nuggets return?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className={`mb-2 ${inputClass}`}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <textarea
              className={`mb-2 min-h-24 ${inputClass}`}
              placeholder="Resolution rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
            <div className="mb-3 grid grid-cols-2 gap-2">
              <label className="text-sm">
                Starting Yes chance (5–95%)
                <input
                  className={`mt-1 ${inputClass} font-mono`}
                  inputMode="numeric"
                  value={startYes}
                  onChange={(e) => setStartYes(digits(e.target.value).slice(0, 2))}
                />
              </label>
              <label className="text-sm">
                Closes
                <input
                  type="date"
                  className={`mt-1 ${inputClass}`}
                  value={closes}
                  onChange={(e) => setCloses(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={createMarket}
              className="rounded-xl bg-no-deep px-4 py-2 text-sm font-semibold text-white"
            >
              List market
            </button>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Markets</h2>
              {markets.length > 0 ? (
                <button type="button" onClick={removeAll} className="text-sm text-no-text hover:underline">
                  Remove all
                </button>
              ) : null}
            </div>
            {markets.length === 0 ? <p className="text-sm text-muted">No markets yet. List one above.</p> : null}
            <div className="space-y-2">
              {markets.map((m) => (
                <div key={m.ticker} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted">
                      {m.ticker} · {m.status}
                      {m.status === "resolved" ? ` · ${m.resolved_outcome}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status !== "resolved" ? (
                      <>
                        <button
                          type="button"
                          className="rounded-lg bg-yes-soft px-3 py-1 text-sm text-yes-text"
                          onClick={() => act({ action: "resolve", ticker: m.ticker, outcome: "yes" }, "Resolved Yes.")}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-no-soft px-3 py-1 text-sm text-no-text"
                          onClick={() => act({ action: "resolve", ticker: m.ticker, outcome: "no" }, "Resolved No.")}
                        >
                          No
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1 text-sm text-muted hover:bg-surface-2"
                      onClick={() => removeMarket(m)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-1 font-semibold">Bettors</h2>
            <p className="mb-3 text-sm text-muted">
              A bettor signs in with their username and bank account number (the number is their password).
            </p>
            <div className="space-y-3">
              {bettors.map((b) => {
                const edit = edits[b.id] ?? {};
                return (
                  <div key={b.id} className="rounded-xl border border-line p-3">
                    <div className="mb-2 font-medium">{b.username}</div>
                    <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                      <label className="text-xs text-muted">
                        Bank account number
                        <input
                          className={`mt-1 ${inputClass} font-mono text-sm text-foreground`}
                          inputMode="numeric"
                          value={edit.account ?? String(b.bank_account_number)}
                          onChange={(e) =>
                            setEdits((prev) => ({ ...prev, [b.id]: { ...prev[b.id], account: digits(e.target.value) } }))
                          }
                        />
                      </label>
                      <label className="text-xs text-muted">
                        Macho Bucks
                        <input
                          className={`mt-1 ${inputClass} font-mono text-sm text-foreground`}
                          inputMode="decimal"
                          value={edit.balance ?? String(b.macho_bucks)}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [b.id]: { ...prev[b.id], balance: e.target.value.replace(/[^0-9.]/g, "") },
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => saveBettor(b)}
                        className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-line p-3">
              <div className="mb-2 text-sm font-medium">Add a bettor</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  className={inputClass}
                  placeholder="username"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  className={`${inputClass} font-mono`}
                  placeholder="account no. (4+ digits)"
                  inputMode="numeric"
                  value={newAccount}
                  onChange={(e) => setNewAccount(digits(e.target.value))}
                />
                <input
                  className={`${inputClass} font-mono`}
                  placeholder="Macho Bucks"
                  inputMode="decimal"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <button
                type="button"
                onClick={addBettor}
                className="mt-2 rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white"
              >
                Add bettor
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
