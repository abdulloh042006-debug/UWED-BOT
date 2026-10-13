import { verifyInitData, signSession, verifySession, scoreMatch, nextRequestStatus, cleanText, randomId } from './core.js';
import { page, client } from './ui.js';
import { evidence, verificationEvidence, teams } from './teams.js';
import { protectedTier, adminTier, isTopAdmin } from './admin-access.js';
import { admin } from './admin.js';
import { ensureMigrations } from './migrations.js';

const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const fail = (status, code, message) => json({ error: { code, message } }, status);
const row = (db, sql, ...args) => db.prepare(sql).bind(...args).first();
const all = async (db, sql, ...args) => (await db.prepare(sql).bind(...args).all()).results || [];
const run = (db, sql, ...args) => db.prepare(sql).bind(...args).run();
const parse = v => { try { return JSON.parse(v || '[]'); } catch { return []; } };
const iso = value => { const d = new Date(value); if (!value || !Number.isFinite(d.getTime()) || d.toISOString() !== value) throw Error('Vaqt UTC ISO formatida bo‘lishi kerak'); return value; };
const text = (v, n = 500) => cleanText(v, n);
function cookie(request) { return request.headers.get('cookie')?.match(/(?:^|;\s*)uwed_session=([^;]+)/)?.[1] || ''; }
async function actor(request, env) {
  const id = await verifySession(cookie(request), env.SESSION_SECRET);
  return id ? row(env.DB, 'SELECT id,telegram_user_id,display_name,role,verified_university,suspended_at FROM users WHERE id=?', id) : null;
}
function publicProfile(r) { return { id: r.id, display_name: r.display_name, role: r.role, verified_university: !!r.verified_university, faculty: r.faculty, bio: r.bio, timezone: r.timezone, interests: parse(r.interests), languages: parse(r.languages), privacy: r.privacy, notify_bot: !!r.notify_bot, ai_consent:!!r.ai_consent, teach: parse(r.teach), learn: parse(r.learn) }; }
async function profile(db, id) {
  const p = await row(db, 'SELECT u.*,p.faculty,p.bio,p.timezone,p.interests,p.languages,p.privacy,p.notify_bot,p.ai_consent FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?', id);
  if (!p) return null;
  const skills = await all(db, 'SELECT s.name,us.direction FROM user_skills us JOIN skills s ON s.id=us.skill_id WHERE us.user_id=? AND s.approved=1', id);
  p.teach = JSON.stringify(skills.filter(x => x.direction === 'teach').map(x => x.name));
  p.learn = JSON.stringify(skills.filter(x => x.direction === 'learn').map(x => x.name));
  return publicProfile(p);
}
async function notify(db, userId, kind, body, target) {
  const id = randomId();
  await db.batch([
    db.prepare('INSERT INTO notifications(id,user_id,kind,body,target) VALUES(?,?,?,?,?)').bind(id,userId,kind,body,target),
    db.prepare('INSERT INTO bot_outbox(id,notification_id) VALUES(?,?)').bind(randomId(),id)
  ]);
}
async function changeExchange(db, r, action, user) {
  const who=r.sender_id===user.id?'sender':r.recipient_id===user.id?'recipient':null;
  if (!who) throw Error('ownership');
  const next=nextRequestStatus(r.status,action,who);
  const changed=action==='cancel' ? (await db.batch([
    db.prepare('UPDATE exchange_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status=?').bind(next,r.id,r.status),
    db.prepare("UPDATE sessions SET status='cancelled' WHERE request_id=? AND status IN ('proposed','confirmed') AND EXISTS(SELECT 1 FROM exchange_requests WHERE id=? AND status='cancelled')").bind(r.id,r.id)
  ]))[0] : await run(db,'UPDATE exchange_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status=?',next,r.id,r.status);
  if (!changed.meta?.changes) throw Error('changed');
  await notify(db,r.sender_id===user.id?r.recipient_id:r.sender_id,'exchange',`${user.display_name}: so‘rov holati ${next}`,'sessions');
  return next;
}
async function api(request, env, path, method) {
  if (!env.DB || !env.SESSION_SECRET || !env.TELEGRAM_BOT_TOKEN) return fail(503,'config','Xizmat sozlanmagan');
  if (path === 'auth/telegram' && method === 'POST') {
    const { initData } = await request.json();
    let tg;
    try { tg = await verifyInitData(initData, env.TELEGRAM_BOT_TOKEN); } catch { return fail(401,'telegram_auth','Telegram orqali qayta kiring'); }
    let user = await row(env.DB, 'SELECT * FROM users WHERE telegram_user_id=?', tg.id);
    if (!user) {
      const id = randomId();
      const role = protectedTier(tg.id, env) || tg.id === String(env.BOOTSTRAP_ADMIN_TELEGRAM_ID || '') ? 'admin' : 'student';
      try {
        await env.DB.batch([
          env.DB.prepare('INSERT INTO users(id,telegram_user_id,display_name,role) VALUES(?,?,?,?)').bind(id,tg.id,tg.firstName || 'Talaba',role),
          env.DB.prepare('INSERT INTO profiles(user_id) VALUES(?)').bind(id)
        ]);
      } catch (e) {
        // Concurrent first launch may have inserted the same Telegram identity.
        user = await row(env.DB, 'SELECT * FROM users WHERE telegram_user_id=?', tg.id);
        if (!user) throw e;
      }
      user ||= await row(env.DB, 'SELECT * FROM users WHERE telegram_user_id=?', tg.id);
    }
    // Runtime-provisioned top admins can have existing student accounts.
    // Promote only identities verified from signed Telegram initData.
    if (protectedTier(tg.id, env) && user.role !== 'admin') {
      await run(env.DB, "UPDATE users SET role='admin' WHERE id=?", user.id);
      user.role = 'admin';
    }
    if(user.suspended_at) return fail(403,'suspended','Hisobingiz to`xtatilgan');
    const session = await signSession(user.id, env.SESSION_SECRET);
    return json({ ok: true }, 200, { 'set-cookie': `uwed_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/api/v1; Max-Age=3600` });
  }
  const me = await actor(request, env);
  if (!me) return fail(401,'auth','Telegram orqali qayta kiring');
  if (me.suspended_at) return fail(403,'suspended','Hisobingiz to`xtatilgan');
  const adminResult=await admin(request,env,path,method,me);
  if (adminResult) return adminResult;
  const maintenance=await row(env.DB,"SELECT value FROM admin_settings WHERE key='maintenance_mode'");
  if(maintenance?.value==='true' && !['admin','moderator'].includes(me.role)) return fail(503,'maintenance','Xizmat vaqtincha yopiq');
  const teamResult=await teams(request,env,path,method,me);
  if (teamResult) return teamResult;
  if (path === 'me' && method === 'GET') return json({ ...(await profile(env.DB, me.id)), admin_tier: adminTier(me, env) });
  const publicUser=path.match(/^profiles\/([^/]+)$/);
  if (publicUser && method==='GET') {
    const p=await profile(env.DB,publicUser[1]);
    const suspended=await row(env.DB,'SELECT suspended_at FROM users WHERE id=?',publicUser[1]);
    if (!p || suspended?.suspended_at || p.privacy!=='public' && p.id!==me.id) return fail(404,'profile','Profil topilmadi');
    const reviews=await row(env.DB,'SELECT count(*) AS count,avg(stars) AS average FROM reviews WHERE subject_id=? AND hidden_at IS NULL',p.id);
    return json({id:p.id,display_name:p.display_name,faculty:p.faculty,bio:p.bio,teach:p.teach,learn:p.learn,verified_university:p.verified_university,mentor:p.role==='mentor',rating_count:reviews.count,rating_average:reviews.average});
  }
  if (path === 'me' && method === 'PATCH') {
    const b = await request.json();
    const name = text(b.display_name,100), faculty = text(b.faculty || '',100), bio = text(b.bio || '',500);
    if (!name || !Array.isArray(b.interests) || b.interests.length > 20) return fail(400,'input','Profil ma’lumotlarini tekshiring');
    const current=await profile(env.DB,me.id),privacy=b.privacy??current.privacy,timezone=b.timezone??current.timezone,notifyBot=b.notify_bot??current.notify_bot,aiConsent=b.ai_consent??current.ai_consent;
    if (!['public','members','private'].includes(privacy) || typeof timezone!=='string' || timezone.length>60 || ![true,false].includes(notifyBot) || ![true,false].includes(aiConsent)) return fail(400,'input','Sozlamalarni tekshiring');
    try { new Intl.DateTimeFormat('en',{timeZone:timezone}); } catch { return fail(400,'timezone','Vaqt mintaqasi noto‘g‘ri'); }
    const interests = b.interests.map(x => text(x,60));
    await env.DB.batch([
      env.DB.prepare('UPDATE users SET display_name=? WHERE id=?').bind(name,me.id),
      env.DB.prepare('UPDATE profiles SET faculty=?,bio=?,interests=?,privacy=?,timezone=?,notify_bot=?,ai_consent=? WHERE user_id=?').bind(faculty,bio,JSON.stringify(interests),privacy,timezone,notifyBot?1:0,aiConsent?1:0,me.id)
    ]);
    return json(await profile(env.DB,me.id));
  }
  if (path === 'skills' && method === 'GET') return json({ items: await all(env.DB,'SELECT id,name FROM skills WHERE approved=1 ORDER BY name') });
  if (path === 'skills' && method === 'POST') {
    const b = await request.json(), name = text(b.name,60);
    if (!name || !['teach','learn'].includes(b.direction)) return fail(400,'input','Ko‘nikmani tekshiring');
    let skill = await row(env.DB,'SELECT id,approved FROM skills WHERE name=?',name);
    if (!skill) {
      const id=randomId();
      await run(env.DB,'INSERT OR IGNORE INTO skills(id,name,approved) VALUES(?,?,0)',id,name);
      skill=await row(env.DB,'SELECT id,approved FROM skills WHERE name=?',name);
    }
    // New skills require moderation. Only approved skills can enter matching.
    await run(env.DB,'INSERT OR IGNORE INTO user_skills(user_id,skill_id,direction) VALUES(?,?,?)',me.id,skill.id,b.direction);
    if (!skill.approved) return json({ pending: true, message:'Ko‘nikma tasdiqlashga yuborildi' },202);
    return json({ ok:true },201);
  }
  if (path === 'availability' && method === 'GET') return json({ items:await all(env.DB,'SELECT id,weekday,start_minute,end_minute FROM availability WHERE user_id=?',me.id) });
  if (path === 'availability' && method === 'POST') {
    const b=await request.json();
    if (![b.weekday,b.start_minute,b.end_minute].every(Number.isInteger) || b.weekday<0 || b.weekday>6 || b.start_minute<0 || b.end_minute>1440 || b.start_minute>=b.end_minute) return fail(400,'input','Vaqt oralig‘ini tekshiring');
    await run(env.DB,'INSERT INTO availability(id,user_id,weekday,start_minute,end_minute) VALUES(?,?,?,?,?)',randomId(),me.id,b.weekday,b.start_minute,b.end_minute);
    return json({ ok:true },201);
  }
  const availability=path.match(/^availability\/([^/]+)$/);
  if (availability && method==='DELETE') {
    const changed=await run(env.DB,'DELETE FROM availability WHERE id=? AND user_id=?',availability[1],me.id);
    return changed.meta?.changes?json({ok:true}):fail(404,'slot','Vaqt topilmadi');
  }
  if (path === 'mentors' && method==='GET') return json({items:await all(env.DB,"SELECT u.id,u.display_name,p.faculty,p.bio FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.role='mentor' AND u.suspended_at IS NULL AND p.privacy='public' ORDER BY u.display_name LIMIT 100")});
  if (path === 'matches' && method === 'GET') {
    const mine=await profile(env.DB,me.id), peers=await all(env.DB,"SELECT u.id FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id<>? AND u.suspended_at IS NULL AND p.privacy='public' LIMIT 100",me.id);
    const slots=await all(env.DB,'SELECT user_id,weekday,start_minute,end_minute FROM availability');
    const ranges=id=>slots.filter(s=>s.user_id===id).map(s=>({start:new Date(Date.UTC(2026,0,4+s.weekday,0,s.start_minute)).toISOString(),end:new Date(Date.UTC(2026,0,4+s.weekday,0,s.end_minute)).toISOString()}));
    const items=[];
    for (const p of peers) {
      const other=await profile(env.DB,p.id);
      // The weekly overlap shortcut is valid only for equal timezones. Cross-zone
      // availability is left unscored until DST-aware expansion is implemented.
      const match=scoreMatch({...mine,slots:ranges(me.id)},{...other,slots:mine.timezone===other.timezone?ranges(p.id):[]});
      if (!match) continue;
      const skill=await row(env.DB,'SELECT id FROM skills WHERE name=? AND approved=1',match.teach[0] || match.reciprocal[0]);
      if (skill) items.push({id:p.id,display_name:other.display_name,skill_id:skill.id,...match});
    }
    const q=(new URL(request.url)).searchParams.get('q')?.trim().toLocaleLowerCase()||'';
    return json({items:items.filter(x=>!q||x.display_name.toLocaleLowerCase().includes(q)||x.teach.some(s=>s.toLocaleLowerCase().includes(q))).sort((a,b)=>b.score-a.score)});
  }
  const aiMatch=path.match(/^matches\/([^/]+)\/explanation$/);
  if (aiMatch && method==='POST') {
    const mine=await profile(env.DB,me.id),other=await profile(env.DB,aiMatch[1]);
    if (!other || other.id===me.id || other.privacy!=='public') return fail(404,'match','Moslik topilmadi');
    const match=scoreMatch(mine,other);
    if (!match) return fail(404,'match','Moslik topilmadi');
    const fallback={score:match.score,explanation:match.reason,source:'rules'};
    if (!mine.ai_consent || !env.GEMINI_API_KEY || !env.GEMINI_MODEL) return json(fallback);
    if (!/^[a-zA-Z0-9._-]{3,80}$/.test(env.GEMINI_MODEL)) return json(fallback);
    const input=JSON.stringify({teach:match.teach,reciprocal:match.reciprocal,interests:match.sharedInterests,sharedTime:match.sharedTime,score:match.score});
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input)))].map(x=>x.toString(16).padStart(2,'0')).join('');
    const cached=await row(env.DB,'SELECT explanation FROM ai_match_cache WHERE user_id=? AND peer_id=? AND input_hash=? AND created_at>datetime(\'now\',\'-1 day\')',me.id,other.id,hash);
    if (cached) return json({score:match.score,explanation:cached.explanation,source:'gemini-cache',reason:match.reason});
    const day=new Date().toISOString().slice(0,10);
    await run(env.DB,'INSERT OR IGNORE INTO ai_daily_usage(user_id,day,count) VALUES(?,?,0)',me.id,day);
    const quota=await run(env.DB,'UPDATE ai_daily_usage SET count=count+1 WHERE user_id=? AND day=? AND count<5',me.id,day);
    if (!quota.meta?.changes) return json(fallback);
    try {
      const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:JSON.stringify({contents:[{parts:[{text:`O‘zbekcha 1–2 jumla yozing: faqat berilgan ko‘nikma va umumiy qiziqishlarga tayangan holda hamkorlik g‘oyasi. Yangi fakt, sertifikat, reyting yoki foiz to‘qimang. Ma’lumot: ${input}`}]}],generationConfig:{maxOutputTokens:150,temperature:0.3}}),signal:AbortSignal.timeout(4000)});
      if (!response.ok) return json(fallback);
      const data=await response.json(),explanation=String(data.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().slice(0,500);
      if (!explanation) return json(fallback);
      await run(env.DB,'INSERT OR REPLACE INTO ai_match_cache(user_id,peer_id,input_hash,explanation) VALUES(?,?,?,?)',me.id,other.id,hash,explanation);
      return json({score:match.score,reason:match.reason,explanation,source:'gemini'});
    } catch { return json(fallback); }
  }
  if (path === 'exchange-requests' && method === 'POST') {
    if((await row(env.DB,"SELECT value FROM admin_settings WHERE key='allow_skill_exchange'"))?.value!=='true') return fail(409,'setting','Skill Exchange vaqtincha yopiq');
    const b=await request.json();
    if (b.recipient_id===me.id) return fail(400,'self','O‘zingizga taklif yuborolmaysiz');
    const recipient=await row(env.DB,"SELECT u.id,u.display_name FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=? AND p.privacy='public' AND u.suspended_at IS NULL",b.recipient_id);
    const skill=await row(env.DB,'SELECT id,name FROM skills WHERE id=? AND approved=1',b.skill_id);
    if (!recipient || !skill) return fail(404,'target','Foydalanuvchi yoki ko‘nikma topilmadi');
    const pair=await row(env.DB,"SELECT 1 AS ok FROM user_skills a JOIN user_skills b ON a.skill_id=b.skill_id WHERE a.user_id=? AND b.user_id=? AND a.skill_id=? AND ((a.direction='learn' AND b.direction='teach') OR (a.direction='teach' AND b.direction='learn'))",me.id,recipient.id,skill.id);
    if (!pair) return fail(400,'skill','Bu ko‘nikma bo‘yicha moslik yo‘q');
    const id=randomId();
    try { await run(env.DB,'INSERT INTO exchange_requests(id,sender_id,recipient_id,skill_id) VALUES(?,?,?,?)',id,me.id,recipient.id,skill.id); }
    catch { return fail(409,'duplicate','Bu taklif allaqachon yuborilgan'); }
    await notify(env.DB,recipient.id,'exchange',`${me.display_name} sizga ${skill.name} bo‘yicha taklif yubordi`,'sessions:'+id);
    return json({id,status:'sent'},201);
  }
  if (path === 'exchange-requests' && method === 'GET') {
    const items=await all(env.DB,`SELECT r.*,s.name AS skill_name,COALESCE(x.display_name,y.display_name) AS other_name,t.id AS session_id,t.status AS session_status,t.proposed_by,t.start_at,t.end_at FROM exchange_requests r JOIN skills s ON s.id=r.skill_id LEFT JOIN users x ON x.id=r.recipient_id AND r.sender_id=? LEFT JOIN users y ON y.id=r.sender_id AND r.recipient_id=? LEFT JOIN sessions t ON t.request_id=r.id WHERE r.sender_id=? OR r.recipient_id=? ORDER BY r.created_at DESC LIMIT 100`,me.id,me.id,me.id,me.id);
    return json({items});
  }
  const action=path.match(/^exchange-requests\/([^/]+)$/);
  if (action && method==='PATCH') {
    const r=await row(env.DB,'SELECT * FROM exchange_requests WHERE id=?',action[1]);
    if (!r || (r.sender_id!==me.id && r.recipient_id!==me.id)) return fail(404,'request','So‘rov topilmadi');
    const b=await request.json();
    if (!['accept','reject','cancel','complete'].includes(b.action)) return fail(400,'action','Amal noto‘g‘ri');
    if (b.action==='complete') {
      if (r.status!=='scheduled') return fail(409,'state','Bu amal hozir mumkin emas');
      const s=await row(env.DB,'SELECT * FROM sessions WHERE request_id=?',r.id);
      if (!s || s.status!=='confirmed' || Date.parse(s.end_at)>Date.now()) return fail(409,'session','Sessiya hali yakunlanmagan');
      await run(env.DB,'INSERT OR IGNORE INTO session_completions(session_id,user_id) VALUES(?,?)',s.id,me.id);
      const completed=await row(env.DB,'SELECT count(*) AS n FROM session_completions WHERE session_id=?',s.id);
      if (completed.n<2) return json({id:r.id,status:'scheduled',awaiting_other:true});
      await run(env.DB,"UPDATE sessions SET status='completed' WHERE id=? AND status='confirmed'",s.id);
    }
    try { return json({id:r.id,status:await changeExchange(env.DB,r,b.action,me)}); }
    catch { return fail(409,'state','So‘rov o‘zgargan yoki amal mumkin emas'); }
  }
  const schedule=path.match(/^exchange-requests\/([^/]+)\/schedule$/);
  if (schedule && method==='POST') {
    const r=await row(env.DB,"SELECT * FROM exchange_requests WHERE id=? AND status='accepted'",schedule[1]);
    if (!r || ![r.sender_id,r.recipient_id].includes(me.id)) return fail(404,'request','So‘rov topilmadi');
    const b=await request.json(), start=iso(b.start_at),end=iso(b.end_at);
    if (Date.parse(start)<Date.now() || Date.parse(end)-Date.parse(start)<15*60000 || Date.parse(end)-Date.parse(start)>4*3600000) return fail(400,'time','15 daqiqadan 4 soatgacha kelajak vaqtini tanlang');
    const existing=await row(env.DB,'SELECT id FROM sessions WHERE request_id=?',r.id);
    if (existing) return fail(409,'duplicate','Vaqt allaqachon taklif qilingan');
    const id=randomId();
    await run(env.DB,'INSERT INTO sessions(id,request_id,start_at,end_at,proposed_by) VALUES(?,?,?,?,?)',id,r.id,start,end,me.id);
    await notify(env.DB,r.sender_id===me.id?r.recipient_id:r.sender_id,'session','Yangi sessiya vaqti taklif qilindi','sessions');
    return json({id,status:'proposed'},201);
  }
  const confirm=path.match(/^sessions\/([^/]+)\/confirm$/);
  if (confirm && method==='POST') {
    const s=await row(env.DB,'SELECT t.*,r.sender_id,r.recipient_id,r.status AS request_status FROM sessions t JOIN exchange_requests r ON r.id=t.request_id WHERE t.id=?',confirm[1]);
    if (!s || ![s.sender_id,s.recipient_id].includes(me.id)) return fail(404,'session','Sessiya topilmadi');
    if (s.proposed_by===me.id || s.status!=='proposed' || s.request_status!=='accepted') return fail(409,'state','Ikkinchi ishtirokchi tasdiqlashi kerak');
    const results=await env.DB.batch([
      env.DB.prepare(`UPDATE sessions SET status='confirmed',confirmed_by=? WHERE id=? AND status='proposed' AND EXISTS(SELECT 1 FROM exchange_requests WHERE id=? AND status='accepted') AND NOT EXISTS (SELECT 1 FROM sessions t JOIN exchange_requests r ON r.id=t.request_id WHERE t.status='confirmed' AND t.id<>? AND (r.sender_id IN (?,?) OR r.recipient_id IN (?,?)) AND t.start_at<? AND t.end_at>?)`).bind(me.id,s.id,s.request_id,s.id,s.sender_id,s.recipient_id,s.sender_id,s.recipient_id,s.end_at,s.start_at),
      env.DB.prepare("UPDATE exchange_requests SET status='scheduled' WHERE id=? AND status='accepted' AND EXISTS(SELECT 1 FROM sessions WHERE id=? AND status='confirmed')").bind(s.request_id,s.id)
    ]);
    const changed=results[0];
    if (!changed.meta?.changes) return fail(409,'conflict','Bu vaqtda boshqa sessiya bor yoki sessiya o‘zgargan');
    await notify(env.DB,s.proposed_by,'session','Sessiya vaqti tasdiqlandi','sessions');
    return json({id:s.id,status:'confirmed'});
  }
  const reschedule=path.match(/^sessions\/([^/]+)\/reschedule$/);
  if (reschedule && method==='POST') {
    const s=await row(env.DB,'SELECT t.*,r.sender_id,r.recipient_id FROM sessions t JOIN exchange_requests r ON r.id=t.request_id WHERE t.id=?',reschedule[1]);
    if (!s || ![s.sender_id,s.recipient_id].includes(me.id)) return fail(404,'session','Sessiya topilmadi');
    if (s.status!=='confirmed' || Date.parse(s.start_at)<=Date.now()) return fail(409,'state','Sessiya vaqtini o‘zgartirib bo‘lmaydi');
    const b=await request.json(),start=iso(b.start_at),end=iso(b.end_at);
    if (Date.parse(start)<Date.now() || Date.parse(end)-Date.parse(start)<15*60000 || Date.parse(end)-Date.parse(start)>4*3600000) return fail(400,'time','Vaqtni tekshiring');
    const results=await env.DB.batch([env.DB.prepare("UPDATE sessions SET start_at=?,end_at=?,proposed_by=?,confirmed_by=NULL,status='proposed' WHERE id=? AND status='confirmed' AND EXISTS(SELECT 1 FROM exchange_requests WHERE id=? AND status='scheduled')").bind(start,end,me.id,s.id,s.request_id),env.DB.prepare("UPDATE exchange_requests SET status='accepted' WHERE id=? AND status='scheduled' AND EXISTS(SELECT 1 FROM sessions WHERE id=? AND status='proposed')").bind(s.request_id,s.id)]);
    if (!results[0].meta?.changes) return fail(409,'state','Sessiya o‘zgargan');
    await notify(env.DB,s.sender_id===me.id?s.recipient_id:s.sender_id,'session','Sessiya vaqti o‘zgartirishga yuborildi','sessions');
    return json({id:s.id,status:'proposed'});
  }
  if (path === 'notifications' && method === 'GET') return json({items:await all(env.DB,'SELECT id,kind,body,target,read_at,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50',me.id)});
  if (path === 'verifications' && method === 'POST') {
    const isMultipart=/^multipart\/form-data(?:;|$)/i.test(request.headers.get('content-type')||'');
    const form=isMultipart?await request.formData():null;
    const b=form?Object.fromEntries(form):await request.json();
    if (!['university','mentor'].includes(b.kind)) return fail(400,'input','Ariza turi noto‘g‘ri');
    const file=form?.get('evidence_file'), hasFile=!!(file&&typeof file.arrayBuffer==='function');
    if (file&&!hasFile) return fail(400,'evidence','Faylni tekshiring');
    if (hasFile&&String(b.evidence_url||'').trim()) return fail(400,'evidence','Havola yoki fayldan bittasini tanlang');
    let evidenceUrl=null,bytes=null,contentType=null,filename=null;
    if (hasFile) {
      if (!env.BUCKET) return fail(503,'storage','Fayl xizmati hozircha sozlanmagan');
      if (!Number.isSafeInteger(file.size)||file.size<1||file.size>10485760) return fail(413,'size','Fayl 10 MB dan oshmasin va bo‘sh bo‘lmasin');
      contentType=file.type;
      if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(contentType)) return fail(415,'type','PDF, JPG, PNG yoki WEBP yuboring');
      bytes=new Uint8Array(await file.arrayBuffer());
      if (bytes.length!==file.size) return fail(400,'size','Fayl hajmi mos emas');
      const pdf=bytes.length>=5&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-';
      const png=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
      const jpg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
      const webp=bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
      if (!(contentType==='application/pdf'&&pdf||contentType==='image/png'&&png||contentType==='image/jpeg'&&jpg||contentType==='image/webp'&&webp)) return fail(415,'signature','Fayl turi mos emas');
      filename=text(file.name||'dalil',120).replace(/[\\/\x00-\x1f]+/g,'_')||'dalil';
    } else {
      let link;
      try { link=new URL(b.evidence_url); } catch { return fail(400,'evidence','Dalil havolasi yoki fayl kerak'); }
      if (link.protocol!=='https:'||link.username||link.password||link.href.length>1000) return fail(400,'evidence','HTTPS dalil havolasi kerak');
      evidenceUrl=link.toString();
    }
    const prior=await row(env.DB,"SELECT id FROM verification_requests WHERE user_id=? AND kind=? AND status='pending'",me.id,b.kind);
    if (prior) return fail(409,'duplicate','Arizangiz ko‘rib chiqilmoqda');
    const id=randomId();
    if (hasFile) {
      const key='verification/'+me.id+'/'+id;
      await env.BUCKET.put(key,bytes,{httpMetadata:{contentType}});
      try {
        await env.DB.batch([
          env.DB.prepare('INSERT INTO verification_requests(id,user_id,kind,evidence_url) VALUES(?,?,?,NULL)').bind(id,me.id,b.kind),
          env.DB.prepare('INSERT INTO verification_evidence(request_id,owner_id,storage_key,content_type,size_bytes,filename) VALUES(?,?,?,?,?,?)').bind(id,me.id,key,contentType,bytes.length,filename)
        ]);
      } catch(e) { try { await env.BUCKET.delete(key); } catch {} throw e; }
    } else {
      await run(env.DB,'INSERT INTO verification_requests(id,user_id,kind,evidence_url) VALUES(?,?,?,?)',id,me.id,b.kind,evidenceUrl);
    }
    return json({id,status:'pending'},201);
  }
  if (path === 'admin/verifications' && method === 'GET') {
    if (!['admin','moderator'].includes(me.role)) return fail(403,'role','Ruxsat yo‘q');
    return json({items:await all(env.DB,"SELECT v.id,v.kind,v.evidence_url,u.display_name FROM verification_requests v JOIN users u ON u.id=v.user_id WHERE v.status='pending' ORDER BY v.created_at LIMIT 100")});
  }
  if (path === 'admin/skills' && method === 'GET') {
    if (!['admin','moderator'].includes(me.role)) return fail(403,'role','Ruxsat yo‘q');
    return json({items:await all(env.DB,'SELECT id,name FROM skills WHERE approved=0 ORDER BY name LIMIT 100')});
  }
  const skillReview=path.match(/^admin\/skills\/([^/]+)$/);
  if (skillReview && method==='PATCH') {
    if (!['admin','moderator'].includes(me.role)) return fail(403,'role','Ruxsat yo‘q');
    const changed=await run(env.DB,'UPDATE skills SET approved=1 WHERE id=? AND approved=0',skillReview[1]);
    if (!changed.meta?.changes) return fail(404,'skill','Ko‘nikma topilmadi');
    await run(env.DB,'INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)',randomId(),me.id,'approve','skill',skillReview[1]);
    return json({ok:true});
  }
  const review=path.match(/^admin\/verifications\/([^/]+)$/);
  if (review && method==='PATCH') {
    if (!['admin','moderator'].includes(me.role)) return fail(403,'role','Ruxsat yo‘q');
    const b=await request.json(); if (!['approve','reject'].includes(b.decision)) return fail(400,'input','Qaror noto‘g‘ri');
    const v=await row(env.DB,"SELECT * FROM verification_requests WHERE id=? AND status='pending'",review[1]);
    if (!v || v.user_id===me.id) return fail(404,'verification','Ariza topilmadi');
    const changed=await run(env.DB,"UPDATE verification_requests SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'",b.decision==='approve'?'approved':'rejected',me.id,v.id);
    if (!changed.meta?.changes) return fail(409,'state','Ariza allaqachon ko‘rilgan');
    if (b.decision==='approve' && v.kind==='university') await run(env.DB,'UPDATE users SET verified_university=1 WHERE id=?',v.user_id);
    if (b.decision==='approve' && v.kind==='mentor') await run(env.DB,"UPDATE users SET role='mentor' WHERE id=? AND role='student'",v.user_id);
    await run(env.DB,'INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)',randomId(),me.id,b.decision,'verification',v.id);
    await notify(env.DB,v.user_id,'moderation',`Arizangiz ${b.decision==='approve'?'tasdiqlandi':'rad etildi'}`,'profile');
    return json({ok:true});
  }
  return fail(404,'route','Sahifa topilmadi');
}

