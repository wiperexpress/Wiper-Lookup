# Wiper Express — Fitment Lookup

A standalone vehicle-fitment lookup for Wiper Express. Pick a vehicle (Auto / Heavy-Duty / UTV) and get the right Autotex wiper SKUs for every blade line (M5, M6, CLX, CLX-SP, HD) plus wiper motors and UTV kits. SKUs link out to the Shopify product page when mapped, and fall back to a store search otherwise.

No build step. No framework. Just static files served by Vercel.

## Project structure

```
index.html              # Entry point — loads React + Babel-standalone
app.jsx                 # Brand tokens, data helpers, top bar, logo
components.jsx          # Selector column (year/make/model combos)
results.jsx             # Auto / HD / UTV result panels + SKU tables
composition.jsx         # Main layout, segment routing, tweaks panel
vercel.json             # Static hosting + cache headers
assets/                 # Logos
data/
  packed.json           # ~2.9 MB — all fitment rows (Auto/HD/UTV + Motors)
  shopify-skus.json     # SKU → product-handle map for deep linking
```

## Local dev

Any static server will do. From the project root:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:3000` (or `:8000`). No install, no build.

## Deploy to Vercel

### Option A — via GitHub (recommended)

1. Create a new GitHub repo and push this folder.
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Project** → pick the repo.
3. Framework preset: **Other** (leave everything default — no build command, no output dir).
4. Click **Deploy**. Takes ~20 seconds.

### Option B — via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Pick "Other" as the framework.

### Custom domain

In the Vercel dashboard → **Domains** → add `fitment.wiperexpress.com` (or whatever subdomain you want) and follow the DNS instructions (one CNAME record).

## Updating the data

When the master spreadsheet changes:

1. Regenerate `data/packed.json` (the offline build script reads the Excel master and emits this file).
2. `git commit` + `git push` — Vercel auto-deploys on push to `main`.

Browsers cache `packed.json` for 5 minutes and Vercel's edge caches it for 1 hour, so updates propagate within about an hour. Hard-refresh (Shift+Reload) sees changes immediately.

## Browser support

Everything modern — Chrome, Firefox, Safari, Edge. No IE. Babel-standalone handles the JSX transform client-side so there's no build pipeline, at the cost of ~50 ms of startup parse time. For a production app with a lot of traffic you'd normally pre-compile this, but for an internal-tool-scale page it's totally fine.
