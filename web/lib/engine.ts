import type { BookLevel, Market, Order, Side, Store } from "./types";

export function nextId(store: Store) {
  store.next_id += 1;
  return store.next_id;
}

export function aggregateBook(orders: Order[], ticker: string, side: Side): BookLevel[] {
  const levels = new Map<number, number>();
  for (const order of orders) {
    if (order.ticker !== ticker || order.side !== side || order.status !== "open" || order.remaining <= 0) {
      continue;
    }
    levels.set(order.price_cents, (levels.get(order.price_cents) ?? 0) + order.remaining);
  }
  const sorted = [...levels.entries()].map(([price_cents, size]) => ({ price_cents, size }));
  if (side === "yes") sorted.sort((a, b) => b.price_cents - a.price_cents);
  else sorted.sort((a, b) => b.price_cents - a.price_cents);
  return sorted.slice(0, 8);
}

export function bestYesAsk(orders: Order[], ticker: string) {
  const noBids = aggregateBook(orders, ticker, "no");
  if (!noBids.length) return null;
  return 100 - noBids[0].price_cents;
}

export function bestNoAsk(orders: Order[], ticker: string) {
  const yesBids = aggregateBook(orders, ticker, "yes");
  if (!yesBids.length) return null;
  return 100 - yesBids[0].price_cents;
}

export function lastChange(market: Market) {
  if (market.history.length < 2) return 0;
  const prev = market.history[market.history.length - 2].yes_cents;
  return market.yes_price_cents - prev;
}

function bumpAverage(prevQty: number, prevAvg: number, addQty: number, price: number) {
  const total = prevQty + addQty;
  if (total <= 0) return 0;
  return (prevQty * prevAvg + addQty * price) / total;
}

export function creditPosition(
  store: Store,
  userId: number,
  ticker: string,
  side: Side,
  qty: number,
  price: number,
) {
  let position = store.positions.find((p) => p.user_id === userId && p.ticker === ticker);
  if (!position) {
    position = {
      id: nextId(store),
      user_id: userId,
      ticker,
      yes_contracts: 0,
      no_contracts: 0,
      avg_yes_cents: 0,
      avg_no_cents: 0,
    };
    store.positions.push(position);
  }
  if (side === "yes") {
    position.avg_yes_cents = bumpAverage(position.yes_contracts, position.avg_yes_cents, qty, price);
    position.yes_contracts += qty;
  } else {
    position.avg_no_cents = bumpAverage(position.no_contracts, position.avg_no_cents, qty, price);
    position.no_contracts += qty;
  }
}

export function debitPosition(store: Store, userId: number, ticker: string, side: Side, qty: number) {
  const position = store.positions.find((p) => p.user_id === userId && p.ticker === ticker);
  if (!position) throw new Error("No position to sell");
  if (side === "yes") {
    if (position.yes_contracts < qty) throw new Error("Not enough Yes contracts");
    position.yes_contracts -= qty;
  } else {
    if (position.no_contracts < qty) throw new Error("Not enough No contracts");
    position.no_contracts -= qty;
  }
}

export function matchBuy(
  store: Store,
  userId: number,
  ticker: string,
  side: Side,
  limitCents: number,
  quantity: number,
) {
  const market = store.markets.find((m) => m.ticker === ticker);
  const user = store.users.find((u) => u.id === userId);
  if (!market || !user) throw new Error("Unknown market or user");
  if (market.status !== "open") throw new Error("Market is not open");
  if (quantity < 1) throw new Error("Quantity must be at least 1");
  if (limitCents < 1 || limitCents > 99) throw new Error("Price must be between 1¢ and 99¢");

  const opposite: Side = side === "yes" ? "no" : "yes";
  let remaining = quantity;
  let spent = 0;
  const now = new Date().toISOString();

  const candidates = store.orders
    .filter(
      (o) =>
        o.ticker === ticker &&
        o.side === opposite &&
        o.status === "open" &&
        o.remaining > 0 &&
        o.user_id !== userId &&
        o.price_cents >= 100 - limitCents,
    )
    .sort((a, b) => b.price_cents - a.price_cents || a.id - b.id);

  for (const rest of candidates) {
    if (remaining <= 0) break;
    const tradePrice = 100 - rest.price_cents;
    const fill = Math.min(remaining, rest.remaining);
    const cost = (tradePrice / 100) * fill;
    if (user.macho_bucks < spent + cost) break;

    rest.remaining -= fill;
    if (rest.remaining === 0) rest.status = "filled";
    remaining -= fill;
    spent += cost;

    creditPosition(store, userId, ticker, side, fill, tradePrice);
    creditPosition(store, rest.user_id, ticker, opposite, fill, rest.price_cents);

    store.trades.push({
      id: nextId(store),
      user_id: userId,
      ticker,
      side,
      price_cents: tradePrice,
      quantity: fill,
      macho_bucks: cost,
      created_at: now,
    });

    market.yes_price_cents = side === "yes" ? tradePrice : 100 - tradePrice;
    market.volume_macho_bucks += cost;
    market.history.push({ t: Date.now(), yes_cents: market.yes_price_cents });
    if (market.history.length > 48) market.history = market.history.slice(-48);
  }

  if (remaining > 0) {
    const restCost = (limitCents / 100) * remaining;
    if (user.macho_bucks < spent + restCost) {
      if (spent === 0) throw new Error("Not enough Macho Bucks");
    } else {
      spent += restCost;
      store.orders.push({
        id: nextId(store),
        user_id: userId,
        ticker,
        side,
        price_cents: limitCents,
        quantity: remaining,
        remaining,
        status: "open",
        created_at: now,
      });
      remaining = 0;
    }
  }

  user.macho_bucks = Math.round((user.macho_bucks - spent) * 100) / 100;
  if (user.macho_bucks < 0) throw new Error("Not enough Macho Bucks");
  return { filled: quantity - remaining, spent, last: market.yes_price_cents };
}

