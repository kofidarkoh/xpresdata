# XpresData

Modern data-bundle storefront (Next.js App Router + Paystack) — inspired by the SprintData buyer page.

## Run

```bash
npm install
cp .env.example .env.local   # fill in Paystack test keys
npm run dev                  # http://localhost:3000
```

Without Paystack keys, `/api/checkout` returns a clear error: *"Paystack is not configured…"* — add `PAYSTACK_SECRET_KEY` to enable MoMo/Card redirects.

## Paystack flow

`Buy now` → enter 10-digit phone → `POST /api/checkout` (amount from server bundle table) → Paystack Initialize → redirect to `authorization_url` → `/success?reference=…` → `GET /api/verify` confirms + marks order `paid`. Optional webhook: `POST /api/webhooks/paystack`.

Connect your Paystack Test Mode key: https://dashboard.paystack.com → Settings → API Keys. For live: swap to `sk_live_…` / `pk_live_…`.

## Edit

- Seller + WhatsApp number: `data/config.ts`
- Bundles/prices/networks: `data/bundles.ts`
- Orders (demo in-memory store): `lib/orders.ts` — replace with a DB (Supabase/Postgres) for production. Fulfillment hook marked TODO in `app/api/verify/route.ts`.
