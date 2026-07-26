# Leads → Bale Cloudflare Worker

Receives materials-form POSTs from the static site and forwards a Persian message to the procurement manager via Bale Bot API.

## Setup

```bash
cd workers/leads
npm install
npx wrangler login
npx wrangler secret put BALE_BOT_TOKEN
npx wrangler secret put BALE_PROCUREMENT_CHAT_ID
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

Copy the worker URL (e.g. `https://tousradieh-leads.YOUR_SUBDOMAIN.workers.dev`) into the site env:

```bash
# repo root .env.local (and GitHub Actions secret for production builds)
NEXT_PUBLIC_LEADS_API_URL=https://tousradieh-leads.YOUR_SUBDOMAIN.workers.dev
```

## Local test

```bash
npm run dev
curl -X POST http://127.0.0.1:8787 \
  -H 'Content-Type: application/json' \
  -d '{"companyName":"تست","contactPerson":"علی","phone":"0912","materialType":"asphalt-hot","quantity":"100 تن"}'
```

The procurement manager must message the bot once so `BALE_PROCUREMENT_CHAT_ID` is valid.
