// UWED "Native" design system.
// Surfaces and text follow the live Telegram theme (--tg-theme-*), so the Mini App blends with the chat the student came from.
// The UWED identity is carried by three restrained accents: diplomatic blue (actions), burgundy (alerts), gold (highlights).
// System fonts only (CSP allows no external fonts). Flat surfaces, hairline separators, no decorative gradients.
const light = '--bg:var(--tg-theme-secondary-bg-color,#f1f3f7);--card:var(--tg-theme-section-bg-color,var(--tg-theme-bg-color,#fff));--text:var(--tg-theme-text-color,#14203a);--muted:var(--tg-theme-hint-color,#6b7a90);--line:var(--tg-theme-section-separator-color,rgba(20,32,58,.1));--soft:rgba(110,125,150,.13);--accent:#38567e;--accent-ink:#2f4c75;--tint:rgba(56,86,126,.1);--nav-bg:var(--tg-theme-bottom-bar-bg-color,var(--tg-theme-section-bg-color,#fff));--field:rgba(110,125,150,.1)';
const dark = '--bg:var(--tg-theme-secondary-bg-color,#0e1621);--card:var(--tg-theme-section-bg-color,var(--tg-theme-bg-color,#17212b));--text:var(--tg-theme-text-color,#f3f6fa);--muted:var(--tg-theme-hint-color,#8193a8);--line:var(--tg-theme-section-separator-color,rgba(255,255,255,.09));--soft:rgba(140,160,190,.16);--accent:#4a72ad;--accent-ink:#8fb4e6;--tint:rgba(111,151,207,.16);--nav-bg:var(--tg-theme-bottom-bar-bg-color,var(--tg-theme-section-bg-color,#17212b));--field:rgba(140,160,190,.13)';

