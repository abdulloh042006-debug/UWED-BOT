# UI v2 "Quiet Campus" (feature/claude-ui-v2, based on feature/codex-core 7a3216e)

Presentation-only. No API, auth, DB or route changes. Telegram Mini App only.

- Design system rewritten (`worker/ui-theme.js`; `ui-styles.js` re-exports it): calm surfaces, brand blue/burgundy/gold, light + dark, safe-area aware, no web fonts.
- Removed the large brand header band (Telegram already shows the app title). Home: greeting + avatar, tinted quick-action tiles.
- Match cards: avatar, animated score meter, clear primary action. Floating bottom navigation (solid, 6 tabs).
- Telegram chrome: header/background/bottom bar colours follow theme, vertical-swipe-close disabled, haptic tap on nav, `themeChanged` handled.
- Outside Telegram: clear "open from Telegram" screen. Loading state is a neutral skeleton.
- Motion: entrance on view change only, meter fill, toast/dialog, press feedback; transform/opacity only; `prefers-reduced-motion` clamps all.
- Verified: `npm run check` 29/29, Chromium render at 390x844 and 360x740 (light/dark, admin), no overflow, touch targets >=40px. Not verified on real devices; not deployed.
