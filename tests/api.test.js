import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { webcrypto } from 'node:crypto';
import worker from '../worker/index.js';
import { client } from '../worker/ui.js';
import { migrations, ensureMigrations } from '../worker/migrations.js';
import { Script } from 'node:vm';
globalThis.crypto ||= webcrypto;
const enc=new TextEncoder(), base='https://example.test';
async function hmac(key,msg){return new Uint8Array(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']),enc.encode(msg)))}
async function signed(id){const p=new URLSearchParams({auth_date:String(Math.floor(Date.now()/1000)),user:JSON.stringify({id,first_name:'User '+id})});const check=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('\n');const key=await hmac(enc.encode('WebAppData'),'test-token');p.set('hash',[...await hmac(key,check)].map(x=>x.toString(16).padStart(2,'0')).join(''));return p.toString()}
function blankD1(database=new DatabaseSync(':memory:')){const db=database;db.exec('PRAGMA foreign_keys=ON');return {raw:db,prepare(sql){let args=[];return {bind(...values){args=values;return this},first(){return db.prepare(sql).get(...args)||null},all(){return {results:db.prepare(sql).all(...args)}},run(){const r=db.prepare(sql).run(...args);return {meta:{changes:r.changes}}}}},batch(items){db.exec('BEGIN');try{const result=items.map(x=>x.run());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}}
function d1(){const db=blankD1();for(const {id,sql} of migrations){db.raw.exec(sql);db.raw.exec('CREATE TABLE IF NOT EXISTS _sites_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');db.raw.prepare('INSERT INTO _sites_migrations(id) VALUES (?)').run(id)}return db}
test('Sites D1 migrations apply in order and are safe to recheck',async()=>{const db=blankD1(),expected=migrations.map(x=>x.id);assert.deepEqual(await ensureMigrations(db),expected);assert.equal(db.raw.prepare('SELECT count(*) AS n FROM _sites_migrations').get().n,expected.length);assert.ok(db.raw.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'").get());assert.deepEqual(await ensureMigrations(blankD1(db.raw)),expected)});
function setup(){const db=d1(),env={DB:db,TELEGRAM_BOT_TOKEN:'test-token',SESSION_SECRET:'s'.repeat(32),TELEGRAM_WEBHOOK_SECRET:'hook-secret',MINIAPP_URL:'https://example.test/',HEAD_ADMIN_TELEGRAM_ID:'999'};async function call(path,method='GET',body,cookie='',headers={}){const h={...headers};if(body!==undefined)h['content-type']='application/json';if(cookie)h.cookie=cookie;const req=new Request(base+path,{method,headers:h,body:body!==undefined?JSON.stringify(body):undefined});const res=await worker.fetch(req,env);return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]}}async function login(id){const r=await call('/api/v1/auth/telegram','POST',{initData:await signed(id)});assert.equal(r.status,200);return r.cookie}return {db,env,call,login}}
test('outside Telegram: public shell has no personal data and API rejects',async()=>{const x=setup();let res=await worker.fetch(new Request(base+'/'),x.env);assert.equal(res.status,200);assert.doesNotMatch(await res.text(),/User 101/);assert.equal((await x.call('/api/v1/me')).status,401);assert.equal((await x.call('/api/v1/auth/telegram','POST',{initData:'fake'})).status,401)});
test('profile ownership, skills, matching, invitation and mutual session confirmation',async()=>{
 const x=setup(),a=await x.login(101),b=await x.login(202);
 assert.equal((await x.call('/api/v1/me','PATCH',{display_name:'Ali',faculty:'IR',bio:'Salom',interests:['MUN']},a)).status,200);
 assert.equal((await x.call('/api/v1/me','PATCH',{display_name:'Vali',faculty:'IR',bio:'Mentor',interests:['MUN']},b)).status,200);
 const alice=(await x.call('/api/v1/me','GET',undefined,a)).data,bob=(await x.call('/api/v1/me','GET',undefined,b)).data;
 assert.equal(alice.display_name,'Ali');assert.equal(bob.display_name,'Vali');
 assert.equal((await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'learn'},a)).status,201);
 assert.equal((await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'teach'},b)).status,201);
 const matches=(await x.call('/api/v1/matches','GET',undefined,a)).data.items;assert.equal(matches[0].id,bob.id);assert.match(matches[0].reason,/IELTS/);
 const invite=await x.call('/api/v1/exchange-requests','POST',{recipient_id:bob.id,skill_id:'skill-ielts'},a);assert.equal(invite.status,201);
 assert.equal((await x.call('/api/v1/exchange-requests/'+invite.data.id,'PATCH',{action:'accept'},a)).status,409);
 assert.equal((await x.call('/api/v1/exchange-requests/'+invite.data.id,'PATCH',{action:'accept'},b)).status,200);
 const start=new Date(Date.now()+86400000).toISOString(),end=new Date(Date.now()+90000000).toISOString();
 const proposed=await x.call('/api/v1/exchange-requests/'+invite.data.id+'/schedule','POST',{start_at:start,end_at:end},a);assert.equal(proposed.status,201);
 assert.equal((await x.call('/api/v1/sessions/'+proposed.data.id+'/confirm','POST',{},a)).status,409);
 assert.equal((await x.call('/api/v1/sessions/'+proposed.data.id+'/confirm','POST',{},b)).status,200);
 assert.equal((await x.call('/api/v1/exchange-requests','GET',undefined,a)).data.items[0].status,'scheduled');
 assert.equal((await x.call('/api/v1/reviews','POST',{session_id:proposed.data.id,stars:5,comment:'Zo‘r'},a)).status,403);
 x.db.raw.prepare("UPDATE sessions SET start_at=?,end_at=? WHERE id=?").run(new Date(Date.now()-3600000).toISOString(),new Date(Date.now()-60000).toISOString(),proposed.data.id);
 assert.equal((await x.call('/api/v1/exchange-requests/'+invite.data.id,'PATCH',{action:'complete'},a)).data.awaiting_other,true);
 assert.equal((await x.call('/api/v1/exchange-requests/'+invite.data.id,'PATCH',{action:'complete'},b)).status,200);
 assert.equal((await x.call('/api/v1/reviews','POST',{session_id:proposed.data.id,stars:5,comment:'Zo‘r'},a)).status,201);
 assert.equal((await x.call('/api/v1/reviews','POST',{session_id:proposed.data.id,stars:5,comment:'Takror'},a)).status,409);
 assert.equal((await x.call('/api/v1/notifications','GET',undefined,b)).data.items.length>=1,true);
 assert.equal((await x.call('/api/v1/admin/verifications','GET',undefined,a)).status,403);
});
test('webhook rejects incorrect secret and deduplicates Telegram update',async()=>{
 const x=setup(),old=globalThis.fetch,calls=[];globalThis.fetch=async(url,init)=>{calls.push({url,init});return new Response('{}',{status:200})};
 try {const body={update_id:5,message:{text:'/start',chat:{id:101,type:'private'}}};assert.equal((await x.call('/api/v1/bot/webhook','POST',body)).status,403);assert.equal((await x.call('/api/v1/bot/webhook','POST',body,'',{'X-Telegram-Bot-Api-Secret-Token':'hook-secret'})).status,200);assert.equal((await x.call('/api/v1/bot/webhook','POST',body,'',{'X-Telegram-Bot-Api-Secret-Token':'hook-secret'})).data.duplicate,true);assert.equal(calls.length,1);assert.match(calls[0].init.body,/Ilovani ochish/);assert.match(calls[0].init.body,/Assalomu alaykum/);assert.match(calls[0].init.body,/portfolio orqali ko‘rsating/)}finally{globalThis.fetch=old}
});
test('project application to member contribution to moderated portfolio; cross-user file denied',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';const admin=await x.login(999),owner=await x.login(101),member=await x.login(202),outsider=await x.login(303);
 const due=new Date(Date.now()+604800000).toISOString();
 const created=await x.call('/api/v1/projects','POST',{title:'MUN loyiha',description:'Tadqiqot va taqdimot',goal:'Natija',member_limit:3,deadline:due,roles:['Tadqiqotchi']},owner);assert.equal(created.status,201);
 const project=created.data.id,role=(await x.call('/api/v1/projects/'+project,'GET',undefined,member)).data.item.roles[0].id;
 const application=await x.call('/api/v1/projects/'+project+'/applications','POST',{role_id:role},member);assert.equal(application.status,201);
 const app=(await x.call('/api/v1/projects/'+project,'GET',undefined,owner)).data.item.applications[0];assert.equal(app.applicant_id,(await x.call('/api/v1/me','GET',undefined,member)).data.id);
 assert.equal((await x.call('/api/v1/projects/'+project+'/applications/'+app.id,'PATCH',{decision:'approve'},outsider)).status,404);
 const approved=await x.call('/api/v1/projects/'+project+'/applications/'+app.id,'PATCH',{decision:'approve'},owner);assert.equal(approved.status,200,JSON.stringify(approved.data));
 assert.equal((await x.call('/api/v1/projects/'+project+'/deliverables','POST',{title:'Taqdimot',url:'https://example.org/result',contribution:'Tadqiqot'},member)).status,201);
 assert.equal((await x.call('/api/v1/projects/'+project+'/complete','POST',{},owner)).status,200);
 assert.equal((await x.call('/api/v1/portfolio','POST',{kind:'project',title:'MUN tadqiqot',description:'Mening hissam',project_id:project,visibility:'public',source_url:'https://example.org/result'},outsider)).status,403);
 const portfolio=await x.call('/api/v1/portfolio','POST',{kind:'project',title:'MUN tadqiqot',description:'Mening hissam',project_id:project,visibility:'public',source_url:'https://example.org/result'},member);assert.equal(portfolio.status,201);
 assert.equal((await x.call('/api/v1/portfolio/'+portfolio.data.id,'GET',undefined,outsider)).status,404);
 assert.equal((await x.call('/api/v1/admin/portfolio/'+portfolio.data.id,'PATCH',{decision:'approve'},owner)).status,403);
 assert.equal((await x.call('/api/v1/admin/portfolio/'+portfolio.data.id,'PATCH',{decision:'approve'},admin)).status,200);
 assert.equal((await x.call('/api/v1/portfolio/'+portfolio.data.id,'GET',undefined,outsider)).data.item.status,'verified');
 const objects=new Map();x.env.BUCKET={put:async(k,v)=>objects.set(k,v),get:async(k)=>objects.has(k)?{body:objects.get(k)}:null,delete:async(k)=>objects.delete(k)};
 const privateItem=await x.call('/api/v1/portfolio','POST',{kind:'certificate',title:'Sertifikat',description:'Dalil',visibility:'private'},member);
 const bytes=Uint8Array.from([37,80,68,70,45,49,46,48]);
 const req=new Request(base+'/api/v1/portfolio/'+privateItem.data.id+'/evidence',{method:'POST',headers:{cookie:member,'content-type':'application/pdf','content-length':String(bytes.length),'x-file-name':'proof.pdf'},body:bytes});
 const response=await worker.fetch(req,x.env),e=await response.json();assert.equal(response.status,201);
 assert.equal((await x.call('/api/v1/evidence/'+e.id,'GET',undefined,outsider)).status,404);
 const file=await worker.fetch(new Request(base+'/api/v1/evidence/'+e.id,{headers:{cookie:member}}),x.env);assert.equal(file.status,200);assert.equal(file.headers.get('content-disposition'),'attachment; filename="proof.pdf"');
});
test('Gemini is consent gated, quota bounded, cached and falls back on outage',async()=>{
 const x=setup(),a=await x.login(101),b=await x.login(202);
 await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'learn'},a);
 await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'teach'},b);
 const peer=(await x.call('/api/v1/me','GET',undefined,b)).data.id;
 x.env.GEMINI_API_KEY='test-key';x.env.GEMINI_MODEL='test-model';
 const basePath='/api/v1/matches/'+peer+'/explanation';
 assert.equal((await x.call(basePath,'POST',{},a)).data.source,'rules');
 const p=(await x.call('/api/v1/me','GET',undefined,a)).data;
 await x.call('/api/v1/me','PATCH',{display_name:p.display_name,faculty:p.faculty,bio:p.bio,interests:[],ai_consent:true},a);
 const old=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'IELTS bo‘yicha mashq qiling.'}]}}]}),{status:200})};
 try{assert.equal((await x.call(basePath,'POST',{},a)).data.source,'gemini');assert.equal((await x.call(basePath,'POST',{},a)).data.source,'gemini-cache');assert.equal(calls,1)}finally{globalThis.fetch=old}
 x.db.raw.prepare('DELETE FROM ai_match_cache').run();
 globalThis.fetch=async()=>{throw Error('offline')};
 try{assert.equal((await x.call(basePath,'POST',{},a)).data.source,'rules')}finally{globalThis.fetch=old}
 assert.equal((await x.call(basePath,'POST',{},b)).status,404);
});
test('inline callback checks Telegram sender, expiry and duplicate update',async()=>{
 const x=setup(),a=await x.login(101),b=await x.login(202),c=await x.login(303);
 await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'learn'},a);await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'teach'},b);
 const recipient=(await x.call('/api/v1/me','GET',undefined,b)).data.id;
 const request=await x.call('/api/v1/exchange-requests','POST',{recipient_id:recipient,skill_id:'skill-ielts'},a);
 const old=globalThis.fetch;globalThis.fetch=async()=>new Response('{}',{status:200});
 try{
   const cb=(update_id,id)=>({update_id,callback_query:{id:'cb'+update_id,from:{id},data:'ex:accept:'+request.data.id}});
   const headers={'X-Telegram-Bot-Api-Secret-Token':'hook-secret'};
   assert.equal((await x.call('/api/v1/bot/webhook','POST',cb(11,303),'',headers)).status,200);
   assert.equal((await x.call('/api/v1/exchange-requests','GET',undefined,a)).data.items[0].status,'sent');
   assert.equal((await x.call('/api/v1/bot/webhook','POST',cb(12,202),'',headers)).status,200);
   assert.equal((await x.call('/api/v1/bot/webhook','POST',cb(12,202),'',headers)).data.duplicate,true);
   assert.equal((await x.call('/api/v1/exchange-requests','GET',undefined,a)).data.items[0].status,'accepted');
   await x.call('/api/v1/skills','POST',{name:'Python',direction:'learn'},a);await x.call('/api/v1/skills','POST',{name:'Python',direction:'teach'},b);
   const expired=await x.call('/api/v1/exchange-requests','POST',{recipient_id:recipient,skill_id:'skill-python'},a);
   x.db.raw.prepare("UPDATE exchange_requests SET created_at=? WHERE id=?").run('2026-01-01 00:00:00',expired.data.id);
   assert.equal((await x.call('/api/v1/bot/webhook','POST',{update_id:13,callback_query:{id:'cb13',from:{id:202},data:'ex:accept:'+expired.data.id}},'',headers)).status,200);
   assert.equal((await x.call('/api/v1/exchange-requests','GET',undefined,a)).data.items.find(x=>x.id===expired.data.id).status,'sent');
 }finally{globalThis.fetch=old}
});
test('mentor badge requires evidence request and moderator decision',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';const admin=await x.login(999),student=await x.login(101);
 assert.equal((await x.call('/api/v1/verifications','POST',{kind:'mentor'},student)).status,400);
 assert.equal((await x.call('/api/v1/verifications','POST',{kind:'mentor',evidence_url:'https://example.org/mentor-proof'},student)).status,201);
 const item=(await x.call('/api/v1/admin/verifications','GET',undefined,admin)).data.items[0];assert.equal(item.evidence_url,'https://example.org/mentor-proof');
 assert.equal((await x.call('/api/v1/admin/verifications/'+item.id,'PATCH',{decision:'approve'},student)).status,403);
 assert.equal((await x.call('/api/v1/admin/verifications/'+item.id,'PATCH',{decision:'approve'},admin)).status,200);
 assert.equal((await x.call('/api/v1/me','GET',undefined,student)).data.role,'mentor');
});

