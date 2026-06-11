export const RAD = Math.PI / 180;
export const TZ = 4;
export const LAT = 24.47, LON = 54.37;

export function fmtT(d) { return d.toTimeString().slice(0, 5); }
export function fmtD(d) { return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }

export function nearestMin(t, target) { return Math.abs(t.getTime() - target.getTime()) / 60000; }

export function haversine(a, b) {
  const dLat = (b.lat - a.lat) * RAD, dLon = (b.lon - a.lon) * RAD;
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

export function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

// Local-date string for inputs and "today" checks — toISOString would slip a
// day between midnight and 04:00 on this UTC+4 timezone.
export function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
