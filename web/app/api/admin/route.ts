import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { nextId, resolveMarket } from "@/lib/engine";
import { seedBook } from "@/lib/seed";
import { withStore } from "@/lib/store";
import type { Category, Side } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ admin: await isAdmin() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }
  const body = (await request.json()) as {
    action?: "resolve" | "create";
    ticker?: string;
    outcome?: Side;
    title?: string;
    category?: Category;
    rules?: string;
    yes?: number;
  };

  try {
    const result = await withStore((store) => {
      if (body.action === "resolve") {
        if (!body.ticker || !body.outcome) throw new Error("Need ticker and outcome");
        resolveMarket(store, body.ticker, body.outcome);
        return { ok: true };
      }
      if (body.action === "create") {
        if (!body.title || !body.category || !body.rules) throw new Error("Missing market fields");
        const eventId = nextId(store);
        const ticker = `NEW-${eventId}`;
        store.events.push({
          id: eventId,
          slug: ticker.toLowerCase(),
          title: body.title,
          category: body.category,
          subtitle: "Listed by admin",
        });
        const yes = Math.min(90, Math.max(10, body.yes ?? 50));
        const close = new Date();
        close.setDate(close.getDate() + 14);
        store.markets.push({
          id: nextId(store),
          ticker,
          event_id: eventId,
          title: body.title,
          rules: body.rules,
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
      throw new Error("Unknown action");
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
