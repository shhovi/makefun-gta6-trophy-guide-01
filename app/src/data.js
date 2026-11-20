// Vice Trophy Guide — data layer. Fetches trophies.json and exposes helpers.
(function () {
  'use strict';

  let cache = null;

  async function load() {
    if (cache) return cache;
    const res = await fetch('data/trophies.json');
    if (!res.ok) throw new Error('Failed to load trophies: ' + res.status);
    const json = await res.json();
    cache = json.trophies || [];
    return cache;
  }

  function byCategory(trophies) {
    const groups = {};
    for (const t of trophies) {
      (groups[t.category] = groups[t.category] || []).push(t);
    }
    return groups;
  }

  function byStep(trophies) {
    const groups = {};
    for (const t of trophies) {
      (groups[t.step] = groups[t.step] || []).push(t);
    }
    return groups;
  }

  // Case-insensitive search across name + description.
  function search(trophies, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return trophies.slice();
    return trophies.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }

  window.TrophyData = { load, byCategory, byStep, search };
})();
