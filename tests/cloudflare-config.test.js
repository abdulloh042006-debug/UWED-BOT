import test from 'node:test';
import assert from 'node:assert/strict';
import { createCloudflareConfig, createCloudflareSecrets } from '../scripts/render-cloudflare-config.mjs';

const base = {
  CLOUDFLARE_D1_DATABASE_ID: '11111111-1111-4111-8111-111111111111',
  CLOUDFLARE_D1_DATABASE_NAME: 'uwed-talent-network',
  CLOUDFLARE_R2_BUCKET_NAME: 'uwed-evidence-bucket',
  CLOUDFLARE_WORKER_NAME: 'uwed-talent-network'
};

test('Cloudflare config binds the existing Worker code to named D1 and R2 resources', () => {
  const config = createCloudflareConfig({ ...base, MINIAPP_URL: 'https://uwed-talent-network.example.workers.dev/', GEMINI_MODEL: 'gemini-2.5-flash' });
  assert.equal(config.main, 'worker/index.js');
  assert.equal(config.name, 'uwed-talent-network');
  assert.equal(config.d1_databases[0].binding, 'DB');
  assert.equal(config.d1_databases[0].database_id, base.CLOUDFLARE_D1_DATABASE_ID);
  assert.equal(config.r2_buckets[0].binding, 'BUCKET');
  assert.equal(config.r2_buckets[0].bucket_name, base.CLOUDFLARE_R2_BUCKET_NAME);
  assert.equal(config.vars.MINIAPP_URL, 'https://uwed-talent-network.example.workers.dev/');
  assert.equal(config.vars.GEMINI_MODEL, 'gemini-2.5-flash');
  assert.equal(JSON.stringify(config).includes('SESSION_SECRET'), false);
});

test('Cloudflare config refuses missing or invalid storage resource identifiers', () => {
  assert.throws(() => createCloudflareConfig({ ...base, CLOUDFLARE_D1_DATABASE_ID: '' }), /CLOUDFLARE_D1_DATABASE_ID/);
  assert.throws(() => createCloudflareConfig({ ...base, CLOUDFLARE_D1_DATABASE_ID: 'not-a-uuid' }), /CLOUDFLARE_D1_DATABASE_ID/);
  assert.throws(() => createCloudflareConfig({ ...base, CLOUDFLARE_R2_BUCKET_NAME: 'Bad Bucket' }), /CLOUDFLARE_R2_BUCKET_NAME/);
  assert.throws(() => createCloudflareConfig({ ...base, MINIAPP_URL: 'http://not-https.example/' }), /MINIAPP_URL/);
  assert.throws(() => createCloudflareConfig({ ...base, MINIAPP_URL: 'https://example.com/path' }), /MINIAPP_URL/);
});

test('runtime secrets are separated from public Wrangler vars and only nonempty values are included', () => {
  const secrets = createCloudflareSecrets({
    SESSION_SECRET: 's'.repeat(32),
    TELEGRAM_BOT_TOKEN: '123456:exampletoken',
    TELEGRAM_WEBHOOK_SECRET: 'secret_with_16_chars',
    BOOTSTRAP_ADMIN_TELEGRAM_ID: '123456789',
    GEMINI_API_KEY: ''
  });
  assert.deepEqual(Object.keys(secrets).sort(), ['BOOTSTRAP_ADMIN_TELEGRAM_ID', 'SESSION_SECRET', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET'].sort());
  assert.equal(secrets.SESSION_SECRET, 's'.repeat(32));
  assert.deepEqual(createCloudflareSecrets({}), {});
  assert.throws(() => createCloudflareSecrets({ SESSION_SECRET: 'too-short' }), /SESSION_SECRET/);
  assert.throws(() => createCloudflareSecrets({ TELEGRAM_WEBHOOK_SECRET: 'short' }), /TELEGRAM_WEBHOOK_SECRET/);
  assert.throws(() => createCloudflareSecrets({ BOOTSTRAP_ADMIN_TELEGRAM_ID: '123abc' }), /BOOTSTRAP_ADMIN_TELEGRAM_ID/);
});
