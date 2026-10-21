import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const fail = message => { throw new Error(message); };

export function createCloudflareConfig(env = process.env) {
  const workerName = env.CLOUDFLARE_WORKER_NAME || 'uwed-talent-network';
  const databaseName = env.CLOUDFLARE_D1_DATABASE_NAME || 'uwed-talent-network';
  const databaseId = env.CLOUDFLARE_D1_DATABASE_ID || '';
  const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME || '';
  const compatibilityDate = env.CLOUDFLARE_COMPATIBILITY_DATE || '2026-10-22';

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(workerName)) fail('CLOUDFLARE_WORKER_NAME must be lowercase letters, numbers and hyphens.');
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(databaseName)) fail('CLOUDFLARE_D1_DATABASE_NAME is invalid.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId)) fail('Set CLOUDFLARE_D1_DATABASE_ID to the ID of a dedicated D1 database.');
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucketName)) fail('Set CLOUDFLARE_R2_BUCKET_NAME to an existing lowercase R2 bucket name (3–63 characters).');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(compatibilityDate) || Number.isNaN(Date.parse(compatibilityDate))) fail('CLOUDFLARE_COMPATIBILITY_DATE must be YYYY-MM-DD.');

  const vars = {};
  if (env.MINIAPP_URL) {
    let url;
    try { url = new URL(env.MINIAPP_URL); } catch { fail('MINIAPP_URL must be a public HTTPS URL.'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.port || url.pathname !== '/') fail('MINIAPP_URL must be a public HTTPS origin with no credentials, query or fragment.');
    vars.MINIAPP_URL = url.origin + '/';
  }
  if (env.GEMINI_MODEL) {
    if (!/^[a-zA-Z0-9._-]{3,80}$/.test(env.GEMINI_MODEL)) fail('GEMINI_MODEL is invalid.');
    vars.GEMINI_MODEL = env.GEMINI_MODEL;
  }

  return {
    $schema: 'node_modules/wrangler/config-schema.json',
    name: workerName,
    main: 'worker/index.js',
    compatibility_date: compatibilityDate,
    workers_dev: true,
    preview_urls: true,
    observability: { enabled: true },
    d1_databases: [{ binding: 'DB', database_name: databaseName, database_id: databaseId }],
    r2_buckets: [{ binding: 'BUCKET', bucket_name: bucketName }],
    ...(Object.keys(vars).length ? { vars } : {})
  };
}

export function createCloudflareSecrets(env = process.env) {
  if (env.SESSION_SECRET && new TextEncoder().encode(env.SESSION_SECRET).length < 32) fail('SESSION_SECRET must be at least 32 bytes.');
  if (env.TELEGRAM_WEBHOOK_SECRET && !/^[a-zA-Z0-9_-]{16,256}$/.test(env.TELEGRAM_WEBHOOK_SECRET)) fail('TELEGRAM_WEBHOOK_SECRET must be 16–256 letters, numbers, underscores or hyphens.');
  if (env.BOOTSTRAP_ADMIN_TELEGRAM_ID && !/^\d{1,20}$/.test(env.BOOTSTRAP_ADMIN_TELEGRAM_ID)) fail('BOOTSTRAP_ADMIN_TELEGRAM_ID must contain only digits.');

  const names = ['SESSION_SECRET', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET', 'BOOTSTRAP_ADMIN_TELEGRAM_ID', 'GEMINI_API_KEY'];
  return Object.fromEntries(names.filter(name => typeof env[name] === 'string' && env[name].length > 0).map(name => [name, env[name]]));
}

async function main() {
  const config = createCloudflareConfig(process.env);
  const secrets = createCloudflareSecrets(process.env);
  await writeFile('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  await writeFile('.cloudflare-secrets.json', JSON.stringify(secrets, null, 2) + '\n', { mode: 0o600 });
  console.log('Generated Cloudflare Worker config and an ignored runtime-secret file.');
  console.log('Worker:', config.name, '| DB and BUCKET bindings validated | secret names prepared:', Object.keys(secrets).join(', ') || '(none)');
  console.log('Secret values are not printed.');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error('Cloudflare configuration error: ' + error.message);
    process.exitCode = 1;
  });
}
