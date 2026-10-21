import test from 'node:test';
import assert from 'node:assert/strict';
import { BOT_PROFILE, configureTelegram, validateConfig } from '../scripts/telegram-setup.mjs';

const token = '123456789:' + 'A'.repeat(40);
const env = {
  TELEGRAM_BOT_TOKEN: token,
  TELEGRAM_WEBHOOK_SECRET: 'secureSecretForTesting_12345',
  MINIAPP_URL: 'https://uwed.example/'
};
const ok = result => new Response(JSON.stringify({ ok: true, result }), {
  status: 200, headers: { 'content-type': 'application/json' }
});

test('Bot launch config rejects insecure or misdirected setup', () => {
  assert.equal(validateConfig(env).webhookUrl, 'https://uwed.example/api/v1/bot/webhook');
  assert.equal(BOT_PROFILE.commands.length, 8);
  assert.throws(() => validateConfig({ ...env, MINIAPP_URL: 'http://uwed.example/' }), /HTTPS/);
  assert.throws(() => validateConfig({ ...env, MINIAPP_URL: 'https://localhost/' }), /local/);
  assert.throws(() => validateConfig({ ...env, TELEGRAM_WEBHOOK_SECRET: '' }), /SECRET/);
  assert.throws(() => validateConfig({ ...env, TELEGRAM_BOT_TOKEN: '' }), /TOKEN/);
});

test('dry run is entirely offline and reveals no credentials', async () => {
  const r = await configureTelegram(env, {
    fetchImpl: () => { throw Error('network must not be called'); }
  });
  assert.equal(r.mode, 'dry-run');
  assert.equal(r.plan.username, '@uwedrobot');
  assert.equal(JSON.stringify(r).includes(token), false);
  assert.equal(JSON.stringify(r).includes(env.TELEGRAM_WEBHOOK_SECRET), false);
});

test('refuse to change Telegram settings before hosted API readiness', async () => {
  const calls = [];
  const fetchImpl = async url => {
    calls.push(String(url));
    if (String(url) === env.MINIAPP_URL) return new Response('UWED Talent Network', { status: 200 });
    return new Response('{}', { status: 503 });
  };
  await assert.rejects(configureTelegram(env, { fetchImpl, apply: true }), /readiness check failed/);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(x => !x.includes('/bot' + token)));
});

test('correctly sets menus, descriptions, commands and verified webhook', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const u = String(url);
    if (u === env.MINIAPP_URL) return new Response('UWED Talent Network', { status: 200 });
    if (u === env.MINIAPP_URL + 'api/v1/me') return new Response('{}', { status: 401 });
    const method = u.split('/').at(-1);
    const data = JSON.parse(options.body);
    calls.push({ method, data });
    if (method === 'getMe') return ok({ username: 'uwedrobot' });
    if (method === 'getWebhookInfo') return ok({ url: env.MINIAPP_URL + 'api/v1/bot/webhook', pending_update_count: 0 });
    return ok(true);
  };
  const result = await configureTelegram(env, { fetchImpl, apply: true });
  assert.equal(result.mode, 'configured');
  assert.deepEqual(calls.map(c => c.method), [
    'getMe', 'setMyName', 'setMyDescription', 'setMyShortDescription',
    'setMyCommands', 'setChatMenuButton', 'setWebhook', 'getWebhookInfo'
  ]);
  assert.equal(calls.find(x => x.method === 'setMyCommands').data.commands.length, 8);
  assert.equal(calls.find(x => x.method === 'setMyDescription').data.description, BOT_PROFILE.description);
  assert.equal(BOT_PROFILE.short_description, 'UWED talabalari uchun bilim almashish, mentorlik, loyihalar va portfolio platformasi.');
  assert.deepEqual(BOT_PROFILE.commands.map(c => c.description), ['Ilovani ochish','Yordam','Mening profilim','Mos sheriklar','Sessiyalar','Loyihalar','Bildirishnomalar','Shaxsiy xabarlar']);
  assert.equal(calls.find(x => x.method === 'setChatMenuButton').data.menu_button.web_app.url, env.MINIAPP_URL);
  assert.equal(calls.find(x => x.method === 'setWebhook').data.secret_token, env.TELEGRAM_WEBHOOK_SECRET);
  assert.equal(JSON.stringify(result).includes(token), false);
});

test('wrong token identity is rejected before any settings change', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const u = String(url);
    if (u === env.MINIAPP_URL) return new Response('UWED Talent Network', { status: 200 });
    if (u === env.MINIAPP_URL + 'api/v1/me') return new Response('{}', { status: 401 });
    const method = u.split('/').at(-1);
    calls.push(method);
    return ok({ username: 'not_uwedrobot' });
  };
  await assert.rejects(configureTelegram(env, { fetchImpl, apply: true }), /does not belong/);
  assert.deepEqual(calls, ['getMe']);
});
