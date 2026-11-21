function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function applyFilters(trophies, filters) {
  return trophies.filter((trophy) => {
    if (filters.tier && filters.tier !== "all" && trophy.tier !== filters.tier) return false;
    if (filters.missableOnly && !trophy.missable) return false;
    return true;
  });
}

export function renderTrophies(container, trophies, state, filters, onToggle) {
  container.textContent = "";
  const visible = applyFilters(trophies, filters);
  for (const trophy of visible) {
    const checked = Boolean(state[trophy.id]);
    const card = el("article", "trophy-card tier-" + trophy.tier + (checked ? " checked" : ""));

    const hideSpoiler = trophy.spoiler && !filters.showSpoilers;
    const name = el("div", "trophy-name" + (hideSpoiler ? " blurred" : ""), hideSpoiler ? "Spoiler trophy" : trophy.name);
    card.appendChild(name);

    const desc = el("p", "trophy-desc", hideSpoiler ? "Enable “Show spoilers” to reveal this trophy." : trophy.description);
    card.appendChild(desc);

    const meta = el("div", "trophy-meta");
    meta.appendChild(el("span", "badge", trophy.tier));
    meta.appendChild(el("span", "badge", trophy.category));
    meta.appendChild(el("span", "badge", "Phase " + trophy.phase));
    if (trophy.missable) meta.appendChild(el("span", "badge missable", "Missable"));
    if (trophy.spoiler) meta.appendChild(el("span", "badge spoiler", "Spoiler"));
    card.appendChild(meta);

    const label = el("label", "check-row");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = checked;
    box.addEventListener("change", () => onToggle(trophy.id));
    label.appendChild(box);
    label.appendChild(document.createTextNode(checked ? "Earned" : "Mark as earned"));
    card.appendChild(label);

    container.appendChild(card);
  }
  return visible.length;
}

const PHASE_TITLES = {
  1: "Phase 1 — First steps in Leonida",
  2: "Phase 2 — Settle in and explore",
  3: "Phase 3 — Mid-game push",
  4: "Phase 4 — Late-game cleanup",
  5: "Phase 5 — Platinum finish"
};

export function renderRoadmap(container, trophies, state) {
  container.textContent = "";
  for (let phase = 1; phase <= 5; phase += 1) {
    const inPhase = trophies.filter((t) => t.phase === phase);
    const done = inPhase.filter((t) => state[t.id]).length;
    const pct = inPhase.length === 0 ? 0 : Math.round((done / inPhase.length) * 100);

    const section = el("div", "phase");
    const head = el("div", "phase-head");
    head.appendChild(el("h3", "", PHASE_TITLES[phase]));
    head.appendChild(el("span", "phase-meta", done + " / " + inPhase.length + " · " + pct + "%" + (pct === 100 ? " · Complete!" : "")));
    section.appendChild(head);

    const bar = el("div", "phase-bar");
    const fill = el("div", "phase-fill");
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    section.appendChild(bar);

    const list = el("ul", "phase-list");
    for (const trophy of inPhase) {
      const item = el("li", state[trophy.id] ? "done" : "", trophy.name + " (" + trophy.tier + ")");
      list.appendChild(item);
    }
    section.appendChild(list);
    container.appendChild(section);
  }
}
