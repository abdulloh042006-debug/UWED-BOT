# Free Cloudflare deployment for UWED Talent Network

This path does not require a paid ChatGPT subscription. Cloudflare Workers has a free tier (currently up to 100,000 requests/day); D1 also has free daily read/write/storage quotas. See [Workers pricing](https://www.cloudflare.com/plans/developer-platform/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

## Important: new hosting is not the same as data migration

- This deploys the Worker to a new Cloudflare `workers.dev` URL. It does **not** replace or delete the existing ChatGPT Site.
- The new D1 database and R2 bucket must be treated as a separate environment. Do not point the Worker at a database containing existing production data unless its schema and migration history have been backed up and verified.
- Do not change `@uwedrobot`'s Mini App URL or webhook as part of an ordinary code deploy. The existing bot/site should remain untouched until a decision is made about exporting/importing any existing student data and completing a real-device acceptance test.
- The Worker applies SQL migrations on its first API request. The deployment smoke test deliberately checks the DB migration path and fails if the schema cannot be initialized.

## One-time Cloudflare setup

1. Create or sign in to a **free Cloudflare account**. Open **Workers & Pages** and choose/enable a `workers.dev` subdomain. No custom domain is required.
2. Create a new D1 database named `uwed-talent-network`. Copy its database ID.
3. Create a new private R2 bucket, e.g. `uwed-talent-network-evidence`. Do not enable public bucket access.
4. Create a Cloudflare API token scoped to this account, with the minimum needed permissions to deploy Workers and access the selected D1/R2 resources. Keep the token secret.
5. In GitHub, open the repository **Settings → Secrets and variables → Actions**.

### Add these Repository secrets

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.
- `SESSION_SECRET` — random secret at least 32 bytes long. Generate it locally; do not paste it into ChatGPT.
- `TELEGRAM_BOT_TOKEN` — use a fresh token from BotFather. Rotate the token that may have been exposed previously.
- `TELEGRAM_WEBHOOK_SECRET` — 16–256 characters using letters, numbers, underscores or hyphens.
- `BOOTSTRAP_ADMIN_TELEGRAM_ID` — numeric Telegram ID for the initial administrator.
- Optional: `GEMINI_API_KEY`.

Secrets are not committed to the repository. The workflow writes a temporary ignored file on the GitHub runner and never prints secret values.

### Add these Repository variables

- `CLOUDFLARE_D1_DATABASE_ID` — ID copied from the new D1 database.
- `CLOUDFLARE_R2_BUCKET_NAME` — exact name of the private R2 bucket.
- `CLOUDFLARE_D1_DATABASE_NAME` — `uwed-talent-network` (optional; this is the default).
- `CLOUDFLARE_WORKER_NAME` — `uwed-talent-network` (optional; this is the default).
- `MINIAPP_URL` — initially may be left blank; set it to the deployed Worker HTTPS URL after the first successful deployment.
- Optional: `GEMINI_MODEL` — only set to a model that has been verified for the supplied Gemini key.

## Automatic deployment

Once the two Cloudflare credentials and the D1/R2 variables are present, every push to `feature/codex-core` will:

1. Run `npm run check` (tests and build).
2. Generate the ignored Wrangler config and temporary secrets file.
3. Deploy the Worker using Cloudflare's official Wrangler action.
4. Run public smoke checks for the Mini App shell, chat/admin/evidence UI markers and unauthenticated API protection.

If the Cloudflare settings are missing, the deploy workflow explicitly skips deployment; a green test workflow alone does not mean the site was deployed. See the repository's **Actions → Deploy Cloudflare Worker** workflow for the actual status and URL.

After the first deploy, copy the HTTPS Worker URL from the Actions log into the `MINIAPP_URL` repository variable, then use **Actions → Deploy Cloudflare Worker → Run workflow** to publish that setting. Keep the existing Telegram bot webhook unchanged until the data migration/cutover decision is complete.

## After deploy: bot cutover is separate

Only after the new Worker passes smoke checks and existing data has been exported/imported or the owner has explicitly chosen a fresh start, configure the BotFather Mini App URL and webhook using `npm run bot:setup -- --apply` in a secure shell with `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and `MINIAPP_URL` supplied through environment variables. Never enter those values in a chat message. Then test two separate Telegram accounts, private chat permissions, admin-to-user messages, and private PDF/image evidence uploads.
