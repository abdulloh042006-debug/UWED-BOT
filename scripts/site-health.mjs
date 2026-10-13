#!/usr/bin/env node
// Public, unauthenticated smoke checks for an existing UWED Talent Network Site.
// Never uses bot tokens or accesses private student information.
const arg = process.argv[2];
if (!arg) {
  console.error('Usage: npm run site:health -- https://YOUR-EXISTING-SITE/');
  process.exit(1);
}
let base;
try {
  base = new URL(arg);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.port) throw Error();
  if (base.pathname !== '/') throw Error();
} catch {
  console.error('A public HTTPS origin ending with / is required.');
  process.exit(1);
}
const required = [
  { name: 'Public Mini App shell', path: '/', code: 200, marker: 'UWED Talent Network' },
  { name: 'Mini App JavaScript', path: '/app.js', code: 200, marker: 'UWED Talent Network' },
  { name: 'Student-to-student chat UI', path: '/app.js', code: 200, marker: 'chat/conversations' },
  { name: 'Admin private messages UI', path: '/app.js', code: 200, marker: 'admin-direct-message' },
  { name: 'Image or PDF verification', path: '/app.js', code: 200, marker: 'evidence_file' },
  { name: 'Authentication required', path: '/api/v1/me', code: 401 },
  { name: 'Private chats protected', path: '/api/v1/chat/conversations', code: 401 },
  { name: 'Admin panel protected', path: '/api/v1/admin/users', code: 401 }
];
const responseCache = new Map();
let fail = 0;
for (const check of required) {
  try {
    if (!responseCache.has(check.path)) {
      const response = await fetch(new URL(check.path, base), { headers: { accept: 'text/html, application/javascript, application/json' }, signal: AbortSignal.timeout(12000), cache: 'no-store' });
      responseCache.set(check.path, { code: response.status, text: await response.text() });
    }
    const response = responseCache.get(check.path);
    const passed = response.code === check.code && (!check.marker || response.text.includes(check.marker));
    console.log((passed ? 'PASS' : 'WAIT') + ' ' + check.name + ' (HTTP ' + response.code + ')');
    if (!passed) fail++;
  } catch (err) {
    fail++;
    console.error('FAIL ' + check.name + ' (' + err.name + ')');
  }
}
if (fail) {
  console.error(fail + ' check(s) are not ready. Deploy the latest feature/codex-core to your existing Site, then rerun.');
  process.exitCode = 2;
} else {
  console.log('All public smoke checks passed. Real Telegram login, D1 persistence and outbound bot messages still require real-device verification.');
}
