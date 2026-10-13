// Production CSS for the UWED Mini App. Brand: blue #38567e (primary), burgundy #8a0019 (verified/danger),
// gold #d4af37 (achievements). Backgrounds and text follow Telegram theme variables; the accent stays brand blue.
// Fonts: CSP allows no external font hosts, so a system font stack is used.
const light = '--bg:var(--tg-theme-secondary-bg-color,#f5f7fa);--card:var(--tg-theme-bg-color,#fff);--text:var(--tg-theme-text-color,#14233a);--muted:#5b6b80;--accent:#38567e;--accent-text:#38567e;--header:#38567e;--line:#dce3ec;--soft:#e8eef5;--gold-ink:#7a5f00;--bad-ink:#8a0019';
const dark = '--bg:var(--tg-theme-secondary-bg-color,#0c1522);--card:var(--tg-theme-bg-color,#142033);--text:var(--tg-theme-text-color,#eef2f7);--muted:#9aa9bd;--accent:#4a6d9c;--accent-text:#9db9de;--header:#22385a;--line:#2a3b53;--soft:#1b2a41;--gold-ink:#e6c65c;--bad-ink:#f0788c';
export const themeCss = `
:root{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color-scheme:light;${light};--burgundy:#8a0019;--gold:#d4af37;--on-accent:#fff}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){color-scheme:dark;${dark}}}
:root[data-theme=dark]{color-scheme:dark;${dark}}
body{background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
main{max-width:640px;padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}
h1{font-size:1.45rem;line-height:1.2;letter-spacing:-.025em;margin:.5em 0 .35em}h2{font-size:1.05rem;letter-spacing:-.01em;margin:0 0 .4em}p{margin:.4em 0}.muted{color:var(--muted)}small{color:var(--muted)}
a{color:var(--accent-text)}
button{min-height:46px;padding:10px 16px;border-radius:14px;font-weight:700;background:var(--accent);color:var(--on-accent);transition:transform .14s cubic-bezier(.2,.8,.2,1),background-color .2s,color .2s,opacity .2s,border-color .2s}
button:active:not(:disabled){transform:scale(.97)}
.secondary{background:var(--soft);color:var(--text);border:1px solid var(--line)}
.danger{background:var(--burgundy);color:#fff}
button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
button:disabled{opacity:.6;cursor:wait}
button:disabled:not([data-admin-page])::after{content:"";display:inline-block;width:14px;height:14px;margin-left:8px;vertical-align:-2px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .7s linear infinite}
input,textarea,select{width:100%;min-height:46px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text);transition:border-color .2s}
input:focus,textarea:focus,select:focus{border-color:var(--accent)}
input[type=checkbox]{width:22px;height:22px;min-height:0;margin-right:8px;vertical-align:middle;accent-color:var(--accent)}
label{display:block;margin:10px 0 4px;font-size:.9rem;font-weight:600}
.row input,.row select{flex:1 1 140px;width:auto}.card>button{margin:8px 8px 0 0}.card .row>button{flex:1 1 auto;margin:0}
.card{border:1px solid var(--line);border-radius:18px;box-shadow:none}
.pill{display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:12px;font-size:.72rem;font-weight:700;background:var(--soft);color:var(--text)}
.pill.ok{background:rgba(56,86,126,.15);color:var(--accent-text)}.pill.warn{background:rgba(212,175,55,.22);color:var(--gold-ink)}.pill.bad{background:rgba(138,0,25,.13);color:var(--bad-ink)}.pill.gold{background:var(--gold);color:#3d2f00}.pill.bur{background:var(--burgundy);color:#fff}.pill.mute{background:var(--soft);color:var(--muted)}
.empty{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;color:var(--muted);border-style:dashed;padding:28px 20px}.empty-ico{width:56px;height:56px;margin-bottom:6px;border-radius:18px;display:grid;place-items:center;background:var(--soft);color:var(--accent-text)}.empty-ico svg{width:26px;height:26px}.empty h2{margin:0;color:var(--text)}.empty p{margin:0 0 6px;max-width:30ch}.empty>button{margin:8px 0 0}#search{flex-wrap:nowrap}#search input{min-width:0}#search button{flex:none}.stack>button{width:100%}.row>.secondary[data-view]{flex:1}
.state-error{border-left:4px solid var(--burgundy)}.state-error p{color:var(--bad-ink)}
/* header */
.admin-head,.brand-head{display:flex;gap:12px;align-items:center;background:var(--header);color:#fff;margin:-18px -16px 18px;padding:18px 18px 20px;border-radius:0 0 24px 24px}
.admin-head>div:nth-child(2){flex:1}.admin-head small,.brand-head small{display:block;color:#d9e3ef;font-size:.75rem}.admin-head .pill{background:#ffffff2b;color:#fff}
.brand-head{padding:12px 16px 14px;margin-bottom:14px;border-radius:0 0 20px 20px}.brand-head .admin-mark{width:34px;height:34px}.brand-head .admin-mark svg{width:19px;height:19px}.brand-head strong{font-size:.95rem}.brand-head small{font-size:.7rem}
.admin-mark{width:40px;height:40px;flex:none;border-radius:50%;display:grid;place-items:center;background:#fff;color:#38567e}.admin-mark svg{width:22px;height:22px}
/* navigation */
nav{background:var(--card);border-top:1px solid var(--line);box-shadow:none;gap:2px;padding:6px 6px calc(6px + env(safe-area-inset-bottom))}
nav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:54px;padding:6px 2px;border-radius:16px;font-size:.68rem;background:transparent;color:var(--muted)}
nav svg{width:22px;height:22px;transition:transform .25s cubic-bezier(.34,1.4,.64,1)}
nav button[aria-current=page]{background:var(--soft);color:var(--accent-text)}nav button[aria-current=page] svg{transform:translateY(-1px) scale(1.08)}
/* home */
.tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
.tile{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:96px;padding:14px;text-align:left;background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:18px}
.tile svg{width:24px;height:24px;margin-bottom:8px;color:var(--accent-text)}.tile small{font-weight:600}
/* profile + matches */
.avatar{width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--accent-text);font-weight:800;font-size:.9rem}.avatar.big{width:56px;height:56px;font-size:1.1rem}
.hero{display:flex;gap:14px;align-items:center}.hero h1{margin:0 0 4px;font-size:1.25rem}
.mhead{display:flex;gap:12px;align-items:center}.mhead h2{margin:0 0 4px}
.meter{height:6px;margin:12px 0;border-radius:3px;background:var(--soft);overflow:hidden}.meter i{display:block;height:100%;border-radius:3px;background:var(--accent);transform-origin:left;transform:scaleX(var(--s,0))}
.steps{display:flex;gap:6px;margin:10px 0 12px}.steps i{flex:1;height:4px;border-radius:2px;background:var(--soft);transition:background-color .3s}.steps i.on{background:var(--accent)}
.ach{display:flex;gap:14px;align-items:flex-start}.ach>div{min-width:0;flex:1}
.medal{width:44px;height:44px;flex:none;border-radius:14px;display:grid;place-items:center;background:var(--soft);color:var(--muted)}.medal.on{background:var(--gold);color:#3d2f00}.medal svg{width:22px;height:22px}
.slot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0;padding:6px 0;border-bottom:1px solid var(--line)}.slot button{min-height:44px;padding:6px 12px;font-size:.8rem}
/* skeleton */
.sk{position:relative;overflow:hidden;background:var(--soft);border-radius:8px}.sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,var(--line),transparent);animation:shimmer 1.2s linear infinite}
/* toast + dialog */
body>p[role=status]{position:fixed;z-index:30;left:16px;right:16px;top:calc(12px + env(safe-area-inset-top));max-width:608px;margin:0 auto;padding:12px 14px;border-radius:14px;background:var(--card);color:var(--text);border:1px solid var(--line);border-left:4px solid var(--accent);box-shadow:0 8px 24px rgba(0,0,0,.18);font-weight:600;animation:toastIn .24s cubic-bezier(.2,.8,.2,1) both}
body>p.error[role=status]{border-left-color:var(--burgundy)}body>p.success[role=status]{border-left-color:var(--gold)}body>p.leaving{animation:toastOut .2s ease both}
.scrim{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:24px;background:rgba(10,14,22,.55);animation:fade .18s ease both}.scrim.leaving{animation:fadeOut .16s ease both}
.dialog{width:100%;max-width:360px;padding:20px;border-radius:20px;background:var(--card);color:var(--text);animation:pop .22s cubic-bezier(.34,1.4,.64,1) both}.dialog .row button{flex:1 1 auto}
/* admin */
.admin-tabs{display:flex;gap:8px;overflow:auto;padding:2px 0 12px;scrollbar-width:thin}
.chip{white-space:nowrap;min-height:44px;padding:0 16px;background:var(--card);border:1px solid var(--line);color:var(--text);border-radius:999px;font-size:.8rem}.chip.selected{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.stat{margin:0;display:flex;flex-direction:column;gap:4px}.stat b{font-size:1.6rem;color:var(--accent-text)}.stat:nth-child(6) b{color:var(--gold-ink)}.stat:nth-child(7) b{color:var(--bad-ink)}.stat small{font-size:.75rem}.stat:nth-child(7){grid-column:1/-1}
.admin-row{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;text-align:left;background:var(--card);color:var(--text);cursor:pointer}.admin-row span:first-child{display:grid;gap:3px}.admin-row small{display:block}
.pager{justify-content:center;margin:18px 0}.pager button{flex:0 1 auto}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.9)}60%{opacity:1;transform:scale(1.03)}100%{transform:scale(1)}}
@keyframes fade{from{opacity:0}to{opacity:1}}@keyframes fadeOut{to{opacity:0}}
@keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}@keyframes toastOut{to{opacity:0;transform:translateY(-8px)}}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{to{transform:translateX(100%)}}
@keyframes fillbar{from{transform:scaleX(0)}to{transform:scaleX(var(--s,0))}}
@media(min-width:660px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.stat:nth-child(7){grid-column:auto}.admin-tabs{flex-wrap:wrap}.admin-row:hover,.card:focus-within{border-color:var(--accent)}}
@media(prefers-reduced-motion:no-preference){
#app.enter>:not(header):not(nav):not(.stats){animation:rise .28s cubic-bezier(.2,.8,.2,1) both}
#app.enter>:nth-child(3){animation-delay:40ms}#app.enter>:nth-child(4){animation-delay:80ms}#app.enter>:nth-child(5){animation-delay:120ms}#app.enter>:nth-child(6){animation-delay:160ms}#app.enter>:nth-child(7){animation-delay:200ms}#app.enter>:nth-child(n+8){animation-delay:240ms}
#app.enter .stat{animation:rise .28s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0)*45ms)}
.meter i{animation:fillbar .6s cubic-bezier(.2,.8,.2,1) .15s both}
.medal.on{animation:pop .35s cubic-bezier(.34,1.56,.64,1) both}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
