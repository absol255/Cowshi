# Cowshi

Kalshi-style prediction markets, settled in **Macho Bucks**.

The Python models in `models.py` (`User`, `Admin`, plus events/markets/orders/positions/trades) are the source of truth. The Next.js app in `web/` mirrors them in `web/lib/types.ts`, in dark mode — light blue for Yes, pink for No.

## Where the data lives

With a Postgres URL set, the app uses the same tables as `models.py`:

- **`users`** (`id`, `username`, `macho_bucks`, `created_at`, `bank_account_number`) holds every bettor. This is `models.User`.
- **`admins`** (`id`, `username`, `password_hash`) holds every admin. This is `models.Admin`.

If those tables already exist, for example from the Flask app, they are used exactly as they are, so your existing bettors and admins just work. If they don't exist they are created with the same columns as `models.py`. Existing rows are never deleted or overwritten by the app. It only updates a bettor's balance when they trade, or when an admin edits it.

Events, markets, orders, positions and trades are kept as one JSON document in a table called `cowshi_state`. A bet writes the bettor's balance in `users` and the document in a single transaction, so they can't get out of step. The market maker (`market_maker`) is added as a row in `users`.

Open `/api/health` to see where data is coming from and how many bettors, admins and markets it found. It shows counts only.

## Who is who

- **Bettors are `User` records.** You sign in from the header with your **username** and use your **`bank_account_number` as the password**. The market maker can't sign in.
- **Admins are `Admin` records.** They sign in at `/admin` with a Werkzeug-format password hash (the same format `Admin.set_password` produces in `models.py`). Admins manage markets and bettors; they don't trade.
- Admins sign in with the `password_hash` stored in the `admins` table. Werkzeug hashes (`scrypt:` and `pbkdf2:`) from the Flask side work.
- **`ADMIN_PASSWORD` is an extra way in.** When it's set, the account named `ADMIN_USERNAME` (default `admin`) signs in with that password. The row is created or refreshed in the `admins` table to match. Change it in Vercel, redeploy, and it takes effect on the next sign-in. Other admins in the table are unaffected.
- The two sessions are separate signed cookies, so a bettor can't reach admin actions and an admin isn't a bettor.
- If a sign-in fails, Vercel → Logs shows why (for example "no such username in the users table" or "bank_account_number does not match"). The browser only shows a generic message.
- Sign-in is rate limited (5 wrong tries locks that username for 5 minutes). Account numbers are short, so treat this as demo-level security.

The demo bettors `cowboy` (1001), `milo` (1002) and `daisy` (1003) are only added to a **completely empty** `users` table. If you already have bettors, no demo bettors are added.

## Replacing the test markets with real ones

Sign in at `/admin`:

- **Markets → Remove** deletes a test market (or **Remove all**). Bettors get back what they paid for open orders and contracts, so nobody loses Macho Bucks.
- **List a market** adds a real one: title, category, resolution rules, starting Yes chance, and close date. The market maker posts opening bids so it can be traded straight away.
- **Markets → Yes / No** settles a market when the outcome is known.
- **Bettors** shows each bettor's bank account number (their password) and balance, lets you change either, and lets you add bettors.

For a brand-new database the app starts with demo markets. Set `SEED_DEMO_MARKETS=false` before the first request to start with none, or edit the `EVENTS` list in `web/lib/seed.ts`.

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

Open <http://localhost:3000>. The admin login is `admin` with the `ADMIN_PASSWORD` from `web/.env.local`, or `cowshi` if that isn't set.

Without a database URL, local data is kept in `web/data/store.json`. Delete that file to reset. To use Postgres locally, put `DATABASE_URL=postgres://...` in `web/.env.local`.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In **Project Settings → General**, set **Root Directory** to `web`.
3. Under **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Postgres connection string. `POSTGRES_URL` also works, and so do the variables the Vercel Postgres/Neon integration sets automatically.
   - `SECRET_KEY` — a long random string (`openssl rand -hex 32`). It signs session cookies.
   - `ADMIN_PASSWORD` — optional. The password for the `admin` account (or `ADMIN_USERNAME`). Changing it later needs a redeploy to take effect.
4. Deploy. The first request creates any missing tables (`users`, `admins`, `cowshi_state`) and adds the demo markets. Older versions of this app stored everything in a table called `cowshi_store`. That table is no longer used and can be dropped.

Notes:
- Without a database URL on Vercel the app runs but keeps data in memory, and it resets on cold starts.
- If your provider's TLS certificate fails to verify, set `DATABASE_SSL=no-verify`.
- Run `npm install` in `web/` and commit the updated `package-lock.json` after pulling this change (it adds the `pg` package).

See `web/.env.example` for all variables.
