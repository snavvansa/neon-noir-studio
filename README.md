# neon-noir-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/snavvansa/neon-noir-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/snavvansa/neon-noir-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Nightshift Studio is an original, offline cover-art editor. Turn your own photo and caption into a cinematic triptych with three independently positioned photo frames, three compositions, three color stories, and a full-resolution PNG export in square, portrait or landscape format. No network requests, accounts or external dependencies.

## Run it

```sh
node serve.ts
# Open http://localhost:8080 in a desktop browser.
```

Select a frame and replace its sample photo with your own. The first upload fills all frames; choose another frame and replace it independently for a multi-photo story. Drag on the canvas or use the zoom and pan controls. Choose a layout, palette and size, edit the title and edition line, and export your PNG. The bundled sample portraits were made with an image model for the make.fun kit; no real person's photograph is required to try the app.

To reproduce the local browser test and genuine screenshot captures, run `node tests/browser.mjs` while the server runs, then `python3 tests/resize.py` to fit the editor capture into the competition's screenshot cap. That test uses a locally installed Playwright at the documented path; the app itself only requires Node 22.18+ to serve it. The kit can validate the repo with `node cli/makefun.mjs check --kit . --repo ../neon-noir-studio` from `../kit/gta6-cover-art-01-kit`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=7pb8t6nt&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
