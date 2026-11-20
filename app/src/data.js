// Loads the trophy list that ships with the app and hands it to the rest
// of the code in a tidy shape. Everything stays local: one JSON file.

export const STAGE_NAMES = {
  1: 'Story',
  2: 'Missables',
  3: 'Collectibles',
  4: 'Activities',
  5: 'Platinum',
};

// The parsed document is cached after the first load so filters and
// re-renders never refetch the JSON file.
let cache = null;

export async function loadTrophies() {
  if (cache) return cache;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error(`Could not load trophy data (HTTP ${res.status})`);
  const doc = await res.json();
  const trophies = Array.isArray(doc.trophies) ? doc.trophies.slice() : [];
  trophies.sort((a, b) => Number(a.id) - Number(b.id));
  cache = {
    game: doc.game || 'Grand Theft Auto VI',
    platform: doc.platform || 'PlayStation 5',
    list: doc.list || '',
    trophies,
    byId: new Map(trophies.map((t) => [String(t.id), t])),
  };
  return cache;
}

export function stageLabel(stage) {
  const name = STAGE_NAMES[stage] || `Stage ${stage}`;
  return `Stage ${stage} · ${name}`;
}
