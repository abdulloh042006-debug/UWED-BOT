import { cleanText, randomId } from './core.js';
import { adminTier, isTopAdmin, protectedTier } from './admin-access.js';
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const fail=(s,c,m)=>json({error:{code:c,message:m}},s);
const one=(db,q,...p)=>db.prepare(q).bind(...p).first();
const all=async(db,q,...p)=>(await db.prepare(q).bind(...p).all()).results||[];
const run=(db,q,...p)=>db.prepare(q).bind(...p).run();
const str=(x,n=500)=>cleanText(x,n);
const url=x=>{try{const u=new URL(x);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error();return u.toString()}catch{throw Error('invalid URL')}};
const staff=u=>['moderator','admin'].includes(u.role);

export async function verificationEvidence(request,env,path,method,me){
  const match=path.match(/^verification-evidence\/([^/]+)$/);
  if(!match)return null;
  if(method!=='GET')return fail(405,'method','Bu amal mavjud emas');
  if(!env.BUCKET)return fail(503,'storage','Fayl xizmati hozircha sozlanmagan');
  const file=await one(env.DB,'SELECT * FROM verification_evidence WHERE request_id=?',match[1]);
  if(!file||(file.owner_id!==me.id&&!staff(me)))return fail(404,'file','Fayl topilmadi');
  const object=await env.BUCKET.get(file.storage_key);
  if(!object)return fail(404,'file','Fayl topilmadi');
  return new Response(object.body,{headers:{
    'content-type':file.content_type,
    'content-disposition':'attachment; filename="'+file.filename.replace(/[^a-zA-Z0-9._-]/g,'_')+'"',
    'cache-control':'private, no-store','x-content-type-options':'nosniff'
  }});
}

