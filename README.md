# Profile Workshop

Source for the ROGFOG profile artwork and Signal Route, a browser circuit puzzle.
The profile links to the game through an SVG preview because README files cannot
run the game's JavaScript.

[Play Signal Route](https://rogfog.github.io/ProfileWorkshop/game/) ·
[Browse the workshop](https://rogfog.github.io/ProfileWorkshop/)

![Signal Route](assets/signal-preview.svg)

## The game

Rotate tiles to connect the left source to the right receiver. Classic contains
four prepared circuits and a final turn summary. Endless starts at 4 × 4 and adds
one row and column after each completed stage. Each stage awards points once;
reset keeps turns already spent. Switching modes preserves both runs for the
current visit. Reloading clears progress.

Large boards use a scrollable view with zoom and Source/Receiver navigation.
Only nearby cells are rendered. A seed reproduces the route, while filler tiles
are computed as needed. There are no hints, accounts or saved scores.

## Run and check

Node.js 24+; no package installation:

```sh
npm start
```

Open http://127.0.0.1:4178. Stop the server with Ctrl+C.

```sh
npm test
npm run check
npm run build
python verify.py dist
```

On systems where Python is named `python3`, use that command for the last step.
The build copies an explicit list of site files to `dist/`; Pages deploys this
folder. `serve.mjs` provides the local HTTP preview. `verify.py` checks HTML links,
anchors and SVG title/description elements and runs in both CI and Pages builds.

Checked on Windows with Node.js 24.14.0 and Python 3.12.14: 24 game tests, script
and profile checks, static build and local-reference verification. The tests
include 480 seed/size combinations, scoring, receiver connections and viewport
selection. Browser layout and touch interaction still need their own checks.

## Source map

| File | Responsibility |
| --- | --- |
| `game/logic.mjs`, `game/levels.mjs` | Rotation, reciprocal ports, classic circuits |
| `game/endless.mjs` | Seeded route generation and points |
| `game/progress.mjs` | Best completed classic attempts |
| `game/viewport.mjs` | Visible cell selection |
| `game/app.mjs` | Controls, board rendering and visit state |
| `assets/` | SVG header and project previews |
| `profile/` | Profile README, artwork and its CI check |
| `signal.html`, `profile.js`, `profile.css` | HTML preview of the profile |
| `build-site.mjs`, `verify.py` | Pages packaging and local link checks |

[Game notes](game/README.md) describe the tile masks, level format and score
formula. [Build notes](how-it-works.html) connect the artwork, profile and game.
The current profile is [ROGFOG/ROGFOG](https://github.com/ROGFOG/ROGFOG).

## Known issues

The game requires HTTP or HTTPS and a browser with ES module support. The old
single-file offline export has been removed; the maintained entry point is
`game/index.html`. Progress is held in memory. Browser scrolling, memory and
numeric limits bound very large endless boards. The score bonus uses a known
solving route; it does not calculate the shortest possible solution.

## Publishing and reuse

CI checks pull requests with read-only repository permissions. The Pages workflow
builds main and deploys it in a separate job. The repository uses the GitHub
Actions Pages source; [GitHub's setup guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
explains that configuration.

The code and SVG artwork use [MIT](LICENSE). No third-party application code,
fonts or artwork are bundled. Keep the full copyright and permission notice
when redistributing these files.