test('admin contract: server roles, pagination, suspension, verification, moderation, settings and audit',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';const admin=await x.login(999),student=await x.login(101),student2=await x.login(202),student3=await x.login(303);
 const a=(await x.call('/api/v1/me','GET',undefined,admin)).data,s=(await x.call('/api/v1/me','GET',undefined,student)).data,t=(await x.call('/api/v1/me','GET',undefined,student2)).data;
 assert.equal((await x.call('/api/v1/admin/dashboard/summary','GET',undefined,student)).status,403);
 assert.equal((await x.call('/api/v1/admin/users?limit=1&page=2','GET',undefined,admin)).data.items.length,1);
 assert.equal((await x.call('/api/v1/admin/users?limit=0','GET',undefined,admin)).status,400);
 assert.equal((await x.call('/api/v1/admin/users?role=bogus','GET',undefined,admin)).status,400);
 assert.equal((await x.call('/api/v1/admin/users/'+s.id,'GET',undefined,admin)).data.item.id,s.id);
 assert.equal((await x.call('/api/v1/admin/users/'+s.id+'/suspend','POST',{reason:'Qoidabuzarlik'},student)).status,403);
 assert.equal((await x.call('/api/v1/admin/users/'+s.id+'/suspend','POST',{reason:'Qoidabuzarlik'},admin)).status,200);
 assert.equal((await x.call('/api/v1/me','GET',undefined,student)).status,403);
 assert.equal((await x.call('/api/v1/auth/telegram','POST',{initData:await signed(101)})).status,403);
 assert.equal((await x.call('/api/v1/admin/users/'+s.id+'/restore','POST',{},admin)).status,200);
 assert.equal((await x.call('/api/v1/me','GET',undefined,student)).status,200);
 assert.equal((await x.call('/api/v1/admin/users/'+t.id+'/role','POST',{role:'moderator'},admin)).status,200);
 assert.equal((await x.call('/api/v1/admin/users/'+a.id+'/role','POST',{role:'student'},admin)).status,409);
 assert.equal((await x.call('/api/v1/admin/settings/maintenance_mode','PATCH',{value:true},student2)).status,403);
 assert.equal((await x.call('/api/v1/admin/settings/maintenance_mode','PATCH',{value:true},admin)).data.value,'true');
 assert.equal((await x.call('/api/v1/admin/settings','GET',undefined,student2)).data.items.length,4);
 assert.equal((await x.call('/api/v1/me','GET',undefined,student)).status,503);
 await x.call('/api/v1/admin/settings/maintenance_mode','PATCH',{value:false},admin);
 const v=await x.call('/api/v1/verifications','POST',{kind:'mentor',evidence_url:'https://example.org/evidence'},student);
 assert.equal(v.status,201);
 const list=await x.call('/api/v1/admin/verifications?type=mentor&status=pending','GET',undefined,student2);
 assert.equal(list.data.total,1);
 assert.equal((await x.call('/api/v1/admin/verifications/'+list.data.items[0].id+'/reject','POST',{},student2)).status,400);
 assert.equal((await x.call('/api/v1/admin/verifications/'+list.data.items[0].id+'/approve','POST',{},student2)).status,200);
 assert.equal((await x.call('/api/v1/me','GET',undefined,student)).data.role,'mentor');
 const cert=await x.call('/api/v1/portfolio','POST',{kind:'certificate',title:'IELTS',visibility:'public',source_url:'https://example.org/cert'},student);
 const certList=await x.call('/api/v1/admin/verifications?type=certificate','GET',undefined,student2);
 assert.equal(certList.data.items[0].id,'certificate:'+cert.data.id);
 assert.equal((await x.call('/api/v1/admin/verifications/'+encodeURIComponent(certList.data.items[0].id)+'/reject','POST',{reason:'Yaroqsiz'},student2)).status,200);
 const project=await x.call('/api/v1/projects','POST',{title:'Loyiha',description:'Tavsif',member_limit:3,deadline:new Date(Date.now()+86400000).toISOString(),roles:['Dizayn']},student);
 assert.equal((await x.call('/api/v1/admin/projects?reported=false','GET',undefined,student2)).data.total,1);
 const report=await x.call('/api/v1/reports','POST',{object_type:'project',object_id:project.data.id,reason:'Noto`g`ri kontent'},student3);
 assert.equal(report.status,201);
 const reports=(await x.call('/api/v1/admin/reports?status=pending','GET',undefined,student2)).data;
 assert.equal(reports.total,1);
 assert.equal((await x.call('/api/v1/admin/reports/'+reports.items[0].id+'/remove-content','POST',{},student2)).status,200);
 assert.equal((await x.call('/api/v1/admin/reports/'+reports.items[0].id+'/remove-content','POST',{},student2)).data.already_removed,true);
 assert.equal((await x.call('/api/v1/projects/'+project.data.id,'GET',undefined,student)).status,404);
 assert.equal((await x.call('/api/v1/admin/projects?status=hidden','GET',undefined,student2)).data.total,1);
 const dash=(await x.call('/api/v1/admin/dashboard/summary','GET',undefined,admin)).data;
 assert.equal(dash.summary.students,1);assert.equal(dash.summary.active_mentors,1);assert.equal(dash.summary.reports,0);
 const log=(await x.call('/api/v1/admin/audit-log?limit=2','GET',undefined,admin)).data;
 assert.equal(log.items.length,2);assert.ok(log.next_cursor);
 assert.equal((await x.call('/api/v1/admin/audit-log?limit=2&cursor='+log.next_cursor,'GET',undefined,admin)).status,200);
});