export const themeCss = `
:root{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;color-scheme:light;${light};--burgundy:#8a0019;--gold:#d4af37;--on-accent:#fff;--r:14px;--ease:cubic-bezier(.2,.8,.2,1)}
html[data-theme=dark]{color-scheme:dark;${dark}}
@media(prefers-color-scheme:dark){html:not([data-theme=light]){color-scheme:dark;${dark}}}
html,body{min-height:100%;margin:0}*,*::before,*::after{box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-size:16px;line-height:1.45;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;overscroll-behavior-y:contain}
main{width:100%;max-width:720px;margin:0 auto;padding:max(14px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) calc(88px + env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));min-height:100dvh}
h1,h2,h3{margin:0 0 8px;line-height:1.25;letter-spacing:-.01em}h1{font-size:1.5rem;font-weight:700}h2{font-size:1.05rem;font-weight:650}h3{font-size:.98rem;font-weight:650}
p{margin:6px 0 12px}.muted,.subtext,small{color:var(--muted)}small{font-size:.8rem}a{color:var(--accent-ink)}
.sr-only{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ui-icon{display:inline-block;vertical-align:middle;width:20px;height:20px;flex:0 0 auto}

/* controls */
button,input,textarea,select{font:inherit}
button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:10px 18px;border:0;border-radius:12px;background:var(--accent);color:var(--on-accent);font-weight:650;line-height:1.25;cursor:pointer;transition:transform .12s var(--ease),opacity .15s,background-color .15s}
button:active:not(:disabled){transform:scale(.98);opacity:.9}button:disabled{opacity:.5;cursor:wait}
button .ui-icon{width:18px;height:18px}
.secondary{background:var(--tint);color:var(--accent-ink)}.danger{background:var(--burgundy);color:#fff}
button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
label{display:grid;gap:6px;font-weight:600;font-size:.86rem;margin:0}
input,textarea,select{width:100%;min-width:0;min-height:46px;padding:11px 13px;border:1px solid transparent;border-radius:12px;background:var(--field);color:var(--text);font-weight:450;transition:border-color .15s,background-color .15s}
input:focus,textarea:focus,select:focus{border-color:var(--accent);background:var(--card);outline:0}
textarea{resize:vertical;min-height:92px}input[type=checkbox]{width:20px;height:20px;min-height:0;margin-right:9px;vertical-align:middle;accent-color:var(--accent)}input[type=file]{padding:10px}
input::placeholder,textarea::placeholder{color:var(--muted);opacity:.85}select{color-scheme:light}html[data-theme=dark] select{color-scheme:dark}
.stack{display:grid;gap:12px}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.row>input{flex:1 1 160px;min-width:0}.row.two{display:grid;grid-template-columns:1fr 1fr}.row.two>label{min-width:0}
button.small{min-height:40px;padding:6px 12px;font-size:.82rem;white-space:nowrap}

/* surfaces */
.card{background:var(--card);border-radius:var(--r);padding:16px;margin:10px 0;border:1px solid var(--line)}
.card>h2{margin-bottom:6px}.card>p:last-child{margin-bottom:0}.card .row{margin-top:10px}
.pill{display:inline-flex;align-items:center;gap:5px;min-height:24px;padding:0 10px;border-radius:999px;background:var(--tint);color:var(--accent-ink);font-size:.74rem;font-weight:700;white-space:nowrap}
.pill.ok{background:rgba(22,130,90,.13);color:#12704d}.pill.warn{background:rgba(212,175,55,.2);color:#7a5f00}.pill.bad{background:rgba(138,0,25,.11);color:#8a0019}.pill.gold{background:var(--gold);color:#3a2d00}.pill.bur{background:var(--burgundy);color:#fff}.pill.mute{background:var(--soft);color:var(--muted)}
html[data-theme=dark] .pill.ok{background:rgba(70,200,150,.16);color:#6fdcb0}html[data-theme=dark] .pill.warn{background:rgba(212,175,55,.18);color:#e8cb6a}html[data-theme=dark] .pill.bad{background:rgba(240,120,140,.15);color:#f59aab}
.error{color:#c0314a}.success{color:#12704d}html[data-theme=dark] .error{color:#f59aab}html[data-theme=dark] .success{color:#6fdcb0}

/* headings */
.page-heading{display:flex;align-items:center;gap:12px;margin:6px 2px 16px}
.page-heading .ph-ic{width:42px;height:42px;padding:10px;border-radius:12px;background:var(--tint);color:var(--accent-ink)}
.page-heading h1{margin:0}.page-heading p{margin:2px 0 0;color:var(--muted);font-size:.88rem;line-height:1.35}.page-heading>div{min-width:0}
.section-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin:22px 4px 8px}
.section-heading h2{flex:1 1 auto;min-width:0;margin:0;font-size:.9rem;font-weight:650;color:var(--tg-theme-section-header-text-color,var(--muted))}
.eyebrow{font-size:.78rem;font-weight:650;color:var(--muted)}

/* home */
.hero{margin:4px 0 12px;padding:16px;border-radius:var(--r);background:var(--card);border:1px solid var(--line)}
.hero-top{display:flex;align-items:center;gap:14px}.hero-top small{display:block}
.hero h1{margin:0;font-size:1.4rem}
.hero-avatar,.welcome-avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--accent);color:#fff;font-weight:700;font-size:1.05rem}
.hero p{margin:12px 0 14px;color:var(--muted);font-size:.9rem}
.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);margin:0 -16px -16px}
.hero-stats button{flex-direction:column;gap:2px;min-height:68px;padding:10px 4px;border-radius:0;background:transparent;color:var(--text)}
.hero-stats button+button{border-left:1px solid var(--line)}
.hero-stats b{font-size:1.5rem;line-height:1;font-weight:700;color:var(--accent-ink)}.hero-stats span{font-size:.72rem;font-weight:600;color:var(--muted)}
.quick-grid{background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.quick-action{display:grid;grid-template-columns:40px 1fr 18px;grid-template-rows:auto auto;column-gap:12px;row-gap:1px;align-items:center;width:100%;min-height:62px;padding:11px 14px;border-radius:0;background:transparent;color:var(--text);text-align:left;font-weight:500}
.quick-action+.quick-action{border-top:1px solid var(--line)}
.quick-action .ui-icon{grid-row:1/3;width:40px;height:40px;padding:9px;border-radius:11px;background:var(--tint);color:var(--accent-ink)}
.quick-action:nth-child(4n+2) .ui-icon{background:rgba(138,0,25,.1);color:#8a0019}.quick-action:nth-child(4n+3) .ui-icon{background:rgba(212,175,55,.2);color:#7a5f00}.quick-action:nth-child(4n+4) .ui-icon{background:rgba(22,130,90,.12);color:#12704d}
html[data-theme=dark] .quick-action:nth-child(4n+2) .ui-icon{background:rgba(240,120,140,.15);color:#f59aab}html[data-theme=dark] .quick-action:nth-child(4n+3) .ui-icon{color:#e8cb6a}html[data-theme=dark] .quick-action:nth-child(4n+4) .ui-icon{color:#6fdcb0}
.quick-action span{align-self:end;font-size:.98rem;font-weight:650}.quick-action small{align-self:start;font-size:.78rem}
.quick-action::after{content:"";grid-column:3;grid-row:1/3;width:8px;height:8px;margin-left:4px;border-top:2px solid var(--muted);border-right:2px solid var(--muted);transform:rotate(45deg);opacity:.6}
.next-card,.admin-launch{display:flex;align-items:center;gap:12px;width:100%;margin:10px 0;padding:13px 14px;text-align:left;color:var(--text);font-weight:500;background:var(--card);border:1px solid var(--line);border-radius:var(--r)}
.next-card>.ui-icon:first-child,.admin-launch>.ui-icon:first-child{width:40px;height:40px;padding:9px;border-radius:11px;background:var(--tint);color:var(--accent-ink)}
.next-card>.ui-icon:last-child,.admin-launch>.ui-icon:last-child{margin-left:auto;color:var(--muted)}
.next-card span,.admin-launch>span:nth-child(2){display:grid;gap:1px;min-width:0;flex:1}.next-card strong,.admin-launch strong{font-size:.96rem}.next-card em{font-style:normal;color:var(--muted);font-size:.82rem}
.next-card.alert{border-color:var(--gold)}.next-card.alert>.ui-icon:first-child{background:rgba(212,175,55,.2);color:#7a5f00}
.admin-launch{border-left:3px solid var(--burgundy)}.admin-launch>.ui-icon:first-child{background:rgba(138,0,25,.1);color:var(--burgundy)}html[data-theme=dark] .admin-launch>.ui-icon:first-child{color:#f59aab}
.admin-launch small{display:block;font-size:.76rem;font-weight:500}
.empty-state{display:flex;gap:12px;align-items:flex-start;padding:16px;margin:10px 0;border:1px dashed var(--line);border-radius:var(--r);color:var(--muted)}
.empty-state .ui-icon{width:40px;height:40px;padding:9px;border-radius:11px;background:var(--tint);color:var(--accent-ink)}.empty-state strong{display:block;color:var(--text)}.empty-state p{margin:4px 0 0;font-size:.86rem}
.search-form{display:flex;gap:8px;margin:0 0 12px}.search-form input{flex:1 1 0}.search-form button{flex:none}
.note-card{position:relative;padding-left:20px}.note-card.unread::before{content:"";position:absolute;left:8px;top:21px;width:7px;height:7px;border-radius:50%;background:var(--burgundy)}.note-time{display:block;margin-top:6px}

/* profile */
.profile-intro{display:flex;align-items:center;gap:14px;margin:6px 2px 14px}.profile-avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tint);color:var(--accent-ink)}.profile-avatar .ui-icon{width:24px;height:24px}
.profile-intro h1{margin:0}.profile-intro p{margin:2px 0 0;color:var(--muted);font-size:.86rem}
.details-card>summary{display:flex;align-items:center;gap:10px;min-height:30px;list-style:none;cursor:pointer;font-weight:650}.details-card>summary::-webkit-details-marker{display:none}.details-card>summary::after{content:"";margin-left:auto;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);transition:transform .2s var(--ease)}.details-card[open]>summary::after{transform:rotate(-135deg)}.details-card>summary .ui-icon{color:var(--accent-ink)}.details-card[open]>summary{margin-bottom:14px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}
.skill-chip{display:inline-flex;align-items:center;min-height:40px;padding:0 2px 0 13px;border-radius:999px;background:var(--tint);color:var(--accent-ink);font-size:.86rem;font-weight:650}.skill-chip.static{padding:0 13px;min-height:32px}
.chip-x{min-height:40px;width:40px;padding:0;border-radius:50%;background:transparent;color:var(--muted);font-size:1.1rem;line-height:1}
h3.mini{margin:12px 0 2px;font-size:.8rem;font-weight:650;color:var(--muted)}.skills-card .row{margin-top:12px}.skills-card .row>input{flex:1 1 100%}.skills-card .row>select{flex:1 1 140px}.skills-card .row>button{flex:0 0 auto}
.week{display:grid;margin:6px 0 14px}.week-row{display:grid;grid-template-columns:42px 1fr;gap:8px;align-items:start;padding:5px 0;border-bottom:1px solid var(--line)}.week-row:last-child{border-bottom:0}
.week-row b{padding-top:10px;font-size:.82rem;color:var(--muted)}.week-row .chips{margin:0;min-height:38px;align-items:center}
.link-row{margin:10px 0}.link-row button{flex:1 1 130px}
.skin-picker{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.skin-picker button{min-height:48px;font-size:.88rem}.skin-picker button[aria-pressed=true]{background:var(--accent);color:#fff}

/* onboarding */
.steps{list-style:none;display:flex;gap:6px;margin:4px 0 18px;padding:0}
.steps li{flex:1;display:grid;gap:5px;justify-items:center;text-align:center;font-size:.72rem;font-weight:650;color:var(--muted);position:relative}
.steps li::before{content:"";position:absolute;top:14px;left:calc(-50% + 18px);right:calc(50% + 18px);height:2px;background:var(--line)}
.steps li:first-child::before{display:none}.steps li.done::before,.steps li.on::before{background:var(--accent)}
.steps i{font-style:normal;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--muted);font-size:.8rem;position:relative;z-index:1}.steps i .ui-icon{width:15px;height:15px}
.steps li.on i,.steps li.done i{background:var(--accent);color:#fff}.steps li.on{color:var(--text)}
.onb-actions{display:flex;gap:10px;margin-top:12px}.onb-actions button{flex:1}

/* match, session, project cards */
.match-top{display:flex;align-items:center;gap:12px}.match-top h2{margin:0 0 4px}
.match-avatar,.chat-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tint);color:var(--accent-ink);font-weight:700}.match-avatar .ui-icon{width:22px;height:22px}
.meter{height:6px;margin:12px 0 4px;border-radius:3px;background:var(--soft);overflow:hidden}.meter i{display:block;height:100%;border-radius:3px;background:var(--accent);transform-origin:left;transform:scaleX(var(--s,0))}
.match-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.match-actions .primary{grid-column:1/-1}.match-actions>button{min-width:0;line-height:1.2;padding-left:10px;padding-right:10px;text-align:center}
.session-card>*+*{margin-top:12px}.session-card>p{margin-bottom:0}.session-card>button{margin:12px 8px 0 0}.session-card form button{width:100%}
.session-card .match-top .pill,.project-card .match-top .pill{margin-left:auto}
.session-card .when{display:flex;align-items:center;gap:8px;color:var(--accent-ink);font-weight:650}.session-card .when .ui-icon{width:18px;height:18px}
.project-card>button{margin-top:4px}.project-card .meta{display:flex;align-items:center;gap:8px;color:var(--muted);font-weight:600;font-size:.88rem}.project-card .meta .ui-icon{width:18px;height:18px}

/* states */
.sk{display:block;position:relative;overflow:hidden;border-radius:8px;background:var(--soft)}.sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,var(--line),transparent);animation:shimmer 1.2s linear infinite}
.state-error{border-left:3px solid var(--burgundy)}.state-error p{color:var(--muted)}
.gate{display:grid;place-items:center;min-height:70dvh;text-align:center}.gate .welcome-avatar{margin:0 auto 16px;width:68px;height:68px}.gate p{color:var(--muted);max-width:30ch;margin:6px auto}
body>p[role=status]{position:fixed;z-index:35;left:14px;right:14px;top:calc(10px + env(safe-area-inset-top));max-width:560px;margin:0 auto;padding:12px 14px;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:12px;background:var(--card);color:var(--text);box-shadow:0 8px 24px #0002;font-weight:600;animation:toast-in .22s var(--ease) both}
body>p.error[role=status]{border-left-color:var(--burgundy)}body>p.success[role=status]{border-left-color:var(--gold)}body>p.leaving{animation:toast-out .16s ease-in both}
.scrim{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:24px;background:#080d1699;animation:fade-in .16s ease both}.scrim.leaving{animation:fade-out .14s ease both}
.dialog{width:100%;max-width:340px;padding:20px;border-radius:18px;background:var(--card);color:var(--text);box-shadow:0 20px 50px #0005;animation:dialog-in .22s var(--ease) both}.dialog .row{margin-top:16px}.dialog .row button{flex:1 1 auto}

/* chat */
.chat-person{display:flex;align-items:center;gap:12px;width:100%;margin:8px 0;text-align:left;color:var(--text);background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:12px 14px;font-weight:500}
.chat-person>span:nth-child(2){flex:1;min-width:0;display:grid;gap:2px}.chat-person small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-unread{min-width:24px;padding:3px 8px;border-radius:999px;background:var(--accent);color:#fff;text-align:center;font-size:.74rem}
.chat-thread-header{display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}.chat-thread-header h2{margin:0 0 2px}
.chat-messages{display:flex;flex-direction:column;gap:6px;min-height:160px;max-height:min(52dvh,540px);overflow-y:auto;padding:14px 2px}
.chat-bubble{max-width:84%;padding:9px 13px;border-radius:16px 16px 16px 5px;background:var(--soft);align-self:flex-start;overflow-wrap:anywhere}.chat-bubble.mine{background:var(--accent);color:#fff;align-self:flex-end;border-radius:16px 16px 5px 16px}
.chat-bubble p{margin:0 0 3px;white-space:pre-wrap}.chat-bubble small{opacity:.7;font-size:.66rem;color:inherit}
.chat-compose{display:flex;align-items:flex-end;gap:8px}.chat-compose textarea{flex:1;min-height:48px;max-height:140px}.chat-compose button{min-width:88px}.chat-thread>.secondary{margin-top:10px}

/* bottom tab bar: attached to the bottom edge like native Telegram apps */
nav.app-nav{position:fixed;z-index:30;left:0;right:0;bottom:0;display:flex;padding:6px max(6px,env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));background:var(--nav-bg);border-top:1px solid var(--line)}
nav.app-nav button{position:relative;flex:1 1 0;min-width:0;min-height:52px;padding:6px 2px;flex-direction:column;gap:3px;border-radius:10px;background:transparent;color:var(--muted);font-size:clamp(.58rem,2.5vw,.7rem);font-weight:650;line-height:1.1;white-space:nowrap}
nav.app-nav .ui-icon{width:23px;height:23px}
nav.app-nav button[aria-current=page]{color:var(--accent-ink)}
nav.app-nav button[aria-current=page]::before{content:"";position:absolute;top:-7px;left:28%;right:28%;height:3px;border-radius:0 0 3px 3px;background:var(--gold)}
.nav-dot{position:absolute;top:6px;left:calc(50% + 7px);width:9px;height:9px;border-radius:50%;background:var(--burgundy);border:2px solid var(--nav-bg)}

/* admin */
.admin-head{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:12px 14px;border-radius:var(--r);background:var(--accent);color:#fff}
.admin-head>div:nth-child(2){flex:1;min-width:0}.admin-head strong{display:block;font-size:.98rem}.admin-head small{display:block;margin-top:1px;color:rgba(255,255,255,.8);font-size:.74rem}.admin-head .pill{background:rgba(255,255,255,.2);color:#fff}
.admin-mark{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;flex:none;background:#fff;color:var(--burgundy)}.admin-mark .ui-icon{width:22px;height:22px}
.admin-tabs{display:flex;gap:8px;overflow-x:auto;max-width:100%;padding:2px 0 12px;scrollbar-width:none}.admin-tabs::-webkit-scrollbar{display:none}
.chip{flex:none;min-height:40px;padding:8px 14px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--text);font-size:.8rem;white-space:nowrap}.chip.selected{background:var(--accent);border-color:var(--accent);color:#fff}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.stat{display:flex;flex-direction:column;gap:6px;min-width:0;min-height:96px;margin:0}.stats>.stat:last-child:nth-child(odd){grid-column:1/-1;min-height:0}
.stat b{font-size:1.7rem;line-height:1;color:var(--accent-ink);font-variant-numeric:tabular-nums}.stat small{font-size:.76rem;line-height:1.35}
.admin-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:68px;text-align:left;color:var(--text);background:var(--card);border:1px solid var(--line);font-weight:500}.admin-row>span:first-child{display:grid;gap:3px;min-width:0}.admin-row small{font-size:.78rem}
.pager{justify-content:center;margin:16px 0}.pager button{flex:0 1 auto}

/* optional "Shisha" skin (Profile > Ilova uslubi): bright, cool, frosted surfaces over a soft blue field */
html[data-skin=glass]{--glass:linear-gradient(135deg,rgba(255,255,255,.7),rgba(255,255,255,.38));--glass-edge:rgba(255,255,255,.9)}
html[data-skin=glass][data-theme=dark]{--glass:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.04));--glass-edge:rgba(255,255,255,.16)}
html[data-skin=glass] body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(70% 38% at 12% 0,rgba(110,165,255,.5),transparent 72%),radial-gradient(60% 34% at 100% 36%,rgba(160,205,255,.45),transparent 72%),linear-gradient(180deg,#e4efff,#f4f8ff 55%,#fbfdff)}
html[data-skin=glass][data-theme=dark] body::before{background:radial-gradient(70% 38% at 12% 0,rgba(60,120,255,.4),transparent 72%),radial-gradient(60% 34% at 100% 40%,rgba(50,100,220,.28),transparent 72%),linear-gradient(180deg,#071328,#091a36 60%,#06101f)}
@supports((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
html[data-skin=glass] :is(.card,.hero,.quick-grid,.next-card,.admin-launch,.chat-person,.empty-state,.admin-row,.stat,.dialog,nav.app-nav){background:var(--glass);border-color:var(--glass-edge);-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);box-shadow:0 8px 26px rgba(50,90,160,.12)}
html[data-skin=glass] :is(input,textarea,select){background:rgba(255,255,255,.4)}html[data-skin=glass][data-theme=dark] :is(input,textarea,select){background:rgba(255,255,255,.07)}
}

/* motion: transform/opacity only; page entrance on view change */
@keyframes shimmer{to{transform:translateX(100%)}}@keyframes toast-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}@keyframes toast-out{to{opacity:0;transform:translateY(-8px)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}@keyframes fade-out{to{opacity:0}}@keyframes dialog-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes fillbar{from{transform:scaleX(0)}to{transform:scaleX(var(--s,0))}}
@media(prefers-reduced-motion:no-preference){
#app.enter>*:not(nav){animation:rise .26s var(--ease) both}#app.enter>:nth-child(2){animation-delay:40ms}#app.enter>:nth-child(3){animation-delay:80ms}#app.enter>:nth-child(n+4){animation-delay:120ms}
.meter i{animation:fillbar .6s var(--ease) .1s both}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
@media(min-width:650px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.admin-tabs{flex-wrap:wrap}}
`;
