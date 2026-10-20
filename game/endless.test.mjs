import test from 'node:test';
import assert from 'node:assert/strict';
import { rotate, traceSignal, validatePath, createLevelFromSpec } from './logic.mjs';
import { CLASSIC_LEVELS, LEVEL_TEMPLATE } from './levels.mjs';
import { createEndlessLevel, createEndlessRun, ROUTE_SEGMENTS } from './endless.mjs';

test('classic catalog and editable template have verified routes', () => {
  for (const spec of [...CLASSIC_LEVELS, LEVEL_TEMPLATE]) {
    const level = createLevelFromSpec(spec);
    assert.equal(traceSignal(level.solution, level.size, level.source, level.target).solved, true);
  }
  for (const path of [[[1,1],[1,2],[1,3]], [[0,0],[0,2],[0,3]], [[0,0],[1,0],[0,0],[0,1],[0,2],[0,3]], [[0,0],[-1,0],[0,3]]]) {
    assert.throws(() => validatePath(path, 4), RangeError);
  }
});

test('prepared route pieces have adjacent steps, no repetitions and an east exit', () => {
  for (const piece of ROUTE_SEGMENTS) {
    let row = 3, column = 0;
    const path = [[row, column]];
    for (const [dr, dc] of piece) {
      assert.equal(Math.abs(dr) + Math.abs(dc), 1);
      row += dr; column += dc; path.push([row, column]);
    }
    assert.equal(column, 1);
    assert.equal(new Set(path.map(point => point.join(','))).size, path.length);
  }
});

test('many seeds and growing sizes retain an unsolved start and a reachable solution', () => {
  for (let seed = 0; seed < 80; seed++) {
    for (const stage of [1, 2, 4, 9, 21, 64]) {
      const level = createEndlessLevel(stage, `sweep-${seed}`);
      assert.equal(level.size, stage + 3);
      assert.equal(validatePath(level.path, level.size), true);
      assert.equal(traceSignal(level.initialAt, level.size, level.source, level.target).solved, false);
      assert.equal(traceSignal(level.solutionAt, level.size, level.source, level.target).solved, true);
      let turns = 0;
      const edits = new Map();
      for (const [r, c] of level.path) {
        const index = r * level.size + c;
        let mask = level.initialAt(index), n = 0;
        while (mask !== level.solutionAt(index) && n < 4) { mask = rotate(mask); n++; }
        assert.equal(mask, level.solutionAt(index));
        edits.set(index, mask); turns += n;
      }
      assert.equal(turns, level.referenceTurns);
      assert.equal(traceSignal(i => edits.get(i) ?? level.initialAt(i), level.size, level.source, level.target).solved, true);
    }
  }
});

test('a run is reproducible and distinct seeds vary its route', () => {
  const first = createEndlessLevel(7, 'same'), second = createEndlessLevel(7, 'same');
  assert.deepEqual(first.path, second.path);
  assert.deepEqual(Array.from({ length: 100 }, (_, i) => first.initialAt(i)), Array.from({ length: 100 }, (_, i) => second.initialAt(i)));
  const routes = new Set(Array.from({ length: 24 }, (_, i) => JSON.stringify(createEndlessLevel(7, `seed-${i}`).path)));
  assert(routes.size > 16);
});

test('large maps are procedural, with a verified route and no full-grid array', () => {
  const level = createEndlessLevel(4093, 'large-map');
  assert.equal(level.size, 4096);
  assert(level.path.length <= level.size * 3);
  assert.equal(level.tiles, undefined);
  assert.equal(traceSignal(level.solutionAt, level.size, level.source, level.target).solved, true);
  assert.equal(typeof level.initialAt(level.size * level.size - 1), 'number');
  assert.throws(() => level.initialAt(level.size * level.size), RangeError);
  for (const stage of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER]) assert.throws(() => createEndlessLevel(stage, 'invalid'), RangeError);
});

test('points are awarded once; a reset or duplicate completion cannot farm score', () => {
  const run = createEndlessRun('points');
  assert.throws(() => run.advance(), /Connect/);
  assert.throws(() => run.complete(), /at least one/);
  run.turn(); run.turn();
  const points = run.complete();
  assert(points > 0);
  assert.equal(run.complete(), 0);
  assert.equal(run.turn(), false);
  assert.equal(run.snapshot().score, points);
  assert.equal(run.snapshot().cleared, 1);
  assert.equal(run.snapshot().turns, 2);
  assert.equal(run.advance().size, 5);
  assert.equal(run.snapshot().stageTurns, 0);
  run.turn();
  const nextPoints = run.complete();
  assert.equal(run.snapshot().score, points + nextPoints);
  assert.equal(run.snapshot().cleared, 2);
});

test('scores reward efficient turns within a bounded bonus, and runs are independent', () => {
  const fast = createEndlessRun('fair'), slow = createEndlessRun('fair');
  fast.turn();
  for (let i = 0; i < 10000; i++) slow.turn();
  const high = fast.complete(), low = slow.complete();
  assert(high > low);
  const base = 125 + fast.level().path.length * 5;
  assert(high <= Math.round(base * 1.5));
  const fresh = createEndlessRun('fresh');
  assert.deepEqual(fresh.snapshot(), { stage: 1, score: 0, cleared: 0, turns: 0, stageTurns: 0, awarded: false, size: 4 });
});
