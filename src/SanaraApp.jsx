import { useEffect, useMemo, useState } from "react";
import { CSS } from "./styles.js";
import { store } from "./lib/store.js";
import { fetchTideSeries, makeTide } from "./lib/tide.js";
import { fetchWindSeries, makeWind } from "./lib/weather.js";
import { Icon, ICONS } from "./components/bits.jsx";
import Forecast from "./components/Forecast.jsx";
import SpotsTab from "./components/SpotsTab.jsx";
import TackleTab from "./components/TackleTab.jsx";
import GuideTab from "./components/GuideTab.jsx";
import LogTab from "./components/LogTab.jsx";

// Serve the cached series immediately, then refresh from Open-Meteo when it
// has gone stale. The staleness check re-runs on an interval and when the app
// comes back online or into view, so long-lived sessions keep fresh data. A
// failed fetch quietly keeps the cache (or the harmonic fallback) so the app
// still works on the rocks with no signal.
function useSeries(key, ttl, fetcher) {
  const [series, setSeries] = useState(null);
  useEffect(() => {
    let on = true, current = null, busy = false;
    const load = async () => {
      if (busy || !on) return;
      busy = true;
      if (!current) {
        const cached = await store.get(key);
        if (cached?.t0 && !current && on) { current = cached; setSeries(cached); }
      }
      const stale = !current?.fetchedAt || Date.now() - current.fetchedAt > ttl;
      if (stale && navigator.onLine !== false) {
        try {
          const fresh = await fetcher();
          current = fresh;
          if (on) setSeries(fresh);
          store.set(key, fresh);
        } catch {}
      }
      busy = false;
    };
    load();
    const id = setInterval(load, 15 * 60000);
    const wake = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("online", load);
    document.addEventListener("visibilitychange", wake);
    return () => {
      on = false;
      clearInterval(id);
      window.removeEventListener("online", load);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);
  return series;
}

export default function SanaraApp() {
  const [tab, setTab] = useState("forecast");
  const [cond, setCond] = useState({ wind: 12, clarity: "clear", auto: true });
  const [profile, setProfile] = useState({ len: "7'0\"", power: "L", pe: 0.8, reel: "2000" });
  const [tackleSel, setTackleSel] = useState("plastics");
  useEffect(() => { store.get("sanara:profile").then(v => { if (v) setProfile(v); }); }, []);
  const tideSeries = useSeries("sanara:tide", 6 * 3600000, fetchTideSeries);
  const windSeries = useSeries("sanara:wx", 3 * 3600000, fetchWindSeries);
  const tide = useMemo(() => makeTide(tideSeries), [tideSeries]);
  const wind = useMemo(() => makeWind(windSeries), [windSeries]);
  const env = useMemo(() => ({ tide, wind, cond }), [tide, wind, cond]);
  const TABS = [["forecast", "Forecast"], ["spots", "Spots"], ["tackle", "Tackle"], ["guide", "Guide"], ["log", "Log"]];
  return (
    <div className="snr">
      <style>{CSS}</style>
      <div className="shell">
        {tab === "forecast" && <Forecast env={env} setCond={setCond} openSpots={() => setTab("spots")} />}
        {tab === "spots" && <SpotsTab env={env} />}
        {tab === "tackle" && <TackleTab profile={profile} setProfile={setProfile} tackleSel={tackleSel} setTackleSel={setTackleSel} />}
        {tab === "guide" && <GuideTab openSetup={id => { setTackleSel(id); setTab("tackle"); }} />}
        {tab === "log" && <LogTab />}
      </div>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map(([id, name]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}>
            <Icon d={ICONS[id]} />{name}
          </button>
        ))}
      </nav>
    </div>
  );
}
