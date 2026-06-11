import { useEffect, useMemo, useState } from "react";
import { HOMES, SPOTS, TERRAIN_LABEL } from "../data/spots.js";
import { buildDay, sampleDay, rankSpots } from "../lib/score.js";
import { store } from "../lib/store.js";
import { midnight } from "../lib/util.js";

function project(lon, lat) {
  return { x: ((lon - 54.24) / 0.58) * 360, y: ((24.63 - lat) / 0.33) * 330 };
}

function CoastMap({ sel, setSel, userPos, ranks, userLabel }) {
  return (
    <svg viewBox="0 0 360 330" style={{ width: "100%", display: "block", borderRadius: 12, background: "var(--deep)" }}
      role="img" aria-label="Schematic map of Abu Dhabi fishing spots">
      {Array.from({ length: 8 }, (_, i) => (
        <line key={"v" + i} x1={i * 48} y1="0" x2={i * 48} y2="330" stroke="var(--line)" opacity=".5" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={"h" + i} x1="0" y1={i * 48} x2="360" y2={i * 48} stroke="var(--line)" opacity=".5" />
      ))}
      <g fill="#16384A" stroke="rgba(217,200,167,.35)" strokeWidth="1">
        <path d="M360,55 C332,82 312,108 296,134 C282,156 268,170 246,182 C226,192 216,200 206,214 C196,228 192,244 178,258 C166,270 156,282 152,300 L150,330 L360,330 Z" />
        <path d="M0,330 L148,330 C140,310 126,300 110,294 C90,288 64,292 44,302 C28,310 12,318 0,324 Z" />
        <path d="M66,152 C60,132 74,114 96,110 C120,106 140,116 144,134 C148,150 140,160 146,172 C152,186 144,202 126,208 C106,214 84,210 74,196 C66,186 64,168 66,152 Z" />
        <path d="M58,236 C58,226 72,220 88,222 C104,224 112,232 110,240 C108,248 92,252 76,250 C64,248 58,244 58,236 Z" />
        <path d="M92,118 C92,110 102,106 110,110 C118,114 118,124 110,128 C102,132 92,128 92,118 Z" />
        <path d="M96,92 C104,78 122,66 142,58 C150,55 156,58 152,66 C140,84 120,94 104,100 C96,102 92,98 96,92 Z" />
        <path d="M146,100 C144,90 154,84 164,88 C172,92 172,102 164,106 C156,110 148,108 146,100 Z" />
        <path d="M208,150 C204,132 214,118 230,116 C246,114 256,126 254,142 C252,158 238,168 224,164 C214,161 210,158 208,150 Z" />
      </g>
      <g fontFamily="Spline Sans Mono" fontSize="8" fill="var(--faint)">
        <text x="104" y="166" textAnchor="middle">ABU DHABI</text>
        <text x="124" y="74">SAADIYAT</text>
        <text x="231" y="142" textAnchor="middle">YAS</text>
        <text x="84" y="240" textAnchor="middle">HUDAYRIAT</text>
        <text x="300" y="240">MAINLAND</text>
      </g>
      <g>
        <line x1="318" y1="312" x2="349" y2="312" stroke="var(--sand)" strokeWidth="2" />
        <text x="333" y="305" textAnchor="middle" fontSize="8" fill="var(--sand)" fontFamily="Spline Sans Mono">5 KM</text>
        <path d="M340,22 l5,14 -5,-4 -5,4 Z" fill="var(--sand)" />
        <text x="340" y="16" textAnchor="middle" fontSize="9" fill="var(--sand)" fontFamily="Spline Sans Mono">N</text>
      </g>
      {userPos && (() => {
        const p = project(userPos.lon, userPos.lat);
        if (p.x < 10 || p.x > 350 || p.y < 12 || p.y > 320) return null;
        return (
          <g>
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="var(--reef)" className="pulse" />
            <circle cx={p.x} cy={p.y} r="5" fill="var(--reef)" stroke="var(--deep)" strokeWidth="1.5" />
            <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize="8.5" fill="var(--reef)"
              fontFamily="Spline Sans Mono" style={{ paintOrder: "stroke", stroke: "var(--deep)", strokeWidth: 3 }}>
              {userLabel}
            </text>
          </g>
        );
      })()}
      {SPOTS.map(s => { const p = project(s.lon, s.lat); const on = sel === s.id; const rank = ranks?.[s.id]; return (
        <g key={s.id} onClick={() => setSel(on ? null : s.id)} style={{ cursor: "pointer" }}>
          {on && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="var(--lamp)" opacity=".7" />}
          <circle cx={p.x} cy={p.y} r="4.5" fill={on ? "var(--lamp)" : "var(--sand)"} stroke="var(--deep)" strokeWidth="1.5" />
          {rank && (
            <g>
              <circle cx={p.x + 10} cy={p.y - 10} r="6.5" fill="var(--lamp)" stroke="var(--deep)" strokeWidth="1.2" />
              <text x={p.x + 10} y={p.y - 7} textAnchor="middle" fontSize="8.5" fontWeight="700"
                fill="var(--deep)" fontFamily="Spline Sans Mono">{rank}</text>
            </g>
          )}
          {on && (
            <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="9.5" fill="var(--lamp)"
              fontFamily="Spline Sans Mono" style={{ paintOrder: "stroke", stroke: "var(--deep)", strokeWidth: 3 }}>
              {s.name.toUpperCase()}
            </text>
          )}
        </g>
      ); })}
    </svg>
  );
}

