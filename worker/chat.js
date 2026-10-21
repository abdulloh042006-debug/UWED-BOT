import { randomId } from './core.js';
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const fail=(status,code,message)=>json({error:{code,message}},status);
const one=(db,q,...args)=>db.prepare(q).bind(...args).first();
const all=async(db,q,...args)=>(await db.prepare(q).bind(...args).all()).results||[];
const count=(db,q,...args)=>one(db,q,...args).n;
const pairWhere='((sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?))';
async function peerFor(db,me,env,id){
  const p=await one(db,'SELECT u.id,u.display_name,u.suspended_at,p.faculty,p.privacy FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?',id);
  if(!p||p.suspended_at||p.id===me.id)return null;
  if(env.FULL_ADMIN_TELEGRAM_ID){
    const owner=await one(db,'SELECT 1 AS yes FROM users WHERE id=? AND telegram_user_id=?',p.id,String(env.FULL_ADMIN_TELEGRAM_ID));
    if(owner)return null;
  }
  const existed=count(db,'SELECT count(*) AS n FROM direct_messages WHERE '+pairWhere,me.id,p.id,p.id,me.id)>0;
  if(p.privacy!=='public'&&!existed)return null;
  const block=await one(db,'SELECT blocker_id FROM direct_message_blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?) LIMIT 1',me.id,p.id,p.id,me.id);
  return {...p,existed,blocked_by_me:block?.blocker_id===me.id,blocked_by_them:block?.blocker_id===p.id};
}
export async function chats(request,env,path,method,me){
  if(!path.startsWith('chat/'))return null;
  const db=env.DB;
  if(path==='chat/people'&&method==='GET'){
    const q=(new URL(request.url)).searchParams.get('q')?.trim()||'';
    if(q.length>80)return fail(400,'input','Qidiruv juda uzun');
    const like='%'+q.replace(/[%_\\]/g,'\\$&')+'%';
    const sql="SELECT u.id,u.display_name,p.faculty FROM users u JOIN profiles p ON p.user_id=u.id "+
      "WHERE u.id<>? AND u.suspended_at IS NULL AND p.privacy='public' "+
      "AND u.telegram_user_id<>? AND (u.display_name LIKE ? ESCAPE '\\' OR p.faculty LIKE ? ESCAPE '\\') "+
      "AND NOT EXISTS(SELECT 1 FROM direct_message_blocks b "+
      "WHERE (b.blocker_id=? AND b.blocked_id=u.id) OR (b.blocker_id=u.id AND b.blocked_id=?)) "+
      "ORDER BY u.display_name,u.id LIMIT 25";
    const items=await all(db,sql,me.id,String(env.FULL_ADMIN_TELEGRAM_ID||''),like,like,me.id,me.id);
    return json({items});
  }
  if(path==='chat/conversations'&&method==='GET'){
    const sql="SELECT u.id,u.display_name,p.faculty,latest.seq AS last_seq, "+
      "(SELECT body FROM direct_messages WHERE seq=latest.seq) AS last_message, "+
      "(SELECT created_at FROM direct_messages WHERE seq=latest.seq) AS last_at, "+
      "(SELECT count(*) FROM direct_messages dm WHERE dm.sender_id=u.id AND dm.recipient_id=? AND dm.read_at IS NULL) AS unread "+
      "FROM (SELECT CASE WHEN sender_id=? THEN recipient_id ELSE sender_id END AS peer_id,MAX(seq) AS seq "+
      "FROM direct_messages WHERE sender_id=? OR recipient_id=? GROUP BY peer_id) latest "+
      "JOIN users u ON u.id=latest.peer_id JOIN profiles p ON p.user_id=u.id "+
      "WHERE u.suspended_at IS NULL AND u.telegram_user_id<>? ORDER BY latest.seq DESC LIMIT 60";
    const items=await all(db,sql,me.id,me.id,me.id,me.id,String(env.FULL_ADMIN_TELEGRAM_ID||''));
    return json({items});
  }
  const block=path.match(/^chat\/([^/]+)\/block$/);
  if(block&&['POST','DELETE'].includes(method)){
    const other=await one(db,'SELECT id,suspended_at,telegram_user_id FROM users WHERE id=?',block[1]);
    if(!other||other.id===me.id||other.suspended_at||other.telegram_user_id===String(env.FULL_ADMIN_TELEGRAM_ID||''))return fail(404,'chat','Foydalanuvchi topilmadi');
    if(method==='POST')await db.prepare('INSERT OR IGNORE INTO direct_message_blocks(blocker_id,blocked_id) VALUES(?,?)').bind(me.id,other.id).run();
    else await db.prepare('DELETE FROM direct_message_blocks WHERE blocker_id=? AND blocked_id=?').bind(me.id,other.id).run();
    return json({blocked:method==='POST'});
  }
  const conversation=path.match(/^chat\/([^/]+)$/);
  if(!conversation||!['GET','POST'].includes(method))return fail(404,'route','Chat topilmadi');
  const p=await peerFor(db,me,env,conversation[1]);
  if(!p)return fail(404,'chat','Foydalanuvchi topilmadi yoki profili yopiq');
  if(method==='GET'){
    const b=new URL(request.url).searchParams.get('before');
    const before=b===null?0:Number(b);
    if(b!==null&&(!Number.isSafeInteger(before)||before<=0))return fail(400,'cursor','Xabar kursori noto‘g‘ri');
    const result=await all(db,'SELECT seq,id,sender_id,recipient_id,body,read_at,created_at FROM direct_messages WHERE '+pairWhere+' AND (?=0 OR seq<?) ORDER BY seq DESC LIMIT 41',me.id,p.id,p.id,me.id,before,before);
    const has_more=result.length>40,items=result.slice(0,40).reverse();
    await db.prepare('UPDATE direct_messages SET read_at=CURRENT_TIMESTAMP WHERE sender_id=? AND recipient_id=? AND read_at IS NULL').bind(p.id,me.id).run();
    return json({peer:{id:p.id,display_name:p.display_name,faculty:p.faculty},blocked_by_me:p.blocked_by_me,blocked_by_them:p.blocked_by_them,items,next_before:has_more?items[0]?.seq:null});
  }
  if(p.blocked_by_me||p.blocked_by_them)return fail(403,'blocked','Bu suhbatda xabar yuborib bo‘lmaydi');
  const data=await request.json();
  const input=data?.body;
  if(typeof input!=='string')return fail(400,'body','Xabar matni kerak');
  const body=input.replace(/\r\n?/g,'\n').trim();
  if(!body||body.length>1500||/[\u0000-\u0009\u000B-\u001F\u007F]/.test(body))return fail(400,'body','Xabar 1–1500 belgidan iborat bo‘lishi kerak');
  const hour=count(db,"SELECT count(*) AS n FROM direct_messages WHERE sender_id=? AND created_at>=datetime('now','-1 hour')",me.id);
  if(hour>=120)return fail(429,'rate','Bir soatdagi xabarlar limiti tugadi');
  const burst=count(db,"SELECT count(*) AS n FROM direct_messages WHERE sender_id=? AND recipient_id=? AND created_at>=datetime('now','-10 seconds')",me.id,p.id);
  if(burst>=5)return fail(429,'rate','Xabarlarni sekinroq yuboring');
  const id=randomId(),notification=randomId();
  const preview=body.length>100?body.slice(0,100)+'…':body;
  await db.batch([
    db.prepare('INSERT INTO direct_messages(id,sender_id,recipient_id,body) VALUES(?,?,?,?)').bind(id,me.id,p.id,body),
    db.prepare('INSERT INTO notifications(id,user_id,kind,body,target) VALUES(?,?,?,?,?)').bind(notification,p.id,'chat',me.display_name+' sizga xabar yozdi:\n'+preview,'chat:'+me.id),
    db.prepare('INSERT INTO bot_outbox(id,notification_id) VALUES(?,?)').bind(randomId(),notification)
  ]);
  return json({id,queued:1},201);
}
