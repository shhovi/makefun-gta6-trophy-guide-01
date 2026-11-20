// Trophy data: loading the official list and the roadmap stage definitions.
// The list is sorted by id so the tracker always opens in trophy order.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const ROADMAP_STAGES = [
  { stage: 1, title: 'Stage 1 — Story chapters', sub: 'Play the main story in order, from the opening mission to the final mission.' },
  { stage: 2, title: 'Stage 2 — Missables during story', sub: 'One-time story moments. Grab each as it happens; check the tracker right after.' },
  { stage: 3, title: 'Stage 3 — Collectibles', sub: 'Counted sweeps: spots, cards, vehicles, areas and properties. Region by region.' },
  { stage: 4, title: 'Stage 4 — Activities & cleanup', sub: 'Races, challenges, stranger strands, robberies and the 100% completion push.' },
  { stage: 5, title: 'Stage 5 — Platinum', sub: 'Earn the other 54 trophies and the platinum unlocks itself.' },
];

export async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('could not load trophy data');
  const data = await res.json();
  return data.trophies.slice().sort((a, b) => a.id - b.id);
}

export function trophiesInStage(trophies, stage) {
  return trophies.filter((t) => t.stage === stage);
}

export function gradeCounts(trophies, earned) {
  const counts = {};
  for (const g of GRADE_ORDER) counts[g] = { earned: 0, total: 0 };
  for (const t of trophies) {
    counts[t.grade].total += 1;
    if (earned.has(t.id)) counts[t.grade].earned += 1;
  }
  return counts;
}
