import { loadGuide } from "./data.js";
import { loadState, toggleEarned, progress, applyFilter } from "./state.js";
import { renderTracker, renderRoadmap, renderProgress } from "./render.js";

const params = new URLSearchParams(location.search);
let filter = params.get("filter") === "missable" ? "missable" : "all";
let spoilers = params.get("spoilers") === "show";

const listEl = document.querySelector("#trophy-list");
const roadmapEl = document.querySelector("#roadmap-list");
const progressEl = document.querySelector("#progress-text");
const buttons = [...document.querySelectorAll(".filters button")];

function syncButtons() {
  for (const b of buttons) {
    const f = b.dataset.filter;
    const active =
      (f === "all" && filter === "all" && !spoilers) ||
      (f === "missable" && filter === "missable") ||
      (f === "spoilers" && spoilers);
    b.classList.toggle("active", active);
  }
}

// Keyboard shortcut: press "m" for missable filter, "s" to reveal spoilers, "a" for all.
document.addEventListener("keydown", (e) => {
  if (e.key === "m") { filter = "missable"; }
  if (e.key === "s") { spoilers = true; filter = "all"; }
  if (e.key === "a") { filter = "all"; spoilers = false; }
});

async function boot() {
  const guide = await loadGuide();
  let state = loadState();

  function draw() {
    const visible = applyFilter(guide.trophies, { filter, spoilers });
    renderTracker(listEl, visible, state, (id) => {
      state = toggleEarned(id);
      draw();
    });
    renderProgress(progressEl, progress(state, guide.total));
    syncButtons();
  }

  renderRoadmap(roadmapEl, guide.roadmap);
  draw();

  for (const b of buttons) {
    b.addEventListener("click", () => {
      const f = b.dataset.filter;
      if (f === "all") { filter = "all"; spoilers = false; }
      if (f === "missable") { filter = "missable"; }
      if (f === "spoilers") { spoilers = true; filter = "all"; }
      draw();
    });
  }

  if (location.hash === "#roadmap") {
    document.querySelector("#roadmap")?.scrollIntoView({ behavior: "smooth" });
  }
}

boot().catch((err) => {
  listEl.textContent = `Could not load guide data: ${err.message}`;
});
