# Vice Trophy Guide — GTA VI trophy tracker & platinum roadmap

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Built for [make.fun](https://make.fun) — a fan-made trophy tracker and platinum roadmap for GTA VI.

## What it does

Vice Trophy Guide tracks **55 trophies: 1 platinum, 8 gold, 18 silver, 28 bronze**.

- **Tracker with check-off state** — tick trophies as you earn them; progress is saved in your browser (localStorage) and shown as a completion bar plus per-tier counts.
- **Platinum roadmap phases** — trophies are grouped into 5 phases (from first steps in Leonida to final cleanup) so you can follow a sensible platinum order.
- **Missable filter** — instantly narrow the list to trophies that can be permanently missed, so you never lock yourself out of the platinum.
- **Spoiler toggle** — story trophy names stay blurred until you choose to reveal them.
- **Tier filter** — view platinum, gold, silver, or bronze trophies on their own.

## How to run

- `node main.ts` — renders the static outputs (snapshot HTML, `summary.json`, and the four screenshots) into `MAKEFUN_OUTPUT_DIR` (default `out/`), then exits. This is the fast, non-interactive grade run.
- `node serve.ts` — starts a tiny static server for the interactive app in `app/` on port `PORT` (default 3000). Open the printed URL in a browser to use the tracker.

## Roadmap phases

1. **Phase 1 — First steps in Leonida:** prologue, first safehouses, early collectibles.
2. **Phase 2 — Settle in and explore:** districts, vehicles, companion and side activities.
3. **Phase 3 — Mid-game push:** heists, races, and the story's turning points (mind the missables).
4. **Phase 4 — Late-game cleanup:** remaining collectibles, combat challenges, online milestones.
5. **Phase 5 — Platinum finish:** businesses, top ranks, and the platinum itself.

## A note on trophy names

GTA VI is unreleased and has no official trophy list. Every trophy name and description in this app is an **original fan-made placeholder** invented for this tracker (Vice City / Leonida flavored) — none of it comes from leaks or official sources. Swap in the real list when the game ships; the tracker, roadmap, and filters work the same.

## Layout

- `app/index.html` — single-page app shell
- `app/style.css` — dark Vice-City-neon theme
- `app/src/` — data loading, state, rendering, and wiring (ES modules, no dependencies)
- `app/data/trophies.json` — the 55 placeholder trophies
- `main.ts` — fast render run (static snapshot + summary + screenshots)
- `serve.ts` — manual static server (never imported by `main.ts`)
