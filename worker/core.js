const encoder = new TextEncoder();
const decoder = new TextDecoder();
const MAX_AUTH_AGE = 300;

export function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
function unb64url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid encoding');
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
}
async function hmac(keyBytes, message) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}
function equal(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
function hex(bytes) { return [...bytes].map(x => x.toString(16).padStart(2, '0')).join(''); }

export async function verifyInitData(raw, botToken, now = Date.now()) {
  if (!raw || raw.length > 8192 || !botToken) throw new Error('invalid initData');
  const params = new URLSearchParams(raw);
  const keys = [...params.keys()];
  if (new Set(keys).size !== keys.length || !params.has('hash')) throw new Error('invalid initData');
  const signature = params.get('hash');
  if (!/^[a-f0-9]{64}$/i.test(signature)) throw new Error('invalid hash');
  params.delete('hash');
  // Telegram's data_check_string includes all received fields except hash, sorted by key.
  const check = [...params].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = await hmac(encoder.encode('WebAppData'), botToken);
  const expected = await hmac(secret, check);
  if (!equal(expected, Uint8Array.from(signature.match(/../g), x => parseInt(x, 16)))) throw new Error('bad signature');
  const authDate = Number(params.get('auth_date'));
  const age = Math.floor(now / 1000) - authDate;
  if (!Number.isSafeInteger(authDate) || age < -30 || age > MAX_AUTH_AGE) throw new Error('expired initData');
  let user;
  try { user = JSON.parse(params.get('user') || ''); } catch { throw new Error('invalid user'); }
  if (!Number.isSafeInteger(user.id) || user.id <= 0) throw new Error('invalid user');
  return { id: String(user.id), firstName: String(user.first_name || '').slice(0, 100) };
}

export async function signSession(userId, secret, now = Date.now()) {
  if (!secret || encoder.encode(secret).length < 32) throw new Error('session secret missing');
  const payload = b64url(encoder.encode(JSON.stringify({ sub: String(userId), exp: Math.floor(now / 1000) + 3600 })));
  return `${payload}.${b64url(await hmac(encoder.encode(secret), payload))}`;
}
export async function verifySession(token, secret, now = Date.now()) {
  if (!token || !secret || token.length > 1024) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  try {
    const expected = await hmac(encoder.encode(secret), parts[0]);
    if (!equal(expected, unb64url(parts[1]))) return null;
    const data = JSON.parse(decoder.decode(unb64url(parts[0])));
    if (!/^[a-f0-9-]{36}$/i.test(data.sub) || !Number.isSafeInteger(data.exp) || data.exp <= now / 1000) return null;
    return data.sub;
  } catch { return null; }
}

export function overlap(a, b) {
  const start = Math.max(Date.parse(a.start), Date.parse(b.start));
  const end = Math.min(Date.parse(a.end), Date.parse(b.end));
  return Number.isFinite(start) && Number.isFinite(end) && start < end ? { start: new Date(start).toISOString(), end: new Date(end).toISOString() } : null;
}
export function scoreMatch(me, other) {
  const set = items => new Set(items || []);
  const intersection = (a, b) => [...set(a)].filter(x => set(b).has(x));
  const teach = intersection(me.learn, other.teach);
  const reciprocal = intersection(me.teach, other.learn);
  if (!teach.length && !reciprocal.length) return null;
  const interests = intersection(me.interests, other.interests);
  const time = (me.slots || []).some(a => (other.slots || []).some(b => overlap(a, b)));
  const score = Math.min(100, (teach.length ? 45 : 0) + (reciprocal.length ? 25 : 0) + Math.min(interests.length, 2) * 5 + (time ? 15 : 0) + (me.faculty && me.faculty === other.faculty ? 5 : 0));
  return { score, teach, reciprocal, sharedInterests: interests, sharedTime: time, reason: [teach.length && `${teach.join(', ')} bo‘yicha o‘rgata oladi`, reciprocal.length && `Siz ${reciprocal.join(', ')} bo‘yicha yordam bera olasiz`, time && 'Bo‘sh vaqtlaringiz mos'].filter(Boolean).join('. ') };
}
export function nextRequestStatus(current, action, actor) {
  const allowed = { sent: { accept: ['recipient', 'accepted'], reject: ['recipient', 'rejected'], cancel: ['sender', 'cancelled'] }, accepted: { schedule: ['participant', 'scheduled'], cancel: ['participant', 'cancelled'] }, scheduled: { complete: ['participant', 'completed'], cancel: ['participant', 'cancelled'] } };
  const result = allowed[current]?.[action];
  if (!result || (result[0] !== actor && !(result[0] === 'participant' && ['sender', 'recipient'].includes(actor)))) throw new Error('invalid transition');
  return result[1];
}
export function cleanText(value, max = 500) {
  if (typeof value !== 'string') throw new Error('invalid text');
  const text = value.trim();
  if (text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error('invalid text');
  return text;
}
export function randomId() { return crypto.randomUUID(); }
