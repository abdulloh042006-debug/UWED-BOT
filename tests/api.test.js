import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { webcrypto } from 'node:crypto';
import worker from '../worker/index.js';
import { client } from '../worker/ui.js';
import { Script } from 'node:vm';
globalThis.crypto ||= webcrypto;
const enc=new TextEncoder(), base='https://example.test';
async function hmac(key,msg){return new Uint8Array(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']),enc.encode(msg)))}
async function signed(id){const p=new URLSearchParams({auth_date:String(Math.floor(Date.now()/1000)),user:JSON.stringify({id,first_name:'User '+id})});const check=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('\n');const key=await hmac(enc.encode('WebAppData'),'test-token');p.set('hash',[...await hmac(key,check)].map(x=>x.toString(16).padStart(2,'0')).join(''));return p.toString()}
function d1(){const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');for(const file of ['0001_initial.sql','0002_teams_trust.sql','0003_ai.sql','0004_verification.sql','0005_admin_panel.sql'])db.exec(readFileSync(new URL('../db/'+file,import.meta.url),'utf8'));return { raw:db,prepare(sql){let args=[];return {bind(...values){args=values;return this},first(){return db.prepare(sql).get(...args)||null},all(){return {results:db.prepare(sql).all(...args)}},run(){const r=db.prepare(sql).run(...args);return {meta:{changes:r.changes}}}}},batch(items){db.exec('BEGIN');try{const result=items.map(x=>x.run());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}}
function setup(){const db=d1(),env={DB:db,TELEGRAM_BOT_TOKEN:'test-token',SESSION_SECRET:'s'.repeat(32),TELEGRAM_WEBHOOK_SECRET:'hook-secret',MINIAPP_URL:'https://example.test/'};async function call(path,method='GET',body,cookie='',headers={}){const h={...headers};if(body!==undefined)h['content-type']='application/json';if(cookie)h.cookie=cookie;const req=new Request(base+path,{method,headers:h,body:body!==undefined?JSON.stringify(body):undefined});const res=await worker.fetch(req,env);return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]}}async function login(id){const r=await call('/api/v1/auth/telegram','POST',{initData:await signed(id)});assert.equal(r.status,200);return r.cookie}return {db,env,call,login}}
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
 try {const body={update_id:5,message:{text:'/start',chat:{id:101,type:'private'}}};assert.equal((await x.call('/api/v1/bot/webhook','POST',body)).status,403);assert.equal((await x.call('/api/v1/bot/webhook','POST',body,'',{'X-Telegram-Bot-Api-Secret-Token':'hook-secret'})).status,200);assert.equal((await x.call('/api/v1/bot/webhook','POST',body,'',{'X-Telegram-Bot-Api-Secret-Token':'hook-secret'})).data.duplicate,true);assert.equal(calls.length,1);assert.match(calls[0].init.body,/Ilovani ochish/)}finally{globalThis.fetch=old}
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
 await root.handlers.click({target:{closest:()=>({dataset:{view:'admin'}})}});await wait('Faol foydalanuvchilar');
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
