import test from 'node:test';
import assert from 'node:assert/strict';
import { N, E, S, W, rotate, traceSignal, createLevel, LEVEL_COUNT } from './logic.mjs';

test('clockwise rotation preserves ports and handles full or negative turns', () => {
  assert.equal(rotate(N | E), E | S);
  assert.equal(rotate(N | S), E | W);
  assert.equal(rotate(N | E, 4), N | E);
  assert.equal(rotate(N | E, -1), W | N);
  for (let mask = 1; mask < 16; mask += 1) assert.equal(rotate(mask, 4), mask);
});

test('signal requires source, reciprocal ports and the east receiver port', () => {
  assert.deepEqual([...traceSignal([N | S, E | W, 0, 0], 2, 0, 1).powered], []);
  const broken = traceSignal([E | W, N | S, 0, 0], 2, 0, 1);
  assert.deepEqual([...broken.powered], [0]);
  assert.equal(broken.solved, false);
  assert.equal(traceSignal([E | W, N | W, 0, 0], 2, 0, 1).solved, false);
  assert.equal(traceSignal([E | W, E | W, 0, 0], 2, 0, 1).solved, true);
});

test('edges do not wrap to the next row', () => {
  const result = traceSignal([E | W, E | W, E | W, E | W], 2, 0, 3);
  assert.deepEqual([...result.powered], [0, 1]);
  assert.equal(result.solved, false);
});

test('cycles terminate and only reachable cells light up', () => {
  const result = traceSignal([W | E | S, W | S, N | E, W | N], 2, 0, 1);
  assert.equal(result.powered.size, 4);
  assert.equal(result.solved, false);
});

for (let index = 0; index < LEVEL_COUNT; index += 1) {
  test(`level ${index + 1} has a valid unsolved start and a rotation-reachable solution`, () => {
    const level = createLevel(index);
    assert.equal(traceSignal(level.tiles, level.size, level.source, level.target).solved, false);
    const verified = traceSignal(level.solution, level.size, level.source, level.target);
    assert.equal(verified.solved, true);
    assert.equal(verified.powered.size, level.path.length);
    const replay = [...level.tiles];
    for (let i = 0; i < replay.length; i += 1) {
      let turns = 0;
      while (replay[i] !== level.solution[i] && turns < 4) { replay[i] = rotate(replay[i]); turns += 1; }
      assert.equal(replay[i], level.solution[i]);
    }
    assert.equal(traceSignal(replay, level.size, level.source, level.target).solved, true);
  });
}

test('reset data is independent and invalid levels are rejected', () => {
  const first = createLevel(0), second = createLevel(0);
  first.tiles[0] = 0;
  first.path[0][0] = 99;
  assert.notEqual(second.tiles[0], 0);
  assert.notEqual(second.path[0][0], 99);
  assert.throws(() => createLevel(-1), RangeError);
  assert.throws(() => createLevel(LEVEL_COUNT), RangeError);
});
