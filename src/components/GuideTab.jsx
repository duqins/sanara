import { useState } from "react";
import { TERRAINS } from "../data/terrains.js";
import { TECHNIQUES } from "../data/tackle.js";
import { Fish } from "./bits.jsx";

function TerrainScene({ id }) {
  const lbl = { fontFamily: "Spline Sans Mono", fontSize: 8, fill: "var(--faint)" };
  return (
    <svg viewBox="0 0 340 180" style={{ width: "100%", display: "block", borderRadius: 12, background: "var(--deep)" }}
      role="img" aria-label={id + " cross-section"}>
      {id === "bridge" && (
        <g>
          <rect x="0" y="58" width="340" height="122" fill="#0F3146" />
          <rect x="0" y="58" width="340" height="12" fill="#000" opacity=".22" />
          <line x1="0" y1="58" x2="340" y2="58" stroke="var(--foam)" opacity=".35" strokeWidth="1.2" />
          <rect x="0" y="10" width="340" height="12" fill="#1A3D4F" stroke="var(--line)" />
          <rect x="86" y="22" width="16" height="132" fill="#16384A" stroke="rgba(217,200,167,.3)" />
          <rect x="206" y="22" width="16" height="132" fill="#16384A" stroke="rgba(217,200,167,.3)" />
          <circle cx="160" cy="16" r="3" fill="var(--lamp)" />
          <polygon points="160,18 128,58 192,58" fill="var(--lamp)" opacity=".10" />
          <ellipse cx="160" cy="60" rx="34" ry="5" fill="var(--lamp)" opacity=".2" className="shimmer" />
          {[84, 106, 128].map(y => (
            <path key={y} d={`M14,${y} H64 l-6,-4 m6,4 l-6,4`} stroke="var(--sand)" strokeWidth="1.3"
              fill="none" className="flowline" />
          ))}
          <circle cx="244" cy="100" r="15" fill="none" stroke="var(--lamp)" strokeDasharray="4 5" className="flowslow" opacity=".8" />
          <Fish x={236} y={97} cls="swim" />
          <Fish x={132} y={72} cls="swimr" flip color="var(--lamp)" />
          <Fish x={104} y={142} cls="swim" s={0.8} />
          <text x="20" y="78" {...lbl}>FLOW</text>
          <text x="226" y="128" {...lbl}>EDDY</text>
          <text x="236" y="70" {...lbl}>SHADOW LINE</text>
        </g>
      )}
      {id === "breakwater" && (
        <g>
          <rect x="0" y="62" width="340" height="118" fill="#0F3146" />
          <line x1="95" y1="62" x2="340" y2="62" stroke="var(--foam)" opacity=".35" strokeWidth="1.2" />
          <polygon points="0,180 0,34 30,30 70,46 110,72 150,108 190,150 212,180" fill="#1B3B49" stroke="rgba(217,200,167,.3)" />
          {[[28, 40, 12], [54, 50, 12], [80, 62, 12], [106, 80, 12], [130, 98, 11], [154, 118, 11], [176, 140, 10]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#16384A" stroke="rgba(217,200,167,.3)" />
          ))}
          {[118, 132, 146].map((x, i) => <circle key={i} cx={x} cy={61} r="2" fill="var(--foam)" opacity=".5" />)}
          <path d="M178,142 C214,150 252,148 318,140" fill="none" stroke="var(--lamp)" strokeWidth="1.3" className="flowslow" />
          <path d="M62,28 C160,30 240,48 306,64" fill="none" stroke="var(--sand)" strokeDasharray="3 5" opacity=".6" />
          <circle cx="302" cy="63" r="2.4" fill="var(--lamp)" />
          <Fish x={184} y={130} cls="swim" />
          <Fish x={238} y={112} cls="swimr" flip />
          <Fish x={278} y={152} cls="swim" s={0.85} />
          <text x="148" y="24" {...lbl}>CAST PARALLEL</text>
          <text x="150" y="166" {...lbl}>TOE OF ROCKS</text>
          <text x="252" y="132" {...lbl}>SEAM</text>
        </g>
      )}
      {id === "surf" && (
        <g>
          <rect x="0" y="50" width="340" height="130" fill="#0F3146" />
          <path d="M0,86 C36,108 70,142 110,150 C140,156 162,140 184,120 C196,110 206,112 220,124 C246,146 290,156 340,160 L340,180 L0,180 Z"
            fill="#23414A" stroke="rgba(217,200,167,.35)" />
          <polygon points="0,86 0,40 26,52 52,70 70,82" fill="#3E4F42" stroke="rgba(217,200,167,.35)" />
          <ellipse cx="128" cy="120" rx="42" ry="22" fill="#000" opacity=".16" />
          <g className="wavemove">
            {[0, 46, 92, 138, 184, 230, 276, 322, 368].map(x => (
              <path key={x} d={`M${x},50 q11,-8 23,0`} stroke="var(--foam)" strokeWidth="1.3" fill="none" opacity=".6" />
            ))}
          </g>
          <path d="M176,48 q8,-12 20,-10 q-2,8 -10,12" fill="none" stroke="var(--foam)" strokeWidth="1.4" opacity=".8" />
          <path d="M42,28 C86,14 130,18 150,40" fill="none" stroke="var(--sand)" strokeDasharray="3 5" opacity=".7" />
          <circle cx="148" cy="44" r="2.4" fill="var(--lamp)" />
          <Fish x={106} y={130} cls="swim" />
          <Fish x={136} y={138} cls="swimr" flip s={0.85} />
          <text x="6" y="34" {...lbl}>BEACH</text>
          <text x="40" y="22" {...lbl}>CAST INTO THE GUTTER</text>
          <text x="100" y="170" {...lbl}>GUTTER</text>
          <text x="176" y="106" {...lbl}>BAR</text>
        </g>
      )}
      {id === "mangrove" && (
        <g>
          <rect x="0" y="150" width="340" height="30" fill="#1C3530" />
          <path d="M150,0 L340,0 L340,46 C290,56 240,52 200,40 C175,32 158,18 150,0 Z" fill="#16463C" />
          {[200, 222, 246, 270, 296, 318].map((x, i) => (
            <path key={x} d={`M${x},${38 + (i % 2) * 6} C${x - 6},80 ${x + 5},110 ${x - 2},150`}
              fill="none" stroke="#8C7A5B" strokeWidth="2.2" />
          ))}
          <g className="risewater">
            <rect x="0" y="96" width="340" height="84" fill="#0F3146" opacity=".92" />
            <line x1="0" y1="96" x2="340" y2="96" stroke="var(--foam)" opacity=".35" strokeWidth="1.2" />
            <Fish x={216} y={120} cls="swimr" flip color="var(--coral)" s={1.1} />
            <Fish x={110} y={132} cls="swim" s={0.8} />
          </g>
          <line x1="0" y1="80" x2="340" y2="80" stroke="var(--sand)" strokeDasharray="3 5" opacity=".55" />
          <line x1="0" y1="112" x2="340" y2="112" stroke="var(--sand)" strokeDasharray="3 5" opacity=".35" />
          <text x="6" y="76" {...lbl}>HIGH</text>
          <text x="6" y="108" {...lbl}>LOW</text>
          <path d="M64,142 q-20,5 -34,14" fill="none" stroke="var(--lamp)" strokeWidth="1.3" className="flowslow" />
          <text x="14" y="170" {...lbl}>DRAIN EXIT</text>
          <text x="236" y="92" {...lbl}>ROOT EDGE</text>
          <circle cx="252" cy="152" r="2.6" fill="var(--coral)" opacity=".8" />
        </g>
      )}
      {id === "marina" && (
        <g>
          <rect x="0" y="58" width="340" height="122" fill="#0F3146" />
          <line x1="0" y1="58" x2="340" y2="58" stroke="var(--foam)" opacity=".35" strokeWidth="1.2" />
          <rect x="0" y="40" width="150" height="10" fill="#1A3D4F" stroke="var(--line)" />
          <rect x="28" y="50" width="8" height="104" fill="#16384A" stroke="rgba(217,200,167,.3)" />
          <rect x="108" y="50" width="8" height="104" fill="#16384A" stroke="rgba(217,200,167,.3)" />
          <line x1="142" y1="40" x2="142" y2="16" stroke="#1A3D4F" strokeWidth="3" />
          <circle cx="142" cy="14" r="3.4" fill="var(--lamp)" />
          <polygon points="142,17 96,58 188,58" fill="var(--lamp)" opacity=".12" />
          <ellipse cx="142" cy="60" rx="46" ry="5" fill="var(--lamp)" opacity=".2" className="shimmer" />
          <rect x="0" y="58" width="92" height="12" fill="#000" opacity=".22" />
          <rect x="192" y="58" width="148" height="12" fill="#000" opacity=".22" />
          <circle cx="142" cy="90" r="15" fill="none" stroke="var(--reef)" strokeDasharray="3 4" className="flowline" />
          {[[136, 84], [148, 86], [140, 94], [150, 96], [134, 92]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.7" fill="var(--reef)" />
          ))}
          <Fish x={196} y={92} cls="swimr" flip color="var(--lamp)" s={1.15} />
          <Fish x={52} y={124} cls="swim" s={0.9} />
          <text x="118" y="34" {...lbl}>LIGHT POOL</text>
          <text x="206" y="76" {...lbl}>SHADOW EDGE</text>
          <text x="128" y="116" {...lbl}>BAIT</text>
        </g>
      )}
    </svg>
  );
}

