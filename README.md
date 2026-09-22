# The Indian Floral — website

Static site (no build step). Open `index.html`, or serve the folder:

    python -m http.server 5174

## Before going live
- `assets/config.js` — set the business WhatsApp number (`919876543210` format).
- `assets/products.js` — real gift products, prices and photos (current ones are examples).
- Confirm the facts in `index.html`: hours, delivery areas, reply time, "Our family has traded flowers here for years".
- Replace `assets/img/bouquets-circle-*` (sourced from Pinterest; we don't own the rights).

## Deploy
Vercel: import this repo, framework preset "Other", no build command, output directory `/`.
