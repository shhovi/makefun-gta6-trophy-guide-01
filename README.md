# Vice Trophy Guide — GTA VI trophy tracker & platinum roadmap

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

## What it is

A fan-made tracker for a fictional 55-trophy list set in Vice City and Leonida. Tick trophies off as you earn them, watch the progress bar fill, and follow a six-step platinum roadmap that runs from story first through collectibles cleanup to the final sweep. Filters let you focus on missable trophies or reveal spoiler trophies when you are ready, and your progress is saved in the browser with localStorage so it survives reloads.

**Platinum route:** story first with a missables watch, then collectibles cleanup, side activities, challenges, and a final sweep with the tracker.

## Run it

```
node main.ts
```

Then open http://localhost:4173 in your browser.

## Screenshots

- `screenshots/1-tracker.jpg` — the main tracker list with the progress bar and trophy rows.
- `screenshots/2-roadmap.jpg` — the six-step platinum roadmap view.
- `screenshots/3-missable.jpg` — only the missable trophies.
- `screenshots/4-spoiler.jpg` — the full list with spoiler trophies revealed.

Regenerate them deterministically with:

```
node main.ts --shots
```

## Data

All guide content lives in `app/data/trophies.json`. The document has a `game` title, a `total` count, a `trophies` array (each entry with `id`, `name`, `tier`, `description`, `missable`, `spoiler`, `chapter`, and `how`), and a `roadmap` array of ordered steps with `step`, `title`, and `detail`.

Built for [make.fun](https://make.fun). MIT licensed — see `LICENSE`.
