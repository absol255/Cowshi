import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Event, MarketView, Store } from "./types";
import { aggregateBook, lastChange } from "./engine";
import { createSeed } from "./seed";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "store.json");

let memory: Store | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Store> {
  if (memory) return memory;
  try {
    const raw = await readFile(dataFile, "utf8");
    memory = JSON.parse(raw) as Store;
    return memory;
  } catch {
    memory = createSeed();
    await persist(memory);
    return memory;
  }
}

async function persist(store: Store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export function withStore<T>(fn: (store: Store) => T | Promise<T>) {
  const run = queue.then(async () => {
    const store = await load();
    try {
      const result = await fn(store);
      await persist(store);
      return result;
    } catch (error) {
      memory = null;
      throw error;
    }
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
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
