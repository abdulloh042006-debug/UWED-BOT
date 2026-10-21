# UWED Talent Network agent instructions

## Repository, tests, and automatic deployment

- Repository: `abdulloh042006-debug/UWED-BOT`; work on `feature/codex-core`.
- The owner does not have a paid ChatGPT subscription. Do not make ChatGPT Sites access a prerequisite. The existing URL `https://uwed-talent-network-2026.abdulloh042006.chatgpt.site/` must remain untouched until a safe migration/cutover is explicitly approved.
- Default hosting fallback: free Cloudflare Workers + D1 + R2, deployed through `.github/workflows/deploy-cloudflare.yml`. Once the owner configures the one-time GitHub Actions secrets/variables in `docs/CLOUDFLARE_FREE_DEPLOYMENT.md`, every push to `feature/codex-core` runs tests, deploys, and runs public smoke checks. If those values are absent, the deploy workflow reports that it skipped; never call a skipped workflow a deployment.
- Do not cut over `@uwedrobot`, change its webhook/Mini App URL, or claim the new Worker is production-ready until the owner has decided how to preserve/migrate the existing site's data. The Cloudflare D1 database is a separate environment unless data is explicitly exported/imported. Keep the old URL and bot configuration unchanged by default.
- Never reset or repurpose an existing D1 database or R2 bucket without a backup and explicit verification. The first Cloudflare deployment should use a dedicated D1 database and R2 bucket. Schema migrations are applied by the Worker on the first API request.
- Run `npm run check` before deployment. After a successful Cloudflare deployment, run `npm run site:health -- <deployment-url>/`; the automatic workflow does this. Real Telegram login, outbound delivery, private uploads and two-account messaging still need real-device checks.
- Never expose or commit credentials. Store Cloudflare API token, Telegram bot token, webhook secret, session secret and admin Telegram ID only in GitHub Actions secrets/host runtime secrets. Rotate the previously exposed Telegram token before enabling the new deployment.
- BotFather/webhook changes are a separate, deliberate cutover action. Only perform them after the new public URL and database pass smoke checks and the owner confirms the existing data migration/restart decision.
- Report four statuses separately: **source committed/pushed**, **tests**, **Cloudflare deployment**, **real Telegram verification**.
