"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMb } from "@/lib/format";
import type { User } from "@/lib/types";

type Option = { id: number; username: string };

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/bootstrap")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setUsers(data.users ?? []);
      })
      .catch(() => undefined);
  }, [pathname]);

  async function switchUser(id: string) {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(id) }),
    });
    router.refresh();
    const data = await fetch("/api/bootstrap").then((r) => r.json());
    setUser(data.user);
  }

  const nav = [
    { href: "/", label: "Markets" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-yes to-no text-sm text-white">
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
                pathname === item.href ? "bg-[#eef7fd] text-yes-deep" : "text-slate-600 hover:bg-slate-50"
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
            className="w-full rounded-full border border-line bg-[#f7fbff] px-4 py-2 text-sm outline-none focus:border-yes"
          />
        </form>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Macho Bucks</div>
            <div className="font-mono text-sm font-semibold">{user ? formatMb(user.macho_bucks) : "—"}</div>
          </div>
          <select
            value={user?.id ?? ""}
            onChange={(e) => switchUser(e.target.value)}
            className="rounded-full border border-line bg-white px-3 py-2 text-sm"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
