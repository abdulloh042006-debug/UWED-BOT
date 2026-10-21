import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { verifyInitData, signSession, verifySession, scoreMatch, nextRequestStatus, overlap } from '../worker/core.js';
globalThis.crypto ||= webcrypto;
const enc=new TextEncoder();
async function hmac(key,msg){return new Uint8Array(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']),enc.encode(msg)))}
async function init(user, authDate=Math.floor(Date.now()/1000)) {
  const params=new URLSearchParams({auth_date:String(authDate),user:JSON.stringify(user),query_id:'AA-test'});
  const check=[...params].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
  const secret=await hmac(enc.encode('WebAppData'),'test-token');
  const hash=[...await hmac(secret,check)].map(x=>x.toString(16).padStart(2,'0')).join('');
  params.set('hash',hash);return params.toString();
}
test('Telegram raw initData verifies and rejects forged, stale, future and duplicate fields',async()=>{
  const valid=await init({id:123,first_name:'Ali'});
  assert.deepEqual(await verifyInitData(valid,'test-token'),{id:'123',firstName:'Ali'});
  await assert.rejects(verifyInitData(valid.replace('123','124'),'test-token'));
  await assert.rejects(verifyInitData(await init({id:123},Math.floor(Date.now()/1000)-301),'test-token'));
  await assert.rejects(verifyInitData(await init({id:123},Math.floor(Date.now()/1000)+60),'test-token'));
  await assert.rejects(verifyInitData(valid+'&user=evil','test-token'));
});
test('session MAC, expiry and tampering',async()=>{
  const secret='x'.repeat(32), now=1_000_000;
  const id='123e4567-e89b-42d3-a456-426614174000';
  const token=await signSession(id,secret,now);
  assert.equal(await verifySession(token,secret,now),id);
  assert.equal(await verifySession(token,secret,now+3600000),null);
  assert.equal(await verifySession(token.slice(0,-2)+'xx',secret,now),null);
});
test('explainable matching and directional state transitions',()=>{
  const a={learn:['IELTS'],teach:['Video'],interests:['MUN'],faculty:'IR',slots:[{start:'2026-10-13T10:00:00.000Z',end:'2026-10-13T12:00:00.000Z'}]};
  const b={teach:['IELTS'],learn:['Video'],interests:['MUN'],faculty:'IR',slots:[{start:'2026-10-13T11:00:00.000Z',end:'2026-10-13T13:00:00.000Z'}]};
  assert.equal(scoreMatch(a,b).score,95);
  assert.match(scoreMatch(a,b).reason,/IELTS/);
  assert.deepEqual(overlap(a.slots[0],b.slots[0]),{start:'2026-10-13T11:00:00.000Z',end:'2026-10-13T12:00:00.000Z'});
  assert.equal(nextRequestStatus('sent','accept','recipient'),'accepted');
  assert.throws(()=>nextRequestStatus('sent','accept','sender'));
  assert.throws(()=>nextRequestStatus('completed','accept','recipient'));
});
export { init };
