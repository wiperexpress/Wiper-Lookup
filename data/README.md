# Regenerate fitment data (packed.json)

This app loads fitment data from `data/packed.json`. When you update the master Excel workbook, regenerate the JSON using one of the approaches below.

## Source of truth
Current source: **WX Application Master v2**
Expected sheets:
- `Vehicles` — auto / passenger fitment
- `Output – Autotex – HD` — heavy-duty
- `Output – Autotex – RV` — motorhomes
- `Output – Autotex – UTV` — utility vehicles (All-Makes Kit is master fitment)
- `Output – Autotex – Motors` — HD/bus wiper motors
- `Brands` — SKU prefix definitions (Walmart rows are filtered out)

## Option 1 — Quick regenerate (one-off)
Open this project, attach the new workbook, and ask Claude: *"Regenerate packed.json from this workbook."*

## Option 2 — Local Python script (recommended for ongoing use)
```bash
pip install openpyxl
python scripts/build_packed.py "WX Application Master v2.xlsx" data/packed.json
```
The script interns makes/types/etc into lookup tables and emits the same schema the app expects.

## Option 3 — Automated (GitHub Actions)
Commit the `.xlsx` to a repo; a GitHub Action converts it to JSON on every push and publishes to Shopify Files (or GitHub Pages). See `DEPLOYMENT.md`.

## Schema contract
```
{
  "auto": {
    "makes": string[], "types": string[], "bts": string[], "ats": string[],
    "rbts": string[], "rats": string[],
    "rows": [ [year, mkIdx, model, typeIdx, fl, fr, btIdx, atIdx, bc,
               rbtIdx, rl, ratIdx, qfrSku, r1Sku], ... ]
  },
  "hd":    { "makes":[], "types":[], "conns":[],
             "rows": [ [year, mkIdx, model, typeIdx, trico, ds, ps, connIdx, hdDS, hdPS], ... ] },
  "rv":    [ [make, series, notes, startY, endY, conn, fD, fP, bD, bP], ... ],
  "utv":   [ { y, mk, md, pg, motor, arm, blade, mh, wh, ms, ws, wp, wr,
               oem, amk, pivot, att, notes, flags }, ... ],
  "motors": [ [year, make, model, autotexMotor], ... ],
  "brands": [ { brand, segment, slot, prefix, source, notes }, ... ],
  "meta":   { source, generated, counts, ... }
}
```

## Do NOT include
- Walmart / private-label SKU columns (excluded per product decision)
- Any customer PII or pricing in this file
