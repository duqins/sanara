// Async key/value wrapper: window.storage when running as a Claude artifact,
// localStorage otherwise. Keys: sanara:profile, sanara:home, sanara:log,
// sanara:tide, sanara:wx.
export const store = {
  async get(k) {
    try {
      if (window.storage) {
        const r = await window.storage.get(k);
        return r ? JSON.parse(r.value) : null;
      }
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  async set(k, v) {
    try {
      if (window.storage) { await window.storage.set(k, JSON.stringify(v)); return; }
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
