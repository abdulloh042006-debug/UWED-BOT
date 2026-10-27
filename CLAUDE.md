# CLAUDE.md — UWED Talent Network (master)

Telegram bot + Mini App for UWED students: find study/project partners by skills, send invitations, schedule
sessions, chat, find mentors, join projects, build a verified portfolio. Admin panel for moderation.
This file is the source of truth for how to work in this repo. `AGENTS.md`, `README.md`, `TASKS.md` and the older
files in `docs/` describe an earlier ChatGPT Sites plan and are partly outdated; where they conflict, follow this file.

## Owner and communication

- The owner writes in Uzbek and does not use a terminal. Reply in Uzbek, short and concrete.
- Anything the owner must do (Cloudflare dashboard, BotFather, Telegram links) is given as click-by-click steps.
- Never ask for, print, log or commit secrets (bot token, webhook secret, session secret). When a URL needs the
  token, write it as `<TOKEN>` and let the owner fill it in.
- Report every change with four separate statuses: **source pushed**, **tests**, **production deploy**,
  **real Telegram check**. Never claim something is live or works in Telegram without checking (see Deploy).

## Stack

- Cloudflare Worker (plain ESM, no framework, no npm dependencies), D1 (`DB`), R2 (`BUCKET`).
- Worker name `uwed-bot`, URL `https://uwed-bot.abdulloh042006.workers.dev`, bot `@uwedrobot`.
- Client is vanilla JS generated as a string and served at `/app.js`; CSS is inlined into the HTML shell.
- Node ≥ 20 for tests (`node:test`, `node:sqlite`).

## Repository map

| Path | What it is |
|---|---|
| `worker/index.js` | Router, auth (`auth/telegram`), core API, bot webhook, outbox, `/health`, error translation |
| `worker/core.js` | initData verification, sessions, matching score, request state machine |
| `worker/chat.js` | 1:1 chat API (rate limits, blocks) |
| `worker/teams.js` | projects, portfolio, evidence uploads |
| `worker/admin.js`, `worker/admin-access.js` | admin API; owner/head/admin/moderator tiers |
| `worker/ui.js` | HTML shell (`page()`), the whole client (`client`), `clientVersion` hash |
| `worker/admin-ui.js` | admin screens (string composed into the client) |
| `worker/ui-theme.js` | design tokens + all CSS (`ui-styles.js` re-exports it) |
| `worker/ui-icons.js` | inline Lucide-style SVG icons (`uiIcon(name)`) |
| `worker/i18n.js` | all translations: client table, API errors, bot texts, notification templates |
| `worker/migrations.js` | GENERATED from `db/*.sql` — never edit by hand |
| `db/00NN_*.sql` | ordered migrations, applied at runtime by `ensureMigrations` |
| `tests/*.test.js` | API, client-in-VM, i18n coverage, bot, webhook tests |
| `scripts/` | migration generator, build, local dev simulator, bot setup, health |
| `design/` | original design prototypes (reference only, not shipped) |

## Commands

```bash
npm run check   # syntax checks + all tests + build — must pass before every push
npm test        # tests only (regenerates migrations first)
npm run dev     # local Telegram simulator (?user=101 / 202 / 999)
npx --yes wrangler@4 deploy --dry-run --outdir /tmp/wr   # proves Cloudflare can bundle it
```

## Deploy (Cloudflare Workers Builds from GitHub)

- Cloudflare builds automatically on push. **Production deploys come from `feature/claude-ui-v2`.**
  `main` is kept identical (pushes to `main` only create preview versions).
- Push the production branch **first**, then `main`. Cloudflare builds a commit SHA only once, so if `main`
  receives the SHA first the production build may never run. To retrigger, push an empty commit to the
  production branch.
- After pushing, verify instead of assuming:
  1. GitHub check suite "Cloudflare Workers and Pages" for the SHA is `completed/success`
     (`gh api repos/abdulloh042006-debug/UWED-BOT/commits/<sha>/check-suites`).
  2. `GET /health` shows the new `BUILD` value. **Bump `const BUILD` in `worker/index.js` in every
     deploy-worthy commit** so this check is meaningful.
- `/health` returns only booleans and counts: which settings exist, last migration, webhook delivery state
  (pending updates, last Telegram error). Use it before blaming code for bot problems.
- `wrangler.toml` holds public config only: `MINIAPP_URL`, `FULL_ADMIN_TELEGRAM_ID` (owner), `HEAD_ADMIN_TELEGRAM_ID`,
  D1/R2 bindings, `keep_vars = true`. Without `[vars]`/`keep_vars`, deploys wipe dashboard variables.
- Secrets live only in the Cloudflare dashboard: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `SESSION_SECRET`
  (optional `GEMINI_API_KEY`, `GEMINI_MODEL`, `BOOTSTRAP_ADMIN_TELEGRAM_ID`). Never add a `[vars]` entry with the
  same name as a dashboard secret — the deploy fails.

## Telegram bot

- Webhook: `POST /api/v1/bot/webhook`, header `X-Telegram-Bot-Api-Secret-Token` must equal the secret.
- Owner re-sets it with
  `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://uwed-bot.abdulloh042006.workers.dev/api/v1/bot/webhook&secret_token=<SECRET>&drop_pending_updates=true`.
