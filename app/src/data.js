export const TIERS = {
  platinum: { label: "Platinum", color: "#e8f0ff" },
  gold: { label: "Gold", color: "#ffc93c" },
  silver: { label: "Silver", color: "#c0c8d8" },
  bronze: { label: "Bronze", color: "#cd7f32" },
};

export const TIER_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function sortByTier(trophies) {
  return [...trophies].sort((a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99));
}

export async function loadGuide() {
  const res = await fetch("data/trophies.json");
  if (!res.ok) throw new Error(`Failed to load trophies: ${res.status}`);
  return res.json();
}
