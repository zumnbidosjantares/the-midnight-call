// save.js — 3 slots em localStorage.
//
// O formato tem `version` de proposito: quando a estrutura do save mudar
// (e vai mudar, o jogo mal comecou), o migrate() decide entre converter o
// save antigo ou marca-lo como incompativel — nunca carregar lixo.

const PREFIX = 'tmc.save.';
const SETTINGS_KEY = 'tmc.settings';
export const SAVE_VERSION = 1;
export const SLOTS = 3;

function slotKey(i) { return PREFIX + 'slot' + i; }

function migrate(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.version === SAVE_VERSION) return data;
  if (data.version > SAVE_VERSION) return null; // save do futuro
  // futuras migracoes entram aqui, uma por versao
  return null;
}

export const save = {
  // Devolve sempre 3 posicoes; slot vazio vem como null.
  list() {
    const out = [];
    for (let i = 0; i < SLOTS; i++) {
      let d = null;
      try {
        const raw = localStorage.getItem(slotKey(i));
        if (raw) d = migrate(JSON.parse(raw));
      } catch (e) { d = null; }
      out.push(d);
    }
    return out;
  },

  read(i) {
    try {
      const raw = localStorage.getItem(slotKey(i));
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch (e) { return null; }
  },

  write(i, payload) {
    const data = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      ...payload,
    };
    try {
      localStorage.setItem(slotKey(i), JSON.stringify(data));
      return true;
    } catch (e) {
      // quota estourada normalmente e a miniatura; tenta de novo sem ela
      try {
        delete data.thumb;
        localStorage.setItem(slotKey(i), JSON.stringify(data));
        return true;
      } catch (e2) { return false; }
    }
  },

  erase(i) {
    try { localStorage.removeItem(slotKey(i)); return true; } catch (e) { return false; }
  },

  // Qual slot foi salvo por ultimo — alimenta o "Continuar" do menu.
  mostRecent() {
    const all = this.list();
    let best = -1, t = -1;
    for (let i = 0; i < all.length; i++) {
      if (all[i] && all[i].savedAt > t) { t = all[i].savedAt; best = i; }
    }
    return best;
  },

  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) { /* sem espaco, sem drama */ }
  },
};

export function formatPlaytime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDate(ms, lang) {
  const d = new Date(ms);
  const p = n => String(n).padStart(2, '0');
  if (lang === 'en') return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
