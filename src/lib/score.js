import { sunTimes, lunarEvents } from "./astro.js";
import { nearestMin, midnight, haversine } from "./util.js";

export function buildDay(date) {
  const sun = sunTimes(date);
  return { ...sun, moon: lunarEvents(date) };
}

function windAt(t, env) {
  if (env.cond.auto && env.wind) {
    const w = env.wind.at(t);
    if (w) return w.speed;
  }
  return env.cond.wind;
}

// The score is a base of 32 plus labeled contributions; scoreParts feeds both
// the number and the "why this score" breakdown in the UI.
export function scoreParts(t, day, env) {
  const dDawn = nearestMin(t, day.sunrise), dDusk = nearestMin(t, day.sunset);
  const h = (t.getTime() - midnight(t).getTime()) / 3600000;
  let maj = 0, min = 0;
  for (const m of day.moon.majors) maj = Math.max(maj, 1 - Math.abs(h - m) / 1.1);
  for (const m of day.moon.minors) min = Math.max(min, 1 - Math.abs(h - m) / 0.8);
  const wind = windAt(t, env);
  const month = t.getMonth() + 1;
  return [
    { k: "golden hour", v: 22 * Math.max(Math.exp(-((dDawn / 70) ** 2)), Math.exp(-((dDusk / 70) ** 2))), max: 22 },
    { k: "solunar", v: 16 * Math.max(0, maj) + 9 * Math.max(0, min), max: 25 },
    { k: "tide flow", v: Math.min(20, (Math.abs(env.tide.flow(t)) / 0.30) * 20), max: 20 },
    { k: "moon phase", v: 8 * Math.abs(day.moon.illum - 0.5) * 2, max: 8 },
    { k: "wind", v: wind >= 6 && wind <= 22 ? 5 : wind > 32 ? -9 : 0, max: 5 },
    { k: "summer midday", v: month >= 5 && month <= 9 && h >= 10 && h <= 16.5 ? -13 : 0, max: 0 },
    { k: "murky water", v: env.cond.clarity === "murky" ? -3 : 0, max: 0 },
  ];
}

export function biteScore(t, day, env) {
  const s = scoreParts(t, day, env).reduce((a, p) => a + p.v, 32);
  return Math.max(4, Math.min(98, s));
}

export function factorsAt(t, day, env) {
  const tags = [];
  if (nearestMin(t, day.sunrise) < 80) tags.push("dawn");
  if (nearestMin(t, day.sunset) < 80) tags.push("dusk");
  const h = (t.getTime() - midnight(t).getTime()) / 3600000;
  if (day.moon.majors.some(m => Math.abs(h - m) < 1.1)) tags.push("solunar major");
  else if (day.moon.minors.some(m => Math.abs(h - m) < 0.8)) tags.push("solunar minor");
  const f = env.tide.flow(t);
  if (f > 0.10) tags.push("rising tide");
  else if (f < -0.10) tags.push("falling tide");
  else tags.push("slack water");
  if (day.moon.illum > 0.93) tags.push("full moon");
  if (day.moon.illum < 0.07) tags.push("new moon");
  return tags;
}

export function sampleDay(date, day, env) {
  const mid = midnight(date);
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const t = new Date(mid.getTime() + i * 9e5);
    pts.push({ t, h: env.tide.h(t), s: biteScore(t, day, env) });
  }
  for (let i = 1; i < pts.length - 1; i++)
    pts[i].sm = (pts[i - 1].s + pts[i].s + pts[i + 1].s) / 3;
  pts[0].sm = pts[0].s; pts[96].sm = pts[96].s;
  return pts;
}

