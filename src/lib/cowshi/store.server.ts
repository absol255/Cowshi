import type { Event, MarketView, Store, User } from "./types";
import { aggregateBook, lastChange } from "./engine";
import { createSeed } from "./seed.server";

const MAX_ATTEMPTS = 6;

type Snapshot = { store: Store; version: number };

const g = globalThis as typeof globalThis & { __cowshiMemory?: Snapshot };

function hasDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
  return Boolean(raw);
}

async function loadSql(): Promise<Snapshot> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  let rows = await sql.query<{ version: number | string; data: Store | string }>(
    "SELECT version, data FROM cowshi_store WHERE id = 1",
  );
  if (!rows[0]) {
    await sql.query(
      "INSERT INTO cowshi_store (id, version, data) VALUES (1, 0, $1::jsonb) ON CONFLICT (id) DO NOTHING",
      [JSON.stringify(createSeed())],
    );
    rows = await sql.query<{ version: number | string; data: Store | string }>(
      "SELECT version, data FROM cowshi_store WHERE id = 1",
    );
  }
  const row = rows[0];
  if (!row) throw new Error("Could not initialise the Cowshi store");
  const data = typeof row.data === "string" ? (JSON.parse(row.data) as Store) : row.data;
  return { store: data, version: Number(row.version) };
}

async function saveSql(next: Store, expectedVersion: number): Promise<boolean> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query<{ id: number }>(
    "UPDATE cowshi_store SET data = $1::jsonb, version = version + 1 WHERE id = 1 AND version = $2 RETURNING id",
    [JSON.stringify(next), expectedVersion],
  );
  return rows.length === 1;
}

function loadMemory(): Snapshot {
  g.__cowshiMemory ??= { store: createSeed(), version: 0 };
  return { store: JSON.parse(JSON.stringify(g.__cowshiMemory.store)) as Store, version: g.__cowshiMemory.version };
}

function saveMemory(next: Store, expectedVersion: number): boolean {
  if (!g.__cowshiMemory || g.__cowshiMemory.version !== expectedVersion) return false;
  g.__cowshiMemory = { store: next, version: expectedVersion + 1 };
  return true;
}

async function loadSnapshot(): Promise<Snapshot> {
  return hasDatabaseUrl() ? loadSql() : loadMemory();
}

async function saveSnapshot(next: Store, expectedVersion: number): Promise<boolean> {
  return hasDatabaseUrl() ? saveSql(next, expectedVersion) : saveMemory(next, expectedVersion);
}

/**
 * Run `fn` against the store. If `fn` changes anything, the change is saved atomically.
 * If `fn` throws, nothing is saved. `fn` may run more than once when writers collide,
 * so keep it free of side effects other than editing the store it is given.
 */
export async function withStore<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { store, version } = await loadSnapshot();
    const before = JSON.stringify(store);
    const draft = JSON.parse(before) as Store;
    const result = await fn(draft);
    if (JSON.stringify(draft) === before) return result;
    if (await saveSnapshot(draft, version)) return result;
  }
  throw new Error("The book is busy — please try again");
}

export function toMarketView(store: Store, ticker: string): MarketView | null {
  const market = store.markets.find((m) => m.ticker === ticker);
  if (!market) return null;
  const event = store.events.find((e) => e.id === market.event_id);
  if (!event) return null;
  return decorate(store, market, event);
}

export function listMarketViews(store: Store): MarketView[] {
  return store.markets
    .map((market) => {
      const event = store.events.find((e) => e.id === market.event_id);
      if (!event) return null;
      return decorate(store, market, event);
    })
    .filter((m): m is MarketView => m !== null)
    .sort((a, b) => b.volume_macho_bucks - a.volume_macho_bucks);
}

function decorate(store: Store, market: Store["markets"][number], event: Event): MarketView {
  return {
    ...market,
    event,
    no_price_cents: Math.max(0, 100 - market.yes_price_cents),
    change_cents: lastChange(market),
    yes_bids: aggregateBook(store.orders, market.ticker, "yes"),
    no_bids: aggregateBook(store.orders, market.ticker, "no"),
  };
}

export function publicUser(store: Store, id: number): User | null {
  const user = store.users.find((u) => u.id === id) ?? null;
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    macho_bucks: user.macho_bucks,
    bank_account_number: user.bank_account_number,
    created_at: user.created_at,
  };
}

export function findBettorByBank(store: Store, bankAccountNumber: number): User | null {
  const user = store.users.find(
    (u) => u.bank_account_number === bankAccountNumber && u.username !== "market_maker",
  );
  return user ? publicUser(store, user.id) : null;
}
