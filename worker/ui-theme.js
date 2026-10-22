// UWED v2 "Quiet Campus": calm surfaces, diplomatic blue (#38567e), burgundy for trust/danger, gold for achievement.
const light='--bg:#eef1f6;--card:#fff;--text:#0c1c3a;--muted:#5a6882;--line:#dde3ed;--soft:#e7ecf4;--accent:#38567e;--accent-ink:#2f4c75;--tint:rgba(56,86,126,.1);--shadow:0 1px 2px rgba(12,28,58,.05),0 6px 18px rgba(12,28,58,.05);--nav-bg:#0c1c3a;--btn-a:#436594;--btn-b:#38567e;--ink:#0b1a36;--navy:#18305a;--on-dark:#fff;--on-dark-2:rgba(255,255,255,.72);--glass:rgba(255,255,255,.58);--glass-2:rgba(255,255,255,.4);--glass-line:rgba(255,255,255,.8);--glass-shadow:0 8px 28px rgba(12,28,58,.1);--glass-hi:inset 0 1px 0 rgba(255,255,255,.95);--blob-a:rgba(56,86,126,.34);--blob-b:rgba(212,175,55,.26);--blob-c:rgba(138,0,25,.15)';
const dark='--bg:#070f1d;--card:#0f1c32;--text:#eaf0f9;--muted:#93a3bc;--line:#1f3250;--soft:#18273f;--accent:#5b86c4;--accent-ink:#9dbcea;--tint:rgba(110,155,215,.14);--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.3);--nav-bg:#13264a;--btn-a:#5a86c8;--btn-b:#4572b3;--ink:#0d1d3b;--navy:#1d3a6c;--on-dark:#fff;--on-dark-2:rgba(255,255,255,.72);--glass:rgba(22,40,72,.52);--glass-2:rgba(22,40,72,.36);--glass-line:rgba(255,255,255,.12);--glass-shadow:0 10px 30px rgba(0,0,0,.35);--glass-hi:inset 0 1px 0 rgba(255,255,255,.12);--blob-a:rgba(70,120,210,.32);--blob-b:rgba(212,175,55,.16);--blob-c:rgba(190,30,60,.2)';
export const themeCss = `
:root{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color-scheme:light;${light};--burgundy:#8a0019;--gold:#d4af37;--on-accent:#fff;--r:20px;--ease:cubic-bezier(.2,.8,.2,1)}
html[data-theme=dark]{color-scheme:dark;${dark}}
@media(prefers-color-scheme:dark){html:not([data-theme=light]){color-scheme:dark;${dark}}}
html,body{min-height:100%;margin:0}*,*::before,*::after{box-sizing:border-box}
body{background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;overscroll-behavior-y:contain}
main{width:100%;max-width:760px;margin:0 auto;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) calc(104px + env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));min-height:100dvh}
h1,h2,h3{letter-spacing:-.025em;line-height:1.2;margin:0 0 10px}h1{font-size:clamp(1.55rem,6vw,2rem);font-weight:800}h2{font-size:1.06rem;font-weight:750}h3{font-size:1rem}
p{line-height:1.5;margin:8px 0 14px}.muted,.subtext{color:var(--muted)}small{color:var(--muted)}a{color:var(--accent-ink)}
/* controls */
.sr-only{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
button,input,textarea,select{font:inherit}
button{cursor:pointer;min-height:46px;border:0;border-radius:14px;padding:10px 18px;background:linear-gradient(180deg,var(--btn-a),var(--btn-b));color:var(--on-accent);font-weight:700;line-height:1.3;transition:transform .14s var(--ease),background-color .2s,opacity .2s}
button:active:not(:disabled){transform:scale(.97)}button:disabled{opacity:.55;cursor:wait}
.secondary{background:var(--tint);color:var(--accent-ink)}.danger{background:var(--burgundy);color:#fff}
button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
label{display:grid;gap:7px;font-weight:650;font-size:.88rem;margin:0}
input,textarea,select{width:100%;min-width:0;min-height:48px;padding:12px 14px;border:1.5px solid var(--line);border-radius:14px;background:var(--card);color:var(--text);font-weight:500;transition:border-color .2s,box-shadow .2s}
input:focus,textarea:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--tint);outline:0}
textarea{resize:vertical;min-height:96px}input[type=checkbox]{width:20px;height:20px;min-height:0;margin-right:9px;vertical-align:middle;accent-color:var(--accent)}input[type=file]{padding:11px}
input::placeholder,textarea::placeholder{color:var(--muted);opacity:.8}select{color-scheme:light}html[data-theme=dark] select{color-scheme:dark}
.stack{display:grid;gap:14px}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.row>input{flex:1 1 170px;min-width:0}
/* surfaces */
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;margin:12px 0;box-shadow:var(--shadow)}
.card>h2{margin-bottom:6px}.card>p:last-child{margin-bottom:0}.card .row{margin-top:12px}
.pill{display:inline-flex;align-items:center;gap:5px;min-height:26px;padding:0 11px;border-radius:999px;background:var(--tint);color:var(--accent-ink);font-size:.74rem;font-weight:750;white-space:nowrap}
.pill.ok{background:rgba(22,130,90,.13);color:#12704d}.pill.warn{background:rgba(212,175,55,.22);color:#7a5f00}.pill.bad{background:rgba(138,0,25,.12);color:#8a0019}.pill.gold{background:var(--gold);color:#3d2f00}.pill.bur{background:var(--burgundy);color:#fff}.pill.mute{background:var(--soft);color:var(--muted)}
html[data-theme=dark] .pill.ok{background:rgba(70,200,150,.16);color:#6fdcb0}html[data-theme=dark] .pill.warn{background:rgba(212,175,55,.2);color:#e8cb6a}html[data-theme=dark] .pill.bad{background:rgba(240,120,140,.16);color:#f59aab}
.error{color:#c0314a}.success{color:#12704d}html[data-theme=dark] .error{color:#f59aab}html[data-theme=dark] .success{color:#6fdcb0}
.ui-icon{display:inline-block;vertical-align:middle;width:21px;height:21px;flex:0 0 auto}
/* headings */
.page-heading{margin:6px 0 18px}.page-heading h1{margin-bottom:4px}.page-heading p{margin:0;color:var(--muted);font-size:.92rem}
.section-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:26px 2px 10px}.section-heading h2{margin:0;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:800}
.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:.68rem;font-weight:800;color:var(--accent-ink)}
/* home */
.dashboard-welcome{display:flex;align-items:center;gap:14px;padding:6px 2px 4px;margin-bottom:12px}
.dashboard-welcome>div{min-width:0;flex:1}.dashboard-welcome h1{margin:4px 0 6px;font-size:clamp(1.45rem,5.6vw,1.8rem)}.dashboard-welcome p{margin:0;color:var(--muted);font-size:.92rem}
.welcome-avatar{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;flex:none;background:linear-gradient(135deg,var(--accent),#2a4268);color:#fff;font-weight:800;font-size:1.1rem;box-shadow:var(--shadow)}
.quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.quick-action{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:3px;min-height:132px;padding:16px;text-align:left;background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow)}
.quick-action .ui-icon{width:42px;height:42px;padding:10px;margin-bottom:12px;border-radius:14px;background:var(--tint);color:var(--accent-ink)}
.quick-action:nth-child(4n+2) .ui-icon{background:rgba(138,0,25,.1);color:#8a0019}.quick-action:nth-child(4n+3) .ui-icon{background:rgba(212,175,55,.2);color:#7a5f00}.quick-action:nth-child(4n+4) .ui-icon{background:rgba(22,130,90,.12);color:#12704d}
html[data-theme=dark] .quick-action:nth-child(4n+2) .ui-icon{background:rgba(240,120,140,.15);color:#f59aab}html[data-theme=dark] .quick-action:nth-child(4n+3) .ui-icon{color:#e8cb6a}html[data-theme=dark] .quick-action:nth-child(4n+4) .ui-icon{color:#6fdcb0}
.quick-action:last-child:nth-child(odd){grid-column:1/-1;min-height:0;flex-direction:row;align-items:center;gap:14px;flex-wrap:wrap}.quick-action:last-child:nth-child(odd) .ui-icon{margin:0}.quick-action span{font-size:.97rem;font-weight:800}.quick-action small{font-size:.76rem;line-height:1.4;font-weight:500}
.empty-state{display:flex;gap:14px;align-items:flex-start;padding:20px;margin:12px 0;border:1.5px dashed var(--line);border-radius:var(--r);color:var(--muted)}
.empty-state .ui-icon{width:44px;height:44px;padding:11px;border-radius:14px;background:var(--tint);color:var(--accent-ink)}.empty-state strong{display:block;color:var(--text);font-size:.98rem}.empty-state p{margin:5px 0 0;font-size:.86rem}
.search-form{display:flex;gap:10px;margin:0 0 14px}.search-form input{flex:1 1 0}.search-form button{flex:none}
.admin-launch{display:flex;align-items:center;gap:13px;width:100%;margin:12px 0;padding:14px 16px;text-align:left;color:var(--text);background:var(--card);border:1px solid var(--line);border-left:4px solid var(--burgundy);border-radius:var(--r);box-shadow:var(--shadow)}
.admin-launch .ui-icon{color:var(--burgundy)}html[data-theme=dark] .admin-launch .ui-icon{color:#f59aab}.admin-launch>span:nth-child(2){flex:1;min-width:0}.admin-launch small{display:block;margin-top:2px;font-size:.76rem;font-weight:500}
/* profile */
.profile-intro{display:flex;align-items:center;gap:14px;margin:6px 0 18px}.profile-avatar{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tint);color:var(--accent-ink)}.profile-avatar .ui-icon{width:26px;height:26px}
.profile-intro h1{margin:0}.profile-intro p{margin:3px 0 0;color:var(--muted);font-size:.86rem}
.details-card>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:30px;list-style:none;cursor:pointer;font-weight:800}.details-card>summary::-webkit-details-marker{display:none}.details-card>summary{justify-content:flex-start}.details-card>summary:after{content:'';margin-left:auto;width:9px;height:9px;border-right:2.5px solid var(--accent-ink);border-bottom:2.5px solid var(--accent-ink);transform:rotate(45deg);transition:transform .2s var(--ease)}.details-card[open]>summary:after{transform:rotate(-135deg)}.details-card>summary .ui-icon{color:var(--accent-ink)}.details-card[open]>summary{margin-bottom:16px}
/* match cards */
.match-top{display:flex;align-items:center;gap:13px}.match-top h2{margin:0 0 5px}.match-avatar{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tint);color:var(--accent-ink);font-weight:800}
.meter{height:6px;margin:14px 0 4px;border-radius:3px;background:var(--soft);overflow:hidden}.meter i{display:block;height:100%;border-radius:3px;background:var(--accent);transform-origin:left;transform:scaleX(var(--s,0))}
.match-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.match-actions .primary{grid-column:1/-1}
/* skeleton + states */
.sk{display:block;position:relative;overflow:hidden;border-radius:8px;background:var(--soft)}.sk:after{content:'';position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,var(--line),transparent);animation:shimmer 1.2s linear infinite}.loading-cards{opacity:.85}
.state-error{border-left:4px solid var(--burgundy)}.state-error p{color:var(--muted)}
.gate{display:grid;place-items:center;min-height:70dvh;text-align:center}.gate .welcome-avatar{margin:0 auto 18px;width:72px;height:72px}.gate p{color:var(--muted);max-width:30ch;margin:6px auto}
/* toast + dialog */
body>p[role=status]{position:fixed;z-index:35;left:16px;right:16px;top:calc(12px + env(safe-area-inset-top));max-width:560px;margin:0 auto;padding:13px 15px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:16px;background:var(--card);color:var(--text);box-shadow:0 12px 32px #0003;font-weight:650;animation:toast-in .24s var(--ease) both}
body>p.error[role=status]{border-left-color:var(--burgundy)}body>p.success[role=status]{border-left-color:var(--gold)}body>p.leaving{animation:toast-out .18s ease-in both}
.scrim{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:24px;background:#080d1699;animation:fade-in .18s ease both}.scrim.leaving{animation:fade-out .16s ease both}
.dialog{width:100%;max-width:360px;padding:22px;border-radius:24px;background:var(--card);color:var(--text);box-shadow:0 20px 60px #0005;animation:dialog-in .24s cubic-bezier(.34,1.4,.64,1) both}.dialog .row{margin-top:18px}.dialog .row button{flex:1 1 auto}
/* chat */
.chat-person{display:flex;align-items:center;gap:13px;width:100%;margin:10px 0;text-align:left;color:var(--text);background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px;box-shadow:var(--shadow)}
.chat-person>span:nth-child(2){flex:1;min-width:0;display:grid;gap:3px}.chat-person small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.8rem}
.chat-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tint);color:var(--accent-ink);font-weight:800}
.chat-unread{min-width:26px;padding:4px 9px;border-radius:999px;background:var(--accent);color:var(--on-accent);text-align:center;font-size:.74rem}
.chat-thread-header{display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}.chat-thread-header h2{margin:0 0 2px}
.chat-messages{display:flex;flex-direction:column;gap:8px;min-height:160px;max-height:min(52dvh,540px);overflow-y:auto;padding:16px 2px}
.chat-bubble{max-width:84%;padding:10px 14px;border-radius:18px 18px 18px 6px;background:var(--soft);align-self:flex-start;overflow-wrap:anywhere}.chat-bubble.mine{background:var(--accent);color:var(--on-accent);align-self:flex-end;border-radius:18px 18px 6px 18px}
.chat-bubble p{margin:0 0 4px;white-space:pre-wrap}.chat-bubble small{opacity:.7;font-size:.66rem;color:inherit}
.chat-compose{display:flex;align-items:flex-end;gap:9px}.chat-compose textarea{flex:1;min-height:52px;max-height:140px}.chat-compose button{min-width:92px}.chat-thread>.secondary{margin-top:12px}
/* bottom navigation: floating bar, safe-area aware */
nav.app-nav{position:fixed;z-index:30;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));max-width:560px;margin:0 auto;display:flex;gap:2px;padding:6px;border:1px solid var(--line);border-radius:26px;background:var(--nav-bg);box-shadow:0 10px 32px rgba(10,20,40,.18)}
nav.app-nav button{flex:1 1 0;min-width:0;min-height:56px;padding:6px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:20px;background:transparent;color:var(--muted);font-size:clamp(.56rem,2.4vw,.7rem);font-weight:700;line-height:1.1;white-space:nowrap}
nav.app-nav .ui-icon{width:23px;height:23px;transition:transform .25s cubic-bezier(.34,1.4,.64,1)}
nav.app-nav button[aria-current=page]{background:var(--tint);color:var(--accent-ink)}nav.app-nav button[aria-current=page] .ui-icon{transform:translateY(-1px) scale(1.1)}
/* admin */
.admin-head{display:flex;align-items:center;gap:13px;margin:0 0 18px;padding:14px 16px;border-radius:var(--r);background:linear-gradient(130deg,#38567e,#2a4268);color:#fff;border-bottom:3px solid var(--gold)}
.admin-head>div:nth-child(2){flex:1;min-width:0}.admin-head strong{display:block;font-size:1rem}.admin-head small{display:block;margin-top:2px;color:#dbe6f3;font-size:.74rem}.admin-head .pill{background:#ffffff26;color:#fff;border:1px solid #ffffff40}
.admin-mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;flex:none;background:#fff;color:#8a0019}.admin-mark .ui-icon{width:24px;height:24px}
.admin-tabs{display:flex;gap:8px;overflow-x:auto;max-width:100%;padding:2px 0 14px;scrollbar-width:none}.admin-tabs::-webkit-scrollbar{display:none}
.chip{flex:none;min-height:40px;padding:8px 15px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--text);font-size:.8rem;white-space:nowrap}.chip.selected{background:var(--accent);border-color:var(--accent);color:#fff}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.stat{display:flex;flex-direction:column;gap:6px;min-width:0;min-height:104px;margin:0}.stats>.stat:last-child:nth-child(odd){grid-column:1/-1;min-height:0}.stat b{font-size:1.8rem;line-height:1;color:var(--accent-ink);font-variant-numeric:tabular-nums}.stat small{font-size:.76rem;line-height:1.35}
.admin-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:72px;text-align:left;color:var(--text);background:var(--card);border:1px solid var(--line)}.admin-row>span:first-child{display:grid;gap:4px;min-width:0}.admin-row small{font-size:.78rem}
.pager{justify-content:center;margin:18px 0}.pager button{flex:0 1 auto}
@media(min-width:650px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.quick-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.admin-tabs{flex-wrap:wrap}}
@media(max-width:360px){nav.app-nav button{font-size:.54rem}.quick-action{min-height:120px;padding:14px}}
/* motion: transform/opacity only, view-change entrance only */
@keyframes shimmer{to{transform:translateX(100%)}}@keyframes toast-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}@keyframes toast-out{to{opacity:0;transform:translateY(-8px)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}@keyframes fade-out{to{opacity:0}}@keyframes dialog-in{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes fillbar{from{transform:scaleX(0)}to{transform:scaleX(var(--s,0))}}@keyframes pop{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.06)}100%{opacity:1;transform:none}}
@media(prefers-reduced-motion:no-preference){
#app.enter>*:not(nav){animation:rise .3s var(--ease) both}#app.enter>:nth-child(2){animation-delay:45ms}#app.enter>:nth-child(3){animation-delay:90ms}#app.enter>:nth-child(4){animation-delay:135ms}#app.enter>:nth-child(5){animation-delay:180ms}#app.enter>:nth-child(n+6){animation-delay:225ms}
#app.enter .quick-action{animation:rise .3s var(--ease) both}#app.enter .quick-action:nth-child(2){animation-delay:40ms}#app.enter .quick-action:nth-child(3){animation-delay:80ms}#app.enter .quick-action:nth-child(4){animation-delay:120ms}#app.enter .quick-action:nth-child(5){animation-delay:160ms}
.meter i{animation:fillbar .7s var(--ease) .15s both}.welcome-avatar{animation:pop .4s cubic-bezier(.34,1.4,.64,1) both}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

/* v2.1: chips, week grid, onboarding, home extras */
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 12px}
.skill-chip{display:inline-flex;align-items:center;gap:0;min-height:40px;padding:0 2px 0 14px;border-radius:999px;background:var(--tint);color:var(--accent-ink);font-size:.86rem;font-weight:700}
.skill-chip.static{padding:0 14px;min-height:34px}
.chip-x{min-height:40px;width:40px;padding:0;border-radius:50%;background:transparent;color:var(--muted);font-size:1.15rem;line-height:1;display:grid;place-items:center}
.chip-x:hover{background:var(--soft);color:var(--burgundy)}
h3.mini{font-size:.74rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:800;margin:14px 0 4px}
.skills-card .row{margin-top:14px}.skills-card .row>input{flex:1 1 100%}.skills-card .row>select{flex:1 1 150px}.skills-card .row>button{flex:0 0 auto}
.week{display:grid;gap:2px;margin:6px 0 16px}
.week-row{display:grid;grid-template-columns:44px 1fr;gap:8px;align-items:start;padding:6px 0;border-bottom:1px solid var(--line)}
.week-row:last-child{border-bottom:0}.week-row b{padding-top:11px;font-size:.84rem;color:var(--muted)}.week-row .chips{margin:0;min-height:40px;align-items:center}
.row.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.row.two>label{min-width:0}
.link-row{margin:12px 0}.link-row button{flex:1 1 140px;display:inline-flex;align-items:center;justify-content:center;gap:8px}
.steps{list-style:none;display:flex;gap:6px;margin:4px 0 22px;padding:0}
.steps li{flex:1;display:grid;gap:6px;justify-items:center;text-align:center;font-size:.72rem;font-weight:700;color:var(--muted);position:relative}
.steps li::before{content:"";position:absolute;top:15px;left:calc(-50% + 18px);right:calc(50% + 18px);height:2px;background:var(--line)}
.steps li:first-child::before{display:none}.steps li.done::before,.steps li.on::before{background:var(--accent)}
.steps i{font-style:normal;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--muted);font-size:.82rem;position:relative;z-index:1}
.steps i .ui-icon{width:16px;height:16px}
.steps li.on i{background:var(--accent);color:var(--on-accent);box-shadow:0 0 0 5px var(--tint)}.steps li.on{color:var(--text)}
.steps li.done i{background:var(--accent);color:var(--on-accent)}
.onb-actions{display:flex;gap:10px;margin-top:14px}.onb-actions button{flex:1}
.next-card{display:flex;align-items:center;gap:14px;width:100%;text-align:left;color:var(--text);font-weight:500;padding:16px 18px;min-height:0}
.next-card>.ui-icon:first-child{width:42px;height:42px;padding:10px;border-radius:14px;background:var(--tint);color:var(--accent-ink);flex:none}
.next-card>.ui-icon:last-child{margin-left:auto;color:var(--muted);flex:none}
.next-card span{display:grid;gap:2px;min-width:0}.next-card strong{font-size:.98rem}.next-card em{font-style:normal;color:var(--muted);font-size:.84rem}
.next-card.alert{border-color:var(--gold)}.next-card.alert>.ui-icon:first-child{background:rgba(212,175,55,.2);color:#7a5f00}
button.small{min-height:40px;padding:6px 12px;font-size:.8rem;border-radius:12px;white-space:nowrap}
.section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
.note-card{position:relative;padding-left:22px}.note-card.unread{border-color:var(--accent)}.note-card.unread::before{content:"";position:absolute;left:9px;top:22px;width:7px;height:7px;border-radius:50%;background:var(--burgundy)}
.note-time{display:block;margin-top:6px}
nav.app-nav button{position:relative}.nav-dot{position:absolute;top:8px;left:calc(50% + 6px);width:9px;height:9px;border-radius:50%;background:var(--burgundy);border:2px solid var(--nav-bg)}
.session-card .match-top{align-items:center}.session-card .match-top .pill{margin-left:auto}
.session-card .when{display:flex;align-items:center;gap:8px;color:var(--accent-ink);font-weight:700}.session-card .when .ui-icon{width:18px;height:18px}
.session-card>*+*{margin-top:14px}.session-card>button{margin:14px 8px 0 0}.session-card>p{margin-bottom:0}.session-card form button{width:100%}.match-actions button{display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap}
@media(prefers-reduced-motion:reduce){.chip-x{transition:none}}

/* v3 skin "Diplomatic": navy ink surfaces, gold highlights, serif display, icon-led headings */
:root{--serif:ui-serif,"Iowan Old Style","Palatino Linotype",Georgia,"Noto Serif",serif;--r:18px}
h1,h2,.hero h1,.stat b,.hero-stats b{font-family:var(--serif)}
h1{font-weight:700;letter-spacing:-.015em}h2{font-weight:700;letter-spacing:-.01em;font-size:1.12rem}
button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:13px}
button:not([class]){box-shadow:0 1px 0 rgba(255,255,255,.14) inset,0 4px 12px rgba(56,86,126,.28)}
button .ui-icon{width:18px;height:18px}
button.primary{background:linear-gradient(180deg,#a3102a,#7c0016);box-shadow:0 1px 0 rgba(255,255,255,.16) inset,0 4px 14px rgba(138,0,25,.32)}
.secondary,button.secondary{background:var(--tint);color:var(--accent-ink);box-shadow:none}
.danger{background:var(--burgundy);box-shadow:none}
.card{border-radius:var(--r);box-shadow:var(--shadow)}
/* section + page headings */
.section-heading h2{font-size:1.18rem;text-transform:none;letter-spacing:-.01em;color:var(--text);font-weight:700;display:flex;align-items:center;gap:10px}
.section-heading h2::before{content:"";width:4px;height:18px;border-radius:2px;background:var(--gold)}
.page-heading{display:flex;align-items:center;gap:14px;margin:4px 0 18px;padding:18px;border-radius:22px;background:linear-gradient(135deg,var(--ink),var(--navy));color:var(--on-dark);box-shadow:0 10px 26px rgba(12,28,58,.22);position:relative;overflow:hidden}
.page-heading::after{content:"";position:absolute;right:-26px;top:-26px;width:110px;height:110px;border:1.5px solid rgba(212,175,55,.28);transform:rotate(45deg);border-radius:6px}
.page-heading .ph-ic{width:48px;height:48px;padding:12px;border-radius:15px;background:rgba(212,175,55,.16);color:var(--gold);box-shadow:0 0 0 1px rgba(212,175,55,.3) inset}
.page-heading h1{margin:0 0 3px;color:#fff;font-size:1.45rem}.page-heading p{margin:0;color:var(--on-dark-2);font-size:.86rem;line-height:1.4}
.page-heading>div{position:relative;z-index:1;min-width:0}
/* hero */
.hero{position:relative;overflow:hidden;margin:2px 0 18px;padding:20px 18px 18px;border-radius:26px;color:var(--on-dark);background:radial-gradient(120% 90% at 100% 0,#27497f 0,transparent 60%),linear-gradient(150deg,var(--ink),var(--navy));box-shadow:0 14px 34px rgba(12,28,58,.3)}
.hero-star{position:absolute;right:-34px;top:-30px;width:190px;height:190px;color:var(--gold);opacity:.32;pointer-events:none}
.hero-top{display:flex;align-items:center;gap:14px;position:relative}.hero-top small{color:var(--on-dark-2);font-size:.78rem;font-weight:600}
.hero h1{margin:2px 0 0;color:#fff;font-size:1.65rem}
.hero-avatar{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;flex:none;background:linear-gradient(145deg,#e6c75a,#b8921f);color:#2a2000;font-weight:800;font-size:1.1rem;box-shadow:0 0 0 3px rgba(255,255,255,.18)}
.hero p{position:relative;margin:14px 0 16px;color:var(--on-dark-2);font-size:.92rem;max-width:30ch}
.hero-stats{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.hero-stats button{flex-direction:column;gap:2px;min-height:76px;padding:10px 6px;border-radius:16px;background:rgba(255,255,255,.09);box-shadow:0 0 0 1px rgba(255,255,255,.14) inset;color:#fff}
.hero-stats b{font-size:1.7rem;line-height:1;color:var(--gold);font-weight:700}.hero-stats span{font-size:.7rem;font-weight:600;color:var(--on-dark-2)}
/* quick actions: icon-led */
.quick-action{border-radius:20px;background:var(--card);box-shadow:var(--shadow);position:relative;overflow:hidden}
.quick-action .ui-icon{width:46px;height:46px;padding:11px;border-radius:15px;background:linear-gradient(145deg,var(--navy),var(--ink));color:var(--gold);box-shadow:0 6px 14px rgba(12,28,58,.25)}
.quick-action:nth-child(4n+2) .ui-icon{background:linear-gradient(145deg,#a3102a,#6d0014);color:#fff}
.quick-action:nth-child(4n+3) .ui-icon{background:linear-gradient(145deg,#e6c75a,#b8921f);color:#2a2000}
.quick-action:nth-child(4n+4) .ui-icon{background:linear-gradient(145deg,#2f6f63,#1f4d45);color:#fff}
html[data-theme=dark] .quick-action:nth-child(4n+2) .ui-icon{color:#fff}html[data-theme=dark] .quick-action:nth-child(4n+3) .ui-icon{color:#2a2000}html[data-theme=dark] .quick-action:nth-child(4n+4) .ui-icon{color:#fff}
.quick-action span{font-family:var(--serif);font-size:1.05rem;font-weight:700}
/* avatars + chips */
.match-avatar,.chat-avatar,.profile-avatar{background:linear-gradient(145deg,var(--navy),var(--ink));color:var(--gold)}
.skill-chip{background:var(--tint);box-shadow:0 0 0 1px var(--line) inset}
.pill{border-radius:8px}
.meter i{background:linear-gradient(90deg,var(--accent),var(--gold))}
.meter{height:7px}
/* profile banner */
.profile-intro{padding:18px;border-radius:22px;background:linear-gradient(135deg,var(--ink),var(--navy));color:var(--on-dark);margin:4px 0 16px;box-shadow:0 10px 26px rgba(12,28,58,.22)}
.profile-intro h1{color:#fff}.profile-intro p{color:var(--on-dark-2)}.profile-intro .profile-avatar{background:rgba(212,175,55,.16);color:var(--gold);box-shadow:0 0 0 1px rgba(212,175,55,.3) inset}
/* nav: ink bar, gold active */
nav.app-nav{border:0;border-radius:24px;box-shadow:0 14px 34px rgba(5,12,28,.45),0 0 0 1px rgba(255,255,255,.06) inset}
nav.app-nav button{background:transparent;box-shadow:none;color:rgba(255,255,255,.62)}
nav.app-nav button[aria-current=page]{background:rgba(212,175,55,.16);color:var(--gold)}
.nav-dot{border-color:var(--nav-bg);background:#e0445f}
/* cards that are buttons */
.next-card{background:var(--card);box-shadow:var(--shadow)}.next-card>.ui-icon:first-child{background:linear-gradient(145deg,var(--navy),var(--ink));color:var(--gold)}
.next-card.alert{border-color:var(--gold)}.next-card.alert>.ui-icon:first-child{background:linear-gradient(145deg,#e6c75a,#b8921f);color:#2a2000}
.admin-launch{background:var(--card);border-radius:var(--r)}
.steps li.on i{background:var(--navy);box-shadow:0 0 0 5px rgba(212,175,55,.3)}.steps li.done i{background:var(--navy);color:var(--gold)}
.chat-bubble.mine{background:linear-gradient(180deg,#436594,#38567e)}
.stat b{color:var(--accent-ink)}
.empty-state .ui-icon{background:linear-gradient(145deg,var(--navy),var(--ink));color:var(--gold)}
.chip.selected{background:var(--navy)}
.admin-head{background:linear-gradient(135deg,var(--ink),var(--navy))}

.match-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.match-actions>button{min-width:0;white-space:normal;text-align:center;line-height:1.2;padding-left:10px;padding-right:10px}
.page-heading::after{right:-60px;top:-30px;border-color:rgba(212,175,55,.16)}
.project-card .match-top .pill{margin-left:auto}.project-card>button{margin-top:6px}.project-card .meta{display:flex;align-items:center;gap:8px;color:var(--muted);font-weight:650;font-size:.88rem}.project-card .meta .ui-icon{width:18px;height:18px}
.match-avatar .ui-icon{width:24px;height:24px}

.section-heading{flex-wrap:wrap}.section-heading h2{flex:1 1 auto;min-width:0}

/* v3.1 glass: ambient colour field + frosted translucent surfaces (only where backdrop-filter exists) */
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(60% 38% at 8% 2%,var(--blob-a),transparent 72%),radial-gradient(50% 32% at 100% 22%,var(--blob-b),transparent 72%),radial-gradient(64% 40% at 0% 78%,var(--blob-c),transparent 72%),radial-gradient(50% 30% at 100% 100%,var(--blob-a),transparent 72%)}
@supports((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
.card,.quick-action,.next-card,.admin-launch,.chat-person,.empty-state,.admin-row,.stat,.dialog,details.card{background:var(--glass);border:1px solid var(--glass-line);box-shadow:var(--glass-hi),var(--glass-shadow);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5)}
.empty-state{border-style:solid;background:var(--glass-2)}
input,textarea,select{background:var(--glass-2);border-color:var(--glass-line);box-shadow:var(--glass-hi);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
html[data-theme=dark] input,html[data-theme=dark] textarea,html[data-theme=dark] select{border-color:rgba(255,255,255,.14)}
input:focus,textarea:focus,select:focus{background:var(--glass);border-color:var(--accent)}
.secondary,button.secondary{background:var(--glass-2);box-shadow:var(--glass-hi),0 0 0 1px var(--glass-line) inset;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.skill-chip,.pill:not(.gold):not(.bur):not(.ok):not(.warn):not(.bad){background:var(--glass-2);box-shadow:var(--glass-hi),0 0 0 1px var(--glass-line) inset}
.chat-bubble:not(.mine){background:var(--glass);box-shadow:var(--glass-hi),0 0 0 1px var(--glass-line) inset;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
nav.app-nav{background:rgba(12,28,58,.76);-webkit-backdrop-filter:blur(24px) saturate(1.7);backdrop-filter:blur(24px) saturate(1.7);box-shadow:0 14px 34px rgba(5,12,28,.4),0 0 0 1px rgba(255,255,255,.16) inset,0 1px 0 rgba(255,255,255,.3) inset}
html[data-theme=dark] nav.app-nav{background:rgba(19,38,74,.74)}
.hero-stats button{background:rgba(255,255,255,.12);box-shadow:0 0 0 1px rgba(255,255,255,.22) inset,0 1px 0 rgba(255,255,255,.35) inset;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.scrim{-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
body>p[role=status]{background:var(--glass);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5)}
}
/* gloss on dark banners */
.hero::after,.page-heading::before,.profile-intro::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(160deg,rgba(255,255,255,.2),rgba(255,255,255,0) 38%);box-shadow:0 0 0 1px rgba(255,255,255,.14) inset}
.profile-intro{position:relative;overflow:hidden}
.hero>*,.profile-intro>*{position:relative;z-index:1}
.hero .hero-star{position:absolute;z-index:0}
.hero-avatar{box-shadow:0 0 0 3px rgba(255,255,255,.28),0 8px 20px rgba(0,0,0,.25)}
.quick-action .ui-icon,.next-card>.ui-icon:first-child,.match-avatar{box-shadow:0 1px 0 rgba(255,255,255,.35) inset,0 6px 14px rgba(12,28,58,.25)}

.admin-launch{border-left:4px solid var(--burgundy)}.next-card.alert{border-color:var(--gold)}.state-error{border-left:4px solid var(--burgundy)}.note-card.unread{border-color:var(--accent)}
.hero-star{opacity:.2;right:-50px;top:-46px}
`;