export async function evidence(request,env,path,method,me){
  const upload=path.match(/^portfolio\/([^/]+)\/evidence$/),download=path.match(/^evidence\/([^/]+)$/);
  if (!upload && !download) return null;
  if (!env.BUCKET) return fail(503,'storage','Fayl xizmati hozircha sozlanmagan');
  if (upload && method==='POST') {
    const item=await one(env.DB,'SELECT owner_id,status FROM portfolio_items WHERE id=?',upload[1]);
    if (!item || item.owner_id!==me.id) return fail(404,'item','Portfolio topilmadi');
    if (item.status==='verified') return fail(409,'state','Tasdiqlangan dalilni almashtirib bo‘lmaydi');
    const length=Number(request.headers.get('content-length'));
    if (!Number.isSafeInteger(length)||length<1||length>10485760) return fail(413,'size','Fayl 10 MB dan oshmasin');
    const type=request.headers.get('content-type');
    if (!['application/pdf','image/jpeg','image/png'].includes(type)) return fail(415,'type','PDF, JPG yoki PNG yuboring');
    const bytes=new Uint8Array(await request.arrayBuffer());
    if (bytes.length!==length) return fail(400,'size','Fayl hajmi mos emas');
    const pdf=bytes.length>4&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-';
    const png=bytes.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
    const jpeg=bytes.length>3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    if (!(type==='application/pdf'&&pdf||type==='image/png'&&png||type==='image/jpeg'&&jpeg)) return fail(415,'signature','Fayl turi mos emas');
    const id=randomId(),key=`evidence/${me.id}/${id}`,filename=str(request.headers.get('x-file-name')||'dalil',120);
    await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});
    try { await run(env.DB,'INSERT INTO portfolio_evidence(id,item_id,owner_id,storage_key,content_type,size_bytes,filename) VALUES(?,?,?,?,?,?,?)',id,upload[1],me.id,key,type,length,filename); }
    catch(e){await env.BUCKET.delete(key);throw e}
    return json({id},201);
  }
  if (download && method==='GET') {
    const e=await one(env.DB,'SELECT e.*,i.status FROM portfolio_evidence e JOIN portfolio_items i ON i.id=e.item_id WHERE e.id=?',download[1]);
    if (!e || (e.owner_id!==me.id&&!staff(me))) return fail(404,'file','Fayl topilmadi');
    const object=await env.BUCKET.get(e.storage_key);
    if (!object) return fail(404,'file','Fayl topilmadi');
    return new Response(object.body,{headers:{'content-type':e.content_type,'content-disposition':`attachment; filename="${e.filename.replace(/[^a-zA-Z0-9._-]/g,'_')}"`,'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
  }
  return fail(405,'method','Bu amal mavjud emas');
}

export async function teams(request,env,path,method,me){
  const db=env.DB;
  if(path==='projects'&&method==='GET')return json({items:await all(db,"SELECT p.id,p.title,p.description,p.goal,p.status,p.member_limit,p.deadline,p.owner_id,u.display_name AS owner_name,(SELECT count(*) FROM project_members m WHERE m.project_id=p.id) AS members FROM projects p JOIN users u ON u.id=p.owner_id WHERE p.status IN ('recruiting','active','completed') AND p.hidden_at IS NULL AND u.suspended_at IS NULL ORDER BY p.created_at DESC LIMIT 100")});
  if(path==='projects'&&method==='POST'){
    if((await one(db,"SELECT value FROM admin_settings WHERE key='allow_projects'"))?.value!=='true')return fail(409,'setting','Loyihalar vaqtincha yopiq');
    const b=await request.json(), title=str(b.title,100),description=str(b.description,1000),goal=str(b.goal||'',300),limit=b.member_limit,deadline=new Date(b.deadline);
    if(!title||!description||!Number.isInteger(limit)||limit<2||limit>20||!Number.isFinite(deadline.getTime())||deadline.getTime()<Date.now()||!Array.isArray(b.roles)||b.roles.length<1||b.roles.length>10)return fail(400,'input','Loyiha ma’lumotlarini tekshiring');
    const roles=[...new Set(b.roles.map(x=>str(x,60)))];if(roles.some(x=>!x))return fail(400,'input','Rol nomini tekshiring');
    const id=randomId();await db.batch([db.prepare('INSERT INTO projects(id,owner_id,title,description,goal,member_limit,deadline) VALUES(?,?,?,?,?,?,?)').bind(id,me.id,title,description,goal,limit,deadline.toISOString()),db.prepare('INSERT INTO project_members(project_id,user_id) VALUES(?,?)').bind(id,me.id),...roles.map(name=>db.prepare('INSERT INTO project_roles(id,project_id,name) VALUES(?,?,?)').bind(randomId(),id,name))]);return json({id,status:'recruiting'},201);
  }
  const detail=path.match(/^projects\/([^/]+)$/);
  if(detail&&method==='GET'){
    const p=await one(db,'SELECT * FROM projects WHERE id=? AND hidden_at IS NULL',detail[1]);if(!p)return fail(404,'project','Loyiha topilmadi');
    const member=await one(db,'SELECT 1 AS ok FROM project_members WHERE project_id=? AND user_id=?',p.id,me.id);
    return json({item:{...p,roles:await all(db,'SELECT id,name FROM project_roles WHERE project_id=?',p.id),members:member?await all(db,'SELECT u.id,u.display_name,r.name AS role FROM project_members m JOIN users u ON u.id=m.user_id LEFT JOIN project_roles r ON r.id=m.role_id WHERE m.project_id=?',p.id):[],applications:p.owner_id===me.id?await all(db,"SELECT a.id,a.applicant_id,u.display_name,r.name AS role,a.status FROM project_applications a JOIN users u ON u.id=a.applicant_id JOIN project_roles r ON r.id=a.role_id WHERE a.project_id=?",p.id):[]}});
  }
  const apply=path.match(/^projects\/([^/]+)\/applications$/);
  if(apply&&method==='POST'){
    const p=await one(db,'SELECT * FROM projects WHERE id=? AND hidden_at IS NULL',apply[1]);if(!p||p.status!=='recruiting'||Date.parse(p.deadline)<Date.now())return fail(404,'project','Ariza qabuli yopilgan');
    if(p.owner_id===me.id)return fail(400,'self','O‘z loyihangizga ariza yuborolmaysiz');
    const b=await request.json(),role=await one(db,'SELECT id FROM project_roles WHERE id=? AND project_id=?',b.role_id,p.id);if(!role)return fail(404,'role','Rol topilmadi');
    try{await run(db,'INSERT INTO project_applications(id,project_id,applicant_id,role_id) VALUES(?,?,?,?)',randomId(),p.id,me.id,role.id)}catch{return fail(409,'duplicate','Ariza allaqachon yuborilgan')}
    return json({status:'pending'},201);
  }
  const decide=path.match(/^projects\/([^/]+)\/applications\/([^/]+)$/);
  if(decide&&method==='PATCH'){
    const p=await one(db,'SELECT * FROM projects WHERE id=? AND hidden_at IS NULL',decide[1]);if(!p||p.owner_id!==me.id)return fail(404,'project','Loyiha topilmadi');
    const a=await one(db,"SELECT * FROM project_applications WHERE id=? AND project_id=? AND status='pending'",decide[2],p.id);if(!a)return fail(404,'application','Ariza topilmadi');
    const b=await request.json();if(!['approve','reject'].includes(b.decision))return fail(400,'input','Qarorni tekshiring');
    if(b.decision==='approve'){
      const result=await db.batch([db.prepare("INSERT INTO project_members(project_id,user_id,role_id) SELECT ?,?,? WHERE (SELECT count(*) FROM project_members WHERE project_id=?)<(SELECT member_limit FROM projects WHERE id=? AND status='recruiting') AND EXISTS(SELECT 1 FROM project_applications WHERE id=? AND status='pending')").bind(p.id,a.applicant_id,a.role_id,p.id,p.id,a.id),db.prepare("UPDATE project_applications SET status='approved' WHERE id=? AND status='pending' AND EXISTS(SELECT 1 FROM project_members WHERE project_id=? AND user_id=?)").bind(a.id,p.id,a.applicant_id)]);
      if(!result[0].meta?.changes)return fail(409,'limit','Jamoa to‘lgan yoki ariza o‘zgargan');
    }else await run(db,"UPDATE project_applications SET status='rejected' WHERE id=? AND status='pending'",a.id);
    return json({ok:true});
  }
  const deliver=path.match(/^projects\/([^/]+)\/deliverables$/);
  if(deliver&&method==='POST'){
    const p=await one(db,'SELECT * FROM projects WHERE id=? AND hidden_at IS NULL',deliver[1]),member=await one(db,'SELECT 1 AS ok FROM project_members WHERE project_id=? AND user_id=?',deliver[1],me.id);
    if(!p||!member||!['recruiting','active'].includes(p.status))return fail(404,'project','Loyiha topilmadi');
    const b=await request.json(),title=str(b.title,100),contribution=str(b.contribution,1000),link=url(b.url);if(!title||!contribution)return fail(400,'input','Natijani tekshiring');
    const id=randomId();await run(db,'INSERT INTO project_deliverables(id,project_id,author_id,title,url,contribution) VALUES(?,?,?,?,?,?)',id,p.id,me.id,title,link,contribution);return json({id},201);
  }
  const finish=path.match(/^projects\/([^/]+)\/complete$/);
  if(finish&&method==='POST'){
    const p=await one(db,'SELECT * FROM projects WHERE id=? AND hidden_at IS NULL',finish[1]);if(!p||p.owner_id!==me.id)return fail(404,'project','Loyiha topilmadi');
    const count=await one(db,'SELECT count(*) AS n FROM project_deliverables WHERE project_id=?',p.id);if(!count.n)return fail(409,'evidence','Avval loyiha natijasini kiriting');
    await run(db,"UPDATE projects SET status='completed' WHERE id=? AND status IN ('recruiting','active')",p.id);return json({status:'completed'});
  }
  if(path==='portfolio'&&method==='GET')return json({items:await all(db,'SELECT id,title,kind,description,source_url,visibility,status,project_id FROM portfolio_items WHERE owner_id=? ORDER BY created_at DESC',me.id)});
  if(path==='portfolio'&&method==='POST'){
    const b=await request.json(),kind=b.kind,title=str(b.title,120),description=str(b.description||'',1000);
    if(!['certificate','research','mun','ielts','project','other'].includes(kind)||!['public','members','private'].includes(b.visibility)||!title)return fail(400,'input','Portfolio ma’lumotlarini tekshiring');
    let projectId=null;
    if(kind==='project'){
      const p=await one(db,"SELECT p.id FROM projects p JOIN project_members m ON m.project_id=p.id WHERE p.id=? AND p.status='completed' AND p.hidden_at IS NULL AND m.user_id=?",b.project_id,me.id);
      const contribution=await one(db,'SELECT id FROM project_deliverables WHERE project_id=? AND author_id=?',b.project_id,me.id);
      if(!p||!contribution)return fail(403,'contribution','Tasdiqlangan loyiha hissasi kerak');projectId=p.id;
    }
    const id=randomId();await run(db,'INSERT INTO portfolio_items(id,owner_id,project_id,kind,title,description,source_url,visibility) VALUES(?,?,?,?,?,?,?,?)',id,me.id,projectId,kind,title,description,b.source_url?url(b.source_url):null,b.visibility);return json({id,status:'pending'},201);
  }
  const item=path.match(/^portfolio\/([^/]+)$/);
  if(item&&method==='GET'){
    const p=await one(db,'SELECT * FROM portfolio_items WHERE id=?',item[1]);if(!p||p.hidden_at&&p.owner_id!==me.id&&!staff(me)||p.owner_id!==me.id&&!staff(me)&&!(p.status==='verified'&&p.visibility==='public'))return fail(404,'item','Portfolio topilmadi');
    const evidence=p.owner_id===me.id||staff(me)?await all(db,'SELECT id,filename,content_type,size_bytes FROM portfolio_evidence WHERE item_id=?',p.id):[];
    return json({item:{...p,evidence}});
  }
  const verify=path.match(/^admin\/portfolio\/([^/]+)$/);
  if(path==='admin/portfolio'&&method==='GET'){
    if(!staff(me))return fail(403,'role','Ruxsat yo‘q');
    return json({items:await all(db,"SELECT i.id,i.title,i.kind,i.source_url,u.display_name FROM portfolio_items i JOIN users u ON u.id=i.owner_id WHERE i.status='pending' ORDER BY i.created_at LIMIT 100")});
  }
  if(verify&&method==='PATCH'){
    if(!staff(me))return fail(403,'role','Ruxsat yo‘q');
    const p=await one(db,"SELECT * FROM portfolio_items WHERE id=? AND status='pending'",verify[1]);if(!p||p.owner_id===me.id)return fail(404,'item','Portfolio topilmadi');
    const b=await request.json();if(!['approve','reject'].includes(b.decision))return fail(400,'input','Qarorni tekshiring');
    const ev=await one(db,'SELECT id FROM portfolio_evidence WHERE item_id=?',p.id);if(b.decision==='approve'&&!p.source_url&&!ev)return fail(409,'evidence','Dalil yoki manba havolasi kerak');
    await db.batch([db.prepare('UPDATE portfolio_items SET status=?,verified_by=?,verified_at=CURRENT_TIMESTAMP WHERE id=? AND status=?').bind(b.decision==='approve'?'verified':'rejected',me.id,p.id,'pending'),db.prepare('INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)').bind(randomId(),me.id,b.decision,'portfolio',p.id)]);return json({ok:true});
  }
  if(path==='reviews'&&method==='POST'){
    const b=await request.json(),s=await one(db,'SELECT t.status,r.sender_id,r.recipient_id FROM sessions t JOIN exchange_requests r ON r.id=t.request_id WHERE t.id=?',b.session_id);
    if(!s||s.status!=='completed'||![s.sender_id,s.recipient_id].includes(me.id))return fail(403,'session','Yakunlangan sessiya kerak');
    const subject=s.sender_id===me.id?s.recipient_id:s.sender_id,stars=b.stars,comment=str(b.comment||'',500);
    if(!Number.isInteger(stars)||stars<1||stars>5)return fail(400,'stars','Bahoni tekshiring');
    try{await run(db,'INSERT INTO reviews(id,session_id,reviewer_id,subject_id,stars,comment) VALUES(?,?,?,?,?,?)',randomId(),b.session_id,me.id,subject,stars,comment)}catch{return fail(409,'duplicate','Siz allaqachon baholagansiz')}
    return json({ok:true},201);
  }
  if(path==='reports'&&method==='POST'){
    const b=await request.json(),reason=str(b.reason,500);if(!['user','project','portfolio','review'].includes(b.object_type)||!reason||typeof b.object_id!=='string'||b.object_id.length>100)return fail(400,'input','Shikoyatni tekshiring');
    const table={user:'users',project:'projects',portfolio:'portfolio_items',review:'reviews'}[b.object_type];if(!await one(db,`SELECT id FROM ${table} WHERE id=?`,b.object_id))return fail(404,'target','Obyekt topilmadi');
    await run(db,'INSERT INTO reports(id,reporter_id,object_type,object_id,reason) VALUES(?,?,?,?,?)',randomId(),me.id,b.object_type,b.object_id,reason);return json({ok:true},201);
  }
  if(path==='admin/reports'&&method==='GET'){
    if(!staff(me))return fail(403,'role','Ruxsat yo‘q');return json({items:await all(db,"SELECT id,object_type,object_id,reason,status FROM reports WHERE status='pending' ORDER BY created_at LIMIT 100")});
  }
  const report=path.match(/^admin\/reports\/([^/]+)$/);
  if(report&&method==='PATCH'){
    if(!staff(me))return fail(403,'role','Ruxsat yo‘q');const b=await request.json();if(!['resolved','dismissed'].includes(b.decision))return fail(400,'input','Qarorni tekshiring');
    const changed=await run(db,"UPDATE reports SET status=?,reviewed_by=? WHERE id=? AND status='pending'",b.decision,me.id,report[1]);if(!changed.meta?.changes)return fail(404,'report','Shikoyat topilmadi');
    await run(db,'INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)',randomId(),me.id,b.decision,'report',report[1]);return json({ok:true});
  }
  if(path==='admin/roles'&&method==='POST'){
    if(!isTopAdmin(adminTier(me,env)))return fail(403,'role','Faqat bosh admin rol tayinlaydi');const b=await request.json();if(!['student','mentor','moderator','admin'].includes(b.role)||b.user_id===me.id)return fail(400,'input','Rolni tekshiring');
    const target=await one(db,'SELECT telegram_user_id FROM users WHERE id=?',b.user_id);if(target&&protectedTier(target.telegram_user_id,env))return fail(403,'protected','Bosh admin hisobini o‘zgartirib bo‘lmaydi');
    const changed=await run(db,'UPDATE users SET role=? WHERE id=?',b.role,b.user_id);if(!changed.meta?.changes)return fail(404,'user','Foydalanuvchi topilmadi');
    await run(db,'INSERT INTO audit_log(id,actor_id,action,object_type,object_id) VALUES(?,?,?,?,?)',randomId(),me.id,'role:'+b.role,'user',b.user_id);return json({ok:true});
  }
  if(path==='admin/users'&&method==='GET'){
    if(me.role!=='admin')return fail(403,'role','Ruxsat yo‘q');
    return json({items:await all(db,'SELECT id,display_name,role,verified_university FROM users ORDER BY created_at DESC LIMIT 100')});
  }
  return null;
}
