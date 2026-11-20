// Rendering: progress header, trophy list, guide detail panel and roadmap.
// Spoiler handling lives here so every view masks hidden trophies the same way.

import { GRADE_ORDER, KIND_LABELS, ROADMAP_STAGES, gradeCounts, trophiesInStage } from './data.js';

export function isSpoilerHidden(trophy, state) {
  return state.hideSpoilers && trophy.hidden && !state.earned.has(trophy.id);
}

export function displayName(trophy, state) {
  return isSpoilerHidden(trophy, state) ? 'Hidden trophy' : trophy.name;
}

export function displayDescription(trophy, state) {
  return isSpoilerHidden(trophy, state) ? 'Hidden until earned — turn off “Hide spoilers” to reveal.' : trophy.description;
}

export function renderProgress(trophies, state) {
  const total = trophies.length;
  const done = trophies.filter((t) => state.earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-count').textContent = done + ' of ' + total + ' earned';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
  const counts = gradeCounts(trophies, state.earned);
  document.getElementById('grade-counts').innerHTML = GRADE_ORDER.map(
    (g) => '<span>' + g[0].toUpperCase() + g.slice(1) + ' <b>' + counts[g].earned + '/' + counts[g].total + '</b></span>'
  ).join('');
}

export function applyFilters(trophies, state, filters) {
  const q = filters.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earned === 'earned' && !state.earned.has(t.id)) return false;
    if (filters.earned === 'remaining' && state.earned.has(t.id)) return false;
    if (q) {
      const hay = (displayName(t, state) + ' ' + displayDescription(t, state) + ' ' + t.kind + ' ' + t.grade).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function badgesHtml(trophy) {
  let html = '<span class="badge badge-' + trophy.grade + '">' + trophy.grade + '</span>';
  html += '<span class="tag">' + (KIND_LABELS[trophy.kind] || trophy.kind) + '</span>';
  if (trophy.missable) html += '<span class="flag">Missable</span>';
  return html;
}

export function renderList(trophies, state, filters, selectedId, onToggle, onSelect) {
  const visible = applyFilters(trophies, state, filters);
  document.getElementById('list-summary').textContent =
    'Showing ' + visible.length + ' of ' + trophies.length + ' trophies';
  const list = document.getElementById('trophy-list');
  list.innerHTML = '';
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (state.earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    const hidden = isSpoilerHidden(t, state);
    li.innerHTML =
      '<input type="checkbox" aria-label="Mark earned"' + (state.earned.has(t.id) ? ' checked' : '') + '>' +
      '<div class="row-main"><div class="row-name' + (hidden ? ' hidden-name' : '') + '">' + escapeHtml(displayName(t, state)) + '</div>' +
      '<div class="row-desc">' + escapeHtml(displayDescription(t, state)) + '</div></div>' +
      '<div class="badges">' + badgesHtml(t) + '</div>';
    li.querySelector('input').addEventListener('click', (ev) => {
      ev.stopPropagation();
      onToggle(t.id);
    });
    li.addEventListener('click', () => onSelect(t.id));
    list.appendChild(li);
  }
  if (!visible.length) {
    const li = document.createElement('li');
    li.className = 'trophy-row';
    li.textContent = 'No trophies match these filters.';
    list.appendChild(li);
  }
}

export function renderDetail(trophy, state, onToggle) {
  const panel = document.getElementById('detail-panel');
  if (!trophy) {
    panel.innerHTML = '<p class="detail-empty">Select a trophy to read its guide, roadmap stage and sources.</p>';
    return;
  }
  const hidden = isSpoilerHidden(trophy, state);
  const stage = ROADMAP_STAGES.find((s) => s.stage === trophy.stage);
  let html = '<p class="detail-kicker">Trophy #' + trophy.id + ' of 55</p>';
  html += '<h2>' + escapeHtml(displayName(trophy, state)) + '</h2>';
  html += '<p class="detail-desc">' + escapeHtml(displayDescription(trophy, state)) + '</p>';
  html += '<div class="detail-meta">' + badgesHtml(trophy) + '<span class="tag">Stage ' + trophy.stage + '</span></div>';
  if (hidden) {
    html += '<p class="guide-text">This is a hidden story trophy. Its name, description and guide stay hidden while “Hide spoilers” is on and the trophy is unearned. Earn it — or turn the spoiler setting off — to reveal the guide.</p>';
  } else {
    html += '<h3>Guide</h3><p class="guide-text">' + escapeHtml(trophy.guide) + '</p>';
    if (trophy.missable) {
      html += '<div class="missable-note"><strong>Missable:</strong> this trophy is tied to a one-time story moment. Grab it when it happens and check the tracker straight after; if it did not pop, reload a save from before the moment.</div>';
    }
    html += '<h3>Roadmap stage</h3><p class="guide-text">' + escapeHtml(stage ? stage.title : 'Stage ' + trophy.stage) + (stage ? ' — ' + escapeHtml(stage.sub) : '') + '</p>';
    html += '<h3>Sources</h3><ul class="sources-list">' + trophy.sources.map((s) => '<li>' + escapeHtml(s) + '</li>').join('') + '</ul>';
  }
  html += '<label class="detail-check"><input type="checkbox" id="detail-earned"' + (state.earned.has(trophy.id) ? ' checked' : '') + '> Earned</label>';
  panel.innerHTML = html;
  panel.querySelector('#detail-earned').addEventListener('change', () => onToggle(trophy.id));
}

export function renderRoadmap(trophies, state, onSelect) {
  const wrap = document.getElementById('roadmap-stages');
  wrap.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const items = trophiesInStage(trophies, stage.stage);
    const done = items.filter((t) => state.earned.has(t.id)).length;
    const card = document.createElement('section');
    card.className = 'stage-card';
    let html = '<h2>' + escapeHtml(stage.title) + '</h2><p class="stage-sub">' + escapeHtml(stage.sub) + '</p>';
    html += '<div class="stage-progress">' + done + ' of ' + items.length + ' earned</div>';
    html += '<div class="stage-track"><div class="stage-fill" style="width:' + (items.length ? Math.round((done / items.length) * 100) : 0) + '%"></div></div>';
    html += '<ul class="stage-list">';
    for (const t of items) {
      const isDone = state.earned.has(t.id);
      html += '<li class="stage-item' + (isDone ? ' done' : '') + '" data-id="' + t.id + '">' +
        '<span class="dot dot-' + t.grade + '"></span>' +
        '<span class="nm">' + escapeHtml(displayName(t, state)) + '</span>' +
        (t.missable ? '<span class="flag">Missable</span>' : '') +
        (isDone ? '<span aria-label="earned">&#10003;</span>' : '') + '</li>';
    }
    html += '</ul>';
    card.innerHTML = html;
    card.querySelectorAll('.stage-item').forEach((el) => {
      el.addEventListener('click', () => onSelect(Number(el.dataset.id)));
    });
    wrap.appendChild(card);
  }
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