const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function seasonTxt(ms) {
  if (ms.length >= 12) return "All year";
  const set = new Set(ms);
  let start = null;
  for (let m = 1; m <= 12; m++) { const prev = m === 1 ? 12 : m - 1; if (set.has(m) && !set.has(prev)) { start = m; break; } }
  if (start === null) start = 1;
  const runs = []; let m = start, count = 0;
  while (count < 12) {
    if (set.has(m)) { let a = m; while (set.has(m) && count < 12) { count++; m = m === 12 ? 1 : m + 1; } const b = m === 1 ? 12 : m - 1; runs.push(a === b ? MN[a - 1] : `${MN[a - 1]}–${MN[b - 1]}`); }
    else { count++; m = m === 12 ? 1 : m + 1; }
  }
  return runs.join(", ");
}

export default function SpotsTab({ env }) {
  const [sel, setSel] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [homeId, setHomeId] = useState("zahiya");
  const [geoMsg, setGeoMsg] = useState("");
  useEffect(() => { store.get("sanara:home").then(v => { if (v) setHomeId(v); }); }, []);
  const date = midnight(new Date());
  const day = useMemo(() => buildDay(date), []);
  const pts = useMemo(() => sampleDay(date, day, env), [day, env]);
  const pos = userPos || HOMES.find(h => h.id === homeId);
  const ranked = useMemo(() => rankSpots(SPOTS, date, day, pts, pos, env.tide), [pts, day, pos, env.tide]);
  const onChart = p => p.lon >= 54.26 && p.lon <= 54.80 && p.lat >= 24.32 && p.lat <= 24.62;
  const homeName = HOMES.find(h => h.id === homeId)?.name;
  const locate = () => {
    setGeoMsg("Finding you…");
    if (!navigator.geolocation) { setGeoMsg(`This device has no location service — distances are measured from Home: ${homeName}.`); return; }
    navigator.geolocation.getCurrentPosition(
      p => {
        const at = { lat: p.coords.latitude, lon: p.coords.longitude };
        setUserPos(at);
        setGeoMsg(onChart(at)
          ? "Found you — that's the green YOU dot. Picks and distances now run from where you're standing."
          : "Found you — you're outside this chart, but picks and distances still run from your real position.");
      },
      () => setGeoMsg(`Location is blocked for this app — distances are measured from Home: ${homeName} instead.`),
      { timeout: 9000, maximumAge: 120000 }
    );
  };
  const selSpot = SPOTS.find(s => s.id === sel);
  const selRank = ranked.find(r => r.s.id === sel);
  const ranks = Object.fromEntries(ranked.slice(0, 3).map((r, i) => [r.s.id, i + 1]));
  return (
    <div className="fade">
      <div className="eyebrow">Spots — schematic chart</div>
      <h1 className="h1">Where to fish</h1>
      <p className="sub">Tap a marker. Picks are ranked by season, today's tide pattern and distance from you.</p>

      <div className="card" style={{ padding: 10 }}>
        <CoastMap sel={sel} setSel={setSel} userPos={pos} ranks={ranks} userLabel={userPos ? "YOU" : "HOME"} />
        <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={locate}>Use my location</button>
          <select value={homeId} onChange={e => { setHomeId(e.target.value); setUserPos(null); store.set("sanara:home", e.target.value); }}
            style={{ flex: 1, minWidth: 130 }} aria-label="Home base">
            {HOMES.map(h => <option key={h.id} value={h.id}>Home: {h.name}</option>)}
          </select>
        </div>
        {geoMsg && <p className="note" style={{ marginTop: 8 }}>{geoMsg}</p>}
        <p className="note" style={{ marginTop: 8 }}>
          Amber ①②③ mark today's top picks · the green dot is {userPos ? "you" : "your home base"} · tap any marker for the full briefing.
        </p>
      </div>

      <div className="card">
        <div className="h2">Today's picks — start at nº1</div>
        {ranked.slice(0, 3).map((r, i) => (
          <div key={r.s.id} className="between" style={{ padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer" }}
            onClick={() => setSel(r.s.id)}>
            <div className="row" style={{ gap: 10 }}>
              <span className="num" style={{ color: "var(--lamp)", fontWeight: 700, fontSize: 16, width: 14, flex: "none" }}>{i + 1}</span>
              <div>
                <b style={{ fontSize: 14.5 }}>{r.s.name}</b>
                <div className="note" style={{ marginTop: 2 }}>{r.why.slice(0, 2).join(" · ")}{r.dist != null ? ` · ${r.dist.toFixed(0)} km` : ""}</div>
              </div>
            </div>
            <span className="pill">{TERRAIN_LABEL[r.s.terrain]}</span>
          </div>
        ))}
      </div>

      {selSpot && (
        <div className="card fade">
          <div className="between">
            <div>
              <div className="eyebrow">{selSpot.area}</div>
              <div className="h2" style={{ margin: "2px 0 0" }}>{selSpot.name}</div>
            </div>
            <span className="pill">{TERRAIN_LABEL[selSpot.terrain]}</span>
          </div>
          {selRank?.dist != null && (
            <p className="note" style={{ marginTop: 6 }}>{selRank.dist.toFixed(1)} km from {userPos ? "your position" : "home base"} · {selSpot.lat.toFixed(3)}°N {selSpot.lon.toFixed(3)}°E</p>
          )}
          <div className="hairline" />
          <div className="label">Species and seasons</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {selSpot.species.map(sp => (
              <span key={sp.n} className={"chip " + (sp.m.includes(new Date().getMonth() + 1) ? "ok" : "")}
                title={seasonTxt(sp.m)}>{sp.n}<span className="note" style={{ marginLeft: 4 }}>{seasonTxt(sp.m)}</span></span>
            ))}
          </div>
          <div className="tip" style={{ marginTop: 10 }}><span className="tipdot" /><span><b>Tide:</b> {selSpot.best}</span></div>
          <div className="tip"><span className="tipdot" /><span><b>Ground:</b> {selSpot.ground}</span></div>
          <div className="tip"><span className="tipdot" /><span><b>Watch for:</b> {selSpot.hazards}</span></div>
          <div className="tip"><span className="tipdot" /><span>{selSpot.notes}</span></div>
        </div>
      )}

      <div className="card">
        <div className="h2">All spots</div>
        {ranked.map(r => (
          <div key={r.s.id} className="spotrow between" onClick={() => setSel(r.s.id === sel ? null : r.s.id)}>
            <div>
              <b style={{ fontSize: 14 }}>{r.s.name}</b>
              <div className="note">{r.s.area} · {r.inSeason.length} in season{r.dist != null ? ` · ${r.dist.toFixed(0)} km` : ""}</div>
            </div>
            <span className="pill">{TERRAIN_LABEL[r.s.terrain]}</span>
          </div>
        ))}
        <p className="note" style={{ marginTop: 10 }}>
          The chart is schematic, not for navigation. Respect signed no-fishing zones, protected mangrove areas and port limits.
        </p>
      </div>
    </div>
  );
}
