# UWED Talent Network agent instructions

## Repository and deployment

- Work on the existing repository `abdulloh042006-debug/UWED-BOT`, production source branch `feature/codex-core`.
- Use the **existing** ChatGPT Sites project `appgprj_6acced78c5d08191a4e1c4a83fcaae99` and live URL `https://uwed-talent-network-2026.abdulloh042006.chatgpt.site/`. Never replace it with a new Site without the owner's explicit approval.
- The project owner wants **deployment included in every completed change**. After implementing and testing each approved code change, push it, deploy the verified commit to the existing Sites project **whenever Sites deployment tools are available**, then run the production smoke test. Do not stop at GitHub push while claiming the site was updated.
- Deployment must use a ChatGPT Sites-capable interface. Do not claim that `git push`, CI success or a local build constitutes production deployment. If the Sites deployment interface is unavailable, report the blocker, provide the precise commit to deploy, and explicitly label the deployment **pending**. Never invent an automated Sites deployment API.
- Preserve the current site's public URL, audience rules, runtime secret bindings, existing D1 database (`DB`), and R2 object store (`BUCKET`). Avoid resetting existing data. Back up persistent data and review all schema changes before applying migrations. Never expose or commit credentials.
- Run `npm run check` before declaring implementation complete. After a successful deployment run `npm run site:health -- https://uwed-talent-network-2026.abdulloh042006.chatgpt.site/` and, when relevant, real-device Telegram bot and Mini App tests.
- Rotate leaked credentials through a secure channel. Never paste bot tokens, webhook secrets or session secrets into chat, URLs, logs or Git history.
- When updating bot commands or the webhook, do so only after the newly deployed Site passes readiness checks and from a secure environment with valid runtime credentials; use `node scripts/telegram-setup.mjs --apply`.
- Report four separate statuses: **source committed/pushed**, **tests**, **production deployment**, **real Telegram verification**.
