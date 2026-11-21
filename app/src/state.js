const KEY = "vice-trophy-guide-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { earned: {} };
  } catch {
    return { earned: {} };
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function toggleEarned(id) {
  const state = loadState();
  state.earned[id] = !state.earned[id];
  if (!state.earned[id]) delete state.earned[id];
  save(state);
  return state;
}

export function isEarned(state, id) {
  return Boolean(state?.earned?.[id]);
}

export function progress(state, total) {
  const earned = Object.values(state?.earned || {}).filter(Boolean).length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  return { earned, total, pct };
}

export function resetState() {
  localStorage.removeItem(KEY);
  return { earned: {} };
}

export function applyFilter(trophies, { filter = "all", spoilers = false } = {}) {
  return trophies.filter((t) => {
    if (filter === "missable" && !t.missable) return false;
    if (!spoilers && t.spoiler) return false;
    return true;
  });
}
