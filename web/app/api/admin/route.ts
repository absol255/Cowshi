import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { nextId, removeMarket, resolveMarket } from "@/lib/engine";
import { seedBook } from "@/lib/seed";
import { withStore } from "@/lib/store";
import type { Category, Side } from "@/lib/types";

const CATEGORIES: Category[] = ["Politics", "Sports", "Culture", "Campus", "Economics", "Weather"];
const round2 = (n: number) => Math.round(n * 100) / 100;

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ admin: false });
  // Admins can see bettors' bank account numbers (their passwords); nobody else can.
  const users = await withStore((store) =>
    store.users
      .filter((u) => u.username !== "market_maker")
      .map((u) => ({
        id: u.id,
        username: u.username,
        macho_bucks: u.macho_bucks,
        bank_account_number: u.bank_account_number,
      })),
  );
  return NextResponse.json({ admin: true, users });
}

type Body = {
  action?: "resolve" | "create" | "remove_market" | "remove_all_markets" | "create_user" | "update_user";
  ticker?: string;
  outcome?: Side;
  title?: string;
  category?: Category;
  rules?: string;
  yes?: number;
  close_at?: string;
  id?: number;
  username?: string;
  bank_account_number?: number | string;
  macho_bucks?: number | string;
};

function parseAccount(value: unknown): number {
  const text = String(value ?? "").trim();
  if (!/^\d{4,15}$/.test(text)) throw new Error("Bank account number must be 4 to 15 digits");
  return Number(text);
}

function parseBalance(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) throw new Error("Macho Bucks must be a number from 0 to 1,000,000,000");
  return round2(n);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as Body;

  try {
    const result = await withStore((store) => {
      switch (body.action) {
        case "resolve": {
          if (!body.ticker || !body.outcome) throw new Error("Need ticker and outcome");
          resolveMarket(store, body.ticker, body.outcome);
          return { ok: true };
        }

        case "create": {
          const title = (body.title ?? "").trim();
          const rules = (body.rules ?? "").trim();
          if (!title || !body.category || !rules) throw new Error("Title, category and rules are required");
          if (title.length > 140) throw new Error("Title is too long (140 characters max)");
          if (!CATEGORIES.includes(body.category)) throw new Error("Unknown category");
          const yes = Math.round(Math.min(95, Math.max(5, Number(body.yes ?? 50) || 50)));
          const close = body.close_at ? new Date(body.close_at) : new Date(Date.now() + 14 * 86_400_000);
          if (Number.isNaN(close.getTime())) throw new Error("Close date is not valid");
          if (close.getTime() <= Date.now()) throw new Error("Close date must be in the future");

          const eventId = nextId(store);
          let slug = title
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          if (slug.length > 24) {
            // Shorten on a word boundary so tickers don't end mid-word.
            slug = slug.slice(0, 24);
            const cut = slug.lastIndexOf("-");
            if (cut > 8) slug = slug.slice(0, cut);
          }
          const ticker = `${slug || "MKT"}-${eventId}`;
          store.events.push({
            id: eventId,
            slug: ticker.toLowerCase(),
            title,
            category: body.category,
            subtitle: "Listed by admin",
          });
          store.markets.push({
            id: nextId(store),
            ticker,
            event_id: eventId,
            title,
            rules,
            status: "open",
            yes_price_cents: yes,
            volume_macho_bucks: 0,
            close_at: close.toISOString(),
            resolved_outcome: null,
            history: [{ t: Date.now(), yes_cents: yes }],
          });
          const mm = store.users.find((u) => u.username === "market_maker");
          if (mm) seedBook(store, ticker, yes, mm.id);
          return { ok: true, ticker };
        }

        case "remove_market": {
          if (!body.ticker) throw new Error("Need a ticker");
          removeMarket(store, body.ticker);
          return { ok: true };
        }

        case "remove_all_markets": {
          for (const ticker of store.markets.map((m) => m.ticker)) removeMarket(store, ticker);
          return { ok: true };
        }

        case "create_user": {
          const username = (body.username ?? "").trim();
          if (!/^[A-Za-z0-9_-]{3,24}$/.test(username)) {
            throw new Error("Username must be 3 to 24 letters, numbers, _ or -");
          }
          if (username.toLowerCase() === "market_maker" || store.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
            throw new Error("That username is taken");
          }
          store.users.push({
            id: nextId(store),
            username,
            macho_bucks: parseBalance(body.macho_bucks ?? 1000),
            bank_account_number: parseAccount(body.bank_account_number),
            created_at: new Date().toISOString(),
          });
          return { ok: true };
        }

        case "update_user": {
          const user = store.users.find((u) => u.id === body.id && u.username !== "market_maker");
          if (!user) throw new Error("Unknown bettor");
          if (body.bank_account_number !== undefined && String(body.bank_account_number).trim() !== "") {
            user.bank_account_number = parseAccount(body.bank_account_number);
          }
          if (body.macho_bucks !== undefined && String(body.macho_bucks).trim() !== "") {
            user.macho_bucks = parseBalance(body.macho_bucks);
          }
          return { ok: true };
        }

        default:
          throw new Error("Unknown action");
      }
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
