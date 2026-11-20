# GTA VI Trophy Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shhovi/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline checklist for all 55 PlayStation 5 trophies in Grand Theft Auto VI, based on the official trophy list dated 2026-11-18. Tick trophies off as you earn them, filter by kind, grade, or status, search by name, and open any trophy for a short guide and its sources. A spoiler toggle keeps hidden trophies secret until you earn them, and a five-stage roadmap groups everything into Story, Missables, Collectibles, Activities, and Platinum so you always know what to do next. Progress lives in your browser's localStorage and can be exported or imported as JSON — no account, no server, no network needed after the page loads.

## Features

- Checklist of all 55 trophies with earned checkboxes saved in localStorage
- Filters for kind, grade, earned/remaining status, plus free-text search
- Spoiler toggle that hides hidden trophies' names and descriptions until earned
- Detail panel with a short guide and sources for every trophy
- Progress summary with earned count, percent complete, and per-grade totals
- Five-stage platinum roadmap: Story, Missables, Collectibles, Activities, Platinum
- Export/import of progress as a JSON file

## Run it

Preview the tracker locally:

```sh
node serve.ts
```

Then open http://localhost:8080/ in your browser.

Build the make.fun dossier (copies `app/` and `screenshots/` into the output folder and writes `dossier.json`):

```sh
node main.ts
```

Set `MAKEFUN_OUTPUT_DIR` to choose the output folder; it defaults to `/output`.

## Built for make.fun

This project was built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01). If you want to join make.fun yourself, you can use this referral link: https://make.fun/r/kjey9p15

## License

MIT — do what you like with it.
