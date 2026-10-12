// One-time Telegram Bot API launch configuration.
// Run only after the public HTTPS Mini App and the D1-backed API are responding.
import { pathToFileURL } from 'node:url';

export const BOT_PROFILE = Object.freeze({
  name: 'UWED Talent Network',
  description: 'UWED Talent Network — talabalarning bilim va ko‘nikmalarini birlashtiruvchi raqamli platforma.\n\nMos sheriklarni toping, tajriba almashing, mentorlar bilan bog‘laning, loyihalar uchun jamoa tuzing va yutuqlaringizni portfolio orqali namoyish eting.\n\nBarcha asosiy imkoniyatlar Telegram Mini App orqali ishlaydi.',
  short_description: 'UWED talabalari uchun bilim almashish, mentorlik, loyihalar va portfolio platformasi.',
  commands: [
    { command: 'start', description: 'Ilovani ochish' },
    { command: 'help', description: 'Yordam' },
    { command: 'profile', description: 'Mening profilim' },
    { command: 'matches', description: 'Mos sheriklar' },
    { command: 'sessions', description: 'Sessiyalar' },
    { command: 'projects', description: 'Loyihalar' },
    { command: 'notifications', description: 'Bildirishnomalar' }
  ]
});

export function validateConfig(env) {
  const botToken = env.TELEGRAM_BOT_TOKEN || '';
  const webhookSecret = env.TELEGRAM_WEBHOOK_SECRET || '';
  if (!/^[0-9]{6,15}:[a-zA-Z0-9_-]{30,}$/.test(botToken)) throw Error('TELEGRAM_BOT_TOKEN is missing or invalid');
  if (!/^[a-zA-Z0-9_-]{16,256}$/.test(webhookSecret)) throw Error('TELEGRAM_WEBHOOK_SECRET must use 16–256 A-Z/a-z/0-9/_/- characters');
  let url;
  try { url = new URL(env.MINIAPP_URL); } catch { throw Error('MINIAPP_URL is missing or invalid'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.port) throw Error('MINIAPP_URL must be a public HTTPS origin/path without credentials, query or fragment');
  if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(url.hostname)) throw Error('MINIAPP_URL must not be local');
  if (!/^\/$/.test(url.pathname)) throw Error('MINIAPP_URL must point at the app root');
  return { botToken, webhookSecret, miniappUrl: url.toString(), webhookUrl: new URL('/api/v1/bot/webhook', url).toString() };
}

async function telegramCall(cfg, method, payload, fetchImpl) {
  let response;
  try {
    response = await fetchImpl('https://api.telegram.org/bot' + cfg.botToken + '/' + method, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
    });
  } catch {
    throw Error('Telegram ' + method + ': network request failed');
  }
  if (!response.ok) throw Error('Telegram ' + method + ': HTTP ' + response.status);
  let data;
  try { data = await response.json(); } catch { throw Error('Telegram ' + method + ': invalid response'); }
  if (!data?.ok) throw Error('Telegram ' + method + ': rejected by Bot API');
  return data.result;
}

export async function configureTelegram(env, { fetchImpl = fetch, apply = false } = {}) {
  const cfg = validateConfig(env);
  const plan = {
    username: '@uwedrobot',
    miniappUrl: cfg.miniappUrl,
    webhookUrl: cfg.webhookUrl,
    commands: BOT_PROFILE.commands.map(c => c.command)
  };
  if (!apply) return { mode: 'dry-run', plan };

  // Do not change the live Telegram bot if the hosted Worker or database is unavailable.
  let shell, api;
  try {
    shell = await fetchImpl(cfg.miniappUrl, { method: 'GET' });
    api = await fetchImpl(new URL('/api/v1/me', cfg.miniappUrl), { method: 'GET' });
  } catch { throw Error('Mini App URL is unreachable. No Telegram settings changed.'); }
  if (shell.status !== 200 || !(await shell.text()).includes('UWED Talent Network')) {
    throw Error('Mini App shell is not responding correctly. No Telegram settings changed.');
  }
  if (api.status !== 401) {
    throw Error('Mini App API readiness check failed (expected 401 for unsigned /api/v1/me, got ' + api.status + '). No Telegram settings changed.');
  }

  const identity = await telegramCall(cfg, 'getMe', {}, fetchImpl);
  if (String(identity?.username || '').toLowerCase() !== 'uwedrobot') {
    throw Error('Connected token does not belong to @uwedrobot. No Telegram settings changed.');
  }

  // Apply harmless profile changes first, webhook last.
  await telegramCall(cfg, 'setMyName', { name: BOT_PROFILE.name }, fetchImpl);
  await telegramCall(cfg, 'setMyDescription', { description: BOT_PROFILE.description }, fetchImpl);
  await telegramCall(cfg, 'setMyShortDescription', { short_description: BOT_PROFILE.short_description }, fetchImpl);
  await telegramCall(cfg, 'setMyCommands', { commands: BOT_PROFILE.commands }, fetchImpl);
  await telegramCall(cfg, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Ilovani ochish', web_app: { url: cfg.miniappUrl } }
  }, fetchImpl);
  await telegramCall(cfg, 'setWebhook', {
    url: cfg.webhookUrl,
    secret_token: cfg.webhookSecret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false
  }, fetchImpl);
  const status = await telegramCall(cfg, 'getWebhookInfo', {}, fetchImpl);
  if (status?.url !== cfg.webhookUrl) throw Error('Webhook URL was not confirmed by Telegram');
  return { mode: 'configured', plan, webhookPending: status.pending_update_count ?? null };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  configureTelegram(process.env, { apply: process.argv.includes('--apply') }).then(result => {
    // No token, webhook secret, or private user data is printed.
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('Launch setup failed: ' + error.message);
    process.exitCode = 1;
  });
}