export function matchSell(
  store: Store,
  userId: number,
  ticker: string,
  side: Side,
  limitCents: number,
  quantity: number,
) {
  const market = store.markets.find((m) => m.ticker === ticker);
  const user = store.users.find((u) => u.id === userId);
  if (!market || !user) throw new Error("Unknown market or user");
  if (market.status !== "open") throw new Error("Market is not open");

  debitPosition(store, userId, ticker, side, quantity);

  let remaining = quantity;
  let proceeds = 0;
  const now = new Date().toISOString();

  const candidates = store.orders
    .filter(
      (o) =>
        o.ticker === ticker &&
        o.side === side &&
        o.status === "open" &&
        o.remaining > 0 &&
        o.user_id !== userId &&
        o.price_cents >= limitCents,
    )
    .sort((a, b) => b.price_cents - a.price_cents || a.id - b.id);

  for (const rest of candidates) {
    if (remaining <= 0) break;
    const fill = Math.min(remaining, rest.remaining);
    const price = rest.price_cents;
    const credit = (price / 100) * fill;
    rest.remaining -= fill;
    if (rest.remaining === 0) rest.status = "filled";
    remaining -= fill;
    proceeds += credit;

    creditPosition(store, rest.user_id, ticker, side, fill, price);

    store.trades.push({
      id: nextId(store),
      user_id: userId,
      ticker,
      side,
      price_cents: price,
      quantity: fill,
      macho_bucks: credit,
      created_at: now,
    });

    market.yes_price_cents = side === "yes" ? price : 100 - price;
    market.volume_macho_bucks += credit;
    market.history.push({ t: Date.now(), yes_cents: market.yes_price_cents });
  }

  if (remaining > 0) {
    creditPosition(store, userId, ticker, side, remaining, limitCents);
    throw new Error("Not enough bids to sell that size. Try a smaller quantity.");
  }

  user.macho_bucks = Math.round((user.macho_bucks + proceeds) * 100) / 100;
  return { filled: quantity, proceeds, last: market.yes_price_cents };
}

export function resolveMarket(store: Store, ticker: string, outcome: Side) {
  const market = store.markets.find((m) => m.ticker === ticker);
  if (!market) throw new Error("Unknown market");
  if (market.status === "resolved") throw new Error("Already resolved");

  for (const order of store.orders) {
    if (order.ticker === ticker && order.status === "open") {
      const refund = (order.price_cents / 100) * order.remaining;
      const owner = store.users.find((u) => u.id === order.user_id);
      if (owner) owner.macho_bucks += refund;
      order.status = "cancelled";
      order.remaining = 0;
    }
  }

  for (const position of store.positions) {
    if (position.ticker !== ticker) continue;
    const owner = store.users.find((u) => u.id === position.user_id);
    if (!owner) continue;
    const winning = outcome === "yes" ? position.yes_contracts : position.no_contracts;
    owner.macho_bucks += winning;
    position.yes_contracts = 0;
    position.no_contracts = 0;
  }

  market.status = "resolved";
  market.resolved_outcome = outcome;
  market.yes_price_cents = outcome === "yes" ? 100 : 0;
}
