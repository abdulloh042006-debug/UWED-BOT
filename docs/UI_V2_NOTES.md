# UI v2 "Quiet Campus" (feature/claude-ui-v2, based on feature/codex-core 7a3216e)

Presentation-only. No API, auth, DB or route changes. Telegram Mini App only.

- Design system rewritten (`worker/ui-theme.js`; `ui-styles.js` re-exports it): calm surfaces, brand blue/burgundy/gold, light + dark, safe-area aware, no web fonts.
- Removed the large brand header band (Telegram already shows the app title). Home: greeting + avatar, tinted quick-action tiles.
- Match cards: avatar, animated score meter, clear primary action. Floating bottom navigation (solid, 6 tabs).
- Telegram chrome: header/background/bottom bar colours follow theme, vertical-swipe-close disabled, haptic tap on nav, `themeChanged` handled.
- Outside Telegram: clear "open from Telegram" screen. Loading state is a neutral skeleton.
- Motion: entrance on view change only, meter fill, toast/dialog, press feedback; transform/opacity only; `prefers-reduced-motion` clamps all.
- Verified: `npm run check` 29/29, Chromium render at 390x844 and 360x740 (light/dark, admin), no overflow, touch targets >=40px. Not verified on real devices; not deployed.

## v2.1 — backend + flows
- Migration `0008_onboarding.sql`: `profiles.onboarded_at`.
- API: `PATCH /me {onboarded:true}`, `DELETE /skills/:id/:direction`, `GET /home`, `POST /notifications/read` (+ `unread` in `GET /notifications`), availability overlap guard (409) and 56-slot cap, mentors list with `rating_average/rating_count/teach`, `mentor` flag in matches, profile `teach_items/learn_items/onboarded`.
- UI: 3-step onboarding, skill chips with remove + catalog suggestions, weekly availability grid, next-session/pending cards on home, unread notifications with "mark all read", nav dot for pending invitations, redesigned mentors and session cards.

## v3 — Premium Dark (design system)

- Tokens are centralised in `worker/ui-theme.js` (semantic roles: background, surface, text-*, border, action-primary, status-*; 4px spacing scale; radius, type and motion tokens). Default theme is a navy dark with one electric-blue action colour (`#5B8DEF`); light theme and Telegram-auto are selectable in Profil → Ko‘rinish (stored in `localStorage` key `uwed_theme`).
- No gradients, glow or glass. System font stack only (the CSP forbids external fonts).
- Layout: bottom tab bar on phones, left side rail from 900px, two-column card grids from 768px.
- Home: welcome, metric cards, next session, pending invitations, profile completeness, quick actions, recent activity.
- Find partners: premium cards (skills, interests, bio, compatibility meter) with client-side sort and mentor filter.
- Sessions grouped by state; profile split into sections with a completeness indicator.
- `GET /matches` now also returns `faculty`, `bio`, `interests`, `their_teach`, `verified`.
