import { RAD, TZ, LAT, LON, midnight } from "./util.js";

export const SYNODIC = 29.53058867;

export function sunTimes(d) {
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86400000);
  const g = (2 * Math.PI / 365) * (day - 1 + 0.5);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(
    Math.cos(90.833 * RAD) / (Math.cos(LAT * RAD) * Math.cos(decl)) - Math.tan(LAT * RAD) * Math.tan(decl)
  ) / RAD;
  const noon = 720 - 4 * LON - eq + TZ * 60;
  const rise = noon - 4 * ha;
  const set = noon + 4 * ha;
  const at = m => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, m, 0);
  return { sunrise: at(rise), sunset: at(set), solarNoon: at(noon) };
}

function jd(t) { return t.getTime() / 86400000 + 2440587.5; }
function deg(x) { let v = x % 360; if (v < 0) v += 360; return v * RAD; }

// Truncated Meeus lunar theory: ~0.3 deg in longitude, minutes-level rise/transit/set.
export function moonPos(t) {
  const T = (jd(t) - 2451545) / 36525;
  const D = deg(297.8501921 + 445267.1114034 * T);
  const M = deg(357.5291092 + 35999.0502909 * T);
  const Mp = deg(134.9633964 + 477198.8675055 * T);
  const F = deg(93.272095 + 483202.0175233 * T);
  const Lp = deg(218.3164477 + 481267.88123421 * T);
  const lon = Lp + RAD * (
    6.288774 * Math.sin(Mp) + 1.274027 * Math.sin(2 * D - Mp) + 0.658314 * Math.sin(2 * D)
    + 0.213618 * Math.sin(2 * Mp) - 0.185116 * Math.sin(M) - 0.114332 * Math.sin(2 * F)
    + 0.058793 * Math.sin(2 * D - 2 * Mp) + 0.057066 * Math.sin(2 * D - M - Mp)
    + 0.053322 * Math.sin(2 * D + Mp) + 0.045758 * Math.sin(2 * D - M));
  const lat = RAD * (
    5.128122 * Math.sin(F) + 0.280602 * Math.sin(Mp + F) + 0.277693 * Math.sin(Mp - F)
    + 0.173237 * Math.sin(2 * D - F) + 0.055413 * Math.sin(2 * D + F - Mp)
    + 0.046271 * Math.sin(2 * D - F - Mp));
  const par = RAD * (0.9508 + 0.0518 * Math.cos(Mp) + 0.0095 * Math.cos(2 * D - Mp)
    + 0.0078 * Math.cos(2 * D) + 0.0028 * Math.cos(2 * Mp));
  const eps = (23.4392911 - 0.0130042 * T) * RAD;
  const dec = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon));
  const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon));
  return { ra, dec, par, lon, lat };
}

function sunLon(t) {
  const T = (jd(t) - 2451545) / 36525;
  const M = deg(357.5291092 + 35999.0502909 * T);
  const C = 1.914602 * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  return deg(280.46646 + 36000.76983 * T + C);
}

function gmst(t) {
  return deg(280.46061837 + 360.98564736629 * (jd(t) - 2451545)) / RAD;
}

function wrapPi(a) {
  let v = (a + Math.PI) % (2 * Math.PI);
  if (v < 0) v += 2 * Math.PI;
  return v - Math.PI;
}

export function moonAge(t) {
  const e = wrapPi(moonPos(t).lon - sunLon(t)) / (2 * Math.PI);
  return (e < 0 ? e + 1 : e) * SYNODIC;
}

export function moonIllum(t) {
  const m = moonPos(t);
  const psi = Math.acos(Math.max(-1, Math.min(1, Math.cos(m.lat) * Math.cos(m.lon - sunLon(t)))));
  const distKm = 6378.14 / Math.sin(m.par);
  const AU = 149597870.7;
  const i = Math.atan2(AU * Math.sin(psi), distKm - AU * Math.cos(psi));
  return (1 + Math.cos(i)) / 2;
}

export function moonPhaseName(age) {
  if (age < 1.5 || age > 28.0) return "New moon";
  if (age < 6.0) return "Waxing crescent";
  if (age < 9.0) return "First quarter";
  if (age < 13.5) return "Waxing gibbous";
  if (age < 16.0) return "Full moon";
  if (age < 21.0) return "Waning gibbous";
  if (age < 24.0) return "Last quarter";
  return "Waning crescent";
}

// Solunar events from the real lunar ephemeris: majors at upper/lower transit,
// minors at moonrise/moonset. Hours are relative to the local midnight of d,
// scanned over -3..27 h so windows spilling across midnight stay intact.
export function lunarEvents(d) {
  const mid = midnight(d);
  const majors = [], minors = [];
  const stepH = 1 / 6;
  let prev = null;
  for (let h = -3; h <= 27 + 1e-9; h += stepH) {
    const t = new Date(mid.getTime() + h * 3600000);
    const p = moonPos(t);
    const ha = wrapPi(gmst(t) * RAD + LON * RAD - p.ra);
    const alt = Math.asin(
      Math.sin(LAT * RAD) * Math.sin(p.dec) + Math.cos(LAT * RAD) * Math.cos(p.dec) * Math.cos(ha)
    ) - (0.7275 * p.par - 0.566 * RAD);
    const cur = { h, ha, alt };
    if (prev) {
      if (prev.ha < 0 && cur.ha >= 0 && cur.ha - prev.ha < Math.PI)
        majors.push(prev.h + stepH * (-prev.ha) / (cur.ha - prev.ha));
      if (prev.ha > Math.PI / 2 && cur.ha < -Math.PI / 2)
        majors.push(prev.h + stepH * (Math.PI - prev.ha) / (cur.ha + 2 * Math.PI - prev.ha));
      if (prev.alt < 0 && cur.alt >= 0)
        minors.push(prev.h + stepH * (-prev.alt) / (cur.alt - prev.alt));
      if (prev.alt > 0 && cur.alt <= 0)
        minors.push(prev.h + stepH * prev.alt / (prev.alt - cur.alt));
    }
    prev = cur;
  }
  const noon = new Date(mid.getTime() + 12 * 3600000);
  return { majors, minors, age: moonAge(noon), illum: moonIllum(noon) };
}
