# Wiper-Lookup repo update — drag & drop files

Five files to update in github.com/wiperexpress/Wiper-Lookup. The fastest path is two web-uploads (root files, then data files).

## Step 1 — root files

1. Open https://github.com/wiperexpress/Wiper-Lookup
2. Click **Add file → Upload files** (button near the green Code button)
3. Drag these three files into the drop zone:
   - `README.md`
   - `index.html`
   - `results.jsx`
4. Scroll down. Commit message: `Add product cards section, refresh fitment data`. Commit directly to `main`.
5. Click **Commit changes**.

## Step 2 — data files

1. From the repo root, click into the `data/` folder.
2. **Add file → Upload files** again.
3. Drag these two files into the drop zone:
   - `data/packed.json`
   - `data/product-info.json`
4. Same commit message style: `Refresh fitment data + add product info`. Commit to `main`.
5. **Commit changes**.

Vercel will auto-deploy on push — give it about 20 seconds, then refresh https://lookup.autotexwipers.com.

## What changed

| File | Change |
| --- | --- |
| `README.md` | Drops outdated mention of `shopify-skus.json`, adds product-cards line |
| `index.html` | Loads `data/product-info.json` into `window.__WX_PRODUCT_INFO` on boot |
| `results.jsx` | Adds `ProductCards` component + helpers, renders one card panel under each segment's results |
| `data/packed.json` | Replaced with new fitment data (10,251 auto · 11,928 HD · 1,776 UTV rows) |
| `data/product-info.json` | NEW · 11 Autotex product families with base64-embedded hero images |

All changes have been Babel-compiled and lookup-tested before staging.
