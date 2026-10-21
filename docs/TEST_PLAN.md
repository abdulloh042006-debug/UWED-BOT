# Test evidence and acceptance plan

## Automated local checks

`npm run check` validates Worker module syntax, runs Node's test runner with in-memory SQLite and D1-shaped adapter, then builds `dist/server`. Current tests cover forged/stale/future/duplicate Telegram initData, session MAC and expiry, public shell/API gate, ownership and RBAC, matching, invitation and mutual scheduling/completion, webhook secret and deduplication, inline sender/expiry checks, project membership and portfolio moderation, private R2-shaped evidence access, review uniqueness, mentor verification and Gemini fallback/cache/consent.

The local simulator was opened in a browser: a signed test identity loaded the home and profile screens, `Video montaj` was saved as a teaching skill, and a project was created through the UI. This is not a Telegram WebView or live Sites test. Browser viewport was desktop; Android/iOS responsive and dark-theme tests remain pending.

## Manual release gate

| Journey | Required observation | State |
|---|---|---|
| Telegram `/start` and menu button | actual BotFather HTTPS Mini App launch on Android, iOS, desktop | Not run |
| Signed login | server accepts real `initData`, rejects stale/forged values and non-Telegram API access | Local synthetic test only |
| Two-user skills to rating | A/B exchange, bot notification, mutual time confirmation, completion, one review each | Local API test; real bot/device pending |
| Project to portfolio | owner, applicant and moderator review contribution and private file | Local API test with fake R2; hosted R2 pending |
| AI outage | deterministic match and explanation remain available | Automated local pass |
| Outbox and restart | retry, blocked bot, durable data after deploy/restart | Local logic only; hosted retry schedule pending |
| Security | forged callback, IDOR, private file URL, role changes, upload signature, audit | Partial automated; penetration/manual review pending |
| Capacity | 50–100 pilot accounts, usage limits and recovery drill | Not run |

Passing local tests is not acceptance for production. Do not call the service production ready until the manual gate and hosted migration/backup checks pass.
