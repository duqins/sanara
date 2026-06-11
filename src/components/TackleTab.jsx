import { TECHNIQUES, POWER_RANK } from "../data/tackle.js";
import { store } from "../lib/store.js";

function Hook({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0,0 v10 c0,7 10,8 12,1 l-2,-1" fill="none" stroke="var(--foam)" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function RigDiagram({ kind }) {
  const lbl = { fontFamily: "Spline Sans Mono", fontSize: 8, fill: "var(--faint)" };
  return (
    <svg viewBox="0 0 170 130" style={{ width: 170, flex: "none" }} role="img" aria-label={kind + " rig diagram"}>
      <line x1="0" y1="14" x2="170" y2="14" stroke="var(--line)" />
      <text x="4" y="10" {...lbl}>WATERLINE</text>
      {kind === "jighead" && (
        <g>
          <line x1="85" y1="0" x2="85" y2="58" stroke="var(--sand)" strokeWidth="1.4" />
          <circle cx="85" cy="38" r="2.4" fill="var(--lamp)" />
          <text x="92" y="41" {...lbl}>FG KNOT</text>
          <text x="92" y="55" {...lbl}>FLUORO 1 m</text>
          <g className="swim">
            <circle cx="85" cy="66" r="6" fill="var(--lamp)" />
            <path d="M85,66 q14,2 26,10 q-4,4 -10,4 q8,4 14,12 l-7,1 q-16,-6 -23,-19" fill="var(--reef)" opacity=".85" />
            <Hook x={88} y={68} s={0.9} />
          </g>
          <text x="30" y="96" {...lbl}>5 g JIGHEAD + PADDLE TAIL</text>
        </g>
      )}
      {kind === "jig" && (
        <g>
          <line x1="85" y1="0" x2="85" y2="50" stroke="var(--sand)" strokeWidth="1.4" />
          <g className="bob">
            <path d="M85,50 l7,30 -7,32 -7,-32 Z" fill="var(--sand)" stroke="var(--foam)" strokeWidth="1" />
            <path d="M85,52 q-12,4 -12,12" fill="none" stroke="var(--foam)" strokeWidth="1.4" />
            <Hook x={71} y={62} s={0.8} />
          </g>
          <text x="100" y="80" {...lbl}>20–30 g JIG</text>
          <text x="100" y="92" {...lbl}>ASSIST UP TOP</text>
        </g>
      )}
      {kind === "pencil" && (
        <g>
          <g className="bob">
            <path d="M40,14 q30,-9 70,-4 q14,2 18,6 q-4,4 -18,5 q-40,4 -70,-7 Z" fill="var(--sand)" stroke="var(--foam)" strokeWidth="1" />
            <circle cx="118" cy="15" r="1.6" fill="var(--deep)" />
            <Hook x={66} y={20} s={0.8} />
            <Hook x={100} y={21} s={0.8} />
          </g>
          <path d="M126,12 q10,-6 20,-7" className="flowline" stroke="var(--lamp)" fill="none" strokeWidth="1.4" />
          <text x="34" y="44" {...lbl}>WALK-THE-DOG ON THE SURFACE</text>
        </g>
      )}
      {kind === "dropper" && (
        <g>
          <line x1="85" y1="0" x2="85" y2="100" stroke="var(--sand)" strokeWidth="1.4" />
          <line x1="85" y1="44" x2="113" y2="44" stroke="var(--sand)" strokeWidth="1.2" />
          <Hook x={113} y={44} s={0.85} />
          <line x1="85" y1="70" x2="113" y2="70" stroke="var(--sand)" strokeWidth="1.2" />
          <Hook x={113} y={70} s={0.85} />
          <g className="bob">
            <path d="M85,100 q7,8 0,18 q-7,-10 0,-18 Z" fill="var(--foam)" opacity=".85" />
          </g>
          <text x="96" y="36" {...lbl}>DROPPER LOOPS</text>
          <text x="96" y="118" {...lbl}>30–60 g SINKER</text>
        </g>
      )}
      {kind === "float" && (
        <g>
          <line x1="60" y1="0" x2="60" y2="8" stroke="var(--sand)" strokeWidth="1.4" />
          <g className="bob">
            <rect x="57.5" y="2" width="5" height="26" rx="2.5" fill="var(--lamp)" />
            <rect x="57.5" y="2" width="5" height="8" rx="2.5" fill="var(--coral)" />
          </g>
          <line x1="60" y1="28" x2="60" y2="74" stroke="var(--sand)" strokeWidth="1.2" />
          <circle cx="60" cy="56" r="1.8" fill="var(--foam)" />
          <circle cx="60" cy="63" r="1.8" fill="var(--foam)" />
          <Hook x={60} y={74} s={0.9} />
          <circle cx="69" cy="84" r="5.5" fill="var(--foam)" opacity=".9" />
          <text x="84" y="60" {...lbl}>SPLIT SHOT</text>
          <text x="84" y="88" {...lbl}>BREAD FLAKE, #8–#6</text>
        </g>
      )}
      {kind === "running" && (
        <g>
          <line x1="6" y1="40" x2="78" y2="62" stroke="var(--sand)" strokeWidth="1.4" />
          <ellipse cx="44" cy="51" rx="8" ry="5.5" fill="var(--foam)" opacity=".9" transform="rotate(17 44 51)" />
          <path d="M20,32 q14,2 26,8" className="flowslow" stroke="var(--lamp)" fill="none" strokeWidth="1.2" />
          <circle cx="80" cy="62" r="2.6" fill="var(--lamp)" />
          <line x1="82" y1="63" x2="126" y2="76" stroke="var(--sand)" strokeWidth="1.2" />
          <Hook x={126} y={74} s={1} />
          <rect x="130" y="84" width="16" height="6" rx="2" fill="var(--reef)" opacity=".85" />
          <text x="8" y="26" {...lbl}>SINKER RUNS FREE</text>
          <text x="86" y="52" {...lbl}>SWIVEL</text>
          <text x="96" y="104" {...lbl}>CIRCLE 1/0 + BAIT</text>
        </g>
      )}
    </svg>
  );
}

function verdict(profile, tq) {
  const pr = POWER_RANK[profile.power];
  const peOk = profile.pe >= tq.pe[0] - 0.05 && profile.pe <= tq.pe[1] + 0.05;
  const pwOk = pr >= tq.pw[0] && pr <= tq.pw[1];
  if (peOk && pwOk) return { t: "Good match", cls: "ok" };
  const peNear = profile.pe >= tq.pe[0] - 0.45 && profile.pe <= tq.pe[1] + 0.45;
  const pwNear = pr >= tq.pw[0] - 1 && pr <= tq.pw[1] + 1;
  if (peNear && pwNear) return { t: "Stretch", cls: "" };
  return { t: "Upgrade needed", cls: "warn" };
}

export default function TackleTab({ profile, setProfile, tackleSel, setTackleSel }) {
  const tq = TECHNIQUES.find(t => t.id === tackleSel) || TECHNIQUES[0];
  const v = verdict(profile, tq);
  const saveP = p => { setProfile(p); store.set("sanara:profile", p); };
  return (
    <div className="fade">
      <div className="eyebrow">Tackle — match the tool to the job</div>
      <h1 className="h1">Rod and rig</h1>
      <p className="sub">Pick a technique. The verdict line compares it against your own setup.</p>

      <div className="card">
        <div className="h2">My setup</div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 96 }}>
            <div className="label">Rod length</div>
            <select value={profile.len} onChange={e => saveP({ ...profile, len: e.target.value })}>
              {["6'6\"", "7'0\"", "7'6\"", "8'0\"", "8'6\"", "9'0\"", "10'+"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 96 }}>
            <div className="label">Power</div>
            <select value={profile.power} onChange={e => saveP({ ...profile, power: e.target.value })}>
              {Object.keys(POWER_RANK).map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 96 }}>
            <div className="label">Braid PE</div>
            <select value={profile.pe} onChange={e => saveP({ ...profile, pe: +e.target.value })}>
              {[0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0].map(o => <option key={o} value={o}>PE {o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 96 }}>
            <div className="label">Reel size</div>
            <select value={profile.reel} onChange={e => saveP({ ...profile, reel: e.target.value })}>
              {["1000", "2000", "2500", "3000", "4000", "5000+"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="seg" style={{ margin: "2px 2px 12px" }}>
        {TECHNIQUES.map(t => (
          <button key={t.id} className={t.id === tq.id ? "on" : ""} onClick={() => setTackleSel(t.id)}>{t.name}</button>
        ))}
      </div>

      <div className="card fade" key={tq.id}>
        <div className="between" style={{ alignItems: "flex-start" }}>
          <div className="h2" style={{ marginBottom: 4 }}>{tq.name}</div>
          <span className={"chip " + v.cls}>{v.t}</span>
        </div>
        <p className="note" style={{ marginBottom: 10 }}>{tq.where}</p>
        <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
          <RigDiagram kind={tq.rig} />
          <div style={{ flex: 1 }}>
            {[["Rod", tq.rod], ["Reel", tq.reel], ["Main line", tq.line], ["Leader", tq.leader]].map(([k, val]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div className="label">{k}</div>
                <div style={{ fontSize: 13 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="label" style={{ marginTop: 4 }}>Terminal</div>
        <div style={{ fontSize: 13 }}>{tq.terminal}</div>
        <div className="label" style={{ marginTop: 10 }}>Targets</div>
        <div style={{ fontSize: 13 }}>{tq.targets}</div>
        <div className="hairline" />
        <div className="tip"><span className="tipdot" /><span><b>Your setup:</b> {tq.fit}</span></div>
        <p className="note" style={{ marginTop: 10 }}>
          Braid to fluoro: FG knot, or back-to-back uni if your hands are wet. Lure to leader: loop knot for action, uni for jigheads.
        </p>
      </div>
    </div>
  );
}