async function telegram(env, method, payload) {
  const res=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if (!res.ok) throw Error('Telegram delivery failed');
}
async function flushOutbox(env) {
  if (!env.DB || !env.TELEGRAM_BOT_TOKEN) return;
  const jobs=await all(env.DB,`SELECT o.id,o.attempts,n.body,n.target,u.telegram_user_id,p.notify_bot FROM bot_outbox o JOIN notifications n ON n.id=o.notification_id JOIN users u ON u.id=n.user_id JOIN profiles p ON p.user_id=u.id WHERE o.status IN ('pending','sending') AND o.next_attempt_at<=CURRENT_TIMESTAMP ORDER BY n.created_at LIMIT 5`);
  for (const job of jobs) {
    const claimed=await run(env.DB,"UPDATE bot_outbox SET status='sending',next_attempt_at=datetime('now','+2 minutes') WHERE id=? AND status IN ('pending','sending') AND next_attempt_at<=CURRENT_TIMESTAMP",job.id);
    if (!claimed.meta?.changes) continue;
    if (!job.notify_bot) { await run(env.DB,"UPDATE bot_outbox SET status='skipped' WHERE id=?",job.id); continue; }
    try {
      const payload={chat_id:job.telegram_user_id,text:job.body};
      if(job.target.startsWith('sessions:')){
        const id=job.target.slice(9),r=await row(env.DB,"SELECT status,created_at FROM exchange_requests WHERE id=?",id);
        if(r?.status==='sent' && Date.now()-Date.parse(r.created_at.replace(' ','T')+'Z')<48*3600000)payload.reply_markup={inline_keyboard:[[{text:'Qabul qilish',callback_data:'ex:accept:'+id},{text:'Rad etish',callback_data:'ex:reject:'+id}],[{text:'Ilovani ochish',web_app:{url:env.MINIAPP_URL}}]]};
      }
      await telegram(env,'sendMessage',payload);await run(env.DB,"UPDATE bot_outbox SET status='sent',attempts=attempts+1 WHERE id=?",job.id);
    }
    catch { await run(env.DB,"UPDATE bot_outbox SET attempts=attempts+1,next_attempt_at=datetime('now', '+' || min(3600, 30 * (1 << min(attempts, 7))) || ' seconds'),last_error='delivery failed' WHERE id=?",job.id); }
  }
}
async function webhook(request, env) {
  if (!env.DB || !env.TELEGRAM_WEBHOOK_SECRET || !env.TELEGRAM_BOT_TOKEN || !env.MINIAPP_URL) return fail(503,'config','Xizmat sozlanmagan');
  if (request.headers.get('X-Telegram-Bot-Api-Secret-Token')!==env.TELEGRAM_WEBHOOK_SECRET) return fail(403,'webhook','Ruxsat yo‘q');
  const update=await request.json();
  if (!Number.isSafeInteger(update.update_id)) return fail(400,'update','Yangilanish noto‘g‘ri');
  const inserted=await run(env.DB,'INSERT OR IGNORE INTO webhook_events(update_id) VALUES(?)',String(update.update_id));
  if (!inserted.meta?.changes) return json({ok:true,duplicate:true});
  const message=update.message, chat=message?.chat?.id;
  const callback=update.callback_query;
  if (callback) {
    const match=String(callback.data||'').match(/^ex:(accept|reject):([a-f0-9-]{36})$/i);
    let answer='So‘rov eskirgan yoki ruxsat yo‘q';
    if (match && Number.isSafeInteger(callback.from?.id)) {
      const user=await row(env.DB,'SELECT * FROM users WHERE telegram_user_id=?',String(callback.from.id));
      const r=await row(env.DB,'SELECT * FROM exchange_requests WHERE id=?',match[2]);
      if (user && !user.suspended_at && r && r.recipient_id===user.id && r.status==='sent' && Date.now()-Date.parse(r.created_at.replace(' ','T')+'Z')<48*3600000) {
        try { await changeExchange(env.DB,r,match[1],user);answer=match[1]==='accept'?'Taklif qabul qilindi':'Taklif rad etildi'; } catch { answer='So‘rov allaqachon o‘zgargan'; }
      }
    }
    try { await telegram(env,'answerCallbackQuery',{callback_query_id:callback.id,text:answer,show_alert:false}); }
    catch(e){await run(env.DB,'DELETE FROM webhook_events WHERE update_id=?',String(update.update_id));throw e}
  }
  if (chat && message.chat.type==='private') {
    const command=String(message.text||'').split(/\s/)[0].split('@')[0];
    const paths={ '/start':'', '/help':'', '/profile':'profile', '/matches':'matches', '/sessions':'sessions', '/projects':'projects', '/notifications':'home' };
    const route=paths[command];
    if (route!==undefined) {
      const url=new URL(env.MINIAPP_URL); if(url.protocol!=='https:') return fail(503,'config','HTTPS manzil sozlanmagan');
      if(route)url.searchParams.set('screen',route);
      // All entry routes use the same Web App; route hints are not identity.
      const text=command==='/help'?'UWED Talent Network: profilni to‘ldiring, mos sheriklarni toping va bilim almashish sessiyalarini boshqaring.':command==='/start'?'Assalomu alaykum! UWED Talent Network platformasiga xush kelibsiz.\nBilim almashing, mentorlar bilan bog‘laning, loyiha jamoalarini toping va yutuqlaringizni portfolio orqali ko‘rsating.':'UWED Talent Network ilovasini oching:';
      try { await telegram(env,'sendMessage',{chat_id:chat,text,reply_markup:{inline_keyboard:[[{text:'Ilovani ochish',web_app:{url:url.toString()}}]]}}); }
      catch (e) { await run(env.DB,'DELETE FROM webhook_events WHERE update_id=?',String(update.update_id)); throw e; }
    }
  }
  return json({ok:true});
}

