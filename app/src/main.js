// Wiring: loads data, applies filters, handles the checklist, the
// roadmap toggle, spoiler protection, export/import, and the ?shot=
// presets used for screenshots.

import { loadTrophies } from './data.js';
import { createState } from './state.js';
import { renderSummary, renderList, renderRoadmap, renderDetail } from './render.js';

const $ = (id) => document.getElementById(id);

const els = {
  search: $('search'),
  kind: $('kind'),
  grade: $('grade'),
  status: $('status'),
  spoiler: $('spoiler'),
  summary: $('summary'),
  list: $('list'),
  roadmap: $('roadmap'),
  detail: $('detail'),
  msg: $('io-msg'),
  viewTracker: $('view-tracker'),
  viewRoadmap: $('view-roadmap'),
};

const state = createState();
let data = null;
let selectedId = null;
let view = 'tracker';

function hideSpoilers() {
  return els.spoiler.checked;
}

function filtered() {
  const q = els.search.value.trim().toLowerCase();
  const kind = els.kind.value;
  const grade = els.grade.value;
  const status = els.status.value;
  return data.trophies.filter((t) => {
    if (kind && t.kind !== kind) return false;
    if (grade && t.grade !== grade) return false;
    if (status === 'earned' && !state.has(t.id)) return false;
    if (status === 'remaining' && state.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.kind} ${t.grade}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function rowOpts() {
  return {
    hideSpoilers: hideSpoilers(),
    selectedId,
    onToggle(id) {
      state.toggle(id);
      draw();
    },
    onSelect(id) {
      selectedId = String(id);
      draw();
    },
  };
}

function draw() {
  renderSummary(els.summary, data.trophies, state);
  const opts = rowOpts();
  if (view === 'roadmap') {
    els.list.hidden = true;
    els.roadmap.hidden = false;
    renderRoadmap(els.roadmap, data.trophies, state, opts);
  } else {
    els.list.hidden = false;
    els.roadmap.hidden = true;
    renderList(els.list, filtered(), state, opts);
  }
  const trophy = selectedId ? data.byId.get(selectedId) : null;
  renderDetail(els.detail, trophy, state, { hideSpoilers: hideSpoilers() });
  // Keep the tab title in sync so progress is visible at a glance.
  const total = data.trophies.length;
  const pct = total ? Math.round((state.count() / total) * 100) : 0;
  document.title = `GTA VI Trophy Tracker — ${pct}%`;
  els.viewTracker.classList.toggle('active', view === 'tracker');
  els.viewRoadmap.classList.toggle('active', view === 'roadmap');
}

function say(text) {
  els.msg.textContent = text;
}

function applyShotPreset() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;
  if (shot === 'roadmap') {
    view = 'roadmap';
  } else if (shot === 'missable') {
    view = 'tracker';
    els.kind.value = 'missable';
    els.status.value = 'remaining';
  } else if (shot === 'spoiler') {
    view = 'tracker';
    els.spoiler.checked = true;
    const firstHidden = data.trophies.find((t) => t.hidden && !state.has(t.id));
    if (firstHidden) selectedId = String(firstHidden.id);
  } else if (shot === 'tracker') {
    view = 'tracker';
  }
}

async function boot() {
  try {
    data = await loadTrophies();
  } catch (err) {
    els.list.replaceChildren();
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = `Failed to load trophy data: ${err.message}`;
    els.list.append(p);
    return;
  }

  applyShotPreset();
  draw();

  for (const el of [els.search, els.kind, els.grade, els.status]) {
    el.addEventListener('input', draw);
    el.addEventListener('change', draw);
  }
  els.spoiler.addEventListener('change', draw);
  els.viewTracker.addEventListener('click', () => { view = 'tracker'; draw(); });
  els.viewRoadmap.addEventListener('click', () => { view = 'roadmap'; draw(); });

  $('export').addEventListener('click', () => {
    const blob = new Blob([state.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    say('Progress exported as JSON.');
  });

  $('import').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const n = state.importJson(text, data.trophies.map((t) => t.id));
      say(`Imported progress: ${n} trophies marked earned.`);
      draw();
    } catch (err) {
      say(`Import failed: ${err.message}`);
    }
    ev.target.value = '';
  });

  $('reset').addEventListener('click', () => {
    state.clear();
    selectedId = null;
    say('Progress cleared.');
    draw();
  });
}

boot();
