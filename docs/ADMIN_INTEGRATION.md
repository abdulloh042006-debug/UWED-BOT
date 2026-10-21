# Admin integration and Claude design coordination

The remote `feature/admin-panel-ui` branch at `063147f2c2050587dfa430e07eb83581262acac9` is the base history for Codex's separate branch. Its `design/Main.dc.html`, `design/Admin.dc.html`, `design/README.md`, `design/canvas.json`, and `docs/admin-api-requirements.md` are preserved byte for byte. The `.dc.html` files require the Claude Design `support.js` runtime; neither file is a production component or a source of live data.

`worker/ui-theme.js` translates the shared Manrope, UWED blue (`#38567e`), burgundy (`#8a0019`), gold (`#d4af37`), rounded card/header, chip and motion patterns into the existing vanilla JS Mini App. Telegram theme variables, safe-area insets, responsive layouts and reduced-motion preferences remain supported. `worker/admin-ui.js` implements the panel sections with real `/api/v1/admin/*` responses. The production UI never imports `support.js` or prototype DEV fixtures.

Claude owns visual critique and further presentation refinements to the preserved prototypes or a distinct UI branch. Codex owns the backend contract, authentication, moderation, migrations and API integration. The PR explicitly requests Claude's design review. No direct communication with Claude is claimed here.

## API contract

All admin routes are under `/api/v1/admin`. A verified Telegram `initData` creates a one-hour HttpOnly cookie; every subsequent request resolves that session server-side and rejects suspension. Staff can read dashboard, users, verification, reports, projects, settings and audit. Moderators can decide verifications and reports or hide projects. Only admins can change roles, suspend/restore accounts, send announcements and change settings. Self-approval and self-role/suspension changes are denied.

Lists use `page` and `limit` (1–100) with total and `has_more`; audit uses an opaque, stable `(created_at,id)` cursor. Status filters accept documented enums, and errors use `{error:{code,message}}`. Portfolio certificates include `certificate` and `ielts` kinds; other portfolio kinds use `portfolio`. University verification remains available in addition to the three design tabs. Verification IDs for portfolio are prefixed `certificate:` or `portfolio:` to disambiguate underlying tables. The legacy `PATCH` moderation routes remain for the existing Mini App while the admin panel uses the new `POST .../approve|reject` contract.

Announcements create in-app notifications and durable outbox jobs for the chosen audience. The existing bounded outbox flush sends through Telegram; it needs a verified unattended scheduler for prompt delivery during idle periods. The delivery endpoint reports queued, Telegram API accepted (`sent`), and failed jobs; `delivered` stays zero because Telegram does not provide per-recipient delivery receipts. No prototype sample count is presented as a live number.

Settings currently expose four boolean keys: `maintenance_mode`, `allow_projects`, `allow_skill_exchange`, and `announcement_enabled`. Their effects are enforced in the Worker. Content removal is idempotent and hides project, portfolio or review content from student views. Moderation records remain for audit. The legacy moderation routes should be retired in a later compatibility window once existing clients are upgraded.

## Verification and remaining gates

`npm run check` runs syntax checks, the Node SQLite/D1 integration suite, a browser-client VM test that authenticates and reads live admin responses, and the Worker build. No production Site, real Telegram device, BotFather configuration, R2 binding, scheduler or hosted migration has been verified. Claude's visual review is still pending.
