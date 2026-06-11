import { useEffect, useMemo, useState } from "react";
import { moonPhaseName } from "../lib/astro.js";
import { buildDay, sampleDay, topWindows, tideExtremes, biteScore, scoreParts, factorsAt, bandOf, rankSpots, suggestTechniques } from "../lib/score.js";
import { compass } from "../lib/weather.js";
import { fmtT, fmtD, localISO } from "../lib/util.js";
import { HOMES, SPOTS } from "../data/spots.js";
import { store } from "../lib/store.js";

function DayDial({ pts, day, isToday, now }) {
  const X = h => 16 + (h / 24) * 328;
  const hs = pts.map(p => p.h);
  const span = Math.max(0.8, Math.max(...hs) - Math.min(...hs) + 0.24);
  const lo = (Math.max(...hs) + Math.min(...hs)) / 2 - span / 2;
  const Y = h => 116 - ((h - lo) / span) * 76;
  const mid = pts[0].t;
  const hr = t => (t.getTime() - mid.getTime()) / 3600000;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(hr(p.t)).toFixed(1)},${Y(p.h).toFixed(1)}`).join(" ");
  const area = `${path} L${X(24)},122 L${X(0)},122 Z`;
  const ex = tideExtremes(pts).filter(e => hr(e.t) > 0.4 && hr(e.t) < 23.6);
  const majors = day.moon.majors.filter(m => m >= 0 && m <= 24);
  const minors = day.moon.minors.filter(m => m >= 0 && m <= 24);
  const nowH = isToday ? hr(now) : null;
  return (
    <svg viewBox="0 0 360 168" style={{ width: "100%", display: "block" }} role="img"
      aria-label="Tide curve with sun, moon and bite quality strip">
      {[0, 6, 12, 18, 24].map(h => (
        <g key={h}>
          <line x1={X(h)} y1="24" x2={X(h)} y2="148" stroke="var(--line)" />
          <text x={X(h)} y="162" textAnchor="middle" fontSize="9"
            fill="var(--faint)" fontFamily="Spline Sans Mono">{String(h).padStart(2, "0")}</text>
        </g>
      ))}
      <text x="20" y="34" fontSize="8.5" fill="var(--faint)" fontFamily="Spline Sans Mono">TIDE m</text>
      <path d={area} fill="var(--sand)" opacity=".07" />
      <path d={path} className="drawpath" fill="none" stroke="var(--sand)" strokeWidth="1.8" />
      {pts.map((p, i) => i % 2 === 0 && i < 96 ? (
        <rect key={i} x={X(hr(p.t))} y="132" width={328 / 48 - 0.6} height="13" rx="1.5"
          fill="var(--lamp)" opacity={Math.max(0, Math.min(1, (p.sm - 40) / 56)) * 0.9} />
      ) : null)}
      <text x="16" y="130" fontSize="8.5" fill="var(--faint)" fontFamily="Spline Sans Mono">BITE</text>
      <circle cx={X(hr(day.sunrise))} cy="22" r="4.5" fill="var(--lamp)" />
      <circle cx={X(hr(day.sunset))} cy="22" r="4.5" fill="var(--lamp)" opacity=".75" />
      <text x={X(hr(day.sunrise))} y="13" textAnchor="middle" fontSize="8.5"
        fill="var(--sand)" fontFamily="Spline Sans Mono">{fmtT(day.sunrise)}</text>
      <text x={X(hr(day.sunset))} y="13" textAnchor="middle" fontSize="8.5"
        fill="var(--sand)" fontFamily="Spline Sans Mono">{fmtT(day.sunset)}</text>
      {majors.map((m, i) => (
        <rect key={"M" + i} x={X(m) - 3.4} y="18.6" width="6.8" height="6.8" rx="1.6"
          transform={`rotate(45 ${X(m)} 22)`} fill="var(--foam)" opacity=".9" />
      ))}
      {minors.map((m, i) => (
        <circle key={"m" + i} cx={X(m)} cy="22" r="2.2" fill="var(--foam)" opacity=".55" />
      ))}
      {ex.map((e, i) => (
        <text key={"e" + i} x={X(hr(e.t))} y={Y(e.h) + (e.k === "H" ? -7 : 13)} textAnchor="middle"
          fontSize="8.5" fill="var(--dim)" fontFamily="Spline Sans Mono">
          {e.k === "H" ? "HIGH" : "LOW"} {e.h.toFixed(1)}m {fmtT(e.t)}
        </text>
      ))}
      {nowH !== null && nowH >= 0 && nowH <= 24 && (
        <g className="needle">
          <line x1={X(nowH)} y1="18" x2={X(nowH)} y2="148" stroke="var(--lamp)" strokeWidth="1.4" />
          <circle cx={X(nowH)} cy="18" r="3" fill="var(--lamp)" />
        </g>
      )}
    </svg>
  );
}

function dayWord(h) {
  if (h < 5) return "before dawn";
  if (h < 10) return "at dawn";
  if (h < 15) return "around midday";
  if (h < 18) return "in the afternoon";
  if (h < 22) return "in the evening";
  return "late tonight";
}

export default function Forecast({ env, setCond, openSpots }) {
  const { tide, wind, cond } = env;
  const [dateStr, setDateStr] = useState(() => localISO(new Date()));
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);
  const date = useMemo(() => { const [y, m, d] = dateStr.split("-").map(Number); return new Date(y, m - 1, d); }, [dateStr]);
  const isToday = dateStr === localISO(now);
  const day = useMemo(() => buildDay(date), [dateStr]);
  const pts = useMemo(() => sampleDay(date, day, env), [dateStr, day, env]);
  const wins = useMemo(() => topWindows(pts, day, env), [pts, day, env]);
  const score = isToday ? biteScore(now, day, env) : Math.max(...pts.map(p => p.sm));
  const band = bandOf(score);
  const week = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
      const dd = buildDay(d);
      const pp = sampleDay(d, dd, env);
      const best = pp.reduce((a, b) => (b.sm > a.sm ? b : a));
      out.push({ d, peak: Math.round(best.sm), at: fmtT(best.t), illum: dd.moon.illum });
    }
    return out;
  }, [env]);
  const [why, setWhy] = useState(false);
  const [help, setHelp] = useState(false);
  const [homeId, setHomeId] = useState("zahiya");
  useEffect(() => { store.get("sanara:home").then(v => { if (v) setHomeId(v); }); }, []);
  const scoreT = isToday ? now : wins[0]?.peakT || date;
  const tags = factorsAt(scoreT, day, env);
  const parts = why ? scoreParts(scoreT, day, env) : null;
  const liveTide = tide.coversDay(date);
  const home = HOMES.find(h => h.id === homeId);
  const topSpot = useMemo(() => rankSpots(SPOTS, date, day, pts, home, tide)[0], [pts, day, home, tide]);
  const bestWin = wins.length ? wins.reduce((a, b) => (b.peak > a.peak ? b : a)) : null;
  const inWindow = bestWin && isToday && now >= bestWin.a && now <= bestWin.b;
  const headline = !bestWin
    ? "A slow one — dawn is your best shot"
    : inWindow
      ? "Go now — you're in the best window"
      : bestWin.peak >= 78 ? `Go ${dayWord(bestWin.peakT.getHours())}`
      : bestWin.peak >= 62 ? `Worth a session ${dayWord(bestWin.peakT.getHours())}`
      : `Slow day — maybe a short go ${dayWord(bestWin.peakT.getHours())}`;
  const headColor = bestWin ? bandOf(bestWin.peak).c : "var(--faint)";
  const wNow = cond.auto ? wind.at(now) : null;
  const effWind = wNow ? Math.round(wNow.speed) : cond.wind;
  const wForecast = wind.at(now);
  return (
    <div className="fade">
      <div className="eyebrow">Forecast — Abu Dhabi shoreline</div>
      <h1 className="h1">{isToday ? "Should you go?" : fmtD(date)}</h1>
      <p className="sub">Sun, moon, solunar periods and the tide, blended into one bite score.</p>

      <div className="card" style={{ borderColor: "rgba(245,169,60,.35)" }}>
        <div className="label">The short answer</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 23, lineHeight: 1.15, color: headColor }}>
          {headline}
        </div>
        {bestWin && (
          <>
            <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              <span className="chip on num">{fmtT(bestWin.a)} – {fmtT(bestWin.b)}</span>
              {bestWin.why.slice(0, 2).map(t => <span key={t} className="chip">{t}</span>)}
            </div>
            <p className="note" style={{ marginTop: 8 }}>
              Throw: {suggestTechniques(bestWin.peakT, day, env).join(" · ")}
            </p>
          </>
        )}
        {topSpot && (
          <>
            <div className="hairline" />
            <div className="between">
              <span style={{ fontSize: 13.5 }}>
                Start at <b>{topSpot.s.name}</b>
                <span className="note">{topSpot.dist != null ? ` · ${topSpot.dist.toFixed(0)} km` : ""}{topSpot.why[0] ? ` · ${topSpot.why[0]}` : ""}</span>
              </span>
              <button className="btn" style={{ flex: "none" }} onClick={openSpots}>Spots →</button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="between">
          <div>
            <div className="label">Bite score · 0–98</div>
            <div className="scorebig num" style={{ color: band.c }}>{Math.round(score)}</div>
            <div className="band" style={{ color: band.c }}>{band.txt}{isToday ? " right now" : " at best window"}</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {tags.slice(0, 3).map(t => <span key={t} className="chip">{t}</span>)}
              <button className="chip" style={{ cursor: "pointer", fontFamily: "inherit" }}
                onClick={() => setWhy(!why)} aria-expanded={why}>
                {why ? "hide ▴" : "why? ▾"}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label">Date</div>
            <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} style={{ width: 150 }} />
            <div className="note" style={{ marginTop: 8 }}>
              {moonPhaseName(day.moon.age)} · {Math.round(day.moon.illum * 100)}% lit
            </div>
          </div>
        </div>
        {why && (
          <div style={{ marginTop: 10 }}>
            {parts.map(p => (
              <div key={p.k} className="row" style={{ gap: 8, padding: "3px 0" }}>
                <span className="label" style={{ margin: 0, width: 108, flex: "none" }}>{p.k}</span>
                <div style={{ flex: 1, height: 4, background: "rgba(233,241,239,.08)", borderRadius: 2 }}>
                  {Math.abs(p.v) > 0.2 && (
                    <div style={{
                      width: `${Math.min(100, (Math.abs(p.v) / (p.max || 13)) * 100)}%`, height: "100%",
                      background: p.v < 0 ? "var(--coral)" : "var(--lamp)", borderRadius: 2,
                    }} />
                  )}
                </div>
                <span className="num note" style={{ width: 28, textAlign: "right", color: p.v < 0 ? "var(--coral)" : p.v > 0.5 ? "var(--foam)" : undefined }}>
                  {p.v > 0 ? "+" : ""}{Math.round(p.v)}
                </span>
              </div>
            ))}
            <p className="note" style={{ marginTop: 6 }}>
              Base 32 plus the factors above, scored {isToday ? "for right now" : "at the day's best window"}.
              78+ is prime, 62+ good, 45+ fair — below that, slow.
            </p>
          </div>
        )}
        <div className="hairline" />
        <DayDial pts={pts} day={day} isToday={isToday} now={now} />
        <div className="between" style={{ marginTop: 6 }}>
          <span className="note" style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <i style={{ flex: "none", width: 8, height: 8, borderRadius: 99, background: "var(--lamp)" }} /> sunrise / sunset
            <i style={{ flex: "none", width: 7, height: 7, borderRadius: 1.5, background: "var(--foam)", opacity: .9, transform: "rotate(45deg)", marginLeft: 4 }} /> major feed
            <i style={{ flex: "none", width: 5, height: 5, borderRadius: 99, background: "var(--foam)", opacity: .55, marginLeft: 4 }} /> minor feed
            <button className="chip" style={{ cursor: "pointer", fontFamily: "inherit", marginLeft: 4 }}
              onClick={() => setHelp(!help)} aria-expanded={help}>
              {help ? "hide ▴" : "how to read ▾"}
            </button>
          </span>
          <span className={"chip " + (liveTide ? "ok" : "")} style={{ flex: "none" }}>
            {liveTide ? "live tide" : "modelled tide"}
          </span>
        </div>
        {help && (
          <div style={{ marginTop: 8 }}>
            <div className="tip"><span className="tipdot" /><span>The cream curve is the <b>tide height</b> through the 24 hours — HIGH and LOW water are marked with their height and time.</span></div>
            <div className="tip"><span className="tipdot" /><span>The <b>amber dots</b> along the top are sunrise and sunset — the golden hours.</span></div>
            <div className="tip"><span className="tipdot" /><span><b>Diamonds</b> are solunar majors — moon overhead or underfoot, the strongest feeding spells. <b>Small dots</b> are minors, at moonrise and moonset.</span></div>
            <div className="tip"><span className="tipdot" /><span>The <b>amber strip</b> at the bottom is the bite score hour by hour — the brighter the block, the better the fishing. The vertical amber line is right now.</span></div>
            <div className="tip"><span className="tipdot" /><span>Put it together: aim for where a <b>moving tide</b>, a <b>feeding spell</b> and <b>dawn or dusk</b> stack up — that's what the Best windows list below does for you.</span></div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="h2">Best windows</div>
        {wins.map((w, i) => (
          <div key={i} className="between" style={{ padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div>
              <span className="num" style={{ fontSize: 16, fontWeight: 600 }}>{fmtT(w.a)} – {fmtT(w.b)}</span>
              <div className="note" style={{ marginTop: 3 }}>{w.why.join(" · ")}</div>
              <div className="note" style={{ marginTop: 2 }}>suits: {suggestTechniques(w.peakT, day, env).join(" · ")}</div>
            </div>
            <span className="num" style={{ color: bandOf(w.peak).c, fontWeight: 600 }}>{Math.round(w.peak)}</span>
          </div>
        ))}
        {wins.length === 0 && <p className="sub">A flat day — fish dawn anyway, it never scores badly.</p>}
      </div>

      <div className="card">
        <div className="h2">Next 7 days</div>
        <div className="row" style={{ overflowX: "auto", gap: 8, paddingBottom: 4 }}>
          {week.map((w, i) => (
            <div key={i} style={{ flex: "0 0 auto", textAlign: "center", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 10px", minWidth: 76 }}>
              <div className="note">{fmtD(w.d).split(" ").slice(0, 2).join(" ")}</div>
              <div className="num" style={{ fontSize: 19, fontWeight: 600, color: bandOf(w.peak).c, margin: "3px 0" }}>{w.peak}</div>
              <div className="note num">{w.at}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="h2">Conditions on the day</div>
        <div className="label">
          Wind — {effWind} km/h{wNow && wNow.dir != null ? ` ${compass(wNow.dir)}` : ""}{wNow ? " · live forecast" : ""}
        </div>
        <input type="range" min="0" max="40" value={effWind}
          onChange={e => setCond({ ...cond, wind: +e.target.value, auto: false })} aria-label="Wind speed" />
        {!cond.auto && wForecast && (
          <button className="btn" style={{ marginTop: 8 }} onClick={() => setCond({ ...cond, auto: true })}>
            Back to forecast ({Math.round(wForecast.speed)} km/h)
          </button>
        )}
        <div className="label" style={{ marginTop: 12 }}>Water clarity</div>
        <div className="seg">
          {["clear", "stained", "murky"].map(c => (
            <button key={c} className={cond.clarity === c ? "on" : ""}
              onClick={() => setCond({ ...cond, clarity: c })}>{c}</button>
          ))}
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          A 6–22 km/h breeze with some chop helps; over 30 km/h hurts. Murky water — slow down, go natural baits or dark plastics.
        </p>
      </div>

      <p className="note" style={{ padding: "0 4px" }}>
        Sun and moon timings are computed astronomically; solunar periods come from the real lunar transit and moonrise / set.{" "}
        {liveTide
          ? <>Tide heights are Open-Meteo sea level forecasts for Abu Dhabi{tide.fetchedAt ? `, updated ${fmtT(new Date(tide.fetchedAt))}` : ""}.</>
          : <>This date is outside the fetched tide window, so the curve is a harmonic estimate — check the official tide table before a long session.</>}
        {" "}Always check the weather before you go.
      </p>
    </div>
  );
}
