# UWED Talent Network — Telegram admin access hierarchy

## Visible roles

- **Bosh Admin**: trusted top administrator; can promote existing registered users to ordinary Admin, demote them, moderate users and projects, change platform settings and send announcements.
- **Admin**: ordinary administrator; may moderate content, verification and regular users, but cannot appoint administrators, modify protected admin accounts, change global settings or send mass announcements.
- **Full Admin (internal owner)**: all current administrator permissions and owner-level access. The UI deliberately labels this user *Bosh Admin*, so only the two visible admin levels appear. This identity is omitted from admin user list and admin user detail API. Internal database and security audit retain accountable records.
- **Moderator**: existing limited content moderation role, distinct from administrator levels.

## Authentication: Telegram only

There is **no email/password authentication**. Telegram Mini App passes signed `initData` to the backend. The server verifies it using the bot token and issues a short-lived secure session cookie. A Telegram username or a client-supplied role is **not** proof of admin access.

## Server-only runtime settings

Set the following in Sites runtime secrets, **not** in GitHub, front-end files or chat:

- `FULL_ADMIN_TELEGRAM_ID`: the verified Telegram numeric ID of the internal full administrator.
- `HEAD_ADMIN_TELEGRAM_ID`: the verified Telegram numeric ID of the visible Bosh Admin.
- Existing `TELEGRAM_BOT_TOKEN`, `SESSION_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, `MINIAPP_URL` must remain configured.

The two privileged IDs must belong to different Telegram accounts. Privileged accounts become `admin` in the database only after successfully signed Telegram authentication. The top-level tier is derived from the server-only configuration on each authenticated request. **No protected IDs are hardcoded in source.**

Existing `BOOTSTRAP_ADMIN_TELEGRAM_ID` remains supported as an ordinary admin for backward compatibility; it is **not** implicitly a Bosh Admin.

## How a Bosh Admin adds an ordinary Admin

1. The new Admin opens the Mini App in Telegram at least once to create a user record.
2. Bosh Admin opens **Admin → Foydalanuvchilar**.
3. Selects the user, chooses role **Admin**, and saves.
4. Server verifies Bosh Admin tier, updates the user role, and records an audit event.

The owner/head IDs are protected from the in-app suspend/demote controls. To rotate a protected ID, adjust runtime configuration through the trusted host control plane. A standard admin cannot use the old `/admin/roles` endpoint to escalate privileges.

## Site deployment status

This branch only prepares the policy. It is **not deployed**. Publishing a new Sites version and configuring the runtime variables are separate steps. The existing live site may still be running the previous role model until these changes are reviewed and deployed. Run the real `@uwedrobot` login and two-account permission checks before inviting students.
