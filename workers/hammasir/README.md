# هم‌مسیر توس — Cloudflare Worker + D1

Backend for the `/hammasir` personnel campaign page (static site → this Worker).
Personnel sign in with **personnel code + PIN** and see their Rad-Coin wallet
(knowledge share = learning; mission share = real-system work), study their learning
tracks, take weekly quizzes, report courses/classes and follow the team leaderboard.
HR/admins manage everything from `/hammasir/admin`.

## Learning tracks

Eleven tracks live in `src/curriculum/`, following campaign document v2 (lessons and quiz
answers stay in the Worker, so internal strategy content is only served to signed-in staff):

| Track | Audience |
| --- | --- |
| `strategy` آموزش استراتژیک سازمان | everyone |
| `management` مدیران و سرپرستان (KPI/OKR، کارت فردی، مربی‌گری) | managers (6th import column) |
| `technical` فنی و مهندسی و کارگاه‌ها | unit `technical` |
| `plants` کارخانجات و تولید | unit `plants` |
| `machinery` ماشین‌آلات و ناوگان | unit `machinery` |
| `finance` مالی، بودجه و انبارها | unit `finance` |
| `sales` مناقصات، قراردادها و بازرگانی | unit `sales` |
| `hr` سرمایه انسانی، اداری و HSE | unit `hr` |
| `rnd` تحقیقات و توسعه | unit `rnd` |
| `osm` تیم استراتژیک (OSM) | unit `strategy` |
| `ai` آکادمی هوش مصنوعی (final challenge varies by unit) | everyone |

Each unit track also lists the unit's operational tasks (the 60% share, entered by admins
as mission points) and a learning map. Wallet shares: strategic knowledge 20%, AI skill 20%,
operations 60% (AI-track points go to the AI share; unit final projects and approved
improvement projects to operations).

Other modules: glossary and 50-prompt bank (site data in `lib/data/`), improvement projects
scored by a manager on ease × impact (1–5 each, × 8 points), reward store (spending does not
lower league rank; rejecting a request refunds), encouragement messages, a manager «تیم من» tab
(team progress, approvals for their own unit/site, OKR builder) and a people export with a
random prize draw on the admin page.

Each track has 5–6 lessons (reading, key points, a weekly action, a 4-question quiz)
and a final practical assignment. A lesson unlocks in its campaign week; passing
needs 70%. Only the **first** attempt earns points (40 max), later attempts can still
pass. After all lessons are passed the person submits the assignment; a manager
approves it on the admin page (rejecting requires feedback) and only then its points
count, in the mission share.

Quiz options are shuffled deterministically per question, so editing a question's
options changes the served order; do that between campaigns, not mid-week.
After editing content run `npm run check:curriculum`.

## Setup (once)

```bash
cd workers/hammasir
npm install
npx wrangler login
npx wrangler d1 create hammasir        # paste database_id into wrangler.toml
npm run db:migrate                      # create / upgrade tables
npx wrangler d1 execute hammasir --remote --file=seed.sql   # optional sample units, quiz, courses
npx wrangler secret put ADMIN_TOKEN     # admin password, 16+ characters
npx wrangler secret put PIN_PEPPER      # random string, 16+ characters; never change after PINs are issued
```

In `wrangler.toml` set `CAMPAIGN_START` (first day of week 1, `YYYY-MM-DD`) and
`ALLOWED_ORIGIN` to the site origin(s), comma-separated, e.g.
`https://tousradieh.com,https://www.tousradieh.com`. Then:

```bash
npm run deploy
```

Site env (repo root `.env.local` + GitHub Actions secret):

```bash
NEXT_PUBLIC_HAMMASIR_API_URL=https://tousradieh-hammasir.YOUR_SUBDOMAIN.workers.dev
```

## Starter data

- `seed.sql` (safe to re-run): 15 sample units/sites, 8 weekly quizzes (month 1 basics,
  month 2 scenarios), courses and the 4 managers' workshops, 4 store rewards.
- `sample-data/units.csv`, `sample-data/missions.csv`: paste into the admin imports.
- `sample-data/personnel.csv`: fictional staff list. Build the import file with random PINs:

  ```bash
  node scripts/make-pins.mjs sample-data/personnel.csv
  ```

  It writes `sample-data/private/personnel-import.csv` (paste into «پرسنل») and
  `pin-slips.csv` (hand out privately). That folder is git-ignored; never commit it. Use the
  same script on the real staff list.

**Upgrading** a database created with the old `schema.sql` (`npm run db:init`): just
run `npm run db:migrate`; `0001` only creates missing tables and `0002` adds the
department column and the new tables. Existing sign-ins are ended once (sessions are
now stored hashed).

## Admin imports (paste from Excel or CSV, header row optional)

| Import | Columns |
| --- | --- |
| Units / sites | `id, name` — id is lowercase latin, digits, `-`; e.g. `golbahar, مجتمع گلبهار` |
| Personnel | `code, name, team_id, pin, department, manager` — PIN 6–8 digits, blank keeps the existing one; department is one of `technical, plants, machinery, finance, sales, hr, rnd, strategy` (blank = shared tracks only); manager column `مدیر` (or `1`) for managers/supervisors |
| Mission points | `target, week, points, note` — target is a personnel code or `team:<id>` for the whole unit; negative points correct a mistake |

Setting a new PIN signs that person out everywhere. Courses/classes and weekly quizzes
are added on the admin page (quiz JSON: `[{"q": "...", "options": ["...", "..."], "answer": 0}]`).

## Security notes

- PINs are SHA-256 hashed with the code and `PIN_PEPPER`; session tokens are stored hashed.
- Five wrong PINs lock that code for 15 minutes; 30 failed sign-ins per IP per hour
  (10 for the admin password) block that IP for an hour.
- Admin password compared in constant time; quiz answers are never sent before submission.
- Bodies are capped (64 KB, 1 MB for admin imports); every query is parameterised.
- The site stores the personnel token in `localStorage` and the admin password in
  `sessionStorage` (cleared when the tab closes). Use the admin page only on trusted devices.

## Local test

`workers/hammasir/.dev.vars`:

```bash
ADMIN_TOKEN=dev-admin-token-0123456789
PIN_PEPPER=dev-pepper-0123456789abcdef
ALLOWED_ORIGIN=*
```

```bash
npm run db:migrate:local
npm run db:seed:local
npx wrangler dev --var CAMPAIGN_START:2026-06-01   # a past date opens every week
```
