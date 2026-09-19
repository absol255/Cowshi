# Cowshi

Kalshi-style prediction markets, settled in **Macho Bucks**.

The Python models in `models.py` (`User`, `Admin`, plus events/markets/orders/positions/trades) are the source of truth. The Next.js app in `web/` mirrors them in `web/lib/types.ts`, in dark mode — light blue for Yes, pink for No.

## Who is who

- **Bettors are `User` records.** You sign in from the header with your **username** and use your **`bank_account_number` as the password**. The market maker can't sign in.
- **Admins are `Admin` records.** They sign in at `/admin` with a Werkzeug-format password hash (the same format `Admin.set_password` produces in `models.py`). Admins list and resolve markets; they don't trade.
- The two sessions are separate signed cookies, so a bettor can't reach admin actions and an admin isn't a bettor.
- Sign-in is rate limited (5 wrong tries locks that username for 5 minutes). Account numbers are short, so treat this as demo-level security.

Demo bettors (username → password): `cowboy` → `1001`, `milo` → `1002`, `daisy` → `1003`.

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

Open <http://localhost:3000>. The admin login is `admin` / `cowshi` (or whatever `ADMIN_PASSWORD` was when the data was first created).

Without a database URL, local data is kept in `web/data/store.json`. Delete that file to reset. To use Postgres locally, put `DATABASE_URL=postgres://...` in `web/.env.local`.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In **Project Settings → General**, set **Root Directory** to `web`.
3. Under **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Postgres connection string. `POSTGRES_URL` also works, and so do the variables the Vercel Postgres/Neon integration sets automatically.
   - `SECRET_KEY` — a long random string (`openssl rand -hex 32`). It signs session cookies.
   - `ADMIN_PASSWORD` — the password for the seeded `admin` account. It's read once, when the database is first created.
4. Deploy. The first request creates one table (`cowshi_store`) and seeds the markets and demo bettors.

Notes:
- Without a database URL on Vercel the app runs but keeps data in memory, and it resets on cold starts.
- If your provider's TLS certificate fails to verify, set `DATABASE_SSL=no-verify`.
- Run `npm install` in `web/` and commit the updated `package-lock.json` after pulling this change (it adds the `pg` package).

See `web/.env.example` for all variables.