- The webhook must return 2xx for permanent Telegram errors (blocked bot, expired callback): a 5xx makes Telegram
  resend the same update forever and every later update gets stuck. Only transient errors may return 5xx.
- Bot texts, buttons, callback answers and command menus (uz default, ru, en) come from `msg()` in `i18n.js`.
- Outgoing notifications go through `notifications` + `bot_outbox` and are flushed in `ctx.waitUntil`.

## Auth, roles, admins

- Login only via Telegram-signed `initData` → HttpOnly session cookie (1 h). `auth/telegram` returns the profile.
- Tiers: owner (`FULL_ADMIN_TELEGRAM_ID`, hidden from user lists), head (`HEAD_ADMIN_TELEGRAM_ID`), admin,
  moderator. Configured top admins are promoted to role `admin` on login. Server checks use the DB role.
- Announcements never go to the sender; `students`/`mentors` audiences exclude both top admins.

## Client rules (`worker/ui.js`, `worker/admin-ui.js`)

- The client is a JS **template literal**. Inside it: no backticks, no `${…}` except intentional interpolation, and
  regex backslashes must be doubled (`/\\s+/`), otherwise they silently disappear.
- Every user-visible string goes through `T('<Uzbek source>', {vars})`. Add the `[uz, ru, en]` row to `CLIENT` in
  `worker/i18n.js`. A test fails if any `T()` key or any server `fail(...)` message lacks ru/en. Same Uzbek text =
  same key; if meanings differ, use different Uzbek wording (e.g. `Ko‘rinish` vs `Tashqi ko‘rinish`).
- Use `‘` / `’` (not ASCII `'`) in Uzbek and English text inside the client.
- Escape all user data with `escape()`; translations are trusted plain text, never HTML.
- `api()` caches GET responses in memory (stale-while-revalidate) and clears the cache on every write. Chat
  polling uses `fetchJson` directly. Keep this when adding screens.
- Fetch independent data with `Promise.all`; skeletons appear only after 150 ms.
- Language: profile `ui_lang` → device `localStorage` → Telegram `language_code`. API calls send `x-ui-lang`;
  the server translates error messages and renders notifications in the recipient's language.
- The test VM has no real DOM: guard browser-only APIs (`document.createElement`, `localStorage`) and pass any new
  globals into `runInNewContext` in tests.

## Design system

- "UWED26" design (owner-approved Oct 2026). Tokens in `worker/ui-theme.js`: Cloud Dancer `#F0EEE9` (light
  background), warm near-black `#1C1B19` (dark background), carmine `--action-primary` `#A51C30` (fills, white text);
  `--accent-text` for red text/icons (`#A51C30` light, `#EF6B78` dark — never use `--action-primary` as a text colour
  on dark). 4 px spacing scale (`--space-*`), radii (`--radius-*`), type scale, motion 120/200/300 ms with
  reduced-motion support. Dark is the default theme; light and auto are user options.
- Glass is allowed only on surfaces (`.card`, `.quick-grid`, `.next-card`, `.metric`, `.empty-state`, `nav.app-nav`)
  via `--glass*` tokens, over the quiet `.bg-mark` "UW / ED / 26" background in the page shell. Keep the
  `@supports not (backdrop-filter)` and `prefers-reduced-transparency` solid fallbacks. Background letters stay
  low-contrast so text placed directly on the page still passes 4.5:1. No gradients or glow.
- Logo: the UW/ED monogram (`.logo-mark` inline SVG in the splash; source files in `design/logo/`).
  Status colour always paired with an icon or word. Tap targets ≥ 44 px. Focus ring 2 px solid `--focus`.
- CSP: `script-src 'self' https://telegram.org; style-src 'unsafe-inline'`. No external fonts, images or CDNs;
  icons are inline SVG from `ui-icons.js`; system font stack.
- Layout: bottom tab bar on phones, side rail from 900 px, two-column card grids from 768 px. Check 320, 390 and
  1280 px wide with no horizontal overflow, in dark and light, and in ru/en (longer labels).

## Database (D1)

- In production D1 `.first()/.all()/.run()` are **async**; the test fake is synchronous, so a missing `await`
  passes tests and breaks production. Always `await` DB calls.
- New schema = new file `db/00NN_name.sql`; never edit an applied migration. Statements are split on `;`, so no
  semicolons inside SQL strings. `npm test` regenerates `worker/migrations.js`.
- Skills: only `approved=1` skills count for matching. New names are stored as pending, shown to the owner with an
  "in review" badge, and approved/rejected in Admin → Tasdiqlash.

## Testing and definition of done

- Add or update tests for every behaviour change (API, bot, i18n, client flow). `npm run check` must be green.
- For UI changes render the real client in Chromium (Playwright, mock `/api/v1/*` responses, set
  `window.Telegram.WebApp`) and look at screenshots before pushing.
- Commit with a clear message, push production branch then `main`, confirm the build and `/health`, then report
  the four statuses in Uzbek. Ask the owner to test in real Telegram; say plainly what was not verified.
