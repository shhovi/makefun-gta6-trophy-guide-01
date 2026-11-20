// Vice Trophy Guide — DOM rendering for tracker, roadmap, and progress.
(function () {
  'use strict';

  const STEP_TITLES = {
    1: 'Step 1 — Story',
    2: 'Step 2 — Missables cleanup',
    3: 'Step 3 — Collectibles',
    4: 'Step 4 — Activities',
    5: 'Step 5 — Online & final',
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function trophyCard(t, opts) {
    const earned = window.TrophyState.has(t.id);
    const blurred = t.spoiler && !opts.showSpoilers;
    const tags = [
      t.missable ? '<span class="tag tag-missable">Missable</span>' : '',
      t.spoiler ? '<span class="tag tag-spoiler">Spoiler</span>' : '',
    ].join('');
    return (
      '<article class="card' + (earned ? ' earned' : '') + (blurred ? ' spoiler-blur' : '') + '" data-id="' + t.id + '">' +
      '<label class="card-head">' +
      '<input type="checkbox" class="trophy-check" data-id="' + t.id + '"' + (earned ? ' checked' : '') + ' />' +
      '<span class="trophy-name">' + escapeHtml(t.name) + '</span>' +
      '</label>' +
      '<p class="trophy-desc">' + escapeHtml(t.description) + '</p>' +
      '<div class="card-meta">' +
      '<span class="badge badge-' + t.type + '">' + t.type + '</span>' +
      '<span class="category">' + escapeHtml(t.category) + '</span>' + tags +
      '</div></article>'
    );
  }

  function renderTracker(trophies, opts) {
    const grid = document.getElementById('trophy-grid');
    const empty = document.getElementById('empty');
    grid.innerHTML = trophies.map((t) => trophyCard(t, opts)).join('');
    empty.hidden = trophies.length > 0;
  }

  function renderRoadmap(trophies, opts) {
    const wrap = document.getElementById('roadmap-steps');
    const groups = window.TrophyData.byStep(trophies);
    wrap.innerHTML = Object.keys(groups)
      .sort((a, b) => a - b)
      .map((step) => {
        const items = groups[step]
          .map((t) => {
            const done = window.TrophyState.has(t.id);
            const blurred = t.spoiler && !opts.showSpoilers;
            return (
              '<li class="' + (done ? 'done' : '') + (blurred ? ' spoiler-blur' : '') + '">' +
              '<span class="badge badge-' + t.type + '">' + t.type + '</span> ' +
              escapeHtml(t.name) +
              (t.missable ? ' <span class="tag tag-missable">Missable</span>' : '') +
              '</li>'
            );
          })
          .join('');
        return '<div class="roadmap-step"><h3>' + (STEP_TITLES[step] || 'Step ' + step) + '</h3><ul>' + items + '</ul></div>';
      })
      .join('');
  }

  function renderProgress(total) {
    const p = window.TrophyState.progress(total);
    document.getElementById('progress-fill').style.width = p.percent + '%';
    document.getElementById('progress-text').textContent =
      p.count + ' / ' + p.total + ' — ' + p.percent + '%' +
      (p.total > 0 && p.count === p.total ? ' 🏆 Platinum!' : '');
  }

  window.TrophyRender = { renderTracker, renderRoadmap, renderProgress };
})();
