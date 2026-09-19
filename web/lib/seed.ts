import type { Order, Store } from "./types";
import { nextId } from "./engine";
import { hashPassword } from "./password";

export { hashPassword };

function walk(start: number, points: number, vol: number) {
  const history = [];
  let price = start;
  const now = Date.now();
  for (let i = points; i >= 0; i -= 1) {
    price = Math.min(92, Math.max(8, price + Math.round((Math.random() - 0.48) * vol)));
    history.push({ t: now - i * 36e5, yes_cents: price });
  }
  return history;
}

export function seedBook(store: Store, ticker: string, yes: number, mmId: number) {
  const now = new Date().toISOString();
  const push = (side: "yes" | "no", price: number, qty: number) => {
    store.orders.push({
      id: nextId(store),
      user_id: mmId,
      ticker,
      side,
      price_cents: price,
      quantity: qty,
      remaining: qty,
      status: "open",
      created_at: now,
    } satisfies Order);
  };
  for (let i = 0; i < 6; i += 1) {
    const yesBid = yes - 1 - i;
    const noBid = 100 - yes - i;
    if (yesBid >= 1) push("yes", yesBid, 80 + i * 40);
    if (noBid >= 1) push("no", noBid, 70 + i * 35);
  }
}

export function createSeed(): Store {
  const store: Store = {
    next_id: 0,
    users: [],
    admins: [],
    events: [],
    markets: [],
    orders: [],
    positions: [],
    trades: [],
  };

  for (const user of [
    { username: "cowboy", macho_bucks: 5000, bank_account_number: 1001 },
    { username: "milo", macho_bucks: 1800, bank_account_number: 1002 },
    { username: "daisy", macho_bucks: 920, bank_account_number: 1003 },
    { username: "market_maker", macho_bucks: 250000, bank_account_number: 999 },
  ]) {
    store.users.push({
      id: nextId(store),
      created_at: new Date().toISOString(),
      ...user,
    });
  }
  const mmId = store.users.find((u) => u.username === "market_maker")!.id;

  store.admins.push({
    id: nextId(store),
    username: "admin",
    password_hash: hashPassword(process.env.ADMIN_PASSWORD || "cowshi"),
  });

  const catalog: Array<{
    slug: string;
    title: string;
    subtitle: string;
    category: Store["events"][number]["category"];
    markets: Array<{
      ticker: string;
      title: string;
      yes: number;
      volume: number;
      rules: string;
      days: number;
    }>;
  }> = [
    {
      slug: "homecoming",
      title: "Cowshi Homecoming 2026",
      subtitle: "Parade, rain, and the marching band.",
      category: "Campus",
      markets: [
        {
          ticker: "HOME-RAIN",
          title: "Will it rain during the homecoming parade?",
          yes: 38,
          volume: 12440,
          days: 18,
          rules:
            "Resolves Yes if measurable precipitation is recorded at campus weather station between 10am and 2pm local on parade day.",
        },
        {
          ticker: "HOME-BAND",
          title: "Will the marching band play Y.M.C.A.?",
          yes: 71,
          volume: 8320,
          days: 18,
          rules:
            "Resolves Yes if the official homecoming set list includes Y.M.C.A. or it is performed on the field.",
        },
      ],
    },
    {
      slug: "midterms",
      title: "Student Government Midterms",
      subtitle: "Who controls the pasture senate?",
      category: "Politics",
      markets: [
        {
          ticker: "SG-DAISY",
          title: "Will Daisy win student body president?",
          yes: 56,
          volume: 44120,
          days: 40,
          rules:
            "Resolves Yes if Daisy is certified as student body president after the official count.",
        },
        {
          ticker: "SG-TURNOUT",
          title: "Will voter turnout exceed 40%?",
          yes: 29,
          volume: 9100,
          days: 40,
          rules:
            "Resolves Yes if official turnout is strictly greater than 40.0% of eligible students.",
        },
      ],
    },
    {
      slug: "bowl",
      title: "Pasture Bowl",
      subtitle: "Cows vs. Bulls, championship weekend.",
      category: "Sports",
      markets: [
        {
          ticker: "PB-COWS",
          title: "Will the Cows win the Pasture Bowl?",
          yes: 62,
          volume: 128500,
          days: 12,
          rules:
            "Resolves Yes if the Cows are the official Pasture Bowl champion. Overtime counts.",
        },
        {
          ticker: "PB-TOTAL",
          title: "Will combined score be over 48.5?",
          yes: 47,
          volume: 22110,
          days: 12,
          rules: "Resolves Yes if the sum of both teams' final scores is 49 or more.",
        },
      ],
    },
    {
      slug: "fed",
      title: "Macho Bucks Reserve",
      subtitle: "Will they cut the hay rate?",
      category: "Economics",
      markets: [
        {
          ticker: "MBR-CUT",
          title: "Will the Reserve cut rates this meeting?",
          yes: 22,
          volume: 88000,
          days: 9,
          rules:
            "Resolves Yes if the policy statement announces a decrease in the target hay rate.",
        },
      ],
    },
    {
      slug: "album",
      title: "Barn Door Studio",
      subtitle: "Surprise drops and tour rumors.",
      category: "Culture",
      markets: [
        {
          ticker: "ALBUM-DROP",
          title: "Will a surprise album drop this month?",
          yes: 18,
          volume: 15400,
          days: 12,
          rules:
            "Resolves Yes if a full-length album is commercially released by Barn Door Studio before month end.",
        },
      ],
    },
    {
      slug: "nuggets",
      title: "Cafeteria Specials",
      subtitle: "The only poll that matters.",
      category: "Campus",
      markets: [
        {
          ticker: "NUG-SPICY",
          title: "Will spicy nuggets return this week?",
          yes: 81,
          volume: 6400,
          days: 5,
          rules:
            "Resolves Yes if spicy nuggets appear on any official cafeteria menu day this week.",
        },
      ],
    },
    {
      slug: "frost",
      title: "First Frost",
      subtitle: "Pasture overnight lows.",
      category: "Weather",
      markets: [
        {
          ticker: "FROST-OCT",
          title: "First frost on or before Oct 15?",
          yes: 44,
          volume: 5100,
          days: 27,
          rules:
            "Resolves Yes if the campus station records a temperature at or below 32°F on or before October 15.",
        },
      ],
    },
  ];

  for (const event of catalog) {
    const eventId = nextId(store);
    store.events.push({
      id: eventId,
      slug: event.slug,
      title: event.title,
      category: event.category,
      subtitle: event.subtitle,
    });
    for (const market of event.markets) {
      const history = walk(market.yes, 24, 4);
      history[history.length - 1].yes_cents = market.yes;
      const close = new Date();
      close.setDate(close.getDate() + market.days);
      store.markets.push({
        id: nextId(store),
        ticker: market.ticker,
        event_id: eventId,
        title: market.title,
        rules: market.rules,
        status: "open",
        yes_price_cents: market.yes,
        volume_macho_bucks: market.volume,
        close_at: close.toISOString(),
        resolved_outcome: null,
        history,
      });
      seedBook(store, market.ticker, market.yes, mmId);
    }
  }

  return store;
}
