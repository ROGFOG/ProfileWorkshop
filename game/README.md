# Signal Route

A small original circuit puzzle for Profile Workshop. Rotate the tiles to carry a signal from the west source to the east receiver. Classic has four prepared circuits. Endless generates growing, solvable fields with points. Both support keyboard input, two color themes and reduced motion.

## Run locally

This game uses browser ES modules. Serve the workshop directory over HTTP instead of opening `index.html` as a local file. No build step, package installation, account, network API, tracking, cookies, or persistent browser storage is used.

Example, from the workshop directory with Python available:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/game/`. The light version is `http://127.0.0.1:8765/game/?theme=paper`. Stop the server with Ctrl+C.

## Verify logic

From this game directory, with Node.js available:

```powershell
node --test logic.test.mjs progress.test.mjs endless.test.mjs viewport.test.mjs
```

The tests sweep 480 seed/size combinations and verify every prepared circuit has an unsolved starting state and an explicit solved orientation reachable only by rotating its tiles. They also check reciprocal connections, board boundaries, cycles, negative/full rotations, independent level copies, and invalid level selection.

## Files and rule API

- `index.html`: semantic page structure and controls.
- `style.css`: responsive design. The default theme uses charcoal, warm lettering and orange connections; `?theme=paper` selects the paper palette.
- `app.mjs`: browser rendering, keyboard handling, session-only progress, and motion control.
- `logic.mjs`: pure rotation, path validation, classic construction and graph traversal.
- `levels.mjs`: editable classic catalog and a valid LEVEL_TEMPLATE.
- `endless.mjs`: verified route segments, seeded procedural fields and one-time stage scoring.
- `viewport.mjs`: visible-window cell selection, independent of total map area.
- `progress.mjs`: classic run completion and best-attempt totals.
- `logic.test.mjs`: Node built-in tests, with no dependencies.

Ports are a four-bit mask: north `1`, east `2`, south `4`, west `8`. For example, a vertical straight is `5` and a north/east corner is `3`.

`rotate(mask, turns = 1)` rotates ports clockwise. It accepts negative turns and wraps every four turns.

`traceSignal(tilesOrGetter, size, source, target)` returns `{ powered: Set<number>, solved: boolean }`. A tile is reached only across matching opposite ports. The source must face west to receive the external signal. The circuit is complete when the signal reaches the receiver through matching ports. The receiver does not need an external output. Open ends stop the signal. They do not invalidate an otherwise connected path. The first argument can be a flat array or a function returning a mask by index. Indices are row-major, with index `row * size + column`.

`createLevel(index)` returns an independent level object:

```js
{
  id, name, note, size,
  source, target, // row-major edge tile indices
  tiles,         // starting orientation masks
  solution,      // tested solved orientation masks, not rendered by the app
  path           // ordered [row, column] pairs used to build the solution
}
```

To add a classic circuit, copy `LEVEL_TEMPLATE` into `CLASSIC_LEVELS` in `levels.mjs`, then edit its name, size and path. `createLevelFromSpec` validates the route before generating tiles. `path` must start in column `0`, finish in column `size - 1`, stay inside the square board, never repeat a cell, and move one orthogonal cell per step. The generator derives the route masks and deterministic filler tiles, then rotates them for the start. Tests automatically include every circuit via `LEVEL_COUNT`.

## Input and accessibility

- Click, tap, Enter, or Space rotates a focused tile clockwise.
- Tab reaches every tile and control. Arrow keys move focus inside the board without wrapping at its edges.
- Focus stays on the current tile when the signal changes.
- Live announcements report turns and completion. Tile labels describe row, column, ports, endpoints, and signal state.
- Completed circuits remain marked during the current page visit. Reset affects the current board. Reload clears progress.
- Complete every distinct circuit to open the final screen. Replaying one circuit cannot substitute for the others. Total turns use the best completed attempt on each circuit during the visit. Play again clears all circuit marks and starts a fresh run; Keep exploring preserves them. Escape closes the final screen. Run summary reopens it after completion.
- The interface follows the operating system's reduced motion preference and includes a local toggle. No animation is needed to solve the game.

## License and verification

The code, circuit shapes and CSS visuals are project materials under the [MIT license](../LICENSE). No third-party images, font files or application libraries are bundled. Preserve the license notice when redistributing the source or artwork.

Passing the pure logic tests alone does not verify the page layout. After changing the interface, check a narrow screen, keyboard rotation and focus, reset, level selection and reduced motion in a browser.

## Endless generation and points

`createEndlessLevel(stage, seed)` starts at size `stage + 3`, so each next stage
adds one row and one column. It joins prechecked adjacent path segments that
exit to the next column, then validates the assembled path. The path cannot
repeat a cell because completed columns are not revisited. A solved orientation
is derived from this path. The generator verifies connectivity, scrambles tile
rotations and verifies that the start is unsolved. A source facing away from the
external input prevents an accidentally completed starting board.

The level exposes `initialAt(index)` and `solutionAt(index)` getters. Filler masks
are computed from the seed and coordinates, while only the route is stored.
Reusing the same seed and stage reproduces the same field. The witness route
is for generation and checks; the player is not shown a solution or hint.

The score uses `base = 100 + 25 * stage + 5 * pathLength`, plus a bonus of
`round(base * 0.5 * min(1, referenceTurns / actualTurns))`. Reference turns restore
the saved route and are an upper bound, not a proven optimum. Another route may
finish sooner; the efficiency bonus remains capped at half the base award.

Points are awarded once per stage. All turns count, including turns before a
reset. A completed endless field is locked until advancing. Run summary reports
points, cleared stages and total turns. New run starts a different seeded run
at 4 by 4 with zero points. Classic and endless state remain separate in memory.
Reload clears both; no cookies, storage or network requests are introduced.

## Larger fields

The scrollable map keeps only visible cells plus an overscan border in the DOM.
Arrow navigation and Source/Receiver controls move focus across that window.
Zoom changes the view without changing tiles, turns or score. Logical map growth
is not tied to a fixed viewport size. Every finite stage still depends on normal
browser memory and numeric limits; this is not a promise of unlimited resources.
