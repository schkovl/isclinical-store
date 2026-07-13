# The Skin Stockist

Static e-commerce storefront for iS CLINICAL products (authorized-reseller positioning).

- `data/products.json` — catalog, store identity, Stripe Payment Links (`stripeLink` per product; empty = email-order fallback)
- `build.js` — generates `site/` (run `node build.js` after any data/template change)
- `site/` — deployable static output (Replit static deploy, `publicDir = "site"`)

To enable checkout on a product: create a Payment Link in Stripe, paste the URL into that product's `stripeLink`, run `node build.js`, redeploy.
