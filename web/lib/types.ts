export type Category =
  | "Politics"
  | "Sports"
  | "Culture"
  | "Campus"
  | "Economics"
  | "Weather";

export type MarketStatus = "open" | "closed" | "resolved";
export type Side = "yes" | "no";

export type User = {
  id: number;
  username: string;
  macho_bucks: number;
  bank_account_number: number;
  created_at: string;
};

/** A User without the bank account number, which doubles as the bettor's password. */
export type PublicUser = Omit<User, "bank_account_number">;

export type Admin = {
  id: number;
  username: string;
  password_hash: string;
};

export type Event = {
  id: number;
  slug: string;
  title: string;
  category: Category;
  subtitle: string;
};

export type Candle = { t: number; yes_cents: number };

export type Order = {
  id: number;
  user_id: number;
  ticker: string;
  side: Side;
  price_cents: number;
  quantity: number;
  remaining: number;
  status: "open" | "filled" | "cancelled";
  created_at: string;
};

export type Position = {
  id: number;
  user_id: number;
  ticker: string;
  yes_contracts: number;
  no_contracts: number;
  avg_yes_cents: number;
  avg_no_cents: number;
};

export type Trade = {
  id: number;
  user_id: number;
  ticker: string;
  side: Side;
  price_cents: number;
  quantity: number;
  macho_bucks: number;
  created_at: string;
};

export type Market = {
  id: number;
  ticker: string;
  event_id: number;
  title: string;
  rules: string;
  status: MarketStatus;
  yes_price_cents: number;
  volume_macho_bucks: number;
  close_at: string;
  resolved_outcome: Side | null;
  history: Candle[];
};

export type Store = {
  next_id: number;
  users: User[];
  admins: Admin[];
  events: Event[];
  markets: Market[];
  orders: Order[];
  positions: Position[];
  trades: Trade[];
};

export type BookLevel = { price_cents: number; size: number };

export type MarketView = Market & {
  event: Event;
  no_price_cents: number;
  change_cents: number;
  yes_bids: BookLevel[];
  no_bids: BookLevel[];
};
