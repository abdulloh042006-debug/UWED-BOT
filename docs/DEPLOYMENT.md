# Deployment and operations gate

No deployment has been authorized or performed. Do not use the current manifest as a production configuration; D1/R2 are deliberately `null` while their exact Site binding and migration contract remains untested.

## Before a private Sites dry run

1. Review source and determine Sites Worker ESM support for multi-file imports, D1 migration application, R2 binding, runtime secrets, inbound webhook and public audience without ChatGPT sign-in. Record actual commands, results and limits in `HOSTING_FEASIBILITY.md`.
2. Configure D1 `DB` and R2 `BUCKET` bindings using the verified Sites manifest format. Apply `db/0001_initial.sql` through `0005_admin_panel.sql` in order using the verified hosted migration mechanism. Test on a disposable private Site and back up before any later migration. Do not mutate applied migration files.
3. Provision runtime-only `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `SESSION_SECRET` (32+ random bytes), `BOOTSTRAP_ADMIN_TELEGRAM_ID`, `MINIAPP_URL`. Optional: `GEMINI_API_KEY` and a verified `GEMINI_MODEL`. Never paste values into chat, Git, browser bundles or logs. Validate the admin Telegram ID via a trusted process before first launch.
4. Verify a real public HTTPS URL. Only then configure BotFather Mini App URL/menu button and the webhook with its secret header. User approval is required before publication and BotFather/webhook changes.
5. Confirm signed initData from a real Telegram launch, two distinct accounts, a webhook callback, R2 authorization, durable records after restart/deploy, and mobile light/dark screens. Keep the pilot closed until the verification policy is defined.

## Runtime and recovery

- The outbox is persisted. Request and webhook activity runs a bounded delivery attempt; **there is no verified unattended scheduler**. Pending jobs can wait during inactivity. Do not promise one-hour reminders or prompt delivery until a Sites-compatible schedule/worker is verified, then add a bounded due-job endpoint and tests.
- Inspect pending/failed outbox and webhook event volume without printing bot tokens or student records. A blocked bot is an expected delivery failure; in-app inbox remains the record.
- Before pilot, exercise D1 export and R2 object backup, restore them into a disposable environment, compare row/object counts and access permissions, and document retention and deletion. No backup/restore command is claimed verified yet.
- Student data minimization: no mandatory phone/email. Evidence files are private, 10 MB maximum and PDF/JPEG/PNG signature checked. Malware scanning and university evidence rules require an operational decision before live upload.
- Assess Sites beta quotas, D1/R2 limits, regional storage constraints, cost, and failure recovery with 50–100 test accounts. If a required capability fails, document the blocker and seek approval before selecting Option B or any paid/external provider.
