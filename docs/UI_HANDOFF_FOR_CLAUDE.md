# Claude UI handoff — v1

**Existing design branch:** `feature/admin-panel-ui`. Claude's `design/Main.dc.html` and `design/Admin.dc.html` remain the approved reference prototypes, with `docs/admin-api-requirements.md` as the admin contract. Codex's production conversion lives on `feature/codex-core` and targets Claude's branch in a PR. Do not edit concurrently in one checkout.

**Ownership:** Claude reviews visual fidelity and can propose refinements in `design/` or a separate frontend branch. Codex owns `worker/ui.js`, `worker/admin-ui.js`, `worker/ui-theme.js` integration, backend authentication and contracts, migrations, tests and deployment configuration. Propose contract changes instead of editing backend files. The preserved prototypes remain references and need their special runtime.

**Screens/routes:** `/` is a Telegram-only gate and authenticated Mini App shell. Navigation: Bosh sahifa, Moslar, Sessiyalar, Loyihalar, Profil, plus Inbox and role-gated Admin. The functional first increment covers onboarding/profile, skills, match cards, exchange requests and session controls. Future sections must show truthful empty states while their APIs are absent.

**API boundary:** UI calls `/api/v1/auth/telegram` with `{initData: string}` then cookie-authenticated `/api/v1/me`, `/api/v1/skills`, `/api/v1/availability`, `/api/v1/matches`, `/api/v1/exchange-requests`, `/api/v1/sessions`, `/api/v1/notifications`, `/api/v1/projects`, `/api/v1/portfolio`, and `/api/v1/admin/*`. Errors use `{error:{code,message}}` with Uzbek text. Do not store `initData`, session credentials or user IDs in localStorage; do not insert identity from `initDataUnsafe` into requests. No mock personal records in production. Dev fixtures are only for explicit test mode.

**Design tokens:** CSS variables map to Telegram `--tg-theme-bg-color`, `--tg-theme-text-color`, `--tg-theme-button-color`, `--tg-theme-button-text-color`, `--tg-theme-secondary-bg-color`, plus safe-area insets. Base styling belongs in `worker/ui-styles.js` as an exported CSS string. Keep readable contrast, 44px touch targets, visible focus and responsive mobile cards.

**States:** each API view needs loading, empty, error and retry, with Uzbek copy. Server errors must not expose internals. Disabled/loading actions must prevent duplicate submission. Navigation/back/keyboard/scroll should behave in Android, iOS and Telegram Desktop.

**Motion:** 150–300ms opacity/transform for onboarding, match results, shared availability, portfolio badge, project invitation and success/error feedback. Use `prefers-reduced-motion`. Never block completion, use continuous effects, heavy 3D, or animate private data into public HTML. Motion is progressive enhancement; all controls must remain usable without it.

**Acceptance:** inspect changed component APIs, auth boundary, keyboard use, dark/light themes, reduced motion and functioning API-backed flows before merge. This handoff coordinates work; it does not claim Claude was contacted or that UI work has been merged.