export function topWindows(pts, day, env) {
  const thr = Math.max(60, Math.max(...pts.map(p => p.sm)) * 0.8);
  const runs = [];
  let cur = null;
  for (const p of pts) {
    if (p.sm >= thr) {
      if (!cur) cur = { a: p.t, b: p.t, sum: 0, n: 0, peak: 0, peakT: p.t };
      cur.b = p.t; cur.sum += p.sm; cur.n++;
      if (p.sm > cur.peak) { cur.peak = p.sm; cur.peakT = p.t; }
    } else if (cur) { runs.push(cur); cur = null; }
  }
  if (cur) runs.push(cur);
  return runs
    .map(r => ({ ...r, avg: r.sum / r.n, why: factorsAt(r.peakT, day, env).slice(0, 3) }))
    .sort((x, y) => y.peak - x.peak)
    .slice(0, 3)
    .sort((x, y) => x.a - y.a);
}

export function tideExtremes(pts) {
  const ex = [];
  for (let i = 1; i < pts.length - 1; i++) {
    if (pts[i].h > pts[i - 1].h && pts[i].h >= pts[i + 1].h) ex.push({ t: pts[i].t, h: pts[i].h, k: "H" });
    if (pts[i].h < pts[i - 1].h && pts[i].h <= pts[i + 1].h) ex.push({ t: pts[i].t, h: pts[i].h, k: "L" });
  }
  return ex;
}

export function bandOf(s) {
  if (s >= 78) return { txt: "Prime", c: "var(--lamp)" };
  if (s >= 62) return { txt: "Good", c: "var(--reef)" };
  if (s >= 45) return { txt: "Fair", c: "var(--sand)" };
  return { txt: "Slow", c: "var(--faint)" };
}

// Match a moment's character (light, flow, season, night) to the techniques
// from the Tackle tab, most specific first. Soft plastics are the all-rounder.
export function suggestTechniques(t, day, env) {
  const parts = Object.fromEntries(scoreParts(t, day, env).map(p => [p.k, p.v]));
  const month = t.getMonth() + 1;
  const ms = t.getTime();
  const night = ms < day.sunrise.getTime() - 18e5 || ms > day.sunset.getTime() + 18e5;
  const golden = parts["golden hour"] > 10;
  const out = [];
  if (golden && (month >= 10 || month <= 4)) out.push("topwater");
  if (night) out.push("bait at structure");
  if (parts["tide flow"] > 12) out.push("jigging");
  if (golden && !night && month >= 3 && month <= 6 && t.getHours() < 12) out.push("float & bread");
  out.push("soft plastics");
  if (parts["tide flow"] < 7 && !night) out.push("bottom bait");
  return [...new Set(out)].slice(0, 3);
}

export function rankSpots(spots, date, day, pts, userPos, tide) {
  const month = date.getMonth() + 1;
  const ex = tideExtremes(pts);
  const maxFlow = Math.max(...pts.filter((_, i) => i % 4 === 0).map(p => Math.abs(tide.flow(p.t))));
  return spots.map(s => {
    let sc = 0; const why = [];
    const inSeason = s.species.filter(sp => sp.m.includes(month));
    sc += inSeason.length * 9;
    if (inSeason.length) why.push(`${inSeason.length} species in season`);
    if (s.tide === "run") { if (maxFlow > 0.18) { sc += 16; why.push("strong tidal flow today"); } else if (maxFlow > 0.12) { sc += 8; why.push("moderate flow"); } }
    if (s.tide === "high") {
      const hit = ex.some(e => e.k === "H" && (nearestMin(e.t, day.sunrise) < 110 || nearestMin(e.t, day.sunset) < 110));
      if (hit) { sc += 16; why.push("high water meets golden hour"); } else sc += 5;
    }
    if (s.tide === "in") {
      if (tide.flow(day.sunrise) > 0.07 || tide.flow(day.sunset) > 0.07) { sc += 14; why.push("flooding through golden hour"); }
    }
    let dist = null;
    if (userPos) { dist = haversine(userPos, s); sc += Math.max(0, 16 - dist * 1.1); }
    return { s, sc, why, dist, inSeason };
  }).sort((a, b) => b.sc - a.sc);
}
