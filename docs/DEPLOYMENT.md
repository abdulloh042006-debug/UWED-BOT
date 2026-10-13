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

## Telegram @uwedrobot launch setup (after hosted deployment)

**Do not run setup until the public HTTPS Mini App, D1 migrations and server secrets work.** The script refuses to change the bot if the Mini App shell is not HTTP 200 or the unsigned API probe is not HTTP 401.

- Configure `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `SESSION_SECRET`, `BOOTSTRAP_ADMIN_TELEGRAM_ID` and `MINIAPP_URL` as runtime secrets on the host. Keep configuration out of Git/chat/logs.
- In a secured deployment shell, provide `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `MINIAPP_URL` as environment variables.
- Check configuration offline using `npm run bot:setup` (does not call Telegram).
- Execute `npm run bot:setup -- --apply` **only when live setup is authorized**. It probes the hosted application and API before calling Telegram. This installs name, description, short description, command list, Mini App menu button and webhook with a secret token.
- The script checks that the token belongs to `@uwedrobot`; it does not configure another bot.
- Test `/start` in Telegram after setup and check hosted D1 persistence plus real `initData`; successful setup alone is **not** a real-device pass.
- Bot avatar/photo must be set separately through BotFather or verified image upload; this script does not upload an image.
- If no public URL / D1 binding exists, stop. Do not claim the bot is live.

The current `.openai/hosting.json` deliberately has `d1: null` and `r2: null` until ChatGPT Sites bindings and migration steps are verified. Do not replace them with invented IDs.
