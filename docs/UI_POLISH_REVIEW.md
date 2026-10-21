# UWED UI polish integration

Integrated Claude's presentation updates into `feature/codex-core` while preserving the production branch's newer admin hierarchy, mobile navigation, project workflows, portfolio features, and API behavior.

## Included

- Uzbek labels and color tones for common request, verification, project, and moderation states.
- Accessible confirmation dialogs for project hiding, content removal, role changes, and account suspension. Admin-tier checks remain enforced by the existing production UI and API.
- Toasts remain visible across re-renders, announce status to assistive technology, and use Telegram haptic feedback when available.
- Loading skeletons and structured error cards with a retry action.
- Clearer profile field placeholders and default availability times.
- Dialog, toast, and skeleton styling with a reduced-motion override.

## Preserved

- Production admin hierarchy and `topAdmin()` controls.
- Existing projects, portfolio, mentor, dashboard, and mobile navigation screens.
- Existing API requests, authentication, database, and worker routes.

## Not included

Claude's full `ui.js`, `admin-ui.js`, and theme replacement were not copied wholesale because they predate several production features and remove the admin-tier checks. Backend-dependent onboarding and shared-availability features remain outside this UI-only integration.