export default {
  async fetch(request, env, ctx) {
    const url=new URL(request.url), path=url.pathname, method=request.method;
    try {
      if (env.DB && (path.startsWith('/api/v1/') || path==='/api/v1/bot/webhook')) {
        try { await ensureMigrations(env.DB); }
        catch { return fail(503,'database','Ma`lumotlar bazasini tayyorlab bo`lmadi'); }
      }
      if (path==='/api/v1/bot/webhook' && method==='POST') {
        const result=await webhook(request,env);
        if (ctx?.waitUntil && env.DB && result.status<500) ctx.waitUntil(flushOutbox(env));
        return result;
      }
      if (path.startsWith('/api/v1/')) {
        if (!['GET','POST','PATCH','DELETE'].includes(method)) return fail(405,'method','Bu amal mavjud emas');
        const route=path.slice(8), isEvidence=/^portfolio\/[^/]+\/evidence$/.test(route)||(route==='verifications'&&method==='POST'&&/^multipart\/form-data(?:;|$)/i.test(request.headers.get('content-type')||''));
        if (!isEvidence && Number(request.headers.get('content-length')||0)>16384) return fail(413,'size','So‘rov juda katta');
        if (method!=='GET' && !isEvidence && request.headers.get('content-type')?.split(';')[0]!=='application/json') return fail(415,'type','JSON yuboring');
        // Same-origin browser writes: no cross-origin CORS and explicit origin check.
        if (method!=='GET' && path!=='/api/v1/bot/webhook') {
          const origin=request.headers.get('origin');
          if (origin && origin!==url.origin) return fail(403,'origin','Ruxsat yo‘q');
        }
        let result;
        if ((isEvidence && route!=='verifications') || /^evidence\/[^/]+$/.test(route) || /^verification-evidence\/[^/]+$/.test(route)) {
          if (!env.DB || !env.SESSION_SECRET) return fail(503,'config','Xizmat sozlanmagan');
          const me=await actor(request,env);
          result=me?(me.suspended_at?fail(403,'suspended','Hisobingiz to`xtatilgan'):await (route.startsWith('verification-evidence/')?verificationEvidence:evidence)(request,env,route,method,me)):fail(401,'auth','Telegram orqali qayta kiring');
        } else result=await api(request,env,route,method);
        if (ctx?.waitUntil && env.DB && result.status<500) ctx.waitUntil(flushOutbox(env));
        return result;
      }
      if (path==='/app.js' && method==='GET') return new Response(client,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
      if (path==='/' && method==='GET') return new Response(page(),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; script-src 'self' https://telegram.org; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors https://web.telegram.org https://*.telegram.org"}});
      return fail(404,'route','Sahifa topilmadi');
    } catch (e) {
      if (e instanceof SyntaxError || e.message==='invalid text' || e.message?.startsWith('Vaqt')) return fail(400,'input','Ma’lumotlarni tekshiring');
      return fail(500,'server','Serverda xatolik yuz berdi');
    }
  }
};
