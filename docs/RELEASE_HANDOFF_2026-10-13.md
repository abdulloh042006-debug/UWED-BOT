# UWED Talent Network — deployment handoff (13 October 2026)

## Verified before deploy

- Repository: https://github.com/abdulloh042006-debug/UWED-BOT
- Source branch: `feature/codex-core`
- Existing ChatGPT Sites project: `appgprj_6acced78c5d08191a4e1c4a83fcaae99`
- Existing live URL: https://uwed-talent-network-2026.abdulloh042006.chatgpt.site/
- Local and GitHub CI: `npm run check` passes (29 tests prior to release helper).
- The live website responded 200 and its private `/api/v1/me` returned 401, **but /app.js was still an older version** with no new chat/admin-message/file evidence UI.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `MINIAPP_URL`, `SESSION_SECRET` were **not available in the new local PowerShell process**. Do not copy secrets into this file or Git.

## Sites deployment required (keep existing data)

1. In the existing **UWED Talent Network** Sites project, deploy the **latest** `feature/codex-core` source. Do **not** create a new Site, overwrite a database, switch to `main`, or reinitialize the app.
2. Preserve the existing D1 binding `DB` and R2 binding `BUCKET`. Ensure migration files `0006_verification_evidence.sql` and `0007_direct_messages.sql` are applied once through `ensureMigrations`. **Back up D1 before deploying.**
3. Keep runtime-only `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `MINIAPP_URL`, and administrative IDs. Do not reveal their values. The leaked bot token from earlier setup should be rotated.
4. Confirm the existing public URL is still used. Check with:

   ```powershell
   cd C:\UWED-bot-setup
   npm run site:health -- https://uwed-talent-network-2026.abdulloh042006.chatgpt.site/
   ```

   This checks that the new UI is deployed and that unauthorized requests are rejected. It does not check the real Telegram sign-in or message delivery.

## Bot setup (only after the Site has the new code)

- Make available **only in your local secure shell**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `MINIAPP_URL`. Use the identical webhook secret in Sites runtime.
- From the checkout, run `node .\scripts\telegram-setup.mjs --apply`. This configures 8 commands, including `/messages`, the Mini App menu and webhook. Script validates `@uwedrobot` identity before changes.
- A 403 `Wrong response from webhook` reported by Telegram is **not** proof that the Mini App itself is down. Recheck that Sites and setWebhook have matching secrets and that the deployed Worker accepts `X-Telegram-Bot-Api-Secret-Token`. Never send the token/secret in a chat message.
- A Telegram API accepted message is not evidence of device delivery; users may block the bot or disable bot notifications. Notifications remain in the Mini App.

## Real-device acceptance

1. Open `@uwedrobot` via two different Telegram accounts and verify their signed Mini App logins.
2. In **Xabarlar**, send text A→B then B→A; confirm each account cannot see a third party's conversations. Confirm unread badge, read state and blocking.
3. Use one admin account to send a message to only one selected student. Confirm others cannot see it. Moderators do not have this permission.
4. Submit a university verification with a JPG/PNG/WEBP/PDF (≤10 MB); ensure admin can review the private file. Test HTTPS-link alternative. Keep R2 private.
5. Verify bot notification, webhook status and D1 data remaining after redeploy.

## What is and is not included

- User-to-user text messages and admin-to-user private notifications are implemented. The Telegram bot notifies the recipient; it is **not a two-way Telegram chat relay**.
- The chat UI polls while the thread is open; this is not WebSocket push.
- No unconditional scheduler for retrying failed Telegram notifications has been verified on Sites; an inactive Site can leave messages in the outbox until the next request.

If Sites publishing is unavailable in the assistant's active tools, use its project interface to deploy manually. GitHub passing checks is not equivalent to production deployment.
