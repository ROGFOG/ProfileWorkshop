import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgress } from './progress.mjs';

test('the finale requires every distinct circuit, in any order', () => {
  const run = createProgress(4);
  assert.equal(run.record(3, 20), false);
  assert.equal(run.record(3, 18), false);
  assert.equal(run.record(0, 9), false);
  assert.equal(run.record(2, 15), false);
  assert.deepEqual(run.summary(), { completed: 3, total: 4, complete: false, turns: 42 });
  assert.equal(run.record(1, 12), true);
  assert.deepEqual(run.summary(), { completed: 4, total: 4, complete: true, turns: 54 });
  assert.equal(run.record(1, 10), false, 'replaying does not reopen the finale');
});

test('a worse replay does not inflate the best-turn summary', () => {
  const run = createProgress(2);
  run.record(0, 8);
  run.record(0, 20);
  run.record(1, 11);
  assert.equal(run.summary().turns, 19);
  run.record(0, 7);
  assert.equal(run.summary().turns, 18);
  const snapshot = run.summary();
  snapshot.turns = 999;
  assert.equal(run.summary().turns, 18);
});

test('starting again clears completion and permits a new finale', () => {
  const run = createProgress(1);
  assert.equal(run.record(0, 5), true);
  run.reset();
  assert.equal(run.has(0), false);
  assert.deepEqual(run.summary(), { completed: 0, total: 1, complete: false, turns: 0 });
  assert.equal(run.record(0, 8), true);
});

test('invalid progress never creates a completed circuit', () => {
  assert.throws(() => createProgress(0), RangeError);
  const run = createProgress(4);
  for (const [index, turns] of [[-1, 2], [4, 2], [0, 0], [0, -3], [0, NaN], [0, 2.5]]) {
    assert.throws(() => run.record(index, turns), RangeError);
  }
  assert.equal(run.summary().completed, 0);
});
