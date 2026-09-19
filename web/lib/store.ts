import { promises as fs } from "node:fs";
import path from "node:path";
import type { Event, MarketView, PublicUser, Store, User } from "./types";
import { aggregateBook, lastChange } from "./engine";
import { createSeed } from "./seed";
import { postgresBackend, type Backend, type Snapshot } from "./postgres";

// Persistence
// -----------
//   - DATABASE_URL (or POSTGRES_URL) set -> Postgres (use this on Vercel). Bettors and admins are
//                                           rows in the `users` and `admins` tables from models.py;
//                                           see postgres.ts.
//   - running locally without a URL     -> one JSON file, web/data/store.json
//   - on Vercel without a URL           -> in memory only; resets on every cold start
// Writes use optimistic concurrency (a version number) so parallel serverless
// invocations can't overwrite each other: a losing write is retried on fresh data.

type Globals = typeof globalThis & {
  __cowshiBackend?: Backend;
  __cowshiBackendKind?: "postgres" | "file" | "memory";
  __cowshiMemory?: Snapshot;
  __cowshiLock?: Promise<unknown>;
};
const g = globalThis as Globals;

/** Postgres connection string from whichever variable your host or integration provides. */
export function databaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    undefined
  );
}

function fileBackend(): Backend {
  const file = process.env.COWSHI_DATA_FILE || path.join(process.cwd(), "data", "store.json");
  return {
    async load() {
      try {
        const parsed = JSON.parse(await fs.readFile(file, "utf8")) as
          | { version: number; store: Store }
          | Store;
        // Files written before versioning are a bare Store.
        if ("store" in parsed) return { store: parsed.store, version: parsed.version };
        return { store: parsed, version: 0 };
      } catch {
        const store = createSeed();
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, JSON.stringify({ version: 0, store }, null, 2));
        return { store, version: 0 };
      }
    },
    save(next, _prev, expectedVersion) {
      // Serialise check-and-write so parallel requests in one dev server can't interleave.
      const run = async () => {
        const current = await this.load();
        if (current.version !== expectedVersion) return false;
        const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
        await fs.writeFile(tmp, JSON.stringify({ version: expectedVersion + 1, store: next }, null, 2));
        await fs.rename(tmp, file);
        return true;
      };
      const result = (g.__cowshiLock ?? Promise.resolve()).then(run, run);
      g.__cowshiLock = result.catch(() => undefined);
      return result;
    },
  };
}

function memoryBackend(): Backend {
  return {
    async load() {
      g.__cowshiMemory ??= { store: createSeed(), version: 0 };
      return { store: JSON.parse(JSON.stringify(g.__cowshiMemory.store)), version: g.__cowshiMemory.version };
    },
    async save(next, _prev, expectedVersion) {
      if (!g.__cowshiMemory || g.__cowshiMemory.version !== expectedVersion) return false;
      g.__cowshiMemory = { store: next, version: expectedVersion + 1 };
      return true;
    },
  };
}

function backend(): Backend {
  if (g.__cowshiBackend) return g.__cowshiBackend;
  const url = databaseUrl();
  if (url) {
    g.__cowshiBackend = postgresBackend(url);
    g.__cowshiBackendKind = "postgres";
  } else if (process.env.VERCEL) {
    console.warn(
      "[cowshi] No DATABASE_URL set — data is kept in memory and will reset. Add a Postgres database in Vercel.",
    );
    g.__cowshiBackend = memoryBackend();
    g.__cowshiBackendKind = "memory";
  } else {
    g.__cowshiBackend = fileBackend();
    g.__cowshiBackendKind = "file";
  }
  return g.__cowshiBackend;
}

/** Where data is stored right now: "postgres", "file" (local dev) or "memory" (Vercel without a database). */
export function storageKind(): "postgres" | "file" | "memory" {
  backend();
  return g.__cowshiBackendKind!;
}

const MAX_ATTEMPTS = 6;

/**
 * Run `fn` against the store. If `fn` changes anything, the change is saved atomically.
 * If `fn` throws, nothing is saved. `fn` may run more than once when writers collide,
 * so keep it free of side effects other than editing the store it is given.
 */
export async function withStore<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  const b = backend();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { store, version } = await b.load();
    const before = JSON.stringify(store);
    const draft = JSON.parse(before) as Store;
    const result = await fn(draft);
    if (JSON.stringify(draft) === before) return result;
    if (await b.save(draft, store, version)) return result;
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

/** Drops the bank account number (the bettor's password) so it never leaves the server by accident. */
export function toPublicUser(user: User): PublicUser {
  const { bank_account_number: _secret, ...rest } = user;
  void _secret;
  return rest;
}

export function publicUser(store: Store, id: number): PublicUser | null {
  const user = store.users.find((u) => u.id === id);
  return user ? toPublicUser(user) : null;
}
