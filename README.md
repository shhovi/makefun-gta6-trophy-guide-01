# Vice Trophy Guide — GTA VI trophy tracker & platinum roadmap
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

## What it is

Vice Trophy Guide is an offline trophy tracker and platinum roadmap for a fictional GTA VI-style game set in Leonida. It lists 55 trophies with descriptions, rarity tiers, categories, missable flags, and spoiler flags, plus a 5-step roadmap to the platinum "King of Leonida". No accounts, no tracking — everything runs in your browser and saves to localStorage.

Built as an entry for the [make.fun](https://make.fun) bounty gta6-trophy-guide-01.

## Features

- Checklist of all 55 trophies with a live progress percentage and progress bar
- Filters: all / earned / missing / missable / spoiler-safe
- Search by trophy name or description
- Step-by-step platinum roadmap view grouped into 5 steps
- Spoiler blur toggle — spoiler trophies stay blurred until you opt in
- Progress persists in localStorage; reset button to start over
- Plain JS + CSS, no build step, works offline

## Run it

Option A — tiny static server (Node 18+):

```bash
node serve.ts
# then open http://localhost:4173
```

Option B — just open the file:

```bash
open app/index.html
```

Note: fetching `app/data/trophies.json` needs an HTTP origin in some browsers, so the server route is recommended.

## Roadmap summary

1. **Step 1 — Story:** finish the main story. Grab the 6 missable trophies along the way (they're flagged in the tracker).
2. **Step 2 — Missables cleanup:** mop up anything missable you skipped via mission replay or a second save.
3. **Step 3 — Collectibles:** hidden packages, stunt jumps, landmarks, and other Leonida collectibles.
4. **Step 4 — Activities:** races, side jobs, combat challenges, and exploration feats.
5. **Step 5 — Online & final:** online trophies and the last grind to platinum.

## Data

All 55 trophies live in `app/data/trophies.json` — edit it to match real trophy lists once they're published. Each entry has an id, name, description, type (bronze/silver/gold/platinum), category, missable flag, spoiler flag, and roadmap step.

## Tips

- Filter by **Missable** before starting the story — those 6 trophies are the only ones you can permanently lose.
- Use **Spoiler-safe** mode plus the spoiler blur if you want to hunt trophies without story reveals.
- The roadmap view mirrors your tracker progress, so check off trophies in either place.
- Progress is per-browser (localStorage key `vice-trophy-guide:earned:v1`) — use the same browser to keep your checklist.

## License

MIT — see `LICENSE`. Fan project; not affiliated with Rockstar Games or Take-Two Interactive.