test('announcement delivery is queued through notification outbox for its audience',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';const admin=await x.login(999),student=await x.login(101),mentor=await x.login(202);
 const id=(await x.call('/api/v1/me','GET',undefined,mentor)).data.id;
 await x.call('/api/v1/admin/users/'+id+'/role','POST',{role:'mentor'},admin);
 assert.equal((await x.call('/api/v1/admin/announcements','POST',{audience:'students',text:'Salom'},student)).status,403);
 assert.equal((await x.call('/api/v1/admin/announcements','POST',{audience:'all',text:''},admin)).status,400);
 const a=await x.call('/api/v1/admin/announcements','POST',{audience:'students',text:'Salom'},admin);
 assert.equal(a.status,201);assert.equal(a.data.queued,1);
 assert.equal((await x.call('/api/v1/notifications','GET',undefined,student)).data.items[0].body,'Salom');
 assert.equal((await x.call('/api/v1/notifications','GET',undefined,mentor)).data.items.length,0);
 const delivery=(await x.call('/api/v1/admin/announcements/'+a.data.id+'/delivery','GET',undefined,admin)).data;
 assert.equal(delivery.queued,1);assert.equal(delivery.delivered,0);
});

test('browser client authenticates via Telegram and renders live admin API data',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';await x.login(101);
 const root={innerHTML:'',handlers:{},querySelector(selector){return selector==='[name="privacy"]'?{value:''}:null},addEventListener(name,fn){this.handlers[name]=fn},prepend(){}},initData=await signed(999);let cookie='',requests=[];
 const browserFetch=async(path,options={})=>{requests.push(path);const headers={...options.headers};if(cookie)headers.cookie=cookie;const response=await worker.fetch(new Request(base+path,{method:options.method||'GET',headers,body:options.body}),x.env);if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return response};
 new Script(client).runInNewContext({document:{querySelector:()=>root},window:{Telegram:{WebApp:{initData,ready(){},expand(){}}}},location:{search:''},URLSearchParams,fetch:browserFetch,setTimeout,console});
 const wait=async expected=>{for(let i=0;i<100;i++){if(root.innerHTML.includes(expected))return;await new Promise(resolve=>setTimeout(resolve,10))}assert.fail('Client did not render '+expected+': '+root.innerHTML.slice(0,300))};
 await wait('UWED Talent Network');
 assert.match(root.innerHTML,/class="app-nav"/,'student nav must be rendered');
 assert.match(root.innerHTML,/<svg class="ui-icon/,'icons must be SVG and bundled locally');
 assert.match(root.innerHTML,/Nimadan boshlaymiz/,'dashboard should have clear next actions');
 await root.handlers.click({target:{closest:()=>({dataset:{view:'admin'}})}});await wait('Faol foydalanuvchilar');
 assert.match(root.innerHTML,/Administrator ish maydoni/,'admin has separate branded header');
 assert.match(root.innerHTML,/Talaba rejimi/,'admin needs an explicit return switch');
 await root.handlers.click({target:{closest:()=>({dataset:{adminTab:'users'},disabled:false})}});await wait('User 101');
 assert.match(root.innerHTML,/Foydalanuvchilar/);assert.match(root.innerHTML,/User 101/);
 await root.handlers.click({target:{closest:()=>({dataset:{view:'matches'}})}});await wait('Qidirish');
 await root.handlers.submit({preventDefault(){},target:{id:'search',dataset:{},elements:{q:{value:'IELTS'}},querySelector:()=>({disabled:false})}});
 assert.ok(requests.some(x=>x==='/api/v1/matches?q=IELTS'));
 await root.handlers.click({target:{closest:()=>({dataset:{view:'profile'}})}});
 await wait('Vaqt mintaqasi');
 assert.ok(root.innerHTML.indexOf('Vaqt mintaqasi')<root.innerHTML.indexOf('<button>Saqlash</button>'),'Saqlash should be after profile settings');
});

