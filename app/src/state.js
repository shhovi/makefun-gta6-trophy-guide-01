// Tracker state: earned set + spoiler setting, saved in localStorage,
// plus export / import of progress as a JSON file.

const STORAGE_KEY = 'gtavi-trophy-tracker-v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: new Set(), hideSpoilers: false };
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      hideSpoilers: Boolean(parsed.hideSpoilers),
    };
  } catch {
    return { earned: new Set(), hideSpoilers: false };
  }
}

export function saveState(state) {
  const payload = { earned: [...state.earned].sort((a, b) => a - b), hideSpoilers: state.hideSpoilers };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function toggleEarned(state, id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveState(state);
}

export function exportProgress(state) {
  const payload = {
    app: 'gtavi-trophy-tracker',
    version: 1,
    earned: [...state.earned].sort((a, b) => a - b),
    hideSpoilers: state.hideSpoilers,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gtavi-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importProgress(state, file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.earned)) throw new Error('not a progress file');
  state.earned = new Set(parsed.earned.filter((n) => Number.isInteger(n)));
  state.hideSpoilers = Boolean(parsed.hideSpoilers);
  saveState(state);
}

// Fixed scenes for screenshots: deterministic earned sets per shot mode.
export const SHOT_EARNED = {
  tracker: [2, 3, 8, 15, 16, 21, 28, 35, 42, 46, 53, 55],
  roadmap: [2, 3, 4, 8, 9, 21, 28, 46],
  missable: [8, 44],
  spoiler: [2, 3, 4, 5, 15, 21, 28, 35],
};

export function applyShotScene(state, shot) {
  const ids = SHOT_EARNED[shot] || [];
  state.earned = new Set(ids);
  state.hideSpoilers = shot === 'spoiler';
  saveState(state);
}
