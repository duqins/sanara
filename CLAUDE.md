# Sanara — Abu Dhabi shore fishing app

Personal fishing companion for shore angling around Abu Dhabi. Predicts when to fish (bite score from sun, moon, solunar periods, tide and wind), recommends where (curated local spots ranked by season, tide pattern and distance), matches tackle to technique against the owner's setup, teaches terrain reading with animated SVG cross-sections, and keeps a persistent catch log with JSON export/import.

Built first as a single-file Claude.ai artifact, then scaffolded as a Vite + React project, now split into modules and wired to live data. Installable as a PWA and usable offline.

## Run

```
npm install
npm run dev
```

No environment variables. No backend. React 18, Vite 5, zero UI libraries — all CSS is a template string injected via a `<style>` tag, all graphics are hand-rolled inline SVG.

## How the code is organized

```
src/
  main.jsx               entry; registers the service worker in production
  SanaraApp.jsx          shell: tabs, profile/conditions state, useSeries data hook
  styles.js              full stylesheet as a template string (design tokens as CSS vars)
  lib/
    util.js              constants (LAT/LON/TZ), formatters, haversine
    astro.js             NOAA sun times; truncated Meeus lunar ephemeris — moon
                         RA/dec/parallax, age, illumination, and solunar events
                         (majors = upper/lower lunar transit, minors = moonrise/set)
    tide.js              Open-Meteo Marine fetch + cubic Hermite interpolation over
                         the hourly series (analytic flow derivative, m/h); harmonic
                         model as offline/out-of-range fallback; makeTide() facade
    weather.js           Open-Meteo wind fetch, makeWind() facade, compass points
    score.js             biteScore, factors, day sampling, windows, extremes, bands
    store.js             async k/v wrapper (window.storage in artifacts, else localStorage)
  data/
    spots.js             HOMES, SPOTS (11 curated spots), TERRAIN_LABEL
    tackle.js            TECHNIQUES (6 cards), POWER_RANK
    terrains.js          TERRAINS (5 terrain guides)
  components/
    bits.jsx             Icon, ICONS, Fish
    Forecast.jsx         forecast tab + DayDial (auto-scaling tide axis, live badge)
    SpotsTab.jsx         schematic CoastMap, spot ranking, geolocation
    TackleTab.jsx        technique cards, RigDiagram, setup verdict
    GuideTab.jsx         TerrainScene cross-sections, safety card
    LogTab.jsx           catch log, pattern stats, per-spot filter, JSON export/import
public/
  manifest.webmanifest, sw.js, icons/   PWA shell
```

## Live data (important)

- **Tide**: hourly `sea_level_height_msl` from the Open-Meteo Marine API
  (`past_days=1&forecast_days=8`, metres relative to MSL — negative values are
  normal). Cached in `store` under `sanara:tide`, refreshed when older than 6 h,
  interpolated with a cubic Hermite spline; flow is its analytic derivative in
  m/h. Days fully inside the fetched window show a "live tide" badge; any other
  date falls back per-timestamp to the harmonic model (real constituent speeds,
  invented phase lags — shape right, clock times not) and the UI says so.
- **Wind**: hourly `wind_speed_10m`/`wind_direction_10m` from the Open-Meteo
  forecast API, cached under `sanara:wx` (3 h TTL). The bite score uses the
  forecast wind at each sampled time while `cond.auto` is true; touching the
  slider switches to manual, a button returns to the forecast.
- **Timezone**: Open-Meteo returns Asia/Dubai wall-clock times; the app parses
  them as machine-local Dates. The whole app assumes it runs on a UTC+4 device
  (same assumption the astronomy code has always made).
- Both fetches fail quietly: cache first, then harmonic/manual fallback, so the
  app keeps working on the rocks with no signal.

## Accuracy notes

- Sun times: NOAA algorithm, reliable (±1–2 min).
- Moon age/illumination and solunar events come from a truncated Meeus lunar
  ephemeris (~10 longitude terms): transits and rise/set are good to a few
  minutes — verified against published Abu Dhabi tables.
- Tide heights/times for the next ~7 days are real Open-Meteo forecasts; only
  out-of-window dates use the harmonic estimate.
- The map is schematic, deliberately not navigational.

## Owner context

The owner fishes light tackle around the Umm Yifenah / Reem Island bridge channels: 7'0" Light rod, PE 0.8 braid, 2000 reel — this is the default tackle profile. Spot data and species names use local Gulf names (sheri, safi, qabit, jesh, hamra, chanad, sobaity, faskar, badah, biyah).

## Conventions

- Comments only where genuinely necessary; no decorative banner comments or separator lines.
- Keep the dark theme and design tokens; don't introduce a component library or Tailwind.
- Mobile-first, max content width 480 px, bottom tab bar. `prefers-reduced-motion` must stay respected.
- Plain, professional code — this is a student project and should read like one.
- Bump `VERSION` in `public/sw.js` when the app shell changes, or installed
  clients keep the old shell.

## Backlog

1. ~~Real tide data~~ — done (Open-Meteo Marine, cached, harmonic fallback).
2. ~~Real weather~~ — done (wind prefill with manual override).
3. ~~PWA~~ — done (manifest, icons, hand-rolled service worker; app shell and
   last fetched data survive offline).
4. ~~Verify solunar~~ — done (real lunar transit/rise/set from the ephemeris,
   checked against published tables).
5. ~~Split the file~~ — done (see layout above).
6. ~~Catch log export/import + per-spot filter~~ — done.
7. **Optional real map.** Leaflet + OSM tiles behind a toggle, keeping the
   schematic chart as the default aesthetic. Still open — weigh the extra
   dependency against the convention of zero libraries.

When working on any item, run `npm run build` before finishing to confirm the project compiles.
