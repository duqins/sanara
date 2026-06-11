import { LAT, LON, midnight } from "./util.js";

const WX_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}`
  + `&hourly=wind_speed_10m,wind_direction_10m&timezone=auto&forecast_days=8`;

function parseLocal(s) {
  const [date, time] = s.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
}

export async function fetchWindSeries() {
  const res = await fetch(WX_URL);
  if (!res.ok) throw new Error("wind fetch " + res.status);
  const j = await res.json();
  const times = j?.hourly?.time, sp = j?.hourly?.wind_speed_10m, dir = j?.hourly?.wind_direction_10m;
  if (!Array.isArray(times) || !Array.isArray(sp) || sp.length !== times.length || times.length < 48)
    throw new Error("wind payload shape");
  const t0 = parseLocal(times[0]);
  return { t0, dt: 3600000, speed: sp, dir, fetchedAt: Date.now() };
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export function compass(degrees) {
  return COMPASS[Math.round(degrees / 22.5) % 16];
}

export function makeWind(series) {
  if (!series || !Array.isArray(series.speed) || series.speed.length < 2)
    return { live: false, fetchedAt: null, at: () => null, coversDay: () => false };
  const { t0, dt, speed, dir } = series;
  const n = speed.length;
  return {
    live: true,
    fetchedAt: series.fetchedAt,
    at: t => {
      const ms = t.getTime();
      if (ms < t0 || ms > t0 + (n - 1) * dt) return null;
      let i = Math.floor((ms - t0) / dt);
      if (i > n - 2) i = n - 2;
      const u = (ms - t0) / dt - i;
      const s0 = speed[i], s1 = speed[i + 1];
      if (typeof s0 !== "number" || typeof s1 !== "number") return null;
      const d0 = dir?.[u < 0.5 ? i : i + 1];
      return { speed: s0 + (s1 - s0) * u, dir: typeof d0 === "number" ? d0 : null };
    },
    coversDay: date => {
      const m = midnight(date).getTime();
      return m >= t0 && m + 86400000 <= t0 + (n - 1) * dt;
    },
  };
}
