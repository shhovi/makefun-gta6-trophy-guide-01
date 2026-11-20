// Vice Trophy Guide — localStorage-backed earned-state.
(function () {
  'use strict';

  const KEY = 'vice-trophy-guide:earned:v1';
  let earned = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      earned = new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      earned = new Set();
    }
    return earned;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify([...earned]));
    } catch (e) {
      /* storage unavailable — keep in-memory state */
    }
  }

  function toggle(id) {
    if (earned.has(id)) earned.delete(id);
    else earned.add(id);
    save();
    return earned.has(id);
  }

  function has(id) {
    return earned.has(id);
  }

  function reset() {
    earned.clear();
    save();
  }

  function progress(total) {
    const count = earned.size;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { count, total, percent };
  }

  // Snapshot of earned ids (e.g. for debugging or future export).
  function list() {
    return [...earned];
  }

  window.TrophyState = { load, save, toggle, has, reset, progress, list };
})();
