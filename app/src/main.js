// Vice Trophy Guide — app wiring: filters, search, spoiler toggle, reset.
(function () {
  'use strict';

  const ui = {
    filter: 'all',
    query: '',
    showSpoilers: false,
  };

  let all = [];

  function applyFilter(list) {
    let out = list;
    if (ui.query.trim()) out = window.TrophyData.search(out, ui.query);
    return out.filter((t) => {
      switch (ui.filter) {
        case 'earned': return window.TrophyState.has(t.id);
        case 'missing': return !window.TrophyState.has(t.id);
        case 'missable': return t.missable;
        case 'spoiler-safe': return !t.spoiler;
        default: return true;
      }
    });
  }

  function render() {
    const visible = applyFilter(all);
    window.TrophyRender.renderTracker(visible, ui);
    window.TrophyRender.renderRoadmap(all, ui);
    window.TrophyRender.renderProgress(all.length);
  }

  function readUrlParams() {
    const params = new URLSearchParams(location.search);
    const f = params.get('filter');
    if (f) ui.filter = f;
    if (params.get('spoilers') === 'show') ui.showSpoilers = true;
    document.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.filter === ui.filter);
    });
    document.getElementById('show-spoilers').checked = ui.showSpoilers;
  }

  function wire() {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        ui.filter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b === btn));
        render();
      });
    });

    document.getElementById('search').addEventListener('input', (e) => {
      ui.query = e.target.value;
      render();
    });

    document.getElementById('show-spoilers').addEventListener('change', (e) => {
      ui.showSpoilers = e.target.checked;
      render();
    });

    document.getElementById('reset').addEventListener('click', () => {
      if (confirm('Reset all trophy progress?')) {
        window.TrophyState.reset();
        render();
      }
    });

    document.getElementById('trophy-grid').addEventListener('change', (e) => {
      if (e.target.classList.contains('trophy-check')) {
        window.TrophyState.toggle(e.target.dataset.id);
        render();
      }
    });
  }

  async function init() {
    window.TrophyState.load();
    readUrlParams();
    wire();
    try {
      all = await window.TrophyData.load();
    } catch (e) {
      document.getElementById('trophy-grid').innerHTML =
        '<p class="empty">Could not load trophy data. Run the local server (node serve.ts) and reload.</p>';
      return;
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
