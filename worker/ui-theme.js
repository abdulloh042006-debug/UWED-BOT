// UWED Talent Network design system — "UWED26" (owner-approved Oct 2026).
// Token architecture, scales and rules follow the project's Product Design System (semantic color roles, 4px spacing,
// role-based radii, named type styles, 120/200/300ms motion). Palette: Pantone 2026 Cloud Dancer (#F0EEE9) with a warm
// near-black, and one carmine red (#A51C30) as the action colour. Surfaces are frosted glass over the bold big-letter
// "UW / ED / 26" background from the owner's design; text always sits on a glass or solid surface (the hero and page
// and section headings included), with solid fallbacks for browsers without
// backdrop-filter and for prefers-reduced-transparency. System fonts only: the CSP allows no external fonts.
// Status colours are used for status only and are always paired with a word or an icon. No gradients or glow.
const light = `
--background:#f0eee9;--surface:#ffffff;--surface-subtle:#e7e4dd;--surface-inverse:#1f1d1a;--input:#ffffff;
--text-primary:#1f1d1a;--text-secondary:#4a4641;--text-muted:#5c5852;--text-inverse:#f0eee9;
--border:#dad6ce;--border-strong:#7c7770;
--action-primary:#a51c30;--action-primary-hover:#8a1626;--on-action-primary:#ffffff;--action-secondary:#e6e1d8;--focus:#0b57d0;
--accent-text:#a51c30;--accent-mark:#a51c30;--bg-letter:#1f1d1a;--bg-letter-soft:#d3cec4;
--glass:#ffffffa6;--glass-strong:#ffffffb3;--glass-border:#ffffffcc;--glass-hi:inset 0 1.5px 0 #ffffff,0 1px 2px #1f1d1a0f,0 10px 30px #1f1d1a14;
--status-success:#1b6b3a;--status-success-surface:#e2f1e6;--status-warning:#85500a;--status-warning-surface:#fbefd6;
--status-danger:#b3261e;--on-status-danger:#ffffff;--status-danger-surface:#fbe4e1;--status-info:#1f5fa8;--status-info-surface:#e1ecf8;
--overlay:#1f1d1a99;--shadow-sm:0 1px 2px #1f1d1a1f;--shadow-md:0 4px 12px #1f1d1a1f;--shadow-lg:0 12px 32px #1f1d1a29`;
const dark = `
--background:#1c1b19;--surface:#262421;--surface-subtle:#2e2b27;--surface-inverse:#f0eee9;--input:#2e2b27;
--text-primary:#f0eee9;--text-secondary:#bdb7ac;--text-muted:#a39d92;--text-inverse:#1c1b19;
--border:#3a3631;--border-strong:#8c877f;
--action-primary:#a51c30;--action-primary-hover:#bd2a40;--on-action-primary:#ffffff;--action-secondary:#33302b;--focus:#7db1ff;
--accent-text:#ef6b78;--accent-mark:#a51c30;--bg-letter:#f0eee9;--bg-letter-soft:#33302b;
--glass:#1c1b19b8;--glass-strong:#1c1b19d9;--glass-border:#ffffff29;--glass-hi:inset 0 1px 0 #ffffff33,0 10px 30px #00000059;
--status-success:#6fcf8f;--status-success-surface:#12281d;--status-warning:#f0b350;--status-warning-surface:#2b2110;
--status-danger:#ff8a80;--on-status-danger:#2a0a08;--status-danger-surface:#2e1715;--status-info:#8fb9f0;--status-info-surface:#14243a;
--overlay:#000000b3;--shadow-sm:0 1px 2px #00000080;--shadow-md:0 4px 12px #00000099;--shadow-lg:0 12px 32px #000000b3`;

