import { cleanText, randomId } from './core.js';
import { adminTier, protectedTier, isTopAdmin, visibleAdminLabel } from './admin-access.js';

const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const fail=(s,c,m)=>json({error:{code:c,message:m}},s);
const one=(db,q,...p)=>db.prepare(q).bind(...p).first();
const all=async(db,q,...p)=>(await db.prepare(q).bind(...p).all()).results||[];
const run=(db,q,...p)=>db.prepare(q).bind(...p).run();
const staff=u=>['admin','moderator'].includes(u.role);
const enums={role:['student','mentor','moderator','admin'],userStatus:['active','suspended'],verificationType:['mentor','certificate','portfolio','university'],verificationStatus:['pending','approved','rejected'],reportStatus:['pending','resolved','dismissed'],projectStatus:['idea','recruiting','active','completed','cancelled','hidden'],audience:['all','students','mentors']};
const keys={maintenance_mode:'admin',allow_projects:'admin',allow_skill_exchange:'admin',announcement_enabled:'admin'};
function paging(url){const p=url.searchParams, page=Number(p.get('page')||1),limit=Number(p.get('limit')||20);if(!Number.isSafeInteger(page)||page<1||page>100000||!Number.isSafeInteger(limit)||limit<1||limit>100)throw Error('pagination');return {page,limit,offset:(page-1)*limit}}
function choice(value,allowed){if(value!==null&&!allowed.includes(value))throw Error('filter');return value}
function listed(items,total,p){return json({items,page:p.page,limit:p.limit,total,has_more:p.offset+items.length<total})}
async function audit(db,me,action,type,id,details={}){await run(db,'INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)',randomId(),me.id,action,type,id,JSON.stringify(details))}
async function body(request){const b=await request.json();if(!b||typeof b!=='object'||Array.isArray(b))throw Error('body');return b}
function reason(b){const x=cleanText(b.reason,500);if(!x)throw Error('reason');return x}
function count(db,sql,...p){return one(db,sql,...p).n}
async function verification(db,id){
  const type=id.startsWith('portfolio:')?'portfolio':id.startsWith('certificate:')?'certificate':null;
  if(type){const p=await one(db,'SELECT * FROM portfolio_items WHERE id=?',id.slice(type.length+1));return p&&{...p,type,user_id:p.owner_id,raw_id:p.id};}
  const v=await one(db,'SELECT * FROM verification_requests WHERE id=?',id.startsWith('mentor:')?id.slice(7):id);
  return v&&{...v,type:v.kind,raw_id:v.id};
}
export async function admin(request,env,path,method,me){
  if(!path.startsWith('admin/'))return null;
  const db=env.DB,route=path.slice(6),url=new URL(request.url);
  if(!staff(me))return fail(403,'role','Ruxsat yo`q');
  const tier=adminTier(me,env);
  try{
    if(route==='dashboard/summary'&&method==='GET'){
      const summary={students:await count(db,"SELECT count(*) n FROM users WHERE role='student'"),active_users:await count(db,'SELECT count(*) n FROM users WHERE suspended_at IS NULL'),active_mentors:await count(db,"SELECT count(*) n FROM users WHERE role='mentor' AND suspended_at IS NULL"),skill_exchanges:await count(db,'SELECT count(*) n FROM exchange_requests'),active_projects:await count(db,"SELECT count(*) n FROM projects WHERE status IN ('recruiting','active') AND hidden_at IS NULL"),pending_verifications:await count(db,"SELECT (SELECT count(*) FROM verification_requests WHERE status='pending')+(SELECT count(*) FROM portfolio_items WHERE status='pending') n"),reports:await count(db,"SELECT count(*) n FROM reports WHERE status='pending'")};
      return json({summary,recent_actions:await all(db,'SELECT a.id,a.action,a.object_type,a.object_id,a.created_at,u.display_name AS actor_name FROM audit_log a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC,a.id DESC LIMIT 8')});
    }
    if(route==='users'&&method==='GET'){
      const p=paging(url),q=(url.searchParams.get('q')||'').trim();if(q.length>100)throw Error('filter');
      const role=choice(url.searchParams.get('role'),enums.role),status=choice(url.searchParams.get('status'),enums.userStatus);
      // Hide the full administrator from administrative user listings.
      let where=' WHERE u.telegram_user_id<>?',args=[String(env.FULL_ADMIN_TELEGRAM_ID || '')];if(q){where+=' AND (u.display_name LIKE ? OR u.telegram_user_id LIKE ?)';args.push('%'+q.replace(/[%_\\]/g,'\\$&')+'%','%'+q.replace(/[%_\\]/g,'\\$&')+'%')}
      if(role){where+=' AND u.role=?';args.push(role)}if(status){where+=status==='active'?' AND u.suspended_at IS NULL':' AND u.suspended_at IS NOT NULL'}
      const total=await count(db,'SELECT count(*) n FROM users u'+where,...args);
      const users=await all(db,'SELECT u.id,u.telegram_user_id,u.display_name,u.role,u.verified_university,u.suspended_at,u.created_at,p.faculty FROM users u JOIN profiles p ON p.user_id=u.id'+where+' ORDER BY u.created_at DESC,u.id DESC LIMIT ? OFFSET ?',...args,p.limit,p.offset);
      return listed(users.map(({telegram_user_id,...u})=>({...u,admin_label:visibleAdminLabel(adminTier({...u,telegram_user_id},env))})),total,p);
    }
    const user=route.match(/^users\/([^/]+)$/);
    if(user&&method==='GET'){
      const u=await one(db,'SELECT u.id,u.telegram_user_id,u.display_name,u.role,u.verified_university,u.suspended_at,u.suspended_reason,u.created_at,p.faculty,p.bio FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?',user[1]);if(!u || protectedTier(u.telegram_user_id,env)==='owner')return fail(404,'user','Foydalanuvchi topilmadi');
      const activity={sessions:await count(db,'SELECT count(*) n FROM exchange_requests WHERE sender_id=? OR recipient_id=?',u.id,u.id),projects:await count(db,'SELECT count(*) n FROM project_members WHERE user_id=?',u.id),portfolio:await count(db,'SELECT count(*) n FROM portfolio_items WHERE owner_id=?',u.id),reports:await count(db,'SELECT count(*) n FROM reports WHERE reporter_id=?',u.id)};
      const {telegram_user_id,...publicUser}=u;
      return json({item:{...publicUser,admin_label:visibleAdminLabel(adminTier(u,env))},activity});
    }
    const userAction=route.match(/^users\/([^/]+)\/(suspend|restore|role)$/);
    if(userAction&&method==='POST'){
      if(me.role!=='admin')return fail(403,'role','Faqat admin uchun');
      const [,id,action]=userAction,u=await one(db,'SELECT id,role,telegram_user_id,suspended_at FROM users WHERE id=?',id);if(!u)return fail(404,'user','Foydalanuvchi topilmadi');
      if(id===me.id)return fail(409,'self','O`zingizning hisobingizni o`zgartira olmaysiz');
      if(protectedTier(u.telegram_user_id,env))return fail(403,'protected','Bosh administrator hisobini bu yerdan o‘zgartirib bo‘lmaydi');
      if(u.role==='admin'&&!isTopAdmin(tier))return fail(403,'admin','Administrator hisobini faqat bosh admin boshqaradi');
      if(action==='role'){
        if(!isTopAdmin(tier))return fail(403,'role','Administratorlarni faqat bosh admin tayinlaydi');
        const b=await body(request);if(!enums.role.includes(b.role))throw Error('role');
        if(u.role===b.role)return json({ok:true,role:u.role});
        await db.batch([db.prepare('UPDATE users SET role=? WHERE id=?').bind(b.role,id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)').bind(randomId(),me.id,'role','user',id,JSON.stringify({from:u.role,to:b.role}))]);
        return json({ok:true,role:b.role});
      }
      if(action==='suspend'){
        const b=await body(request),why=reason(b);if(u.suspended_at)return fail(409,'state','Hisob allaqachon to`xtatilgan');
        await db.batch([db.prepare('UPDATE users SET suspended_at=CURRENT_TIMESTAMP,suspended_reason=? WHERE id=? AND suspended_at IS NULL').bind(why,id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)').bind(randomId(),me.id,'suspend','user',id,JSON.stringify({reason:why}))]);
      }else{
        if(!u.suspended_at)return fail(409,'state','Hisob faol');
        await db.batch([db.prepare('UPDATE users SET suspended_at=NULL,suspended_reason=NULL WHERE id=? AND suspended_at IS NOT NULL').bind(id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)').bind(randomId(),me.id,'restore','user',id)]);
      }return json({ok:true,status:action==='suspend'?'suspended':'active'});
    }
    if(route==='verifications'&&method==='GET'){
      const p=paging(url),type=choice(url.searchParams.get('type'),enums.verificationType),status=choice(url.searchParams.get('status'),enums.verificationStatus)||'pending';
      const union="SELECT v.id,v.kind AS type,v.kind,v.status,v.evidence_url,v.reason,v.created_at,v.user_id,u.display_name,NULL AS title FROM verification_requests v JOIN users u ON u.id=v.user_id WHERE v.status=? AND (? IS NULL OR v.kind=?) UNION ALL SELECT (CASE WHEN p.kind IN ('certificate','ielts') THEN 'certificate:' ELSE 'portfolio:' END)||p.id AS id,CASE WHEN p.kind IN ('certificate','ielts') THEN 'certificate' ELSE 'portfolio' END AS type,p.kind,p.status,p.source_url AS evidence_url,p.rejection_reason AS reason,p.created_at,p.owner_id AS user_id,u.display_name,p.title FROM portfolio_items p JOIN users u ON u.id=p.owner_id WHERE p.status=? AND (? IS NULL OR CASE WHEN p.kind IN ('certificate','ielts') THEN 'certificate' ELSE 'portfolio' END=?)";
      const args=[status,type,type,status==='approved'?'verified':status,type,type];
      const total=await count(db,'SELECT count(*) n FROM ('+union+')',...args);
      const items=await all(db,'SELECT * FROM ('+union+') ORDER BY created_at,id LIMIT ? OFFSET ?',...args,p.limit,p.offset);
      return listed(items,total,p);
    }
    const decision=route.match(/^verifications\/([^/]+)\/(approve|reject)$/);
    if(decision&&method==='POST'){
      const [,id,action]=decision,v=await verification(db,decodeURIComponent(id));if(!v)return fail(404,'verification','Ariza topilmadi');
      if(v.status!=='pending')return fail(409,'state','Ariza allaqachon ko`rilgan');
      if(v.user_id===me.id)return fail(403,'self','O`zingizni tasdiqlay olmaysiz');
      const b=await body(request),why=action==='reject'?reason(b):null;
      if(['portfolio','certificate'].includes(v.type)){
        const ev=await one(db,'SELECT id FROM portfolio_evidence WHERE item_id=?',v.raw_id);
        if(action==='approve'&&!v.source_url&&!ev)return fail(409,'evidence','Dalil yoki manba havolasi kerak');
        await db.batch([db.prepare("UPDATE portfolio_items SET status=?,verified_by=?,verified_at=CURRENT_TIMESTAMP,rejection_reason=? WHERE id=? AND status='pending'").bind(action==='approve'?'verified':'rejected',me.id,why,v.raw_id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)').bind(randomId(),me.id,action,'portfolio',v.raw_id,JSON.stringify({reason:why}))]);
      }else{
        const statements=[db.prepare("UPDATE verification_requests SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,reason=? WHERE id=? AND status='pending'").bind(action==='approve'?'approved':'rejected',me.id,why,v.raw_id)];
        if(action==='approve'&&v.type==='mentor')statements.push(db.prepare("UPDATE users SET role='mentor' WHERE id=? AND role='student'").bind(v.user_id));
        if(action==='approve'&&v.type==='university')statements.push(db.prepare('UPDATE users SET verified_university=1 WHERE id=?').bind(v.user_id));
        statements.push(db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)').bind(randomId(),me.id,action,'verification',v.raw_id,JSON.stringify({reason:why})));
        await db.batch(statements);
      }return json({ok:true,status:action==='approve'?'approved':'rejected'});
    }
    if(route==='reports'&&method==='GET'){
      const p=paging(url),status=choice(url.searchParams.get('status'),enums.reportStatus)||'pending',total=await count(db,'SELECT count(*) n FROM reports WHERE status=?',status);
      return listed(await all(db,'SELECT r.*,u.display_name AS reporter_name FROM reports r JOIN users u ON u.id=r.reporter_id WHERE r.status=? ORDER BY r.created_at DESC,r.id DESC LIMIT ? OFFSET ?',status,p.limit,p.offset),total,p);
    }
    const report=route.match(/^reports\/([^/]+)\/(resolve|dismiss|remove-content)$/);
    if(report&&method==='POST'){
      const [,id,action]=report,r=await one(db,'SELECT * FROM reports WHERE id=?',id);if(!r)return fail(404,'report','Shikoyat topilmadi');
      if(action==='remove-content'){
        if(!['project','portfolio','review'].includes(r.object_type))return fail(400,'target','Kontentni olib tashlash mumkin emas');
        const map={project:['projects','hidden_at'],portfolio:['portfolio_items','hidden_at'],review:['reviews','hidden_at']},[table,column]=map[r.object_type],target=await one(db,`SELECT id,${column} FROM ${table} WHERE id=?`,r.object_id);
        if(!target)return fail(404,'target','Kontent topilmadi');
        if(r.resolution==='remove-content')return json({ok:true,already_removed:true});
        if(r.status!=='pending')return fail(409,'state','Shikoyat allaqachon ko`rilgan');
        const statements=[];
        if(!target[column])statements.push(db.prepare(`UPDATE ${table} SET ${column}=CURRENT_TIMESTAMP WHERE id=? AND ${column} IS NULL`).bind(r.object_id));
        statements.push(db.prepare("UPDATE reports SET status='resolved',resolution='remove-content',reviewed_by=? WHERE id=? AND status='pending'").bind(me.id,id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)').bind(randomId(),me.id,'remove-content',r.object_type,r.object_id,JSON.stringify({report_id:id,already_hidden:!!target[column]})));
        await db.batch(statements);return json({ok:true,removed:!target[column]});
      }
      if(r.status!=='pending')return fail(409,'state','Shikoyat allaqachon ko`rilgan');
      await db.batch([db.prepare("UPDATE reports SET status=?,resolution=?,reviewed_by=? WHERE id=? AND status='pending'").bind(action==='resolve'?'resolved':'dismissed',action,me.id,id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)').bind(randomId(),me.id,action,'report',id)]);
      return json({ok:true,status:action==='resolve'?'resolved':'dismissed'});
    }
    if(route==='projects'&&method==='GET'){
      const p=paging(url),status=choice(url.searchParams.get('status'),enums.projectStatus),reported=choice(url.searchParams.get('reported'),['true','false']);
      let where=' WHERE 1=1',args=[];if(status){where+=status==='hidden'?' AND p.hidden_at IS NOT NULL':' AND p.status=? AND p.hidden_at IS NULL';if(status!=='hidden')args.push(status)}
      if(reported){where+=reported==='true'?' AND EXISTS(SELECT 1 FROM reports r WHERE r.object_type=\'project\' AND r.object_id=p.id)':' AND NOT EXISTS(SELECT 1 FROM reports r WHERE r.object_type=\'project\' AND r.object_id=p.id)'}
      const total=await count(db,'SELECT count(*) n FROM projects p'+where,...args);
      return listed(await all(db,'SELECT p.id,p.title,p.status,p.hidden_at,p.deadline,p.created_at,p.owner_id,u.display_name AS owner_name,(SELECT count(*) FROM project_members m WHERE m.project_id=p.id) AS members,(SELECT count(*) FROM project_applications a WHERE a.project_id=p.id) AS applications,(SELECT count(*) FROM reports r WHERE r.object_type=\'project\' AND r.object_id=p.id) AS reports FROM projects p JOIN users u ON u.id=p.owner_id'+where+' ORDER BY p.created_at DESC,p.id DESC LIMIT ? OFFSET ?',...args,p.limit,p.offset),total,p);
    }
    const project=route.match(/^projects\/([^/]+)\/hide$/);
    if(project&&method==='POST'){
      const p=await one(db,'SELECT id,hidden_at FROM projects WHERE id=?',project[1]);if(!p)return fail(404,'project','Loyiha topilmadi');if(p.hidden_at)return json({ok:true,already_hidden:true});
      await db.batch([db.prepare('UPDATE projects SET hidden_at=CURRENT_TIMESTAMP,hidden_by=? WHERE id=? AND hidden_at IS NULL').bind(me.id,p.id),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)').bind(randomId(),me.id,'hide','project',p.id)]);return json({ok:true});
    }
    if(route==='announcements'&&method==='POST'){
      if(!isTopAdmin(tier))return fail(403,'role','E’lonlar bosh administratorlar uchun');
      const b=await body(request),audience=choice(b.audience,enums.audience),text=cleanText(b.text,1000);if(!audience||!text)throw Error('announcement');
      const setting=await one(db,"SELECT value FROM admin_settings WHERE key='announcement_enabled'");if(setting?.value!=='true')return fail(409,'setting','E`lonlar o`chirilgan');
      const id=randomId();await run(db,'INSERT INTO announcements(id,audience,text,created_by) VALUES(?,?,?,?)',id,audience,text,me.id);
      const users=await all(db,"SELECT u.id FROM users u WHERE u.suspended_at IS NULL AND (?='all' OR (?='students' AND u.role='student') OR (?='mentors' AND u.role='mentor'))",audience,audience,audience);
      for(const u of users){const nid=randomId();await db.batch([db.prepare('INSERT INTO notifications(id,user_id,kind,body,target,announcement_id) VALUES(?,?,?,?,?,?)').bind(nid,u.id,'announcement',text,'home',id),db.prepare('INSERT INTO bot_outbox(id,notification_id) VALUES(?,?)').bind(randomId(),nid)])}
      await audit(db,me,'announce','announcement',id,{audience,recipients:users.length});return json({id,queued:users.length},201);
    }
    const delivery=route.match(/^announcements\/([^/]+)\/delivery$/);
    if(delivery&&method==='GET'){
      const a=await one(db,'SELECT id,audience,text,created_at FROM announcements WHERE id=?',delivery[1]);if(!a)return fail(404,'announcement','E`lon topilmadi');
      const rows=await all(db,'SELECT o.status,o.last_error FROM bot_outbox o JOIN notifications n ON n.id=o.notification_id WHERE n.announcement_id=?',a.id);
      return json({announcement:a,queued:rows.filter(x=>!x.last_error&&['pending','sending'].includes(x.status)).length,sent:rows.filter(x=>x.status==='sent').length,delivered:0,failed:rows.filter(x=>x.last_error&&x.status!=='sent').length,delivery_note:'Telegram individual delivery receipts bermaydi; sent API qabul qilgan xabarlar.'});
    }
    if(route==='settings'&&method==='GET')return json({items:await all(db,'SELECT key,value,updated_at FROM admin_settings ORDER BY key')});
    const setting=route.match(/^settings\/([^/]+)$/);
    if(setting&&method==='PATCH'){
      const key=setting[1];if(!keys[key])return fail(404,'setting','Sozlama topilmadi');if(!isTopAdmin(tier))return fail(403,'role','Sozlamalar bosh administratorlar uchun');
      const b=await body(request);if(typeof b.value!=='boolean')throw Error('setting');const value=String(b.value),old=await one(db,'SELECT value FROM admin_settings WHERE key=?',key);
      await db.batch([db.prepare('UPDATE admin_settings SET value=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE key=?').bind(value,me.id,key),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id,details) VALUES(?,?,?,?,?,?)').bind(randomId(),me.id,'setting','setting',key,JSON.stringify({from:old.value,to:value}))]);return json({key,value});
    }
    if(route==='audit-log'&&method==='GET'){
      const p=paging(url),cursor=url.searchParams.get('cursor');let anchor=null;
      if(cursor){if(!/^[a-f0-9-]{36}$/i.test(cursor))throw Error('cursor');anchor=await one(db,'SELECT created_at,id FROM audit_log WHERE id=?',cursor);if(!anchor)throw Error('cursor')}
      const where=anchor?' WHERE a.created_at<? OR (a.created_at=? AND a.id<?)':'',args=anchor?[anchor.created_at,anchor.created_at,anchor.id]:[];
      const items=await all(db,'SELECT a.*,u.display_name AS actor_name FROM audit_log a LEFT JOIN users u ON u.id=a.actor_id'+where+' ORDER BY a.created_at DESC,a.id DESC LIMIT ?',...args,p.limit+1);
      const has_more=items.length>p.limit;items.length=Math.min(items.length,p.limit);return json({items,next_cursor:has_more?items.at(-1).id:null,has_more});
    }
    return null;
  }catch(e){if(['pagination','filter','body','reason','role','announcement','setting','cursor'].includes(e.message)||e.message==='invalid text')return fail(400,'input','Ma`lumotlarni tekshiring');throw e}
}
