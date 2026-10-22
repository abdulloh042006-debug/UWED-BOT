// Roles are assigned after Telegram's signed initData has been verified.
// The top two identities come exclusively from server-side configuration (wrangler.toml vars).
// A Telegram ID alone grants nothing: access still requires Telegram-signed initData.
export function protectedTier(telegramId, env) {
  const id = String(telegramId || '');
  if (!/^[1-9]\d{0,19}$/.test(id)) return null;
  if (env.FULL_ADMIN_TELEGRAM_ID && id === String(env.FULL_ADMIN_TELEGRAM_ID)) return 'owner';
  if (env.HEAD_ADMIN_TELEGRAM_ID && id === String(env.HEAD_ADMIN_TELEGRAM_ID)) return 'head';
  return null;
}

export function adminTier(user, env) {
  if (!user) return 'none';
  const privileged = protectedTier(user.telegram_user_id, env);
  if (privileged) return privileged;
  if (user.role === 'admin') return 'admin';
  if (user.role === 'moderator') return 'moderator';
  return 'none';
}

export const isTopAdmin = tier => tier === 'owner' || tier === 'head';
export const isAdminAccount = tier => tier === 'owner' || tier === 'head' || tier === 'admin';

export function visibleAdminLabel(tier) {
  return tier === 'owner' || tier === 'head' ? 'Bosh Admin' :
    tier === 'admin' ? 'Admin' :
    tier === 'moderator' ? 'Moderator' : '';
}

export function isProtectedAccount(user, env) {
  return !!protectedTier(user?.telegram_user_id, env);
}
