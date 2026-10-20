/** Pure, dependency-free Signal Route rules. N=1, E=2, S=4, W=8. */
import { CLASSIC_LEVELS } from './levels.mjs';
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

const specs = CLASSIC_LEVELS;

export function validatePath(path, size) {
  if (!Number.isInteger(size) || size < 2 || !Number.isSafeInteger(size * size)) throw new RangeError('Invalid board size.');
  if (!Array.isArray(path) || path.length < 2) throw new RangeError('A route needs at least two cells.');
  const seen = new Set();
  path.forEach((point, index) => {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(value => Number.isInteger(value) && value >= 0 && value < size)) throw new RangeError('Route leaves the board.');
    const key = point[0] * size + point[1];
    if (seen.has(key)) throw new RangeError('Route repeats a cell.');
    seen.add(key);
    if (index && Math.abs(point[0] - path[index - 1][0]) + Math.abs(point[1] - path[index - 1][1]) !== 1) throw new RangeError('Route steps must share an edge.');
  });
  if (path[0][1] !== 0 || path.at(-1)[1] !== size - 1) throw new RangeError('Route must join the west and east edges.');
  return true;
}

function directionBetween([r, c], [nr, nc]) {
  const direction = DIRECTIONS.find(({ dr, dc }) => r + dr === nr && c + dc === nc);
  if (!direction) throw new Error('Path steps must share an edge.');
  return direction.bit;
}

/** Each level returns independent mutable arrays. solution is a verified witness. */
export function createLevel(index) {
  const spec = specs[index];
  if (!spec) throw new RangeError('Unknown level.');
  return createLevelFromSpec(spec, index);
}

export function createLevelFromSpec(spec, index = 0) {
  const { size, path } = spec;
  validatePath(path, size);
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
  const at = typeof tiles === 'function' ? tiles : index => tiles[index];
  const powered = new Set();
  if (!(at(source) & W)) return { powered, solved: false };
  powered.add(source);
  const queue = [source];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const r = Math.floor(current / size), c = current % size;
    for (const { bit, opposite, dr, dc } of DIRECTIONS) {
      const nr = r + dr, nc = c + dc;
      if (!(at(current) & bit) || nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const next = nr * size + nc;
      if ((at(next) & opposite) && !powered.has(next)) {
        powered.add(next);
        queue.push(next);
      }
    }
  }
  return { powered, solved: powered.has(target) };
}
