import { loadTrophies } from "./data.js";
import { loadState, toggle, progress } from "./state.js";
import { renderTrophies, renderRoadmap } from "./render.js";

const grid = document.getElementById("trophy-grid");
const roadmapList = document.getElementById("roadmap-list");
const emptyState = document.getElementById("empty-state");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const tierFilter = document.getElementById("tier-filter");
const missableOnly = document.getElementById("missable-only");
const showSpoilers = document.getElementById("show-spoilers");

let trophies = [];
let state = loadState();

function currentFilters() {
  return {
    tier: tierFilter.value,
    missableOnly: missableOnly.checked,
    showSpoilers: showSpoilers.checked
  };
}

function renderAll() {
  const p = progress(trophies, state);
  progressFill.style.width = p.percent + "%";
  progressText.textContent =
    p.done + " / " + p.total + " trophies · " + p.percent + "%" +
    " · Platinum " + p.byTier.platinum.done + "/" + p.byTier.platinum.total +
    " · Gold " + p.byTier.gold.done + "/" + p.byTier.gold.total +
    " · Silver " + p.byTier.silver.done + "/" + p.byTier.silver.total +
    " · Bronze " + p.byTier.bronze.done + "/" + p.byTier.bronze.total;

  const visibleCount = renderTrophies(grid, trophies, state, currentFilters(), (id) => {
    state = toggle(state, id);
    renderAll();
  });
  emptyState.hidden = visibleCount !== 0;
  renderRoadmap(roadmapList, trophies, state);
}

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("filter") === "missable") {
    missableOnly.checked = true;
  }
  if (params.get("spoilers") === "show") {
    showSpoilers.checked = true;
  }
  const tier = params.get("tier");
  if (tier && ["platinum", "gold", "silver", "bronze"].includes(tier)) {
    tierFilter.value = tier;
  }
}

tierFilter.addEventListener("change", renderAll);
missableOnly.addEventListener("change", renderAll);
showSpoilers.addEventListener("change", renderAll);

// Keyboard shortcuts: "m" toggles missable-only, "s" toggles spoilers.
document.addEventListener("keydown", (event) => {
  if (event.target && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (event.key === "m") {
    missableOnly.checked = !missableOnly.checked;
    renderAll();
  } else if (event.key === "s") {
    showSpoilers.checked = !showSpoilers.checked;
    renderAll();
  }
});

applyUrlParams();

loadTrophies()
  .then((loaded) => {
    trophies = loaded;
    renderAll();
    if (window.location.hash === "#roadmap") {
      document.getElementById("roadmap").scrollIntoView();
    }
  })
  .catch((err) => {
    progressText.textContent = "Could not load trophies: " + err.message;
  });
