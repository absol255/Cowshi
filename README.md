# Cowshi

Kalshi-style prediction markets, settled in **Macho Bucks**.

The Python models in `models.py` (`User`, `Admin`, plus events/markets/orders/positions/trades) are the source of truth. The Next.js app in `web/` is a local trading UI — light blue for Yes, pink for No.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo traders: `cowboy`, `milo`, `daisy`. Admin: `admin` / `cowshi`.

Do not deploy this from this workspace unless you explicitly ask to.