test('pending skills keep associations and become matchable after approval',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';
 const admin=await x.login(999),a=await x.login(101),b=await x.login(202);
 const name='New Skill';
 assert.equal((await x.call('/api/v1/skills','POST',{name,direction:'learn'},a)).status,202);
 assert.equal((await x.call('/api/v1/skills','POST',{name,direction:'teach'},b)).status,202);
 const skill=x.db.raw.prepare('SELECT id FROM skills WHERE name=?').get(name);
 assert.equal(x.db.raw.prepare('SELECT COUNT(*) AS n FROM user_skills WHERE skill_id=?').get(skill.id).n,2);
 assert.ok(!(await x.call('/api/v1/me','GET',undefined,a)).data.learn.includes(name));
 assert.ok(!(await x.call('/api/v1/me','GET',undefined,b)).data.teach.includes(name));
 assert.equal((await x.call('/api/v1/matches','GET',undefined,a)).data.items.length,0);
 assert.equal((await x.call('/api/v1/admin/skills/'+skill.id,'PATCH',{approved:true},a)).status,403);
 assert.equal((await x.call('/api/v1/admin/skills/'+skill.id,'PATCH',{approved:true},admin)).status,200);
 assert.ok((await x.call('/api/v1/me','GET',undefined,a)).data.learn.includes(name));
 assert.ok((await x.call('/api/v1/me','GET',undefined,b)).data.teach.includes(name));
 assert.equal((await x.call('/api/v1/matches','GET',undefined,a)).data.items[0].id,(await x.call('/api/v1/me','GET',undefined,b)).data.id);
 await x.call('/api/v1/skills','POST',{name,direction:'learn'},a);
 assert.equal(x.db.raw.prepare('SELECT COUNT(*) AS n FROM user_skills WHERE skill_id=?').get(skill.id).n,2);
});

