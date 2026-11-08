# هم‌مسیر توس — Cloudflare Worker + D1

Backend for the `/hammasir` personnel campaign page (static site → this Worker).
Personnel sign in with **personnel code + PIN** and see their Rad-Coin wallet
(quiz points = knowledge, mission points = real-system work), take weekly quizzes,
and see the team leaderboard. HR/admins manage everything from `/hammasir/admin`.

## Setup (once)

```bash
cd workers/hammasir
npm install
npx wrangler login
npx wrangler d1 create hammasir        # paste database_id into wrangler.toml
npm run db:init                         # create tables
npx wrangler d1 execute hammasir --remote --file=seed.sql   # optional sample teams + week-1 quiz
npx wrangler secret put ADMIN_TOKEN     # password for /hammasir/admin
npx wrangler secret put PIN_PEPPER      # long random string; never change it after PINs are issued
```

Set `CAMPAIGN_START` (first day of week 1, `YYYY-MM-DD`) in `wrangler.toml`, then:

```bash
npm run deploy
```

Site env (repo root `.env.local` + GitHub Actions secret):

```bash
NEXT_PUBLIC_HAMMASIR_API_URL=https://tousradieh-hammasir.YOUR_SUBDOMAIN.workers.dev
```

## Admin imports (paste from Excel or CSV, header row optional)

| Import | Columns |
| --- | --- |
| Units / sites | `id, name` — e.g. `golbahar, مجتمع گلبهار` |
| Personnel | `code, name, team_id, pin` — blank PIN keeps the existing one |
| Mission points | `target, week, points, note` — target is a personnel code or `team:<id>` for the whole unit; negative points correct a mistake |

Quizzes are added on the admin page as JSON:
`[{"q": "...", "options": ["...", "..."], "answer": 0}]` (answer is 0-based).

## Local test

`workers/hammasir/.dev.vars`:

```bash
ADMIN_TOKEN=dev-admin
PIN_PEPPER=dev-pepper
```

```bash
npm run db:init:local
npm run db:seed:local
npm run dev
```
