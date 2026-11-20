// App wiring: load data, connect filters and views, handle screenshot scenes.

import { loadTrophies } from './data.js';
import { applyShotScene, exportProgress, importProgress, loadState, saveState, toggleEarned } from './state.js';
import { renderDetail, renderList, renderProgress, renderRoadmap } from './render.js';

const filters = { kind: 'all', grade: 'all', earned: 'all', search: '' };
let trophies = [];
let state = loadState();
let selectedId = null;
let view = 'tracker';

function refresh() {
  renderProgress(trophies, state);
  renderList(trophies, state, filters, selectedId, handleToggle, handleSelect);
  const selected = trophies.find((t) => t.id === selectedId) || null;
  renderDetail(selected, state, handleToggle);
  renderRoadmap(trophies, state, handleSelectFromRoadmap);
  document.getElementById('spoiler-toggle').checked = state.hideSpoilers;
}

function handleToggle(id) {
  toggleEarned(state, id);
  refresh();
}

function handleSelect(id) {
  selectedId = id;
  refresh();
}

function handleSelectFromRoadmap(id) {
  selectedId = id;
  setView('tracker');
  refresh();
}

function setView(next) {
  view = next;
  document.getElementById('tracker-view').hidden = view !== 'tracker';
  document.getElementById('roadmap-view').hidden = view !== 'roadmap';
  document.getElementById('tab-tracker').classList.toggle('active', view === 'tracker');
  document.getElementById('tab-roadmap').classList.toggle('active', view === 'roadmap');
}

function setKindFilter(kind) {
  filters.kind = kind;
  document.querySelectorAll('#kind-filters .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === kind);
  });
}

function wireControls() {
  document.getElementById('tab-tracker').addEventListener('click', () => setView('tracker'));
  document.getElementById('tab-roadmap').addEventListener('click', () => setView('roadmap'));
  document.querySelectorAll('#kind-filters .chip').forEach((chip) => {
    chip.addEventListener('click', () => { setKindFilter(chip.dataset.kind); refresh(); });
  });
  document.getElementById('grade-filter').addEventListener('change', (ev) => { filters.grade = ev.target.value; refresh(); });
  document.getElementById('earned-filter').addEventListener('change', (ev) => { filters.earned = ev.target.value; refresh(); });
  document.getElementById('search-box').addEventListener('input', (ev) => { filters.search = ev.target.value; refresh(); });
  document.getElementById('spoiler-toggle').addEventListener('change', (ev) => {
    state.hideSpoilers = ev.target.checked;
    saveState(state);
    refresh();
  });
  document.getElementById('export-btn').addEventListener('click', () => exportProgress(state));
  document.getElementById('import-file').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try { await importProgress(state, file); } catch { /* ignore bad files */ }
    ev.target.value = '';
    refresh();
  });
}

function setupShotScene(shot) {
  applyShotScene(state, shot);
  if (shot === 'tracker') {
    setView('tracker');
    selectedId = 17; // The Shootist — silver, guide open with sources
  } else if (shot === 'roadmap') {
    setView('roadmap');
  } else if (shot === 'missable') {
    setView('tracker');
    setKindFilter('missable');
    selectedId = 8; // Trust — a missable story trophy
  } else if (shot === 'spoiler') {
    setView('tracker');
    selectedId = 9; // a hidden story trophy, still locked
  }
}

async function boot() {
  trophies = await loadTrophies();
  wireControls();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    setupShotScene(shot);
    refresh();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  } else {
    selectedId = trophies.length ? trophies[0].id : null;
    refresh();
  }
}

boot().catch((err) => {
  document.getElementById('detail-panel').innerHTML = '<p class="detail-empty">Could not load trophy data: ' + String(err) + '</p>';
});
