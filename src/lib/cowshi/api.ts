import { createServerFn } from "@tanstack/react-start";
import { contractsForAmount, validateBetAmount, validateContracts } from "./rules";
import type { Category, Side } from "./types";

export const getBootstrap = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./session.server");
  const { listMarketViews, withStore } = await import("./store.server");
  const user = await currentUser();
  return withStore((store) => ({
    user,
    markets: listMarketViews(store),
  }));
});

export const getMarkets = createServerFn({ method: "GET" }).handler(async () => {
  const { listMarketViews, withStore } = await import("./store.server");
  return withStore((store) => listMarketViews(store));
});

export const getMarketPage = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("ticker" in data) || typeof data.ticker !== "string") {
      throw new Error("Missing ticker");
    }
    return { ticker: data.ticker };
  })
  .handler(async ({ data }) => {
    const { currentUser } = await import("./session.server");
    const { toMarketView, withStore } = await import("./store.server");
    const user = await currentUser();
    return withStore((store) => {
      const market = toMarketView(store, data.ticker.toUpperCase());
      if (!market) return null;
      const position =
        user ? (store.positions.find((p) => p.user_id === user.id && p.ticker === market.ticker) ?? null) : null;
      const related = store.markets.filter((m) => m.event_id === market.event_id && m.ticker !== market.ticker);
      return { market, position, related, user };
    });
  });

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./session.server");
  const { withStore } = await import("./store.server");
  const session = await currentUser();
  if (!session) return { user: null, positions: [], openOrders: [], trades: [], markets: [] };
  return withStore((store) => {
    const user = store.users.find((u) => u.id === session.id) ?? null;
    if (!user) return { user: null, positions: [], openOrders: [], trades: [], markets: store.markets };
    const positions = store.positions.filter(
      (p) => p.user_id === user.id && (p.yes_contracts > 0 || p.no_contracts > 0),
    );
    const openOrders = store.orders.filter((o) => o.user_id === user.id && o.status === "open");
    const trades = store.trades.filter((t) => t.user_id === user.id).slice(-20).reverse();
    return { user, positions, openOrders, trades, markets: store.markets };
  });
});

export const loginBettor = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("bank_account_number" in data) ||
      typeof data.bank_account_number !== "number"
    ) {
      throw new Error("Enter your bank account number.");
    }
    return { bank_account_number: data.bank_account_number };
  })
  .handler(async ({ data }) => {
    const { loginWithBankAccount } = await import("./session.server");
    const user = await loginWithBankAccount(data.bank_account_number);
    return { ok: true as const, user };
  });

export const openBettingAccount = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid request");
    const rec = data as { username?: unknown; bank_account_number?: unknown };
    if (typeof rec.username !== "string" || typeof rec.bank_account_number !== "number") {
      throw new Error("Handle and bank account number are required.");
    }
    return { username: rec.username, bank_account_number: rec.bank_account_number };
  })
  .handler(async ({ data }) => {
    const { openAccount } = await import("./session.server");
    const user = await openAccount(data.username, data.bank_account_number);
    return { ok: true as const, user };
  });

export const logoutBettorFn = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutBettor } = await import("./session.server");
  logoutBettor();
  return { ok: true as const };
});

