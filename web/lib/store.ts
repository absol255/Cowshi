import { promises as fs } from "node:fs";
import path from "node:path";
import type { Event, MarketView, Store } from "./types";
import { aggregateBook, lastChange } from "./engine";
import { createSeed } from "./seed";

// Persistence
// -----------
// The whole book (users, admins, markets, orders, ...) is one JSON document.
//   - DATABASE_URL / POSTGRES_URL set  -> stored in Postgres (use this on Vercel)
//   - running locally without a URL     -> stored in web/data/store.json, as before
//   - on Vercel without a URL           -> in memory only; resets on every cold start
// Writes use optimistic concurrency (a version number) so parallel serverless
// invocations can't overwrite each other: a losing write is retried on fresh data.

type Snapshot = { store: Store; version: number };

interface Backend {
  load(): Promise<Snapshot>;
  /** Returns false when someone else saved first. */
  save(next: Store, expectedVersion: number): Promise<boolean>;
}

type Globals = typeof globalThis & {
  __cowshiBackend?: Backend;
  __cowshiMemory?: Snapshot;
  __cowshiLock?: Promise<unknown>;
};
const g = globalThis as Globals;

function normalizeDatabaseUrl(raw: string): string {
  let url = raw.startsWith("postgres://") ? `postgresql://${raw.slice("postgres://".length)}` : raw;
  // TLS is configured on the pool below, so drop sslmode to avoid driver-version differences.
  url = url.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
  return url;
}

function postgresBackend(rawUrl: string): Backend {
  const url = normalizeDatabaseUrl(rawUrl);
  const local = /localhost|127\.0\.0\.1/.test(url);
  let ready: Promise<import("pg").Pool> | undefined;

  const getPool = () => {
    ready ??= (async () => {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: url, max: 1, ssl: local ? undefined : true });
      await pool.query(
        `CREATE TABLE IF NOT EXISTS cowshi_store (
           id integer PRIMARY KEY,
           version bigint NOT NULL DEFAULT 0,
           data jsonb NOT NULL
         )`,
      );
      return pool;
    })();
    return ready;
  };

  const read = async (pool: import("pg").Pool) => {
    const res = await pool.query("SELECT version, data FROM cowshi_store WHERE id = 1");
    return res.rows[0] as { version: string; data: Store } | undefined;
  };

  return {
    async load() {
      const pool = await getPool();
      let row = await read(pool);
      if (!row) {
        await pool.query(
          "INSERT INTO cowshi_store (id, version, data) VALUES (1, 0, $1::jsonb) ON CONFLICT (id) DO NOTHING",
          [JSON.stringify(createSeed())],
        );
        row = await read(pool);
      }
      if (!row) throw new Error("Could not initialise the Cowshi store");
      return { store: row.data, version: Number(row.version) };
    },
    async save(next, expectedVersion) {
      const pool = await getPool();
      const res = await pool.query(
        "UPDATE cowshi_store SET data = $1::jsonb, version = version + 1 WHERE id = 1 AND version = $2",
        [JSON.stringify(next), expectedVersion],
      );
      return res.rowCount === 1;
    },
  };
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
    save(next, expectedVersion) {
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
    async save(next, expectedVersion) {
      if (!g.__cowshiMemory || g.__cowshiMemory.version !== expectedVersion) return false;
      g.__cowshiMemory = { store: next, version: expectedVersion + 1 };
      return true;
    },
  };
}

function backend(): Backend {
  if (g.__cowshiBackend) return g.__cowshiBackend;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    g.__cowshiBackend = postgresBackend(url);
  } else if (process.env.VERCEL) {
    console.warn(
      "[cowshi] No DATABASE_URL or POSTGRES_URL set — data is kept in memory and will reset. Add a Postgres database in Vercel.",
    );
    g.__cowshiBackend = memoryBackend();
  } else {
    g.__cowshiBackend = fileBackend();
  }
  return g.__cowshiBackend;
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
    if (await b.save(draft, version)) return result;
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

export function publicUser(store: Store, id: number) {
  return store.users.find((u) => u.id === id) ?? null;
}
