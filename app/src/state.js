// Progress state: which trophies are earned, kept in localStorage so the
// tracker works fully offline. Also handles export/import as JSON text.

// Versioned key: if the saved shape ever changes, bump the suffix so
// old progress is ignored instead of misread.
const KEY = 'gta6-trophy-tracker-progress-v1';

export function createState() {
  let earned = new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) earned = new Set(parsed.map(String));
    }
  } catch {
    earned = new Set();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => Number(a) - Number(b))));
    } catch {
      // Storage can be unavailable (private mode); the tracker still works in-memory.
    }
  }

  return {
    has(id) {
      return earned.has(String(id));
    },
    toggle(id) {
      const key = String(id);
      if (earned.has(key)) earned.delete(key);
      else earned.add(key);
      save();
      return earned.has(key);
    },
    setAll(ids) {
      earned = new Set(ids.map(String));
      save();
    },
    clear() {
      earned.clear();
      save();
    },
    ids() {
      return [...earned];
    },
    count() {
      return earned.size;
    },
    exportJson() {
      return JSON.stringify(
        {
          game: 'Grand Theft Auto VI',
          exportedAt: new Date().toISOString(),
          earned: [...earned].map(Number).sort((a, b) => a - b),
        },
        null,
        2,
      );
    },
    importJson(text, validIds) {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(list)) throw new Error('Expected a JSON array or an object with an "earned" array.');
      const valid = validIds ? new Set([...validIds].map(String)) : null;
      const next = list.map(String).filter((id) => !valid || valid.has(id));
      earned = new Set(next);
      save();
      return earned.size;
    },
  };
}
