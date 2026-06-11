import { RAD, LAT, LON, midnight } from "./util.js";

// Harmonic fallback: real constituent speeds (M2, S2, K1, O1) with plausible
// amplitudes but invented phase lags — shape is right for Abu Dhabi, clock
// times are not. Used only when no fetched series covers the requested time.
// Mean level 0 keeps it on the same MSL datum as the live series, so there is
// no height step where a partially covered day crosses the seam.
const TIDE_C = [
  { s: 28.9841042, a: 0.56, p: 247 },
  { s: 30.0000000, a: 0.21, p: 291 },
  { s: 15.0410686, a: 0.34, p: 136 },
  { s: 13.9430356, a: 0.20, p: 99 },
];
const TIDE_EPOCH = Date.UTC(2025, 0, 1);

export function harmonicH(t) {
  const hrs = (t.getTime() - TIDE_EPOCH) / 3600000;
  let h = 0;
  for (const c of TIDE_C) h += c.a * Math.cos((c.s * hrs - c.p) * RAD);
  return h;
}
function harmonicFlow(t) {
  return harmonicH(new Date(t.getTime() + 18e5)) - harmonicH(new Date(t.getTime() - 18e5));
}

const TIDE_URL = `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}`
  + `&hourly=sea_level_height_msl&timezone=auto&past_days=1&forecast_days=8`;

// Open-Meteo returns local (Asia/Dubai) wall-clock times; parse them as local
// Date, consistent with the rest of the app's local-time convention.
function parseLocal(s) {
  const [date, time] = s.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
}

export async function fetchTideSeries() {
  const res = await fetch(TIDE_URL);
  if (!res.ok) throw new Error("tide fetch " + res.status);
  const j = await res.json();
  const times = j?.hourly?.time, hs = j?.hourly?.sea_level_height_msl;
  if (!Array.isArray(times) || !Array.isArray(hs) || times.length !== hs.length)
    throw new Error("tide payload shape");
  let a = 0, b = hs.length;
  while (a < b && !(typeof hs[a] === "number" && isFinite(hs[a]))) a++;
  while (b > a && !(typeof hs[b - 1] === "number" && isFinite(hs[b - 1]))) b--;
  const heights = hs.slice(a, b);
  if (heights.length < 48) throw new Error("tide payload short");
  if (!heights.every(v => typeof v === "number" && isFinite(v)))
    throw new Error("tide payload gaps");
  const t0 = parseLocal(times[a]);
  if (parseLocal(times[a + 1]) - t0 !== 3600000) throw new Error("tide spacing");
  return { t0, dt: 3600000, heights, fetchedAt: Date.now() };
}

// Cubic Hermite (Catmull-Rom tangents) over the hourly series gives a smooth
// curve and an analytic derivative for the flow, in metres per hour.
export function makeTide(series) {
  const base = {
    live: false,
    fetchedAt: null,
    h: t => harmonicH(t),
    flow: t => harmonicFlow(t),
    coversDay: () => false,
  };
  if (!series || !Array.isArray(series.heights) || series.heights.length < 4) return base;
  const { t0, dt, heights } = series;
  const n = heights.length;
  const tEnd = t0 + (n - 1) * dt;
  const seg = ms => {
    let i = Math.floor((ms - t0) / dt);
    if (i > n - 2) i = n - 2;
    if (i < 0) i = 0;
    const u = (ms - t0) / dt - i;
    const m0 = i > 0 ? (heights[i + 1] - heights[i - 1]) / 2 : heights[i + 1] - heights[i];
    const m1 = i < n - 2 ? (heights[i + 2] - heights[i]) / 2 : heights[i + 1] - heights[i];
    return { h0: heights[i], h1: heights[i + 1], m0, m1, u };
  };
  const liveH = ms => {
    const { h0, h1, m0, m1, u } = seg(ms);
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * h0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * h1 + (u3 - u2) * m1;
  };
  const liveFlow = ms => {
    const { h0, h1, m0, m1, u } = seg(ms);
    const u2 = u * u;
    return (6 * u2 - 6 * u) * h0 + (3 * u2 - 4 * u + 1) * m0 + (-6 * u2 + 6 * u) * h1 + (3 * u2 - 2 * u) * m1;
  };
  const inRange = ms => ms >= t0 && ms <= tEnd;
  return {
    live: true,
    fetchedAt: series.fetchedAt,
    h: t => (inRange(t.getTime()) ? liveH(t.getTime()) : harmonicH(t)),
    flow: t => (inRange(t.getTime()) ? liveFlow(t.getTime()) : harmonicFlow(t)),
    coversDay: date => {
      const m = midnight(date).getTime();
      return m >= t0 && m + 86400000 <= tEnd;
    },
  };
}
