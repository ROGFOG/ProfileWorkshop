import { N, E, S, W, rotate, validatePath, traceSignal } from './logic.mjs';

/** Each checked piece stays in one column, then exits one column east. */
export const ROUTE_SEGMENTS = Object.freeze([
  [[0,1]], [[-1,0],[0,1]], [[1,0],[0,1]],
  [[-1,0],[-1,0],[0,1]], [[1,0],[1,0],[0,1]],
].map(piece => Object.freeze(piece.map(step => Object.freeze(step)))));

function hashText(text) {
  let value = 2166136261;
  for (const char of String(text)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}
function mix(value) {
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return (value ^ (value >>> 16)) >>> 0;
}
function randomFor(seed) {
  let counter = 0;
  return () => mix(seed + ++counter) / 4294967296;
}

export function createEndlessLevel(stage, seed) {
  if (!Number.isSafeInteger(stage) || stage < 1 || !Number.isSafeInteger((stage + 3) ** 2)) throw new RangeError('Invalid endless stage.');
  const size = stage + 3;
  const key = hashText(`${seed}:${stage}`);
  const random = randomFor(key);
  let row = Math.floor(random() * size);
  const path = [[row, 0]];
  for (let column = 0; column < size - 1; column++) {
    const options = ROUTE_SEGMENTS.filter(piece => {
      let r = row;
      return piece.every(([dr]) => { r += dr; return r >= 0 && r < size; });
    });
    const piece = options[Math.floor(random() * options.length)];
    let c = column;
    for (const [dr, dc] of piece) { row += dr; c += dc; path.push([row, c]); }
  }
  validatePath(path, size);
  const route = new Map();
  path.forEach(([r, c], index) => {
    const before = index ? path[index - 1] : [r, -1];
    const after = index < path.length - 1 ? path[index + 1] : [r, size];
    const port = ([nr, nc]) => nr < r ? N : nr > r ? S : nc < c ? W : E;
    route.set(r * size + c, port(before) | port(after));
  });
  const source = path[0][0] * size;
  const target = path.at(-1)[0] * size + size - 1;
  const checkIndex = index => {
    if (!Number.isSafeInteger(index) || index < 0 || index >= size * size) throw new RangeError('Tile outside board.');
  };
  const solutionAt = index => {
    checkIndex(index);
    return route.get(index) ?? rotate(mix(index ^ key) % 3 === 0 ? N | S : N | E, mix(index + key) % 4);
  };
  const initialAt = index => {
    let mask = rotate(solutionAt(index), mix(index ^ key ^ 0xa5a5a5a5) % 4);
    if (index === source) while (mask & W) mask = rotate(mask);
    return mask;
  };
  let referenceTurns = 0;
  for (const [index, goal] of route) {
    let mask = initialAt(index);
    while (mask !== goal) { mask = rotate(mask); referenceTurns++; }
  }
  if (!traceSignal(solutionAt, size, source, target).solved || traceSignal(initialAt, size, source, target).solved) throw new Error('Generated route failed verification.');
  return Object.freeze({ id: stage, stage, size, name: `Endless / Stage ${stage}`,
    note: 'Connect the edges to grow the next circuit.', source, target, initialAt, solutionAt,
    referenceTurns, path: Object.freeze(path.map(point => Object.freeze(point))) });
}

/** No full-grid allocation: filler cells are computed from their coordinates. */
export function createEndlessRun(seed) {
  let stage = 1, score = 0, cleared = 0, turns = 0, stageTurns = 0, awarded = false;
  let level = createEndlessLevel(stage, seed);
  return {
    level: () => level,
    snapshot: () => ({ stage, score, cleared, turns, stageTurns, awarded, size: level.size }),
    turn() {
      if (awarded) return false;
      turns++; stageTurns++;
      return true;
    },
    complete() {
      if (awarded) return 0;
      if (!stageTurns) throw new Error('A stage needs at least one turn.');
      const base = 100 + stage * 25 + level.path.length * 5;
      const bonus = Math.round(base * 0.5 * Math.min(1, level.referenceTurns / stageTurns));
      const points = base + bonus;
      score += points; cleared++; awarded = true;
      return points;
    },
    advance() {
      if (!awarded) throw new Error('Connect this circuit before advancing.');
      level = createEndlessLevel(stage + 1, seed);
      stage++; stageTurns = 0; awarded = false;
      return level;
    },
  };
}
