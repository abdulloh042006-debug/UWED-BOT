// Local-only Telegram simulator. Never package this script in the Worker build.
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import worker from '../worker/index.js';
globalThis.crypto ||= webcrypto;
const path='.dev.sqlite',fresh=!existsSync(path),sql=new DatabaseSync(path);
sql.exec('PRAGMA foreign_keys=ON');
// Schema comes from the Worker's own ensureMigrations on first request (all db/*.sql, recorded in the migrations table).
const db={prepare(query){let args=[];return{bind(...v){args=v;return this},first(){return sql.prepare(query).get(...args)||null},all(){return{results:sql.prepare(query).all(...args)}},run(){const r=sql.prepare(query).run(...args);return{meta:{changes:r.changes}}}}},batch(items){sql.exec('BEGIN');try{const r=items.map(x=>x.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}};
const env={DB:db,TELEGRAM_BOT_TOKEN:'local-test-token',SESSION_SECRET:'local-only-session-secret-of-32-chars',BOOTSTRAP_ADMIN_TELEGRAM_ID:'999'};
async function hmac(key,message){return new Uint8Array(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']),new TextEncoder().encode(message)))}
async function signed(id){const p=new URLSearchParams({auth_date:String(Math.floor(Date.now()/1000)),user:JSON.stringify({id,first_name:'Test '+id})});const check=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('\n');const key=await hmac(new TextEncoder().encode('WebAppData'),env.TELEGRAM_BOT_TOKEN);p.set('hash',[...await hmac(key,check)].map(x=>x.toString(16).padStart(2,'0')).join(''));return p.toString()}
const handler=async(req,res)=>{
  try{
    const url=new URL(req.url,`http://127.0.0.1:${server.address().port}`),parts=[];
    for await(const chunk of req)parts.push(chunk);
    const body=Buffer.concat(parts),headers=new Headers(req.headers);
    const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:body,duplex:'half'});
    let result=await worker.fetch(request,env);
    if(url.pathname==='/' && req.method==='GET'){
      const id=/^(101|202|999)$/.test(url.searchParams.get('user'))?Number(url.searchParams.get('user')):101;
      const initData=await signed(id),html=(await result.text()).replace(/<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"( defer)?><\/script>/,`<script>window.Telegram={WebApp:{initData:${JSON.stringify(initData)},ready(){},expand(){}}}</script>`);
      result=new Response(html,{status:result.status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    }
    res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));
  }catch(e){res.writeHead(500);res.end('Local simulator error')}
};
const server=http.createServer(handler);
server.listen(Number(process.env.UWED_DEV_PORT||0),'127.0.0.1',()=>console.log(`Local Telegram simulator: http://127.0.0.1:${server.address().port}/?user=101 (also 202, 999). Test accounts only.`));