export const themeCss = `
:root{color-scheme:dark;${dark};
--sans:system-ui,-apple-system,"Segoe UI","Noto Sans","Helvetica Neue",Arial,sans-serif;
--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-8:32px;--space-10:40px;--space-12:48px;
--radius-sm:4px;--radius-md:8px;--radius-lg:12px;--radius-xl:16px;--radius-pill:9999px;
--motion-fast:120ms;--motion-normal:200ms;--motion-emphasis:300ms;--ease-standard:cubic-bezier(.2,0,0,1);
--target-min:44px;--nav-w:232px;
/* type scale (named styles): h1=heading-lg on mobile, heading-xl from 768px */
--fs-h1:30px;--lh-h1:38px;--fs-h2:22px;--lh-h2:30px;--fs-h3:18px;--lh-h3:26px;--fs-body:16px;--fs-sm:14px;--fs-caption:12px}
html[data-theme=light]{color-scheme:light;${light}}
html,body{min-height:100%;margin:0}*,*::before,*::after{box-sizing:border-box}
body{background:var(--background);color:var(--text-primary);font-family:var(--sans);font-size:var(--fs-body);line-height:1.5;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;overscroll-behavior-y:contain}
main{width:100%;max-width:640px;margin:0 auto;padding:max(var(--space-4),env(safe-area-inset-top)) max(var(--space-4),env(safe-area-inset-right)) calc(88px + env(safe-area-inset-bottom)) max(var(--space-4),env(safe-area-inset-left));min-height:100dvh}
h1,h2,h3{margin:0 0 var(--space-2);color:var(--text-primary)}
h1{font-size:var(--fs-h1);line-height:var(--lh-h1);font-weight:700;letter-spacing:-.015em}
h2{font-size:var(--fs-h2);line-height:var(--lh-h2);font-weight:600;letter-spacing:-.01em}
h3{font-size:var(--fs-h3);line-height:var(--lh-h3);font-weight:600}
p{margin:var(--space-2) 0 var(--space-3);max-width:68ch}
.muted,.subtext{color:var(--text-muted)}small{font-size:var(--fs-sm);color:var(--text-muted)}a{color:var(--accent-text)}
.sr-only{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ui-icon{display:inline-block;vertical-align:middle;width:20px;height:20px;flex:0 0 auto}

/* focus: 2px solid ring, 2px offset, on every interactive control */
button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:2px}

/* buttons: primary / secondary / outline / danger / icon-only */
button,input,textarea,select{font:inherit}
button{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);min-height:var(--target-min);padding:var(--space-2) var(--space-4);border:1px solid transparent;border-radius:var(--radius-md);background:var(--action-primary);color:var(--on-action-primary);font-size:var(--fs-sm);font-weight:600;line-height:20px;cursor:pointer;transition:background-color var(--motion-fast) var(--ease-standard),transform var(--motion-fast) var(--ease-standard),opacity var(--motion-fast) var(--ease-standard)}
@media(hover:hover){button:hover:not(:disabled){background:var(--action-primary-hover)}}
button:active:not(:disabled){transform:scale(.98)}button:disabled{opacity:.5;cursor:not-allowed}button[aria-busy=true]{cursor:progress}
button .ui-icon{width:18px;height:18px}
.secondary{background:var(--action-secondary);color:var(--text-primary)}
@media(hover:hover){.secondary:hover:not(:disabled){background:var(--border)}}
.outline{background:transparent;color:var(--text-primary);border-color:var(--border-strong)}
.danger{background:var(--status-danger);color:var(--on-status-danger)}
button.small{min-height:var(--target-min);padding:var(--space-1) var(--space-3);font-size:var(--fs-sm)}
.row .small,.section-heading .small{min-width:var(--space-8)}

/* forms: persistent labels, strong control boundaries */
label{display:grid;gap:var(--space-2);font-size:var(--fs-sm);font-weight:500;color:var(--text-primary)}
input,textarea,select{width:100%;min-width:0;min-height:var(--target-min);padding:var(--space-3);border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--input);color:var(--text-primary);font-size:var(--fs-body);font-weight:400;transition:border-color var(--motion-fast) var(--ease-standard)}
input:hover,textarea:hover,select:hover{border-color:var(--text-muted)}
input:focus,textarea:focus,select:focus{border-color:var(--focus)}
input:disabled,textarea:disabled,select:disabled{opacity:.55;cursor:not-allowed}
input[aria-invalid=true],textarea[aria-invalid=true]{border-color:var(--status-danger)}
textarea{resize:vertical;min-height:96px}input[type=checkbox]{width:20px;height:20px;min-height:0;margin-right:var(--space-2);vertical-align:middle;accent-color:var(--accent-text)}input[type=file]{padding:var(--space-2)}
input::placeholder,textarea::placeholder{color:var(--text-muted)}select{color-scheme:dark}html[data-theme=light] select{color-scheme:light}
.stack{display:grid;gap:var(--space-4)}.row{display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center}.row>input{flex:1 1 160px;min-width:0}.row.two{display:grid;grid-template-columns:1fr 1fr}.row.two>label{min-width:0}
.field-error{display:flex;gap:var(--space-2);align-items:center;color:var(--status-danger);font-size:var(--fs-sm)}

/* surfaces: one level of cards, grouped regions are plain sections */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-4);margin:var(--space-3) 0}
.card>h2,.card>h3{margin-bottom:var(--space-2)}.card>p:last-child{margin-bottom:0}.card .row{margin-top:var(--space-3)}
.card.flat{background:transparent;border-style:dashed}
.pill{display:inline-flex;align-items:center;gap:var(--space-1);min-height:24px;padding:0 var(--space-2);border-radius:var(--radius-pill);background:var(--action-secondary);color:var(--text-primary);font-size:var(--fs-caption);font-weight:600;white-space:nowrap}
.pill.ok{background:var(--status-success-surface);color:var(--status-success)}.pill.warn{background:var(--status-warning-surface);color:var(--status-warning)}.pill.bad{background:var(--status-danger-surface);color:var(--status-danger)}.pill.info,.pill.gold{background:var(--status-info-surface);color:var(--status-info)}.pill.mute{background:var(--surface-subtle);color:var(--text-muted)}.pill.bur{background:var(--status-danger);color:var(--on-status-danger)}
.pill .ui-icon{width:12px;height:12px}
.error{color:var(--status-danger)}.success{color:var(--status-success)}

/* page + section headings */
.page-heading{display:flex;align-items:center;gap:var(--space-3);margin:var(--space-2) 0 var(--space-5)}
.page-heading .ph-ic{width:44px;height:44px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--accent-text)}
.page-heading:not(:has(.ph-ic)){flex-direction:column;align-items:flex-start;gap:var(--space-1)}.page-heading h1{margin:0}.page-heading p{margin:var(--space-1) 0 0;color:var(--text-secondary);font-size:var(--fs-sm);line-height:20px}.page-heading>div{min-width:0}
.section-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-2);margin:var(--space-8) 0 var(--space-3)}
.section-heading h2{flex:1 1 auto;min-width:0;margin:0;font-size:var(--fs-h3);line-height:var(--lh-h3)}
.eyebrow{font-size:var(--fs-sm);font-weight:500;color:var(--text-muted)}

/* home */
.hero{display:flex;flex-direction:column;gap:var(--space-2);margin:var(--space-2) 0 var(--space-4)}
.hero-top{display:flex;align-items:center;gap:var(--space-4)}.hero-top small{display:block}.hero h1{margin:0}
.hero-avatar,.welcome-avatar,.match-avatar,.chat-avatar,.profile-avatar{width:48px;height:48px;border-radius:var(--radius-pill);display:grid;place-items:center;flex:none;background:var(--action-secondary);color:var(--text-primary);font-weight:700;font-size:var(--fs-body)}
.hero p{margin:var(--space-1) 0 0;color:var(--text-secondary);font-size:var(--fs-sm);line-height:20px}
.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3);margin:0 0 var(--space-4)}
.metric{flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:var(--space-1);min-height:96px;padding:var(--space-3);border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);color:var(--text-primary);text-align:left;font-weight:400}
.metric .ui-icon{width:20px;height:20px;color:var(--accent-text)}
.metric b{font-size:var(--fs-h2);line-height:var(--lh-h2);font-weight:700;font-variant-numeric:tabular-nums}.metric span{font-size:var(--fs-caption);line-height:16px;color:var(--text-muted)}
@media(hover:hover){.metric:hover:not(:disabled){background:var(--surface-subtle)}}
.quick-grid{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.quick-action{display:grid;grid-template-columns:40px 1fr 16px;grid-template-rows:auto auto;column-gap:var(--space-3);align-items:center;width:100%;min-height:64px;padding:var(--space-3) var(--space-4);border-radius:0;background:transparent;color:var(--text-primary);text-align:left;font-weight:400}
.quick-action+.quick-action{border-top:1px solid var(--border)}
.quick-action .ui-icon{grid-row:1/3;width:40px;height:40px;padding:var(--space-2);border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--accent-text)}
.quick-action span{align-self:end;font-size:var(--fs-body);font-weight:600}.quick-action small{align-self:start}
.quick-action::after{content:"";grid-column:3;grid-row:1/3;width:8px;height:8px;border-top:2px solid var(--text-muted);border-right:2px solid var(--text-muted);transform:rotate(45deg)}
@media(hover:hover){.quick-action:hover:not(:disabled){background:var(--surface-subtle)}}
.next-card,.admin-launch{display:flex;align-items:center;gap:var(--space-3);width:100%;margin:var(--space-3) 0;padding:var(--space-3) var(--space-4);text-align:left;color:var(--text-primary);font-weight:400;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg)}
.next-card>.ui-icon:first-child,.admin-launch>.ui-icon:first-child{width:40px;height:40px;padding:var(--space-2);border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--accent-text)}
.next-card>.ui-icon:last-child,.admin-launch>.ui-icon:last-child{margin-left:auto;color:var(--text-muted)}
.next-card span,.admin-launch>span:nth-child(2){display:grid;gap:2px;min-width:0;flex:1}.next-card strong,.admin-launch strong{font-size:var(--fs-body);font-weight:600}.next-card em{font-style:normal;color:var(--text-muted);font-size:var(--fs-sm)}
.next-card.alert>.ui-icon:first-child{background:var(--status-warning-surface);color:var(--status-warning)}
.admin-launch small{display:block}
@media(hover:hover){.next-card:hover:not(:disabled),.admin-launch:hover:not(:disabled){background:var(--surface-subtle)}}
.empty-state{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-4);margin:var(--space-3) 0;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);color:var(--text-secondary)}
.empty-state .ui-icon{width:40px;height:40px;padding:var(--space-2);border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--accent-text)}.empty-state strong{display:block;color:var(--text-primary)}.empty-state p{margin:var(--space-1) 0 0;font-size:var(--fs-sm)}
.search-form{display:flex;gap:var(--space-2);margin:0 0 var(--space-3)}.search-form input{flex:1 1 0}.search-form button{flex:none}
.toolbar{display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;margin:0 0 var(--space-4)}.toolbar select{flex:1 1 150px;width:auto}
.toggle{display:inline-flex;align-items:center;gap:var(--space-2);min-height:var(--target-min);padding:0 var(--space-3);border:1px solid var(--border-strong);border-radius:var(--radius-md);background:transparent;color:var(--text-primary);font-size:var(--fs-sm);font-weight:500}
.toggle[aria-pressed=true]{background:var(--action-secondary);border-color:var(--accent-text)}
.toggle[aria-pressed=true]::before{content:"✓";font-weight:700;color:var(--accent-text)}
.note-card{position:relative}.note-card.unread{background:var(--surface-subtle)}.note-card.unread::before{content:attr(data-new);display:table;margin-bottom:var(--space-2);padding:0 var(--space-2);border-radius:var(--radius-pill);background:var(--action-primary);color:var(--on-action-primary);font-size:var(--fs-caption);font-weight:600}
.note-time{display:block;margin-top:var(--space-2)}

/* profile */
.profile-intro{display:flex;align-items:center;gap:var(--space-3);margin:var(--space-2) 0 var(--space-4)}.profile-avatar .ui-icon{width:24px;height:24px}
.profile-intro h1{margin:0}.profile-intro p{margin:var(--space-1) 0 0;color:var(--text-secondary);font-size:var(--fs-sm)}
.completeness{display:grid;gap:var(--space-2)}.completeness header{display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-2)}.completeness b{font-variant-numeric:tabular-nums}
.progress{height:6px;border-radius:var(--radius-pill);background:var(--surface-subtle);overflow:hidden}.progress i{display:block;width:100%;height:100%;border-radius:var(--radius-pill);background:var(--action-primary);transform-origin:left;transform:scaleX(var(--s,0))}
.todo{display:flex;flex-wrap:wrap;gap:var(--space-2)}.todo .pill{background:var(--surface-subtle);color:var(--text-secondary)}
.details-card>summary,.fold>summary{display:flex;align-items:center;gap:var(--space-3);min-height:32px;list-style:none;cursor:pointer;font-weight:600}.details-card>summary::-webkit-details-marker,.fold>summary::-webkit-details-marker{display:none}.details-card>summary::after,.fold>summary::after{content:"";margin-left:auto;width:8px;height:8px;border-right:2px solid var(--text-muted);border-bottom:2px solid var(--text-muted);transform:rotate(45deg);transition:transform var(--motion-normal) var(--ease-standard)}.details-card[open]>summary::after,.fold[open]>summary::after{transform:rotate(-135deg)}.details-card>summary .ui-icon,.fold>summary .ui-icon{color:var(--accent-text)}.fold{border-top:1px solid var(--border);padding-top:var(--space-3)}.fold[open]>summary{margin-bottom:var(--space-3)}.details-card[open]>summary{margin-bottom:var(--space-4)}
.chips{display:flex;flex-wrap:wrap;gap:var(--space-2);margin:var(--space-2) 0 var(--space-3)}
.skill-chip{display:inline-flex;align-items:center;min-height:32px;padding:0 var(--space-3);border-radius:var(--radius-sm);background:var(--action-secondary);color:var(--text-primary);font-size:var(--fs-sm);font-weight:500}
.skill-chip:has(.chip-x){padding-right:0}.skill-chip.pending{background:var(--status-warning-surface);color:var(--text-primary);border:1px dashed var(--status-warning)}.chip-note{display:inline-flex;align-items:center;gap:2px;margin-left:var(--space-2);font-size:var(--fs-caption);color:var(--status-warning)}.chip-note .ui-icon{width:12px;height:12px}.skill-review{padding:var(--space-2) 0;border-top:1px solid var(--border)}.skill-chip.static{min-height:28px}.skill-chip.quiet{background:var(--surface-subtle);color:var(--text-secondary)}
.chip-x{min-height:var(--target-min);width:var(--target-min);margin:-6px 0;padding:0;border-radius:var(--radius-md);background:transparent;color:var(--text-muted);font-size:20px;line-height:1}
@media(hover:hover){.chip-x:hover:not(:disabled){background:transparent;color:var(--status-danger)}}
h3.mini{margin:var(--space-3) 0 var(--space-1);font-size:var(--fs-sm);line-height:20px;font-weight:600;color:var(--text-secondary)}.skills-card .row{margin-top:var(--space-3)}.skills-card .row>input{flex:1 1 100%}.skills-card .row>select{flex:1 1 140px;width:auto}.skills-card .row>button{flex:0 0 auto}
.week{display:grid;margin:var(--space-2) 0 var(--space-4)}.week-row{display:grid;grid-template-columns:44px 1fr;gap:var(--space-2);align-items:center;padding:var(--space-1) 0;border-bottom:1px solid var(--border)}.week-row:last-child{border-bottom:0}
.week-row b{font-size:var(--fs-sm);font-weight:600;color:var(--text-secondary)}.week-row .chips{margin:0;min-height:40px;align-items:center}
.link-row{margin:var(--space-3) 0}.link-row button{flex:1 1 130px}
.seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:var(--space-1);padding:var(--space-1);border-radius:var(--radius-md);background:var(--surface-subtle);margin-top:var(--space-3)}
.seg button{background:transparent;color:var(--text-secondary);min-height:40px;border-radius:var(--radius-sm)}
.seg button[aria-pressed=true]{background:var(--surface);color:var(--text-primary);box-shadow:var(--shadow-sm)}

label.check{display:flex;align-items:center;gap:var(--space-2);min-height:var(--target-min);font-weight:400}
.or{text-align:center;margin:0}.back .ui-icon{transform:rotate(180deg)}.back{width:auto}
.line{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);flex-wrap:wrap}.line>span{display:flex;align-items:center;gap:var(--space-2);min-width:0;overflow-wrap:anywhere}
.loading-cards{display:grid;gap:var(--space-3)}
/* compact profile + settings */
.profile-head{display:grid;gap:var(--space-4);margin-top:var(--space-2)}.profile-id{display:flex;align-items:center;gap:var(--space-3)}.profile-id>div{flex:1;min-width:0}.profile-id h1{margin:0 0 var(--space-1);font-size:var(--fs-h2);line-height:var(--lh-h2);overflow-wrap:anywhere}
.icon-btn{flex:none;width:var(--target-min);padding:0}.icon-btn .ui-icon{width:20px;height:20px}
.profile-head .completeness{gap:var(--space-1)}.profile-head .completeness header{font-size:var(--fs-sm);color:var(--text-secondary)}
.about p{margin-top:0}.about .fold{margin-top:var(--space-3)}
.settings{padding:0}.setting{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);min-height:56px;padding:var(--space-3) var(--space-4);font-weight:400}
.setting+.setting{border-top:1px solid var(--border)}.setting>span:first-child{display:grid;gap:2px;min-width:0}.setting b{font-weight:600}.setting small{line-height:18px}
.setting.col{flex-direction:column;align-items:stretch;gap:var(--space-3)}
.switch{appearance:none;-webkit-appearance:none;flex:none;position:relative;width:48px;height:28px;min-height:0;margin:0;padding:0;border:1px solid var(--border-strong);border-radius:var(--radius-pill);background:var(--surface-subtle);cursor:pointer;transition:background-color var(--motion-normal) var(--ease-standard)}
.switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:var(--radius-pill);background:var(--text-secondary);transition:transform var(--motion-normal) var(--ease-standard),background-color var(--motion-normal) var(--ease-standard)}
.switch:checked{background:var(--action-primary);border-color:var(--accent-text)}.switch:checked::after{transform:translateX(20px);background:var(--on-action-primary)}
.switch:hover{border-color:var(--text-muted)}
.splash{min-height:80dvh;display:grid;place-content:center;justify-items:center;gap:var(--space-4);text-align:center;color:var(--text-primary)}
.splash-mark{display:block;border-radius:18px;box-shadow:var(--shadow-md)}.splash-mark .logo-mark{width:80px;height:80px;padding-left:15px;border-radius:18px;font-size:34px}
.splash b{font-size:var(--fs-h3);font-weight:700}
.splash-bar{display:block;position:relative;width:120px;height:4px;border-radius:var(--radius-pill);background:var(--surface-subtle);overflow:hidden}
.splash-bar::after{content:"";position:absolute;inset:0;width:40%;border-radius:inherit;background:var(--action-primary);animation:splash 1s var(--ease-standard) infinite}
@keyframes splash{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
/* onboarding */
.steps{list-style:none;display:flex;gap:var(--space-2);margin:var(--space-1) 0 var(--space-5);padding:0}
.steps li{flex:1;display:grid;gap:var(--space-1);justify-items:center;text-align:center;font-size:var(--fs-caption);font-weight:500;color:var(--text-muted);position:relative}
.steps li::before{content:"";position:absolute;top:14px;left:calc(-50% + 18px);right:calc(50% + 18px);height:2px;background:var(--border)}
.steps li:first-child::before{display:none}.steps li.done::before,.steps li.on::before{background:var(--action-primary)}
.steps i{font-style:normal;width:28px;height:28px;border-radius:var(--radius-pill);display:grid;place-items:center;background:var(--surface-subtle);color:var(--text-secondary);font-size:var(--fs-caption);font-weight:700;position:relative;z-index:1}.steps i .ui-icon{width:14px;height:14px}
.steps li.on i,.steps li.done i{background:var(--action-primary);color:var(--on-action-primary)}.steps li.on{color:var(--text-primary)}
.onb-actions{display:flex;gap:var(--space-3);margin-top:var(--space-3)}.onb-actions button{flex:1}

/* partner, session, project, mentor cards */
.cards-grid{display:grid;gap:var(--space-3)}.cards-grid>.card{margin:0}
.match-top{display:flex;align-items:flex-start;gap:var(--space-3)}.match-top>div{min-width:0}.match-top h2{margin:0 0 var(--space-1);font-size:var(--fs-h3);line-height:var(--lh-h3);overflow-wrap:anywhere}
.match-avatar{width:48px;height:48px}.match-avatar .ui-icon{width:22px;height:22px}
.match-meta{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.score{display:grid;gap:var(--space-1);margin:var(--space-3) 0}.score header{display:flex;justify-content:space-between;font-size:var(--fs-sm);color:var(--text-secondary)}.score b{color:var(--text-primary);font-variant-numeric:tabular-nums}
.meter{height:4px;border-radius:var(--radius-pill);background:var(--surface-subtle);overflow:hidden}.meter i{display:block;height:100%;border-radius:var(--radius-pill);background:var(--action-primary);transform-origin:left;transform:scaleX(var(--s,0))}
.bio{margin:var(--space-2) 0;color:var(--text-secondary);font-size:var(--fs-sm);line-height:20px}
.reason{display:flex;gap:var(--space-2);margin:var(--space-3) 0 0;padding:var(--space-3);border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-secondary);font-size:var(--fs-sm);line-height:20px}.reason .ui-icon{width:18px;height:18px;color:var(--accent-text);margin-top:1px}
.match-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);margin-top:var(--space-4)}.match-actions .primary{grid-column:1/-1}.match-actions>button{min-width:0;padding-left:var(--space-2);padding-right:var(--space-2);text-align:center}
.session-card>*+*{margin-top:var(--space-3)}.session-card>p{margin-bottom:0}.session-card form button{width:100%}
.session-card .match-top .pill,.project-card .match-top .pill{margin-left:auto}
.facts{display:grid;gap:var(--space-2);margin:var(--space-3) 0 0;padding:0;list-style:none}.facts li{display:flex;gap:var(--space-2);align-items:center;color:var(--text-secondary);font-size:var(--fs-sm)}.facts .ui-icon{width:18px;height:18px;color:var(--text-muted)}
.actions{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-4)}.actions>button{flex:1 1 140px}
.group-title{display:flex;align-items:center;gap:var(--space-2);margin:var(--space-6) 0 var(--space-2);font-size:var(--fs-sm);font-weight:600;color:var(--text-secondary)}
.project-card>button{margin-top:var(--space-2)}

/* states: skeleton, error, gate */
.sk{display:block;position:relative;overflow:hidden;border-radius:var(--radius-md);background:var(--surface-subtle)}.sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,var(--border),transparent);animation:shimmer 1.2s linear infinite}
.state-error{border-color:var(--status-danger);background:var(--status-danger-surface)}.state-error h2{color:var(--status-danger)}.state-error p{color:var(--text-secondary)}
.gate{display:grid;place-items:center;min-height:70dvh;text-align:center}.gate .welcome-avatar{margin:0 auto var(--space-4);width:64px;height:64px}.gate p{color:var(--text-secondary);max-width:30ch;margin:var(--space-2) auto}

/* toast + dialog */
body>p[role=status]{position:fixed;z-index:500;left:var(--space-4);right:var(--space-4);top:calc(var(--space-3) + env(safe-area-inset-top));max-width:560px;margin:0 auto;padding:var(--space-3) var(--space-4);border:1px solid var(--border-strong);border-radius:var(--radius-lg);background:var(--surface);color:var(--text-primary);box-shadow:var(--shadow-md);font-size:var(--fs-sm);font-weight:500;animation:toast-in var(--motion-normal) var(--ease-standard) both}
body>p.error[role=status]{background:var(--status-danger-surface);color:var(--status-danger);border-color:var(--status-danger)}body>p.success[role=status]{background:var(--status-success-surface);color:var(--status-success);border-color:var(--status-success)}body>p.leaving{animation:toast-out var(--motion-fast) ease-in both}
.scrim{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:var(--space-6);background:var(--overlay);animation:fade-in var(--motion-fast) ease both}.scrim.leaving{animation:fade-out var(--motion-fast) ease both}
.dialog{width:100%;max-width:360px;max-height:90dvh;overflow:auto;padding:var(--space-5);border-radius:var(--radius-xl);background:var(--surface);color:var(--text-primary);box-shadow:var(--shadow-lg);animation:dialog-in var(--motion-emphasis) var(--ease-standard) both}.dialog h2{font-size:var(--fs-h3);line-height:var(--lh-h3)}.dialog .row{margin-top:var(--space-5)}.dialog .row button{flex:1 1 auto}

/* chat */
.chat-person{display:flex;align-items:center;gap:var(--space-3);width:100%;margin:var(--space-2) 0;text-align:left;color:var(--text-primary);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-3) var(--space-4);font-weight:400}
@media(hover:hover){.chat-person:hover:not(:disabled){background:var(--surface-subtle)}}
.chat-person>span:nth-child(2){flex:1;min-width:0;display:grid;gap:2px}.chat-person b{font-weight:600}.chat-person small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chat-person>.ui-icon:last-child{color:var(--text-muted)}
.chat-unread{min-width:24px;padding:2px var(--space-2);border-radius:var(--radius-pill);background:var(--action-primary);color:var(--on-action-primary);text-align:center;font-size:var(--fs-caption)}
.chat-thread-header{display:flex;align-items:center;gap:var(--space-3);padding-bottom:var(--space-3);border-bottom:1px solid var(--border)}.chat-thread-header h2{margin:0;font-size:var(--fs-h3);line-height:var(--lh-h3)}
.chat-messages{display:flex;flex-direction:column;gap:var(--space-2);min-height:200px;max-height:min(56dvh,560px);overflow-y:auto;padding:var(--space-4) 0}
.chat-bubble{max-width:82%;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);background:var(--surface-subtle);color:var(--text-primary);align-self:flex-start;overflow-wrap:anywhere}.chat-bubble.mine{background:var(--action-primary);color:var(--on-action-primary);align-self:flex-end;border-radius:var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)}
.chat-bubble p{margin:0 0 var(--space-1);white-space:pre-wrap}.chat-bubble small{font-size:var(--fs-caption);color:inherit;opacity:.8}
.chat-compose{display:flex;align-items:flex-end;gap:var(--space-2)}.chat-compose textarea{flex:1;min-height:var(--target-min);max-height:140px}.chat-compose button{min-width:96px}.chat-thread>.secondary{margin-top:var(--space-3)}

/* navigation: bottom tab bar on phones, side rail on wide screens */
nav.app-nav{position:fixed;z-index:100;left:0;right:0;bottom:0;display:flex;padding:var(--space-1) max(var(--space-1),env(safe-area-inset-right)) calc(var(--space-1) + env(safe-area-inset-bottom)) max(var(--space-1),env(safe-area-inset-left));background:var(--surface);border-top:1px solid var(--border)}
nav.app-nav button{position:relative;flex:1 1 0;min-width:0;min-height:52px;padding:var(--space-1) 2px;flex-direction:column;gap:2px;border-radius:var(--radius-md);background:transparent;color:var(--text-muted);font-size:var(--fs-caption);font-weight:600;line-height:16px;white-space:nowrap}
nav.app-nav .ui-icon{width:22px;height:22px}nav.app-nav button span{max-width:100%;overflow:hidden;text-overflow:ellipsis}
@media(hover:hover){nav.app-nav button:hover:not(:disabled){background:var(--surface-subtle);color:var(--text-primary)}}
nav.app-nav button[aria-current=page]{color:var(--accent-text)}
nav.app-nav button[aria-current=page]::before{content:"";position:absolute;top:-5px;left:30%;right:30%;height:3px;border-radius:0 0 var(--radius-sm) var(--radius-sm);background:var(--action-primary)}
nav.app-nav button[aria-current=page]{font-weight:700}
.nav-dot{position:absolute;top:var(--space-1);left:calc(50% + 6px);width:10px;height:10px;border-radius:var(--radius-pill);background:var(--status-danger);border:2px solid var(--surface)}

/* admin */
.admin-head{display:flex;align-items:center;gap:var(--space-3);margin:0 0 var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface)}
.admin-head>div:nth-child(2){flex:1;min-width:0}.admin-head strong{display:block;font-size:var(--fs-body)}.admin-head small{display:block}.admin-head .pill{background:var(--action-secondary);color:var(--text-primary)}
.admin-mark{width:40px;height:40px;border-radius:var(--radius-md);display:grid;place-items:center;flex:none;background:var(--action-primary);color:var(--on-action-primary)}.admin-mark .ui-icon{width:22px;height:22px}
.admin-tabs{display:flex;gap:var(--space-2);overflow-x:auto;max-width:100%;padding:2px 0 var(--space-3);scrollbar-width:none}.admin-tabs::-webkit-scrollbar{display:none}
.chip{flex:none;min-height:40px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-strong);border-radius:var(--radius-md);background:transparent;color:var(--text-primary);font-size:var(--fs-sm);font-weight:500;white-space:nowrap}.chip.selected{background:var(--action-secondary);border-color:var(--accent-text)}.chip.selected::before{content:"✓";margin-right:var(--space-1);color:var(--accent-text)}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}.stat{display:flex;flex-direction:column;gap:var(--space-2);min-width:0;min-height:96px;margin:0}.stats>.stat:last-child:nth-child(odd){grid-column:1/-1;min-height:0}
.stat b{font-size:var(--fs-h2);line-height:var(--lh-h2);font-variant-numeric:tabular-nums}.stat small{line-height:20px}
.admin-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);width:100%;min-height:68px;text-align:left;color:var(--text-primary);background:var(--surface);border:1px solid var(--border);font-weight:400}.admin-row>span:first-child{display:grid;gap:2px;min-width:0}
@media(hover:hover){.admin-row:hover:not(:disabled){background:var(--surface-subtle)}}
.pager{justify-content:center;margin:var(--space-4) 0}.pager button{flex:0 1 auto}

/* motion: opacity/transform only; entrance on view change */
@keyframes shimmer{to{transform:translateX(100%)}}@keyframes toast-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}@keyframes toast-out{to{opacity:0;transform:translateY(-8px)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}@keyframes fade-out{to{opacity:0}}@keyframes dialog-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes fillbar{from{transform:scaleX(0)}to{transform:scaleX(var(--s,0))}}
@media(prefers-reduced-motion:no-preference){
#app.enter>*:not(nav){animation:rise var(--motion-normal) var(--ease-standard) both}#app.enter>:nth-child(2){animation-delay:40ms}#app.enter>:nth-child(n+3){animation-delay:80ms}
.meter i{animation:fillbar var(--motion-emphasis) var(--ease-standard) .1s both}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

@media(max-width:360px){nav.app-nav button{font-size:10.5px;letter-spacing:-.02em;padding-left:0;padding-right:0}main{padding-left:var(--space-3);padding-right:var(--space-3)}}
/* breakpoints: tablet (768) and desktop (900): side rail + wider content */
@media(min-width:768px){:root{--fs-h1:40px;--lh-h1:46px}.card{padding:var(--space-6)}.cards-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.admin-tabs{flex-wrap:wrap}main{max-width:960px}}
@media(min-width:900px){
body{padding-left:var(--nav-w)}
nav.app-nav{top:0;right:auto;width:var(--nav-w);flex-direction:column;gap:var(--space-1);padding:var(--space-4) var(--space-3);border-top:0;border-right:1px solid var(--border)}
nav.app-nav button{flex:0 0 auto;flex-direction:row;justify-content:flex-start;gap:var(--space-3);min-height:var(--target-min);padding:var(--space-2) var(--space-3);font-size:var(--fs-sm)}
nav.app-nav button[aria-current=page]{background:var(--action-secondary)}
nav.app-nav button[aria-current=page]::before{top:10px;bottom:10px;left:0;right:auto;width:3px;height:auto;border-radius:0 var(--radius-sm) var(--radius-sm) 0}
.nav-dot{top:12px;left:28px}
main{padding-bottom:var(--space-8)}
}

/* UWED26: big-letter background + frosted glass surfaces */
.bg-mark{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;user-select:none;font-weight:900;letter-spacing:-.06em;line-height:.85;color:var(--bg-letter)}
.bg-mark span{position:absolute;white-space:nowrap;font-size:min(68vw,300px)}
.bg-mark span:nth-child(1){left:-3.5%;top:8%}.bg-mark span:nth-child(2){left:10%;top:36%}.bg-mark span:nth-child(3){left:-2.5%;top:64%;color:var(--bg-letter-soft)}
.bg-mark i{font-style:normal;color:var(--accent-mark)}
.card,.quick-grid,.next-card,.admin-launch,.metric,.empty-state,.hero,.page-heading,.section-heading,.splash,.gate>div{background:var(--glass);border-color:var(--glass-border);box-shadow:var(--glass-hi);-webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%)}
.hero,.page-heading,.splash,.gate>div{padding:var(--space-4) var(--space-5);border:1px solid var(--glass-border);border-radius:var(--radius-xl)}
.splash{min-height:0;margin:20dvh auto 0;width:max-content;max-width:100%;padding:var(--space-8) var(--space-6)}
.section-heading{padding:var(--space-2) var(--space-4);border:1px solid var(--glass-border);border-radius:var(--radius-xl)}
.card.flat{background:var(--glass)}
nav.app-nav{background:var(--glass-strong);border-color:var(--glass-border);-webkit-backdrop-filter:blur(28px) saturate(180%);backdrop-filter:blur(28px) saturate(180%)}
/* UW/ED monogram, drawn as text exactly like the owner's logo board: two rows, ED indented, red W */
.logo-mark{display:inline-flex;flex-direction:column;justify-content:center;flex:none;width:2.6em;height:2.6em;padding-left:.55em;border-radius:var(--radius-pill);background:var(--surface-inverse);color:var(--text-inverse);font-size:20px;font-weight:900;letter-spacing:-.07em;line-height:.8}
.logo-mark b{display:block;font-weight:inherit}.logo-mark b+b{padding-left:.25em}.logo-mark i{font-style:normal;color:var(--action-primary)}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.card,.quick-grid,.next-card,.admin-launch,.metric,.empty-state,.card.flat,.hero,.page-heading,.section-heading,.splash,.gate>div{background:var(--surface)}nav.app-nav{background:var(--surface)}}
@media(prefers-reduced-transparency:reduce){.card,.quick-grid,.next-card,.admin-launch,.metric,.empty-state,.card.flat,.hero,.page-heading,.section-heading,.splash,.gate>div,nav.app-nav{background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none}.bg-mark{display:none}}
`;
