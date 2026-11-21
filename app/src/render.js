import { TIERS } from "./data.js";
import { isEarned } from "./state.js";

export function renderTracker(container, trophies, state, onToggle) {
  container.innerHTML = "";
  if (trophies.length === 0) {
    const empty = document.createElement("p");
    empty.className = "trophy-desc";
    empty.textContent = "No trophies match this filter yet.";
    container.append(empty);
    return;
  }
  for (const t of trophies) {
    const row = document.createElement("article");
    row.className = `trophy ${t.tier}` + (isEarned(state, t.id) ? " earned" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = isEarned(state, t.id);
    cb.setAttribute("aria-label", `Mark ${t.name} earned`);
    cb.addEventListener("change", () => onToggle(t.id));

    const body = document.createElement("div");
    const head = document.createElement("div");
    const name = document.createElement("span");
    name.className = "trophy-name";
    name.textContent = t.name;
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = TIERS[t.tier]?.label || t.tier;
    head.append(name, " ", badge);
    if (t.missable) {
      const tag = document.createElement("span");
      tag.className = "tag missable";
      tag.textContent = "Missable";
      head.append(tag);
    }
    if (t.spoiler) {
      const tag = document.createElement("span");
      tag.className = "tag spoiler";
      tag.textContent = "Spoiler";
      head.append(tag);
    }
    const desc = document.createElement("div");
    desc.className = "trophy-desc";
    desc.textContent = t.description;
    const how = document.createElement("div");
    how.className = "trophy-how";
    how.textContent = t.how;
    body.append(head, desc, how);
    row.append(cb, body);
    container.append(row);
  }
}

export function renderRoadmap(container, steps) {
  container.innerHTML = "";
  for (const s of steps) {
    const li = document.createElement("li");
    const title = document.createElement("span");
    title.className = "step-title";
    title.textContent = `Step ${s.step}: ${s.title}`;
    const detail = document.createElement("div");
    detail.textContent = s.detail;
    li.append(title, detail);
    container.append(li);
  }
}

export function renderProgress(el, prog) {
  const fill = document.querySelector("#progress-fill");
  if (fill) fill.style.width = `${prog.pct}%`;
  if (el) el.textContent = `${prog.earned} / ${prog.total} earned (${prog.pct}%)`;
}
