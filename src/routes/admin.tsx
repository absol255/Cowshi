"use client";

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminAction, getAdminStatus, getBootstrap, loginAdmin } from "@/lib/cowshi/api";
import type { Category, MarketView } from "@/lib/cowshi/types";

const categories: Category[] = ["Politics", "Sports", "Culture", "Campus", "Economics", "Weather"];

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [markets, setMarkets] = useState<MarketView[]>([]);
  const [title, setTitle] = useState("");
  const [rules, setRules] = useState("");
  const [category, setCategory] = useState<Category>("Campus");

  async function load() {
    const data = await getBootstrap();
    setMarkets(data.markets ?? []);
  }

  useEffect(() => {
    getAdminStatus()
      .then((data) => setAuthed(Boolean(data.admin)))
      .catch(() => undefined);
    load().catch(() => undefined);
  }, []);

  async function login() {
    setError("");
    try {
      await loginAdmin({ data: { username, password } });
      setAuthed(true);
    } catch {
      setError("Invalid admin login");
    }
  }

  async function resolve(ticker: string, outcome: "yes" | "no") {
    try {
      await adminAction({ data: { action: "resolve", ticker, outcome } });
      await load();
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolve failed");
    }
  }

  async function createMarket() {
    try {
      await adminAction({ data: { action: "create", title, rules, category, yes: 50 } });
      setTitle("");
      setRules("");
      await load();
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list market");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Admin</h1>
      {!authed ? (
        <form
          className="rounded-2xl border border-line bg-surface p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <p className="mb-4 text-sm text-muted">
            Sign in with an <code className="font-mono">Admin</code> account. Bettors can't use this page.
          </p>
          <input
            className="mb-2 w-full rounded-lg border border-line px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
          />
          <input
            type="password"
            className="mb-3 w-full rounded-lg border border-line px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
          />
          {error ? <p className="mb-2 text-sm text-no-text">{error}</p> : null}
          <button className="min-h-11 rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white" type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <>
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-semibold">List a market</h2>
            <input
              className="mb-2 w-full rounded-lg border border-line px-3 py-2"
              placeholder="Will spicy nuggets return?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="mb-2 w-full rounded-lg border border-line px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <textarea
              className="mb-3 min-h-24 w-full rounded-lg border border-line px-3 py-2"
              placeholder="Resolution rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void createMarket()}
              className="min-h-11 rounded-xl bg-no-deep px-4 py-2 text-sm font-semibold text-white"
            >
              List market
            </button>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-semibold">Resolve</h2>
            {error ? <p className="mb-2 text-sm text-no-text">{error}</p> : null}
            <div className="space-y-2">
              {markets.map((m) => (
                <div key={m.ticker} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted">
                      {m.ticker} · {m.status}
                    </div>
                  </div>
                  {m.status === "open" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-yes-soft px-3 py-2 text-sm text-yes-text"
                        onClick={() => void resolve(m.ticker, "yes")}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-no-soft px-3 py-2 text-sm text-no-text"
                        onClick={() => void resolve(m.ticker, "no")}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm capitalize text-muted">{m.resolved_outcome}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