test('suspended recipient cannot accept an old Telegram inline invitation',async()=>{
 const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';
 const admin=await x.login(999),a=await x.login(101),b=await x.login(202);
 await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'learn'},a);
 await x.call('/api/v1/skills','POST',{name:'IELTS',direction:'teach'},b);
 const recipient=(await x.call('/api/v1/me','GET',undefined,b)).data.id;
 const invitation=await x.call('/api/v1/exchange-requests','POST',{recipient_id:recipient,skill_id:'skill-ielts'},a);
 assert.equal(invitation.status,201);
 assert.equal((await x.call('/api/v1/admin/users/'+recipient+'/suspend','POST',{reason:'Review'},admin)).status,200);
 const before=x.db.raw.prepare('SELECT COUNT(*) AS n FROM notifications').get().n;
 const old=globalThis.fetch;globalThis.fetch=async()=>new Response('{}',{status:200});
 const headers={'X-Telegram-Bot-Api-Secret-Token':'hook-secret'};
 const callback=id=>({update_id:id,callback_query:{id:'cb'+id,from:{id:202},data:'ex:accept:'+invitation.data.id}});
 try {
  assert.equal((await x.call('/api/v1/bot/webhook','POST',callback(81),'',headers)).status,200);
  assert.equal(x.db.raw.prepare('SELECT status FROM exchange_requests WHERE id=?').get(invitation.data.id).status,'sent');
  assert.equal(x.db.raw.prepare('SELECT COUNT(*) AS n FROM notifications').get().n,before);
  assert.equal((await x.call('/api/v1/admin/users/'+recipient+'/restore','POST',{},admin)).status,200);
  assert.equal((await x.call('/api/v1/bot/webhook','POST',callback(82),'',headers)).status,200);
  assert.equal(x.db.raw.prepare('SELECT status FROM exchange_requests WHERE id=?').get(invitation.data.id).status,'accepted');
 } finally {globalThis.fetch=old}
});


