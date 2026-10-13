# Hosting feasibility — 2026-10-12

**Decision:** Option A is plausible but not yet proven. Local code targets Cloudflare Worker HTTP semantics with D1 and a replaceable storage boundary. No claim of a functioning Sites deployment is made. Option B is not selected. Before any paid or external backend choice, present the blocker, limits, cost and migration effects for approval.

Evidence: the installed Sites skill documents hosted Cloudflare Workers (128 MB/isolate, HTTP external connections), public/owner-private audiences, D1 and R2 bindings, runtime secrets and deployment migrations. These are platform documentation, not a test of this specific project. The Worker ESM starter is dependency-free. The empty connected `abdulloh042006-debug/UWED-BOT` repository has no deployment or tests. `git ls-remote` failed because direct GitHub network access is unavailable here.

| Requirement | State | Evidence / next verification |
|---|---|---|
| Public HTTPS URL for BotFather Web App | Unverified | Sites publishing workflow supplies a deployed URL; none exists for this project. Create a private test then public audience only after review; launch in Telegram. |
| Telegram WebApp Android/iOS/desktop | Unverified | Requires actual URL and devices. |
| Frontend and server-side HTTP API | Verified capability, project unverified | Sites Worker ESM starter exports `fetch(request, env, ctx)`. Local build and API tests still required. |
| Server-side secrets | Verified capability, project unverified | Sites identity/secrets guidance describes runtime values; configure only via native secret tools at approved deployment. |
| Signed initData and freshness | Unverified | Can run in Worker Web Crypto; test locally and then with a real Telegram launch. |
| Durable structured DB | Verified capability, project unverified | Sites storage guidance documents D1 and migrations. Bind and test restart persistence after deployment. |
| Private file storage | Verified capability, project unverified | R2 documented; auth, content validation and actual upload/download remain to be tested. |
| Inbound Telegram HTTPS webhook | Unverified | Worker accepts POST in principle; test Telegram delivery and secret header on actual public URL. |
| Outbound Telegram/Gemini HTTPS | Unverified | Worker supports HTTP external connections; test provider reachability with secrets and quotas. |
| Reminders/background jobs | Unverified | Sites has scheduling tools, but the suitable unattended Worker invocation and delivery contract are not yet established. Keep persistent outbox; do not promise reminders. |
| Quotas for 50–100 students | Unverified | Measure invocation, D1/R2 and outbound usage during pilot; account beta limits may vary. |
| Backup/export/restore | Unverified | D1/R2 export and restore operation must be exercised before pilot. |

The user-facing channel remains Telegram only. A public URL is a technical Mini App endpoint; outside a verified Telegram session the page shows only an opening instruction, and API resources reject access. A private ChatGPT sign-in Site would add an unwanted sign-in boundary, so audience and webhook reachability require a real test before publication.
