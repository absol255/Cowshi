"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, MarketView } from "@/lib/types";

const categories: Category[] = ["Politics", "Sports", "Culture", "Campus", "Economics", "Weather"];

export default function AdminPage() {
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
    const data = await fetch("/api/bootstrap").then((r) => r.json());
    setMarkets(data.markets ?? []);
  }

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((data) => setAuthed(Boolean(data.admin)))
      .catch(() => undefined);
    load();
  }, []);

  async function login() {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError("Invalid admin login");
      return;
    }
    setAuthed(true);
  }

  async function resolve(ticker: string, outcome: "yes" | "no") {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", ticker, outcome }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Resolve failed");
      return;
    }
    await load();
    router.refresh();
  }

  async function createMarket() {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", title, rules, category, yes: 50 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not list market");
      return;
    }
    setTitle("");
    setRules("");
    await load();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Admin</h1>
      {!authed ? (
        <form
          className="rounded-2xl border border-line bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <p className="mb-4 text-sm text-slate-600">
            Admins come from <code>models.py</code>. Demo login is <strong>admin / cowshi</strong>.
          </p>
          <input
            className="mb-2 w-full rounded-lg border border-line px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
          <input
            type="password"
            className="mb-3 w-full rounded-lg border border-line px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          {error ? <p className="mb-2 text-sm text-no-deep">{error}</p> : null}
          <button className="rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white" type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <>
          <section className="rounded-2xl border border-line bg-white p-5">
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
              onClick={createMarket}
              className="rounded-xl bg-no-deep px-4 py-2 text-sm font-semibold text-white"
            >
              List market
            </button>
          </section>
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 font-semibold">Resolve</h2>
            {error ? <p className="mb-2 text-sm text-no-deep">{error}</p> : null}
            <div className="space-y-2">
              {markets.map((m) => (
                <div key={m.ticker} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-slate-500">
                      {m.ticker} · {m.status}
                    </div>
                  </div>
                  {m.status === "open" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#e7f6fd] px-3 py-1 text-sm text-yes-deep"
                        onClick={() => resolve(m.ticker, "yes")}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[#fde8f1] px-3 py-1 text-sm text-no-deep"
                        onClick={() => resolve(m.ticker, "no")}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm capitalize text-slate-500">{m.resolved_outcome}</span>
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