test('top administrator tiers are bound to signed Telegram identities and hidden owner listing',async()=>{
 const x=setup();x.env.FULL_ADMIN_TELEGRAM_ID='777';
 const owner=await x.login(777),head=await x.login(999),person=await x.login(101);
 const ownProfile=(await x.call('/api/v1/me','GET',undefined,owner)).data;
 const headProfile=(await x.call('/api/v1/me','GET',undefined,head)).data;
 assert.equal(ownProfile.role,'admin');
 assert.equal(ownProfile.admin_tier,'owner');
 assert.equal(headProfile.admin_tier,'head');
 assert.equal((await x.call('/api/v1/me','GET',undefined,person)).data.admin_tier,'none');
 const list=(await x.call('/api/v1/admin/users?limit=100','GET',undefined,head)).data;
 assert.equal(list.items.length,2);
 assert.ok(list.items.every(u=>u.id!==ownProfile.id));
 assert.equal(list.items.find(u=>u.id===headProfile.id).admin_label,'Bosh Admin');
 assert.equal((await x.call('/api/v1/admin/users/'+ownProfile.id,'GET',undefined,head)).status,404);
 assert.equal((await x.call('/api/v1/admin/users/'+ownProfile.id+'/role','POST',{role:'student'},head)).status,403);
 assert.equal((await x.call('/api/v1/admin/users/'+headProfile.id+'/role','POST',{role:'student'},owner)).status,403);
});

test('head administrator appoints ordinary admins while ordinary admins cannot escalate roles',async()=>{
 const x=setup();x.env.FULL_ADMIN_TELEGRAM_ID='777';
 const owner=await x.login(777),head=await x.login(999),normal=await x.login(101),target=await x.login(202);
 const regularId=(await x.call('/api/v1/me','GET',undefined,normal)).data.id;
 const targetId=(await x.call('/api/v1/me','GET',undefined,target)).data.id;
 assert.equal((await x.call('/api/v1/admin/users/'+regularId+'/role','POST',{role:'admin'},head)).status,200);
 assert.equal((await x.call('/api/v1/me','GET',undefined,normal)).data.admin_tier,'admin');
 assert.equal((await x.call('/api/v1/admin/dashboard/summary','GET',undefined,normal)).status,200);
 assert.equal((await x.call('/api/v1/admin/users/'+targetId+'/role','POST',{role:'admin'},normal)).status,403);
 assert.equal((await x.call('/api/v1/admin/roles','POST',{user_id:targetId,role:'admin'},normal)).status,403);
 assert.equal((await x.call('/api/v1/admin/announcements','POST',{audience:'all',text:'Broadcast'},normal)).status,403);
 assert.equal((await x.call('/api/v1/admin/settings/maintenance_mode','PATCH',{value:true},normal)).status,403);
 assert.equal((await x.call('/api/v1/admin/users/'+targetId+'/suspend','POST',{reason:'Spam'},normal)).status,200);
 assert.equal((await x.call('/api/v1/admin/users/'+regularId+'/suspend','POST',{reason:'Blocked'},head)).status,200);
 assert.equal((await x.call('/api/v1/admin/users/'+regularId+'/restore','POST',{},owner)).status,200);
 const audit=x.db.raw.prepare("SELECT count(*) AS n FROM audit_log WHERE action='role'").get().n;
 assert.ok(audit>=1);
});


