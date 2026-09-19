"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMb } from "@/lib/format";
import type { PublicUser } from "@/lib/types";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [query, setQuery] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = () =>
      fetch("/api/bootstrap")
        .then((r) => r.json())
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => undefined);
    load();
    // The trade ticket fires this after a fill so the balance updates right away.
    window.addEventListener("cowshi:refresh", load);
    return () => window.removeEventListener("cowshi:refresh", load);
  }, [pathname]);

  async function signIn() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The password is the user's bank account number.
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not sign in");
      return;
    }
    setUser(data.user);
    setSigningIn(false);
    setUsername("");
    setPassword("");
    router.refresh();
  }

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    setUser(null);
    router.refresh();
  }

  const nav = [
    { href: "/", label: "Markets" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-yes to-no text-sm font-semibold text-[#0a1120]">
            C
          </span>
          <span>Cowshi</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm ${
                pathname === item.href ? "bg-yes-soft text-yes-text" : "text-muted hover:bg-surface-2"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          className="ml-auto hidden min-w-[220px] flex-1 max-w-md md:block"
          action="/"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets, tickers, events"
            className="w-full rounded-full border border-line bg-surface-2 px-4 py-2 text-sm outline-none focus:border-yes"
          />
        </form>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-muted">Macho Bucks</div>
            <div className="font-mono text-sm font-semibold">{user ? formatMb(user.macho_bucks) : "—"}</div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-surface px-3 py-2 text-sm">{user.username}</span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full px-3 py-2 text-sm text-muted hover:bg-surface-2"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSigningIn((open) => !open)}
                className="rounded-full bg-yes-deep px-4 py-2 text-sm font-semibold text-white"
              >
                Sign in
              </button>
              {signingIn ? (
                <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-surface p-4 shadow-xl">
                  <div className="mb-3 text-sm font-semibold">Sign in to bet</div>
                  <label className="mb-3 block text-sm">
                    Username
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2"
                    />
                  </label>
                  <label className="mb-3 block text-sm">
                    Bank account number
                    <input
                      type="password"
                      inputMode="numeric"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && username && password) signIn();
                      }}
                      autoComplete="current-password"
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono"
                    />
                  </label>
                  {error ? <div className="mb-3 text-sm text-no-text">{error}</div> : null}
                  <button
                    type="button"
                    disabled={busy || !username || !password}
                    onClick={signIn}
                    className="w-full rounded-xl bg-yes-deep py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? "Signing in…" : "Sign in"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
