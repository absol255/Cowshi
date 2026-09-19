# Cowshi

Kalshi-style prediction markets, settled in **Macho Bucks**.

The Python models in `models.py` (`User`, `Admin`, plus events/markets/orders/positions/trades) are the source of truth. The Next.js app in `web/` mirrors them in `web/lib/types.ts`, in dark mode — light blue for Yes, pink for No.

## Who is who

- **Bettors are `User` records.** Anyone placing a bet is a `User`; the trader picker in the header signs you in as one.
- **Admins are `Admin` records.** They sign in at `/admin` with a Werkzeug-format password hash (the same format `Admin.set_password` produces in `models.py`). Admins list and resolve markets; they don't trade.
- The two sessions are separate signed cookies, so a bettor can't reach admin actions and an admin isn't a bettor.

## Betting rules

- The minimum bet is **1 Macho Buck**, and bets are **whole numbers** of Macho Bucks.
- Buying takes a bet amount and buys as many contracts as it covers at your limit price. It never spends more than the bet.
- Selling takes a whole number of contracts.
- The rules live in `web/lib/rules.ts` and are enforced in the trade ticket and again in `POST /api/trade`.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:3000>.

Demo traders: `cowboy`, `milo`, `daisy`. Admin: `admin` / `cowshi` (or whatever `ADMIN_PASSWORD` was set to when the data was first created).

Without a `DATABASE_URL`, local data is kept in `web/data/store.json`. Delete that file to reset.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In **Project Settings → General**, set **Root Directory** to `web`. The Next.js app is in that folder.
3. Add a Postgres database (**Storage** tab → Neon / Vercel Postgres). This sets `DATABASE_URL` or `POSTGRES_URL` for you.
4. Under **Environment Variables**, add:
   - `SECRET_KEY` — a long random string (`openssl rand -hex 32`). It signs session cookies.
   - `ADMIN_PASSWORD` — the password for the seeded `admin` account. It's read once, when the database is first created.
5. Deploy. The first request creates the table and seeds the markets and demo traders.

Without a database on Vercel the app still runs, but data lives in memory and resets on cold starts.

See `web/.env.example` for all variables.
