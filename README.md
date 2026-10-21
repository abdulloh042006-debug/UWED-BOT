# UWED Talent Network - pilot implementation

Telegram Bot + Mini App only. This is unpublished source code for the 50–100 student pilot described in TZ v1.2. It has no independent account/password login or public personal-data page.

## Local verification

Node.js 24 is available in this workspace. No npm dependencies are required.

```text
npm run check
npm run dev
```

`npm run dev` starts a local-only Telegram simulator at a printed `127.0.0.1` URL. `?user=101`, `?user=202`, and `?user=999` are disposable test identities; `999` is a test admin. The simulator signs short-lived test initData and stores local SQLite data in `.dev.sqlite`. It is excluded from the Worker build and must never be used as production authentication. Delete the local test database when fresh fixtures are needed.

The release build copies ESM Worker modules into `dist/server`. The authenticated API namespace is `/api/v1/`; the public root contains only the Telegram opening shell. Migrations are under `db/` in order. ChatGPT Sites deployment is not required: a free Cloudflare Workers + D1 + R2 deployment path is provided. See `docs/CLOUDFLARE_FREE_DEPLOYMENT.md`. The Cloudflare database is separate from the existing ChatGPT Site's data; do not switch the Telegram bot until the data migration/cutover decision is made.

## Implemented local flows

- Signed Telegram launch, profile/skills, availability, visibility, verified role moderation.
- Explainable skill matching, invitations, recipient decisions, mutually confirmed times and completion, ratings.
- Project roles/applications, member deliverables, completed project contribution, portfolio moderation and private evidence adapter.
- In-app notification history, bot webhook and delivery outbox, bounded inline callbacks.
- Role-gated Admin Panel: dashboard, paginated users, suspension, verification, reports, project moderation, Telegram announcements, settings and audit history.
- Production Mini App and admin screens use the visual tokens and layout patterns in Claude's `design/*.dc.html` prototypes. Those prototypes remain unmodified references and are not shipped as runtime components.
- Optional Gemini explanation with explicit consent, five requests per user/day, a one-day cache and rule-based fallback. Score and verification stay deterministic.

See `TASKS.md`, `docs/ADMIN_INTEGRATION.md`, `docs/HOSTING_FEASIBILITY.md`, `docs/CLOUDFLARE_FREE_DEPLOYMENT.md`, `docs/DEPLOYMENT.md`, `docs/TEST_PLAN.md` and `docs/UI_HANDOFF_FOR_CLAUDE.md` for remaining gates. GitHub CI is not the same as production deployment; the Cloudflare deploy workflow stays skipped until its required account settings are added.
