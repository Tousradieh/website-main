# Leads → Bale Cloudflare Worker

Receives materials-form POSTs from the static site, verifies Cloudflare Turnstile (`TURNSTILE_SECRET`), then forwards a Persian message to the procurement manager via Bale Bot API.

## Setup

```bash
cd workers/leads
npm install
npx wrangler login
npx wrangler secret put BALE_BOT_TOKEN
npx wrangler secret put BALE_PROCUREMENT_CHAT_ID
npx wrangler secret put TURNSTILE_SECRET
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
```

## Local test

`workers/leads/.dev.vars`:

```bash
BALE_BOT_TOKEN=...
BALE_PROCUREMENT_CHAT_ID=...
TURNSTILE_SECRET=...
```

```bash
npm run dev
```

The procurement manager must message the bot once so `BALE_PROCUREMENT_CHAT_ID` is valid.
