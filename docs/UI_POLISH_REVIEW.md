# UI polish review (feature/claude-ui-polish)

Base: `feature/codex-core` (51171f5). Scope: presentation only. No change to API calls, authentication, database or worker routes.

## Findings (before) and changes (after)

| Area | Before | After |
|---|---|---|
| Brand | `✦` glyph as logo; accent followed the user's Telegram button color | UWED cap logo, brand blue accent; page/card/text colors still follow Telegram |
| Raw enums | `sent`, `accepted`, `certificate`, `suspended`, audit actions shown to users in English | Uzbek labels + tone pills (`badge()`/`lab()` in `admin-ui.js`) |
| Toasts | Prepended into `#app`, so `render()` wiped success messages immediately | Appended to `body`, styled, auto-dismiss, Telegram haptic feedback |
| Loading | Text "Yuklanmoqda…" replaced the whole page, nav disappeared | Skeleton cards, header and nav kept, `aria-busy` |
| Errors | Plain red text | Card with retry button, `role="alert"` |
| Navigation | Text-only tabs | Icons + labels, active pill; Telegram BackButton on sub-screens |
| Matches | Name, text, pill | Avatar, animated score meter, full-width action row |
| Skill Exchange | Status as raw text | Status pill + 4-step progress |
| Portfolio | Create form above the list; status raw | List first, gold medal for approved achievements |
| Projects | Create form above the list | List first |
| Profile | "Saqlash" button sat before the timezone/privacy/consent fields | Button after all fields; profile header with avatar and role |
| Availability | Plain paragraphs | Row layout with 44px remove buttons |
| Destructive admin actions | No confirmation | Accessible confirm dialog (Esc, focus trap) for content removal, project hide, role change, suspension |
| Admin | Same nav chips, no stat emphasis | Brand header, pending (gold) and reports (burgundy) emphasised |
| Motion | Every card re-animated on every re-render | Entrance only on view change, staggered; meter fill; medal pop; dialog/toast; nothing runs on idle |
| Reduced motion | Duration clamp only | Also clamps iteration count (stops shimmer/spin loops) |

## Decisions that need approval
1. Accent stays brand blue instead of `--tg-theme-button-color` (brand consistency). Backgrounds/text follow Telegram.
2. `--tg-theme-hint-color` is not used for muted text (Telegram's default #999 fails contrast on white).
3. No web font: the Worker CSP (`default-src 'none'`) blocks external font hosts, so a system font stack is used.
4. Confirm dialogs add one tap to four admin actions.

## Not done / needs backend
- First-time onboarding flow and calendar grid with shared-availability overlap (prototype only; needs an API for the partner's slots).
- Verified-mentor badge on match cards needs a verified flag in `/matches`.
- Dashboard values are real API data; no sample numbers are shown.
