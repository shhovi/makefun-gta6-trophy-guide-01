const STORAGE_KEY = "vice-trophy-guide-checked-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode); state still works in memory.
  }
}

export function toggle(state, id) {
  const next = { ...state };
  if (next[id]) {
    delete next[id];
  } else {
    next[id] = true;
  }
  saveState(next);
  return next;
}

export function resetState() {
  saveState({});
  return {};
}

export function progress(trophies, state) {
  const byTier = {
    platinum: { done: 0, total: 0 },
    gold: { done: 0, total: 0 },
    silver: { done: 0, total: 0 },
    bronze: { done: 0, total: 0 }
  };
  let done = 0;
  for (const trophy of trophies) {
    const bucket = byTier[trophy.tier];
    if (bucket) bucket.total += 1;
    if (state[trophy.id]) {
      done += 1;
      if (bucket) bucket.done += 1;
    }
  }
  const total = trophies.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent, byTier };
}
