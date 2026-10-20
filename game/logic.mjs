/** Pure, dependency-free Signal Route rules. N=1, E=2, S=4, W=8. */
export const N = 1, E = 2, S = 4, W = 8;
export const DIRECTIONS = Object.freeze([
  { bit: N, opposite: S, dr: -1, dc: 0, name: 'north' },
  { bit: E, opposite: W, dr: 0, dc: 1, name: 'east' },
  { bit: S, opposite: N, dr: 1, dc: 0, name: 'south' },
  { bit: W, opposite: E, dr: 0, dc: -1, name: 'west' },
]);

export function rotate(mask, turns = 1) {
  let result = mask;
  for (let i = 0; i < ((turns % 4) + 4) % 4; i += 1) {
    result = ((result << 1) & 15) | ((result >> 3) & 1);
  }
  return result;
}

const specs = [
  { name: 'First contact', size: 4, note: 'Connect the source on the left to the receiver on the right.', path: [[1,0],[1,1],[0,1],[0,2],[1,2],[2,2],[2,3]] },
  { name: 'The long way', size: 5, note: 'The route turns back toward the top of the board.', path: [[3,0],[3,1],[2,1],[1,1],[1,2],[1,3],[2,3],[3,3],[3,4]] },
  { name: 'Switchback', size: 5, note: 'Look for the vertical connections between the corners.', path: [[0,0],[1,0],[2,0],[2,1],[2,2],[1,2],[0,2],[0,3],[0,4],[1,4],[2,4]] },
  { name: 'Across the network', size: 6, note: 'Connect both edges across the larger board.', path: [[4,0],[4,1],[4,2],[3,2],[2,2],[2,1],[1,1],[0,1],[0,2],[0,3],[1,3],[2,3],[2,4],[3,4],[4,4],[4,5]] },
];

function directionBetween([r, c], [nr, nc]) {
  const direction = DIRECTIONS.find(({ dr, dc }) => r + dr === nr && c + dc === nc);
  if (!direction) throw new Error('Path steps must share an edge.');
  return direction.bit;
}

/** Each level returns independent mutable arrays. solution is a verified witness. */
export function createLevel(index) {
  const spec = specs[index];
  if (!spec) throw new RangeError('Unknown level.');
  const { size, path } = spec;
  const solution = Array.from({ length: size * size }, (_, i) => rotate(i % 3 === 0 ? N | S : N | E, (i + index) % 4));
  path.forEach((point, step) => {
    const previous = step === 0 ? [point[0], -1] : path[step - 1];
    const next = step === path.length - 1 ? [point[0], size] : path[step + 1];
    solution[point[0] * size + point[1]] = directionBetween(point, previous) | directionBetween(point, next);
  });
  const tiles = solution.map((mask, i) => rotate(mask, ((i * 7 + index * 3) % 3) + 1));
  const source = path[0][0] * size;
  const target = path.at(-1)[0] * size + size - 1;
  // Always start with the external source disconnected. No accidental solved boards.
  while (tiles[source] & W) tiles[source] = rotate(tiles[source]);
  return { id: index, name: spec.name, note: spec.note, size, source, target, tiles, solution, path: path.map(point => [...point]) };
}

export const LEVEL_COUNT = specs.length;

/** Signal crosses only reciprocal ports and starts at the external west source. */
export function traceSignal(tiles, size, source, target) {
  const powered = new Set();
  if (!(tiles[source] & W)) return { powered, solved: false };
  powered.add(source);
  const queue = [source];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const r = Math.floor(current / size), c = current % size;
    for (const { bit, opposite, dr, dc } of DIRECTIONS) {
      const nr = r + dr, nc = c + dc;
      if (!(tiles[current] & bit) || nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const next = nr * size + nc;
      if ((tiles[next] & opposite) && !powered.has(next)) {
        powered.add(next);
        queue.push(next);
      }
    }
  }
  return { powered, solved: powered.has(target) && Boolean(tiles[target] & E) };
}
