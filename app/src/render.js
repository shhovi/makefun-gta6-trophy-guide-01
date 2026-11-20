// Rendering: builds the summary strip, the checklist, the roadmap
// groups, and the detail panel. Pure DOM work — no state lives here.

import { stageLabel, STAGE_NAMES } from './data.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function displayName(trophy, earned, hideSpoilers) {
  if (trophy.hidden && hideSpoilers && !earned) return 'Hidden trophy';
  return trophy.name;
}

function displayDesc(trophy, earned, hideSpoilers) {
  if (trophy.hidden && hideSpoilers && !earned) return 'Hidden — earn it to reveal the description.';
  return trophy.description;
}

function tagsFor(trophy) {
  const wrap = el('div', 'tags');
  const grade = el('span', `tag ${trophy.grade}`, trophy.grade);
  wrap.append(grade);
  wrap.append(el('span', 'tag', trophy.kind));
  wrap.append(el('span', 'tag', stageLabel(trophy.stage)));
  if (trophy.missable) wrap.append(el('span', 'tag missable', 'missable'));
  if (trophy.hidden) wrap.append(el('span', 'tag hidden', 'hidden'));
  return wrap;
}

export function renderSummary(mount, trophies, state) {
  mount.replaceChildren();
  const total = trophies.length;
  const done = trophies.filter((t) => state.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const stats = [
    [`${done} / ${total}`, 'earned'],
    [`${pct}%`, 'complete'],
    [String(total - done), 'remaining'],
  ];
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => state.has(t.id)).length;
    stats.push([`${got} / ${inGrade.length}`, grade]);
  }
  for (const [value, label] of stats) {
    const box = el('div', 'stat');
    box.append(el('b', '', value), el('span', '', label));
    mount.append(box);
  }
  const bar = el('div', 'bar');
  const fill = document.createElement('i');
  fill.style.width = `${pct}%`;
  bar.append(fill);
  mount.append(bar);
}

export function trophyRow(trophy, state, opts) {
  const earned = state.has(trophy.id);
  const row = el('button', 'row');
  row.type = 'button';
  row.dataset.id = String(trophy.id);
  if (opts.selectedId === String(trophy.id)) row.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('click', (ev) => ev.stopPropagation());
  box.addEventListener('change', () => opts.onToggle(trophy.id));

  const body = el('div');
  body.append(
    el('div', 'name', displayName(trophy, earned, opts.hideSpoilers)),
    el('div', 'desc', displayDesc(trophy, earned, opts.hideSpoilers)),
    tagsFor(trophy),
  );

  row.append(box, body);
  row.addEventListener('click', () => opts.onSelect(trophy.id));
  return row;
}

export function renderList(mount, trophies, state, opts) {
  mount.replaceChildren();
  if (!trophies.length) {
    mount.append(el('p', 'empty', 'No trophies match the current filters.'));
    return;
  }
  for (const trophy of trophies) mount.append(trophyRow(trophy, state, opts));
}

export function renderRoadmap(mount, trophies, state, opts) {
  mount.replaceChildren();
  const notes = {
    1: 'Play through the story first. These unlock as chapters and key missions finish.',
    2: 'Grab these while the story is still going — they can be missed for good.',
    3: 'Sweep Leonida for collectibles once the map is open to you.',
    4: 'Clean up activities, races, robberies, and side strands.',
    5: 'The final step: every other trophy earned unlocks the platinum.',
  };
  for (const stage of [1, 2, 3, 4, 5]) {
    const group = trophies.filter((t) => Number(t.stage) === stage);
    if (!group.length) continue;
    const done = group.filter((t) => state.has(t.id)).length;
    mount.append(el('h3', '', `Stage ${stage} · ${STAGE_NAMES[stage]} — ${done}/${group.length}`));
    mount.append(el('p', 'stage-note', notes[stage] || ''));
    const list = el('div', 'list');
    for (const trophy of group) list.append(trophyRow(trophy, state, opts));
    mount.append(list);
  }
}

export function renderDetail(mount, trophy, state, opts) {
  mount.replaceChildren();
  if (!trophy) {
    mount.append(el('p', 'hint', 'Pick a trophy to see its guide and sources.'));
    return;
  }
  const earned = state.has(trophy.id);
  const hiddenAway = trophy.hidden && opts.hideSpoilers && !earned;

  mount.append(el('h3', '', hiddenAway ? 'Hidden trophy' : trophy.name));
  mount.append(el('p', 'meta', hiddenAway ? 'Hidden — earn it to reveal the description.' : trophy.description));
  mount.append(tagsFor(trophy));

  const guideHead = el('h4', '', 'How to earn it');
  const guide = el(
    'p',
    'guide',
    hiddenAway
      ? 'The guide stays hidden while spoiler protection is on and this trophy is unearned. Tick it off once you have it, or switch spoiler protection off.'
      : trophy.guide || 'No guide text yet.',
  );
  mount.append(guideHead, guide);

  if (trophy.missable) {
    mount.append(el('p', 'guide', '⚠ Missable: this one can be lost if you play past it.'));
  }

  mount.append(el('h4', '', 'Sources'));
  const ul = document.createElement('ul');
  for (const src of trophy.sources || []) {
    const li = document.createElement('li');
    li.textContent = src;
    ul.append(li);
  }
  mount.append(ul);
  mount.append(el('p', 'meta', earned ? `Status: earned ✓ · ${stageLabel(trophy.stage)}` : `Status: not earned yet · ${stageLabel(trophy.stage)}`));
}