test('production HTML includes responsive brand styling and no external icon font',async()=>{
 const {page}=await import('../worker/ui.js');
 const html=page();
 assert.match(html,/--accent:#38567e/);
 assert.match(html,/--burgundy:#8a0019/);
 assert.match(html,/--gold:#d4af37/);
 assert.match(html,/nav\.app-nav/);
 assert.match(html,/safe-area-inset-bottom/);
 assert.doesNotMatch(html,/fonts\.googleapis\.com|fontawesome|cdnjs\.cloudflare\.com/);
});

test('verification accepts private image evidence or HTTPS URL and admins can moderate both',async()=>{
  const x=setup(),objects=new Map();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';
  x.env.BUCKET={put:async(k,v)=>objects.set(k,v),get:async(k)=>objects.has(k)?{body:objects.get(k)}:null,delete:async(k)=>objects.delete(k)};
  const admin=await x.login(999),student=await x.login(101),other=await x.login(202);
  const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,1,2,3]);
  const form=new FormData();form.set('kind','university');form.set('evidence_file',new Blob([bytes],{type:'image/png'}),'student.png');
  const req=new Request(base+'/api/v1/verifications',{method:'POST',headers:{cookie:student,origin:base},body:form});
  const res=await worker.fetch(req,x.env),data=await res.json();assert.equal(res.status,201,JSON.stringify(data));
  assert.equal(objects.size,1);
  assert.equal((await x.call('/api/v1/verifications','POST',{kind:'university',evidence_url:'https://example.org/doc'},student)).status,409);
  const items=(await x.call('/api/v1/admin/verifications?type=university','GET',undefined,admin)).data.items;
  assert.equal(items[0].evidence_file_id,data.id);assert.equal(items[0].evidence_url,null);
  assert.equal((await x.call('/api/v1/verification-evidence/'+data.id,'GET',undefined,other)).status,404);
  const file=await worker.fetch(new Request(base+'/api/v1/verification-evidence/'+data.id,{headers:{cookie:admin}}),x.env);
  assert.equal(file.status,200);assert.equal(file.headers.get('content-disposition'),'attachment; filename="student.png"');
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()),bytes);
  assert.equal((await x.call('/api/v1/admin/verifications/'+data.id+'/approve','POST',{},admin)).status,200);
  assert.equal((await x.call('/api/v1/me','GET',undefined,student)).data.verified_university,true);
  const link=await x.call('/api/v1/verifications','POST',{kind:'mentor',evidence_url:'https://example.org/mentor'},student);
  assert.equal(link.status,201);assert.equal((await x.call('/api/v1/admin/verifications?type=mentor','GET',undefined,admin)).data.items[0].evidence_file_id,null);
});
test('verification rejects forged file types, oversized uploads and cross-origin submissions',async()=>{
  const x=setup(),student=await x.login(101);x.env.BUCKET={put:async()=>{},get:async()=>null,delete:async()=>{}};
  async function upload(blob,filename='bad.pdf',headers={}){const f=new FormData();f.set('kind','mentor');f.set('evidence_file',blob,filename);return worker.fetch(new Request(base+'/api/v1/verifications',{method:'POST',headers:{cookie:student,...headers},body:f}),x.env)}
  assert.equal((await upload(new Blob(['not a pdf'],{type:'application/pdf'}))).status,415);
  assert.equal((await upload(new Blob([new Uint8Array(10485761)],{type:'application/pdf'}))).status,413);
  const pdf=new Blob([Uint8Array.from([37,80,68,70,45,49])],{type:'application/pdf'});
  assert.equal((await upload(pdf,'proof.pdf',{origin:'https://attacker.test'})).status,403);
  assert.equal((await x.call('/api/v1/verifications','POST',{kind:'mentor',evidence_url:'http://insecure.test'},student)).status,400);
  assert.match(client,/name="evidence_file"/);
});

test('admin sends a private message only to a selected user and queues Telegram delivery',async()=>{
  const x=setup();x.env.BOOTSTRAP_ADMIN_TELEGRAM_ID='999';
  const admin=await x.login(999),a=await x.login(101),b=await x.login(202),outsider=await x.login(303);
  const aId=(await x.call('/api/v1/me','GET',undefined,a)).data.id;
  const bId=(await x.call('/api/v1/me','GET',undefined,b)).data.id;
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'No permission'},b)).status,403);
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'  '},admin)).status,400);
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'x'.repeat(1001)},admin)).status,400);
  assert.equal((await x.call('/api/v1/admin/users/no-user/message','POST',{text:'Hi'},admin)).status,404);
  const result=await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'Assalomu alaykum!\nYaxshi kun.'},admin);
  assert.equal(result.status,201,JSON.stringify(result.data));
  assert.equal(result.data.queued,1);
  assert.equal((await x.call('/api/v1/notifications','GET',undefined,a)).data.items.length,1);
  const items=(await x.call('/api/v1/notifications','GET',undefined,a)).data.items;
  assert.equal(items[0].kind,'admin_message');
  assert.match(items[0].body,/Yaxshi kun/);
  assert.equal((await x.call('/api/v1/notifications','GET',undefined,b)).data.items.length,0);
  assert.equal((await x.call('/api/v1/notifications','GET',undefined,outsider)).data.items.length,0);
  const outbox=x.db.raw.prepare('SELECT n.user_id,n.kind,o.status FROM bot_outbox o JOIN notifications n ON n.id=o.notification_id').all();
  assert.deepEqual(outbox.map(x=>({...x})),[{user_id:aId,kind:'admin_message',status:'pending'}]);
  const audit=x.db.raw.prepare("SELECT actor_id,object_id,details FROM audit_log WHERE action='direct_message'").all();
  assert.equal(audit.length,1);assert.equal(audit[0].object_id,aId);
  assert.doesNotMatch(audit[0].details,/Yaxshi kun/);
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'Duplicate'},admin)).status,429);
  assert.equal((await x.call('/api/v1/admin/users/'+bId+'/message','POST',{text:'Alohida xabar'},admin)).status,201);
  assert.equal((await x.call('/api/v1/notifications','GET',undefined,b)).data.items.length,1);
  const moderatorId=(await x.call('/api/v1/me','GET',undefined,outsider)).data.id;
  assert.equal((await x.call('/api/v1/admin/users/'+moderatorId+'/role','POST',{role:'moderator'},admin)).status,200);
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'Moderator'},outsider)).status,403);
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/suspend','POST',{reason:'Temporary'},admin)).status,200);
  assert.equal((await x.call('/api/v1/admin/users/'+aId+'/message','POST',{text:'Paused'},admin)).status,409);
  assert.match(client,/id="admin-direct-message"/);
});

