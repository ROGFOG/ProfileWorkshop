# Signal Route

A small original circuit puzzle for Profile Workshop. Rotate the tiles to carry a signal from the west source to the east receiver. Four circuits, keyboard and touch input, two color themes, and reduced motion support.

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
node --test logic.test.mjs
```

The tests verify every circuit has an unsolved starting state and an explicit solved orientation reachable only by rotating its tiles. They also check reciprocal connections, board boundaries, cycles, negative/full rotations, independent level copies, and invalid level selection.

## Files and rule API

- `index.html`: semantic page structure and controls.
- `style.css`: responsive design. The default theme uses charcoal, warm lettering and orange connections; `?theme=paper` selects the paper palette.
- `app.mjs`: browser rendering, keyboard handling, session-only progress, and motion control.
- `logic.mjs`: pure rotation, level generation, and graph traversal.
- `logic.test.mjs`: Node built-in tests, with no dependencies.

Ports are a four-bit mask: north `1`, east `2`, south `4`, west `8`. For example, a vertical straight is `5` and a north/east corner is `3`.

`rotate(mask, turns = 1)` rotates ports clockwise. It accepts negative turns and wraps every four turns.

`traceSignal(tiles, size, source, target)` returns `{ powered: Set<number>, solved: boolean }`. A tile is reached only across matching opposite ports. The source must face west to receive the external signal. The receiver must be reachable and face east to win. Open ends stop the signal. They do not invalidate an otherwise connected path. Tiles are a flat row-major array, with index `row * size + column`.

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

To add a circuit, add an item to `specs` in `logic.mjs`. `path` must start in column `0`, finish in column `size - 1`, stay inside the square board, never repeat a cell, and move one orthogonal cell per step. The generator derives the route masks and deterministic filler tiles, then rotates them for the start. Tests automatically include every circuit via `LEVEL_COUNT`.

## Input and accessibility

- Click, tap, Enter, or Space rotates a focused tile clockwise.
- Tab reaches every tile and control. Arrow keys move focus inside the board without wrapping at its edges.
- Focus stays on the current tile when the signal changes.
- Live announcements report turns and completion. Tile labels describe row, column, ports, endpoints, and signal state.
- Completed circuits remain marked during the current page visit. Reset affects the current board. Reload clears progress.
- The interface follows the operating system's reduced motion preference and includes a local toggle. No animation is needed to solve the game.

## License and verification

The code, circuit shapes and CSS visuals are project materials under the [MIT license](../LICENSE). No third-party images, font files or application libraries are bundled. Preserve the license notice when redistributing the source or artwork.

Passing the pure logic tests alone does not verify the page layout. After changing the interface, check a narrow screen, keyboard rotation and focus, reset, level selection and reduced motion in a browser.
