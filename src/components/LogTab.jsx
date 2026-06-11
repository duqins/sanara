import { useEffect, useRef, useState } from "react";
import { SPOTS } from "../data/spots.js";
import { moonAge, moonPhaseName } from "../lib/astro.js";
import { store } from "../lib/store.js";
import { localISO } from "../lib/util.js";

const MAX_ENTRIES = 300;

function sanitizeEntry(raw, fallbackId) {
  if (!raw || typeof raw !== "object" || typeof raw.species !== "string" || !raw.species.trim()) return null;
  const date = typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
    ? raw.date : localISO(new Date());
  return {
    id: typeof raw.id === "number" ? raw.id : fallbackId,
    date,
    spot: SPOTS.some(s => s.id === raw.spot) ? raw.spot : SPOTS[0].id,
    species: raw.species.trim(),
    lure: typeof raw.lure === "string" ? raw.lure : "",
    cm: raw.cm === undefined || raw.cm === null ? "" : String(raw.cm),
    notes: typeof raw.notes === "string" ? raw.notes : "",
    phase: typeof raw.phase === "string" ? raw.phase : moonPhaseName(moonAge(new Date(date + "T12:00:00"))),
  };
}

export default function LogTab() {
  const blank = { date: localISO(new Date()), spot: SPOTS[0].id, species: "", lure: "", cm: "", notes: "" };
  const [entries, setEntries] = useState([]);
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const fileRef = useRef(null);
  useEffect(() => { store.get("sanara:log").then(v => { if (v) setEntries(v); }); }, []);
  const save = () => {
    if (!f.species.trim()) { setMsg("Add a species first."); return; }
    const d = new Date(f.date + "T12:00:00");
    const e = { ...f, id: Date.now(), phase: moonPhaseName(moonAge(d)) };
    const next = [e, ...entries].slice(0, MAX_ENTRIES);
    setEntries(next); store.set("sanara:log", next);
    setF({ ...blank, date: f.date, spot: f.spot }); setMsg("Logged.");
  };
  const del = id => { const next = entries.filter(e => e.id !== id); setEntries(next); store.set("sanara:log", next); };
  const exportLog = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sanara-log-${localISO(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(`Exported ${entries.length} entries.`);
  };
  const importLog = async file => {
    try {
      const raw = JSON.parse(await file.text());
      if (!Array.isArray(raw)) throw new Error("not a list");
      const seen = new Set(entries.map(e => e.id));
      const fresh = [];
      raw.forEach((r, i) => {
        const e = sanitizeEntry(r, Date.now() + i);
        if (e && !seen.has(e.id)) { seen.add(e.id); fresh.push(e); }
      });
      const next = [...fresh, ...entries]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .slice(0, MAX_ENTRIES);
      setEntries(next); store.set("sanara:log", next);
      setMsg(`Imported ${fresh.length} entries (${raw.length - fresh.length} skipped).`);
    } catch {
      setMsg("Couldn't read that file — expected a JSON export from this app.");
    }
  };
  const top = key => {
    const m = {};
    entries.forEach(e => { const k = e[key]; if (k) m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1])[0] || null;
  };
  const spotName = id => SPOTS.find(s => s.id === id)?.name || id;
  const topSpot = top("spot"), topLure = top("lure"), topPhase = top("phase");
  const shown = filter === "all" ? entries : entries.filter(e => e.spot === filter);
  return (
    <div className="fade">
      <div className="eyebrow">Catch log — build your own pattern</div>
      <h1 className="h1">The record</h1>
      <p className="sub">Every entry is tagged with its moon phase, so your own data starts answering "when" for you.</p>

      <div className="card">
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <div className="label">Date</div>
            <input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
          </div>
          <div style={{ flex: 1.4, minWidth: 150 }}>
            <div className="label">Spot</div>
            <select value={f.spot} onChange={e => setF({ ...f, spot: e.target.value })}>
              {SPOTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <div style={{ flex: 1.4, minWidth: 140 }}>
            <div className="label">Species</div>
            <input type="text" value={f.species} placeholder="Sheri" onChange={e => setF({ ...f, species: e.target.value })} />
          </div>
          <div style={{ flex: 1, minWidth: 110 }}>
            <div className="label">Lure / bait</div>
            <input type="text" value={f.lure} placeholder="5 g paddle tail" onChange={e => setF({ ...f, lure: e.target.value })} />
          </div>
          <div style={{ flex: 0.6, minWidth: 76 }}>
            <div className="label">cm</div>
            <input type="number" value={f.cm} onChange={e => setF({ ...f, cm: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="label">Notes</div>
          <input type="text" value={f.notes} placeholder="Outgoing tide, shadow line, second pylon" onChange={e => setF({ ...f, notes: e.target.value })} />
        </div>
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={save}>Log catch</button>
          {msg && <span className="note">{msg}</span>}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="card">
          <div className="h2">Your pattern so far</div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="chip">{entries.length} catches</span>
            <span className="chip">Best spot: {topSpot ? `${spotName(topSpot[0])} ×${topSpot[1]}` : "—"}</span>
            <span className="chip">Top lure: {topLure ? `${topLure[0]} ×${topLure[1]}` : "—"}</span>
            <span className="chip">Best phase: {topPhase ? `${topPhase[0]} ×${topPhase[1]}` : "—"}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="between" style={{ marginBottom: 6 }}>
          <div className="h2" style={{ margin: 0 }}>Entries</div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ width: "auto", maxWidth: 180 }} aria-label="Filter by spot">
            <option value="all">All spots</option>
            {SPOTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {entries.length === 0 && <p className="sub">Nothing yet. The first fish you log starts the dataset.</p>}
        {entries.length > 0 && shown.length === 0 && <p className="sub">No catches at this spot yet.</p>}
        {shown.map(e => (
          <div key={e.id} className="between" style={{ padding: "9px 0", borderTop: "1px solid var(--line)" }}>
            <div>
              <b style={{ fontSize: 14 }}>{e.species}{e.cm ? ` · ${e.cm} cm` : ""}</b>
              <div className="note" style={{ marginTop: 2 }}>
                {e.date} · {spotName(e.spot)}{e.lure ? ` · ${e.lure}` : ""} · {e.phase}
              </div>
              {e.notes && <div className="note">{e.notes}</div>}
            </div>
            <button className="btn" style={{ padding: "5px 9px" }} onClick={() => del(e.id)} aria-label="Delete entry">✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <button className="btn" onClick={exportLog} disabled={entries.length === 0}>Export JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: "none" }}
            onChange={e => { const file = e.target.files?.[0]; if (file) importLog(file); e.target.value = ""; }} />
        </div>
        <p className="note" style={{ marginTop: 10 }}>Saved to this app's storage on your account — entries stay between sessions. Export now and then as a backup.</p>
      </div>
    </div>
  );
}
