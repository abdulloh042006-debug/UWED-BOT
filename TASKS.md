# UWED Talent Network — implementation ledger

Source of truth: TZ v1.2, Master Prompt v1.3, and Claude's `docs/admin-api-requirements.md`. The remote `feature/admin-panel-ui` branch contains design prototypes and the admin contract. This source is proposed on a separate `feature/codex-core` branch based on that history.

## Phase 0 — hosting decision

- [x] Read both requirements in full and inspect workspace and connected repository listing.
- [x] Record capability evidence and verification gaps in `docs/HOSTING_FEASIBILITY.md`.
- [x] Choose a host-independent HTTP Worker/D1 adapter for local development. Option A remains conditional on a private Sites deployment test; no external backend selected.

## Phase A — foundations

- [x] Telegram `initData` HMAC/freshness validation, short-lived session, Telegram-only UI/API gate.
- [x] D1 migrations, profile, skills, availability, role and evidence-link verification requests.
- [x] Webhook `/start` and route commands, secret check and deduplication. Menu button requires approved live BotFather setup.
- [x] Automated forgery, expiry, RBAC and webhook tests.

## Phase B — collaboration

- [x] Deterministic matches and actual score explanations; cross-timezone availability is conservatively unscored.
- [x] Exchange request transitions, mutual scheduling/completion and conflict checks.
- [x] In-app notifications and Telegram delivery outbox with retry lease. Unattended retries await verified scheduling support.

## Phase C — teams and trust

- [x] Mentor verification, projects, applications, contributions, portfolio, private R2 evidence adapter, reviews and moderation implemented and locally tested.
- [ ] Real R2 binding, malware scanning policy and manual evidence review procedure verified before pilot.

## Phase D — AI and pilot

- [x] Optional Gemini with consent/quota/cache/fallback; callback actions with sender/expiry/dedup checks.
- [ ] Reliable unattended reminders depend on a verified scheduler; not claimed implemented.
- [ ] Real Telegram and Sites integration, mobile tests, 50–100 person pilot readiness.

## Admin and frontend integration

- [x] Admin API contract: dashboard, paginated search, user detail, role, suspension, mentor/certificate/portfolio verification, reports, project moderation, announcements, settings, cursor audit.
- [x] Server authorization from verified Telegram session, admin/moderator policy, validation and audit records for consequential actions.
- [x] Functional API-backed admin views and design-token conversion from Claude prototypes, without sample data in production.
- [ ] Claude review of the production conversion against `design/Main.dc.html` and `design/Admin.dc.html`; coordinate any refinements on Claude's branch or a separate UI branch without editing the prototype files.

## External gates

- The user approved a push to `feature/codex-core` and a PR targeting the existing base branch. Merge, Site publication, BotFather changes and live webhook setup still require approval.
- Real-device acceptance requires a bot token stored as a runtime secret, an actual HTTPS URL, an admin Telegram ID provisioned securely, and the university verification policy.
- Hosted D1/R2 bindings and migration mechanism remain unverified; `.openai/hosting.json` intentionally leaves them `null` until a private deployment dry run.