test('private 1:1 chat: discovery, delivery, read state, privacy, block and authorization',async()=>{
 const x=setup(),ali=await x.login(101),vali=await x.login(202),outsider=await x.login(303);
 const a=(await x.call('/api/v1/me','GET',undefined,ali)).data.id,b=(await x.call('/api/v1/me','GET',undefined,vali)).data.id,c=(await x.call('/api/v1/me','GET',undefined,outsider)).data.id;
 let directory=await x.call('/api/v1/chat/people?q=User','GET',undefined,ali);
 assert.equal(directory.status,200);assert.ok(directory.data.items.some(u=>u.id===b));assert.ok(!directory.data.items.some(u=>u.id===a));
 assert.equal((await x.call('/api/v1/chat/'+a,'POST',{body:'Hello'},ali)).status,404);
 assert.equal((await x.call('/api/v1/chat/bogus','POST',{body:'Hello'},ali)).status,404);
 assert.equal((await x.call('/api/v1/chat/'+b,'POST',{body:' '},ali)).status,400);
 assert.equal((await x.call('/api/v1/chat/'+b,'POST',{body:'x'.repeat(1501)},ali)).status,400);
 const sent=await x.call('/api/v1/chat/'+b,'POST',{body:'Salom Vali!'},ali);assert.equal(sent.status,201,JSON.stringify(sent.data));
 assert.equal((await x.call('/api/v1/chat/conversations','GET',undefined,vali)).data.items[0].unread,1);
 assert.equal((await x.call('/api/v1/notifications','GET',undefined,vali)).data.items[0].target,'chat:'+a);
 assert.equal((await x.call('/api/v1/chat/'+a,'GET',undefined,vali)).data.items[0].body,'Salom Vali!');
 assert.equal((await x.call('/api/v1/chat/conversations','GET',undefined,vali)).data.items[0].unread,0);
 assert.equal((await x.call('/api/v1/chat/conversations','GET',undefined,outsider)).data.items.length,0);
 assert.equal((await x.call('/api/v1/chat/'+c,'GET',undefined,ali)).data.items.length,0);
 assert.equal((await x.call('/api/v1/chat/'+a,'POST',{body:'Salom Ali!'},vali)).status,201);
 const list=(await x.call('/api/v1/chat/'+b,'GET',undefined,ali)).data.items;assert.deepEqual(list.map(m=>m.body),['Salom Vali!','Salom Ali!']);
 const d=(await x.call('/api/v1/me','GET',undefined,vali)).data;
 assert.equal((await x.call('/api/v1/me','PATCH',{display_name:d.display_name,faculty:d.faculty,bio:d.bio,interests:d.interests,privacy:'private'},vali)).status,200);
 assert.equal((await x.call('/api/v1/chat/people?q=User','GET',undefined,outsider)).data.items.some(u=>u.id===b),false);
 assert.equal((await x.call('/api/v1/chat/'+b,'POST',{body:'New stranger'},outsider)).status,404);
 assert.equal((await x.call('/api/v1/chat/'+b,'POST',{body:'Old contact'},ali)).status,201);
 assert.equal((await x.call('/api/v1/chat/'+b+'/block','POST',{},ali)).status,200);
 assert.equal((await x.call('/api/v1/chat/'+b,'POST',{body:'Blocked'},ali)).status,403);
 assert.equal((await x.call('/api/v1/chat/'+a,'POST',{body:'Blocked back'},vali)).status,403);
 assert.equal((await x.call('/api/v1/chat/'+b+'/block','DELETE',{},ali)).status,200);
 assert.equal((await x.call('/api/v1/chat/'+a,'POST',{body:'Unblocked'},vali)).status,201);
 assert.equal((await x.call('/api/v1/chat/'+b+'?before=abc','GET',undefined,ali)).status,400);
 assert.equal((await x.call('/api/v1/chat/people?q='+('a'.repeat(81)),'GET',undefined,ali)).status,400);
 assert.match(client,/data-chat-messages/);assert.match(client,/chat-send/);
});
test('chat applies burst limits and exposes only participant conversations',async()=>{
 const x=setup(),sender=await x.login(101),receiver=await x.login(202),stranger=await x.login(303);
 const to=(await x.call('/api/v1/me','GET',undefined,receiver)).data.id;
 for(let i=0;i<5;i++)assert.equal((await x.call('/api/v1/chat/'+to,'POST',{body:'Message '+i},sender)).status,201);
 assert.equal((await x.call('/api/v1/chat/'+to,'POST',{body:'Too soon'},sender)).status,429);
 const inbox=await x.call('/api/v1/chat/conversations','GET',undefined,sender);
 assert.equal(inbox.data.items.length,1);assert.equal(inbox.data.items[0].last_message.length>0,true);
 assert.equal((await x.call('/api/v1/chat/conversations','GET',undefined,stranger)).data.items.length,0);
});
