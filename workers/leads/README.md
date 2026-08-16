# Leads → Bale Cloudflare Worker

Receives materials-form and contact-form POSTs from the static site, verifies Cloudflare Turnstile (`TURNSTILE_SECRET`), then forwards a Persian message via Bale Bot API.

- `recipient: "procurement"` (default) → materials inquiry → `BALE_PROCUREMENT_CHAT_ID`
- `recipient: "sales"` → contact page inquiry → `BALE_SALES_CHAT_ID` if set, otherwise procurement chat

## Setup

```bash
cd workers/leads
npm install
npx wrangler login
npx wrangler secret put BALE_BOT_TOKEN
npx wrangler secret put BALE_PROCUREMENT_CHAT_ID
npx wrangler secret put TURNSTILE_SECRET
# optional; contact-form messages use procurement chat if omitted
npx wrangler secret put BALE_SALES_CHAT_ID
```

Optional: lock CORS to your GitHub Pages origin in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGIN = "https://YOUR_ORG.github.io"
```

## Deploy

```bash
npm run deploy
```

Site env (repo root `.env.local` + GitHub Actions secrets):

```bash
NEXT_PUBLIC_LEADS_API_URL=https://tousradieh-leads.YOUR_SUBDOMAIN.workers.dev
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAD-Y85vhIK94W0Mm
NEXT_PUBLIC_SITE_URL=https://tousradieh.com
```

## Local test

`workers/leads/.dev.vars`:

```bash
BALE_BOT_TOKEN=...
BALE_PROCUREMENT_CHAT_ID=...
BALE_SALES_CHAT_ID=...
TURNSTILE_SECRET=...
```

```bash
npm run dev
```

The procurement manager must message the bot once so `BALE_PROCUREMENT_CHAT_ID` is valid.
