export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Spline+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500;600&display=swap');

:root{
  --deep:#081C28; --water:#0E2A3A; --panel:#10303F; --line:rgba(233,241,239,.10);
  --foam:#E9F1EF; --dim:rgba(233,241,239,.62); --faint:rgba(233,241,239,.38);
  --sand:#D9C8A7; --lamp:#F5A93C; --reef:#3BA388; --coral:#D2654F;
}
.snr{min-height:100vh;background:radial-gradient(1100px 600px at 50% -180px,#11394C 0%,var(--deep) 58%) fixed;color:var(--foam);font-family:'Spline Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.snr *{box-sizing:border-box}
.shell{max-width:480px;margin:0 auto;padding:18px 14px 104px}
.eyebrow{font-family:'Spline Sans Mono',monospace;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--sand);opacity:.85}
.h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:30px;line-height:1.05;margin:4px 0 2px}
.h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:17px;margin:0 0 10px}
.sub{color:var(--dim);font-size:13px;line-height:1.45;margin:0}
.card{background:linear-gradient(180deg,rgba(233,241,239,.03),rgba(233,241,239,0)) ,var(--panel);border:1px solid var(--line);border-radius:18px;padding:16px;margin:14px 0}
.mono{font-family:'Spline Sans Mono',monospace}
.num{font-family:'Spline Sans Mono',monospace;font-variant-numeric:tabular-nums}
.row{display:flex;align-items:center;gap:10px}
.between{display:flex;align-items:center;justify-content:space-between;gap:10px}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:12px;color:var(--dim);background:rgba(233,241,239,.03)}
.chip.on{color:var(--deep);background:var(--lamp);border-color:var(--lamp);font-weight:600}
.chip.ok{color:var(--reef);border-color:rgba(59,163,136,.5)}
.chip.warn{color:var(--coral);border-color:rgba(210,101,79,.5)}
.seg{display:flex;gap:6px;flex-wrap:wrap}
.seg button{border:1px solid var(--line);background:rgba(233,241,239,.04);color:var(--dim);border-radius:10px;padding:7px 11px;font-size:12.5px;font-family:inherit;cursor:pointer}
.seg button.on{background:var(--lamp);border-color:var(--lamp);color:var(--deep);font-weight:600}
.btn{border:1px solid var(--line);background:rgba(233,241,239,.05);color:var(--foam);border-radius:12px;padding:9px 13px;font-size:13px;font-family:inherit;cursor:pointer}
.btn.primary{background:var(--lamp);border-color:var(--lamp);color:var(--deep);font-weight:700}
.btn:focus-visible,.seg button:focus-visible,.tabbar button:focus-visible{outline:2px solid var(--lamp);outline-offset:2px}
select,input[type=text],input[type=number],textarea{background:rgba(8,28,40,.7);border:1px solid var(--line);color:var(--foam);border-radius:10px;padding:8px 10px;font-family:inherit;font-size:13px;width:100%}
input[type=range]{width:100%;accent-color:var(--lamp)}
.label{font-size:11px;color:var(--faint);letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;font-family:'Spline Sans Mono',monospace}
.scorebig{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:58px;line-height:1}
.band{font-size:12px;font-weight:600;letter-spacing:.06em}
.tabbar{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(480px,100%);display:grid;grid-template-columns:repeat(5,1fr);background:rgba(8,28,40,.88);backdrop-filter:blur(12px);border-top:1px solid var(--line);padding:8px 6px calc(10px + env(safe-area-inset-bottom));z-index:30}
.tabbar button{background:none;border:none;color:var(--faint);font-family:inherit;font-size:10.5px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0;cursor:pointer;letter-spacing:.04em}
.tabbar button.on{color:var(--lamp)}
.tabbar svg{width:21px;height:21px}
.hairline{height:1px;background:var(--line);margin:12px 0}
.spotrow{border-top:1px solid var(--line);padding:12px 2px;cursor:pointer}
.spotrow:first-of-type{border-top:none}
.pill{font-size:10.5px;border-radius:6px;padding:2px 7px;background:rgba(233,241,239,.07);color:var(--dim);font-family:'Spline Sans Mono',monospace;letter-spacing:.04em}
.tip{display:flex;gap:9px;font-size:13px;color:var(--dim);line-height:1.45;padding:7px 0;border-top:1px solid var(--line)}
.tip:first-of-type{border-top:none}
.tip b{color:var(--foam);font-weight:600}
.tipdot{flex:none;width:7px;height:7px;border-radius:99px;background:var(--lamp);margin-top:6px}
.note{font-size:11.5px;color:var(--faint);line-height:1.5}
.fade{animation:fade .45s ease both}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.drawpath{stroke-dasharray:900;stroke-dashoffset:900;animation:draw 1.1s .15s ease-out forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.needle{animation:needledrop .7s .4s cubic-bezier(.2,.9,.3,1.3) both}
@keyframes needledrop{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
.pulse{animation:pulse 2.2s ease-out infinite}
@keyframes pulse{0%{opacity:.9;r:5}70%{opacity:0;r:14}100%{opacity:0;r:14}}
.flowline{stroke-dasharray:7 6;animation:flow 1.6s linear infinite}
@keyframes flow{to{stroke-dashoffset:-13}}
.flowslow{stroke-dasharray:5 7;animation:flow 2.8s linear infinite}
.bob{animation:bob 2.6s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
.swim{animation:swim 5s ease-in-out infinite}
@keyframes swim{0%,100%{transform:translateX(0)}50%{transform:translateX(9px)}}
.swimr{animation:swimr 6s ease-in-out infinite}
@keyframes swimr{0%,100%{transform:translateX(0)}50%{transform:translateX(-11px)}}
.spin{transform-origin:center;animation:spin 9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.risewater{animation:rise 7s ease-in-out infinite alternate}
@keyframes rise{from{transform:translateY(0)}to{transform:translateY(-16px)}}
.wavemove{animation:wavemove 4.5s linear infinite}
@keyframes wavemove{to{transform:translateX(-46px)}}
.shimmer{animation:shimmer 6s ease-in-out infinite alternate}
@keyframes shimmer{from{opacity:.25}to{opacity:.55}}
@media (prefers-reduced-motion: reduce){
  .drawpath,.needle,.pulse,.flowline,.flowslow,.bob,.swim,.swimr,.spin,.risewater,.wavemove,.shimmer,.fade{animation:none}
  .drawpath{stroke-dashoffset:0}
}
`;
