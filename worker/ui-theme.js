// Brand tokens preserve UWED's diplomatic blue, burgundy and gold, with dark-mode contrast.
export const themeCss = `
:root{--header:#38567e;--burgundy:#8a0019;--gold:#d4af37;--soft:#eaf0f7;--line:#dce4ed;--accent:#38567e;--on-accent:#fff}
html[data-theme=dark]{color-scheme:dark;--bg:#111d2b;--text:#eef3f9;--muted:#a8b5c7;--card:#1a2839;--soft:#273c55;--line:#34465e;--accent:#426b9c;--on-accent:#fff;--header:#2c476b;--shadow:0 12px 30px rgba(0,0,0,.12)}
html[data-theme=dark] select{color-scheme:dark}
.brand-head,.admin-head{display:flex;align-items:center;gap:13px;margin:-18px -16px 24px;padding:22px 18px 23px;border-radius:0 0 25px 25px;background:var(--header);color:#fff;min-height:110px}
.brand-head>div:nth-child(2),.admin-head>div:nth-child(2){min-width:0;flex:1}.brand-head strong,.admin-head strong{font-size:1rem;letter-spacing:-.018em;font-weight:800;display:block}
.brand-head small,.admin-head small{display:block;margin-top:3px;color:#e5edf5;font-size:.72rem;line-height:1.5}
.admin-head{background:linear-gradient(125deg,#38567e,#26436a 65%,#6f1532);border-bottom:3px solid var(--gold)}
.admin-head .pill{background:#ffffff24;border:1px solid #ffffff44;color:#fff;white-space:nowrap}
.admin-mark{width:44px;height:44px;border-radius:15px;display:grid;place-items:center;background:#fff;color:var(--header);flex:0 0 auto}
.admin-mark .ui-icon{width:25px;height:25px}.admin-head .admin-mark{color:var(--burgundy)}
.page-heading{margin:8px 0 16px}.page-heading p{color:var(--muted);font-size:.93rem;margin:0}
.dashboard-welcome{border-radius:23px;padding:22px;background:linear-gradient(135deg,#38567e 0%,#2a4669 72%,#412d54 100%);color:#fff;margin-bottom:24px;position:relative;overflow:hidden}
.dashboard-welcome:after{content:'';position:absolute;right:-28px;top:-45px;width:155px;height:155px;border-radius:50%;border:30px solid #ffffff11}
.dashboard-welcome h1{font-size:1.65rem;color:#fff;margin:7px 0}.dashboard-welcome p{max-width:300px;color:#e6edf5;margin:0}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:.68rem;font-weight:800;color:#d4af37}
.section-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:22px 0 12px}.section-heading h2{margin:0}
.quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.quick-action{background:var(--card);color:var(--text);border:1px solid var(--line);text-align:left;border-radius:18px;padding:16px;min-height:128px;display:flex;flex-direction:column;gap:9px;align-items:flex-start;justify-content:space-between;box-shadow:var(--shadow)}
.quick-action .ui-icon{width:24px;height:24px;color:var(--accent)}.quick-action span{font-size:.96rem;font-weight:800}.quick-action small{font-size:.74rem;color:var(--muted);font-weight:500;line-height:1.4}
.empty-state{display:flex;align-items:flex-start;gap:13px;padding:18px;border:1px dashed var(--line);border-radius:18px;background:var(--card);color:var(--muted);margin:14px 0}
.empty-state .ui-icon{width:26px;height:26px;color:var(--accent)}.empty-state strong{color:var(--text);display:block;font-size:.97rem}.empty-state p{margin:5px 0 0;font-size:.86rem}
.search-form{display:flex;gap:10px;margin:18px 0}.search-form input{flex:1 1 0;min-width:0}.search-form button{padding-inline:17px}
.admin-launch{display:flex;gap:12px;align-items:center;width:100%;background:var(--soft);color:var(--text);text-align:left;border:1px solid var(--line);border-radius:17px;padding:15px;margin:14px 0}
.admin-launch .ui-icon{color:var(--burgundy);width:24px;height:24px}.admin-launch small{display:block;font-size:.75rem;font-weight:500;color:var(--muted);margin-top:3px}
.admin-launch>span:nth-child(2){flex:1}
.profile-intro{display:flex;align-items:center;gap:13px;margin-bottom:18px}.profile-avatar{height:54px;width:54px;border-radius:18px;background:var(--soft);display:grid;place-items:center;color:var(--accent);font-weight:800;font-size:1.3rem}
.profile-intro h1{margin:0}.profile-intro p{margin:4px 0 0;color:var(--muted);font-size:.84rem}
.admin-tabs{display:flex;gap:8px;overflow-x:auto;max-width:100%;padding:3px 0 14px;margin:0 0 5px;scrollbar-width:thin}
.chip{background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:999px;white-space:nowrap;font-size:.79rem;min-height:39px;padding:8px 13px}
.chip.selected{background:var(--accent);color:#fff;border-color:var(--accent)}
.admin-panel main{max-width:860px}.admin-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;background:var(--card);color:var(--text);min-height:72px}.admin-row>span:first-child{min-width:0;display:grid;gap:4px}.admin-row small{font-size:.78rem;color:var(--muted)}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.stat{margin:0;min-width:0;display:flex;flex-direction:column;gap:7px;min-height:110px}.stat b{font-size:1.7rem;color:var(--accent);line-height:1}.stat small{font-size:.74rem;color:var(--muted);line-height:1.35}
.pager{justify-content:center;margin:18px 0}.pager button{flex:0 1 auto}
a{color:var(--accent)}
@media(min-width:650px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.quick-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.admin-tabs{flex-wrap:wrap}}
@media(min-width:780px){.brand-head,.admin-head{margin:-24px -24px 24px;padding:25px 25px 28px}}
@media(max-width:370px){.brand-head small,.admin-head small{font-size:.68rem}.brand-head strong,.admin-head strong{font-size:.93rem}.search-form button{padding-inline:12px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