export const placeTrade = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid request");
    const rec = data as {
      ticker?: unknown;
      side?: unknown;
      action?: unknown;
      price_cents?: unknown;
      amount?: unknown;
      quantity?: unknown;
    };
    if (typeof rec.ticker !== "string" || (rec.side !== "yes" && rec.side !== "no")) {
      throw new Error("Missing trade fields");
    }
    if (typeof rec.price_cents !== "number") throw new Error("Limit price must be a whole number of cents from 1 to 99");
    return {
      ticker: rec.ticker,
      side: rec.side as Side,
      action: rec.action === "sell" ? ("sell" as const) : ("buy" as const),
      price_cents: rec.price_cents,
      amount: typeof rec.amount === "number" ? rec.amount : undefined,
      quantity: typeof rec.quantity === "number" ? rec.quantity : undefined,
    };
  })
  .handler(async ({ data }) => {
    const { requireBettor } = await import("./session.server");
    const { matchBuy, matchSell } = await import("./engine");
    const { toMarketView, withStore } = await import("./store.server");
    const user = await requireBettor();
    const { ticker, side, price_cents } = data;
    const action = data.action;
    if (!Number.isInteger(price_cents) || price_cents < 1 || price_cents > 99) {
      throw new Error("Limit price must be a whole number of cents from 1 to 99");
    }
    const limit = price_cents;

    let quantity: number;
    if (action === "buy") {
      const problem = validateBetAmount(data.amount);
      if (problem) throw new Error(problem);
      quantity = contractsForAmount(data.amount as number, limit);
      if (quantity < 1) throw new Error("That bet is too small at this price");
    } else {
      const problem = validateContracts(data.quantity);
      if (problem) throw new Error(problem);
      quantity = data.quantity as number;
    }

    return withStore((store) => {
      const outcome =
        action === "sell"
          ? matchSell(store, user.id, ticker, side, limit, quantity)
          : matchBuy(store, user.id, ticker, side, limit, quantity);
      const fresh = store.users.find((u) => u.id === user.id);
      const spent = "spent" in outcome ? outcome.spent : 0;
      const proceeds = "proceeds" in outcome ? outcome.proceeds : 0;
      return { filled: outcome.filled, spent, proceeds, last: outcome.last, user: fresh, market: toMarketView(store, ticker) };
    });
  });

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdmin } = await import("./session.server");
  return { admin: await isAdmin() };
});

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid admin login");
    const rec = data as { username?: unknown; password?: unknown };
    if (typeof rec.username !== "string" || typeof rec.password !== "string") {
      throw new Error("Invalid admin login");
    }
    return { username: rec.username, password: rec.password };
  })
  .handler(async ({ data }) => {
    const { withStore } = await import("./store.server");
    const { verifyPassword } = await import("./password.server");
    const { setAdminCookie } = await import("./session.server");
    const admin = await withStore((store) => store.admins.find((a) => a.username === data.username) ?? null);
    const ok = Boolean(admin && data.password && verifyPassword(data.password, admin.password_hash));
    if (!ok || !admin) throw new Error("Invalid admin credentials");
    setAdminCookie(admin.id);
    return { ok: true as const };
  });

export const adminAction = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid request");
    const rec = data as {
      action?: unknown;
      ticker?: unknown;
      outcome?: unknown;
      title?: unknown;
      category?: unknown;
      rules?: unknown;
      yes?: unknown;
    };
    return {
      action: rec.action === "create" ? ("create" as const) : ("resolve" as const),
      ticker: typeof rec.ticker === "string" ? rec.ticker : undefined,
      outcome: rec.outcome === "yes" || rec.outcome === "no" ? (rec.outcome as Side) : undefined,
      title: typeof rec.title === "string" ? rec.title : undefined,
      category: typeof rec.category === "string" ? (rec.category as Category) : undefined,
      rules: typeof rec.rules === "string" ? rec.rules : undefined,
      yes: typeof rec.yes === "number" ? rec.yes : undefined,
    };
  })
  .handler(async ({ data }) => {
    const { isAdmin } = await import("./session.server");
    const { nextId, resolveMarket } = await import("./engine");
    const { seedBook } = await import("./seed.server");
    const { withStore } = await import("./store.server");
    if (!(await isAdmin())) throw new Error("Admin only");
    return withStore((store) => {
      if (data.action === "resolve") {
        if (!data.ticker || !data.outcome) throw new Error("Need ticker and outcome");
        resolveMarket(store, data.ticker, data.outcome);
        return { ok: true as const };
      }
      if (!data.title || !data.category || !data.rules) throw new Error("Missing market fields");
      const eventId = nextId(store);
      const ticker = `NEW-${eventId}`;
      store.events.push({
        id: eventId,
        slug: ticker.toLowerCase(),
        title: data.title,
        category: data.category,
        subtitle: "Listed by admin",
      });
      const yes = Math.min(90, Math.max(10, data.yes ?? 50));
      const close = new Date();
      close.setDate(close.getDate() + 14);
      store.markets.push({
        id: nextId(store),
        ticker,
        event_id: eventId,
        title: data.title,
        rules: data.rules,
        status: "open",
        yes_price_cents: yes,
        volume_macho_bucks: 0,
        close_at: close.toISOString(),
        resolved_outcome: null,
        history: [{ t: Date.now(), yes_cents: yes }],
      });
      const mm = store.users.find((u) => u.username === "market_maker");
      if (mm) seedBook(store, ticker, yes, mm.id);
      return { ok: true as const, ticker };
    });
  });
