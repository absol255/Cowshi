# Cowshi

Kalshi-style prediction markets, settled in **Macho Bucks**. A Next.js (TypeScript) app with a Postgres database, in dark mode: light blue for Yes, pink for No.

## How it works

- **Bettors** are rows in the `users` table (`id`, `username`, `macho_bucks`, `created_at`, `bank_account_number`). A bettor signs in with their **username** and use their **`bank_account_number` as the password**.
- **Admins** are rows in the `admins` table (`id`, `username`, `password_hash`). They sign in at `/admin` to list, settle and remove markets and to manage bettors.
- The two sessions are separate signed cookies, so a bettor can't reach admin actions and an admin isn't a bettor.
- **If the `users` and `admins` tables already exist, they're used exactly as they are.** Existing rows are never deleted or overwritten. The app only changes a bettor's balance when they trade or when an admin edits it. If the tables don't exist, they're created.
- Markets, orders, positions and trades are kept as one JSON document in a table called `cowshi_state`. A bet updates the bettor's row in `users` and that document in a single transaction, so they can't get out of step. The house market maker is a row in `users` called `market_maker`.

### Passwords

- Admin passwords are checked against `admins.password_hash`. Werkzeug-style hashes (`scrypt:...` and `pbkdf2:...`) work.
- If `password_hash` holds a plain-text password, it's accepted once and replaced with a proper hash.
- `ADMIN_PASSWORD` (and optionally `ADMIN_USERNAME`, default `admin`) is always a way in: that account is created or refreshed to match. There's no default password on a real deployment.
- Bettor account numbers can be typed with spaces or dashes. Sign-in is rate limited (5 wrong tries locks that username for 5 minutes, per server instance), and account numbers are short, so treat it as demo-level security.

### Betting rules

- The minimum bet is **1 Macho Buck**, in **whole numbers**. Buying takes a bet amount and buys as many contracts as it covers at your limit price. It never spends more than the bet. Selling takes whole contracts.
- The rules live in `lib/rules.ts` and are enforced in the trade ticket and again in `POST /api/trade`.

### Managing markets and bettors (`/admin`)

- **List a market:** title, category, rules, starting Yes chance, close date.
- **Yes / No:** settle a market. **Remove:** delete a market and give bettors back what they paid.
- **Bettors:** see and change each bettor's bank account number and balance, and add bettors.

A brand-new database starts with demo markets (and demo bettors `cowboy` 1001, `milo` 1002, `daisy` 1003 only if `users` is completely empty). Set `SEED_DEMO_MARKETS=false` before the first visit to start with no markets.

## Environment variables

| Name | Required | What it is |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. `POSTGRES_URL` and the variables the Vercel/Neon integration sets also work. |
| `SECRET_KEY` | yes | Long random string that signs session cookies. `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | recommended | Password for the admin account. Needed if your `admins` table is empty. |
| `ADMIN_USERNAME` | no | Username for that account. Default `admin`. |
| `SEED_DEMO_MARKETS` | no | `false` = start a new database with no markets. |
| `GENERIC_LOGIN_ERRORS` | no | `true` = sign-in errors just say "wrong username or password". |
| `DATABASE_SSL` | no | `no-verify` only if your database's TLS certificate can't be verified. |

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL etc., or leave DATABASE_URL empty
npm run dev
```

Open <http://localhost:3000>. With no `DATABASE_URL`, data is kept in `data/store.json` (delete it to reset) and the admin is `admin` / `cowshi` unless you set `ADMIN_PASSWORD`.

## Deploy to Vercel, start to finish

**1. Put the code on GitHub.** This repo is a plain Next.js app: `package.json` is at the top level. Replace everything in your GitHub repo with these files (delete the old `web/` folder, `models.py`, `config.py`, `requirements.txt`, `pyproject.toml` and `static/`), then:

```bash
npm install          # refreshes package-lock.json (the pg package was added)
git add -A
git commit -m "Pure Next.js Cowshi"
git push
```

**2. Have a Postgres database.** Either use your existing one (you need its connection string, `postgres://user:password@host/dbname`), or create one in Vercel: Dashboard → **Storage** → **Create Database** → **Neon** (Postgres) → connect it to your project. That adds `DATABASE_URL` for you.

**3. Import the project.** Vercel dashboard → **Add New… → Project** → pick your GitHub repo → **Import**. Framework Preset should say **Next.js**. Leave **Root Directory** empty (`./`). If you set it to `web` for an earlier version, clear it under **Settings → General → Root Directory**.

**4. Add environment variables.** Before the first deploy (or later under **Settings → Environment Variables**), add for Production, Preview and Development:

- `DATABASE_URL` = your Postgres connection string (skip if the Neon integration already added it)
- `SECRET_KEY` = a long random string, from `openssl rand -hex 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_PASSWORD` = the admin password you want (and `ADMIN_USERNAME` if you don't want `admin`)

**5. Deploy.** Click **Deploy**. Environment variable changes only apply to new deployments, so after changing any later, go to **Deployments → ⋯ → Redeploy**.

**6. Check it.** Open `https://YOUR-SITE.vercel.app/api/health`. You should see `"ok":true`, `"storage":"postgres"`, `"databaseUrlSet":true`, `"secretKeySet":true`, and counts of bettors, admins and markets. On the first visit the app creates any missing tables.

**7. Sign in.**
- Admin: go to `/admin`. Sign in with `ADMIN_USERNAME` (default `admin`) and `ADMIN_PASSWORD`, or with any admin already in your `admins` table.
- Bettors: **Sign in** at the top right, with a username and bank account number from the `users` table. Admins can see and change these under **Bettors**.

**8. Replace the demo markets.** In `/admin`, use **Remove all**, then **List a market** for each real one.

### If something's wrong

| What you see | What it means |
| --- | --- |
| `/api/health` is a 404 | Vercel is running old code, or the wrong folder. Check that the latest commit is deployed and Root Directory is empty. |
| `/api/health` says `"ok":false` with an error | The message says why, most often a bad `DATABASE_URL`. For a TLS or certificate error, add `DATABASE_SSL=no-verify`. |
| `"storage":"memory"` | No database URL is set. Add `DATABASE_URL` and redeploy. |
| "There's no bettor called …" | That username isn't in the `users` table. |
| "That bank account number doesn't match" | Wrong number for that bettor. An admin can see and change it. |
| "There's no admin called …" | That username isn't in `admins`. Use `ADMIN_USERNAME` + `ADMIN_PASSWORD`. |
| "…password_hash is in a format the app can't read" | The row uses another hash scheme, such as bcrypt. Set `ADMIN_USERNAME` to that name plus `ADMIN_PASSWORD` and redeploy, and the row is reset. |
| Build fails on install | Run `npm install` locally and commit the updated `package-lock.json`. |

The exact reason for every failed sign-in is also written to Vercel → your project → **Logs**.
