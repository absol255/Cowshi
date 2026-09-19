"use client";

import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatMb } from "@/lib/cowshi/format";
import { getBootstrap, logoutBettorFn } from "@/lib/cowshi/api";
import type { User } from "@/lib/cowshi/types";

const nav = [
  { to: "/", label: "Markets" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/admin", label: "Admin" },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = () =>
      getBootstrap()
        .then((data) => setUser(data.user))
        .catch(() => undefined);
    load();
    window.addEventListener("cowshi:refresh", load);
    return () => window.removeEventListener("cowshi:refresh", load);
  }, [pathname]);

  async function signOut() {
    await logoutBettorFn();
    setUser(null);
    window.dispatchEvent(new Event("cowshi:refresh"));
    await router.invalidate();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 md:gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-yes to-no text-sm font-semibold text-background">
            C
          </span>
          <span>Cowshi</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  active ? "bg-yes-soft text-yes-text" : "text-muted hover:bg-surface-2"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form
          className="ml-auto hidden min-w-[180px] flex-1 max-w-md md:block"
          onSubmit={(e) => {
            e.preventDefault();
            void router.navigate({ to: "/", search: { q: query, cat: "All" } });
          }}
        >
          <input
            suppressHydrationWarning
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets, tickers, events"
            className="w-full rounded-full border border-line bg-surface-2 px-4 py-2 text-sm outline-none focus:border-yes"
          />
        </form>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {user ? (
            <>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wide text-muted">Macho Bucks</div>
                <div className="font-mono text-sm font-semibold tabular-nums">{formatMb(user.macho_bucks)}</div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-[11px] uppercase tracking-wide text-muted">{user.username}</div>
                <div className="font-mono text-xs text-muted-2 tabular-nums">#{user.bank_account_number}</div>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="min-h-11 rounded-full border border-line bg-surface px-3 py-2 text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center rounded-full bg-yes-deep px-4 py-2 text-sm font-semibold text-white"
            >
              Log in to bet
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-1 md:hidden">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`min-h-11 shrink-0 rounded-full px-3 py-2 text-sm ${
                active ? "bg-yes-soft text-yes-text" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
