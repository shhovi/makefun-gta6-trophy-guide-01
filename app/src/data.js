export const TIERS = ["platinum", "gold", "silver", "bronze"];

export const CATEGORIES = ["story", "collectible", "combat", "exploration", "side", "online"];

export const PHASES = [1, 2, 3, 4, 5];

export function byPhase(trophies, phase) {
  return trophies.filter((t) => t.phase === phase);
}

export async function loadTrophies() {
  const res = await fetch("../data/trophies.json");
  if (!res.ok) {
    throw new Error("Failed to load trophies: " + res.status);
  }
  const data = await res.json();
  return Array.isArray(data.trophies) ? data.trophies : [];
}