export default function GuideTab({ openSetup }) {
  const [terr, setTerr] = useState("bridge");
  const t = TERRAINS.find(x => x.id === terr);
  const tq = TECHNIQUES.find(x => x.id === t.setup);
  return (
    <div className="fade">
      <div className="eyebrow">Field guide — read the water</div>
      <h1 className="h1">Terrain playbook</h1>
      <p className="sub">Five kinds of Abu Dhabi shoreline, where the fish sit in each, and how to present to them.</p>
      <div className="seg" style={{ margin: "12px 2px" }}>
        {TERRAINS.map(x => (
          <button key={x.id} className={x.id === terr ? "on" : ""} onClick={() => setTerr(x.id)}>{x.name}</button>
        ))}
      </div>
      <div className="card fade" key={terr}>
        <TerrainScene id={terr} />
        <p className="sub" style={{ margin: "12px 2px 2px" }}>{t.intro}</p>
        <div className="hairline" />
        {t.tips.map(([b, txt]) => (
          <div key={b} className="tip"><span className="tipdot" /><span><b>{b}.</b> {txt}</span></div>
        ))}
        <div className="hairline" />
        <div className="between">
          <span className="note">Suggested approach here</span>
          <button className="btn" onClick={() => openSetup(t.setup)}>{tq.name} →</button>
        </div>
      </div>
      <div className="card">
        <div className="h2">Before every session</div>
        <div className="tip"><span className="tipdot" /><span><b>Heat plan.</b> May–Sep: fish dawn or night, carry more water than feels necessary, and tell someone where you are.</span></div>
        <div className="tip"><span className="tipdot" /><span><b>Spike fish.</b> Safi and catfish spines hurt for hours — grip with a cloth, pliers for the hook.</span></div>
        <div className="tip"><span className="tipdot" /><span><b>Size limits.</b> Undersized hamour, sheri and safi go back — check the current UAE regulations, they're enforced.</span></div>
        <div className="tip"><span className="tipdot" /><span><b>Licence.</b> Recreational fishing in Abu Dhabi needs a (free) TAMM licence — keep it on your phone.</span></div>
      </div>
    </div>
  );
}
