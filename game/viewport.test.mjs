import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleCells } from './viewport.mjs';

test('small circuits show the whole board without duplicate cells', () => {
  assert.deepEqual(visibleCells(4, 60, 240, 240, 0, 0), Array.from({ length: 16 }, (_, i) => i));
});
test('large fields render a bounded window instead of all logical cells', () => {
  for (const size of [100, 4096, 100000]) {
    const indices = visibleCells(size, 62, 600, 520, 620, 1240);
    assert(indices.length < 150);
    assert.equal(indices.length, new Set(indices).size);
    assert(indices.every(i => i >= 0 && i < size * size));
    assert(indices.includes(20 * size + 10));
  }
});
test('scrolling to the far corner includes the last tile and respects boundaries', () => {
  const size = 1000;
  const indices = visibleCells(size, 62, 600, 520, size * 62 - 600, size * 62 - 520);
  assert(indices.includes(size * size - 1));
  assert(indices.every(i => Math.floor(i / size) < size && i % size < size));
  assert.throws(() => visibleCells(4, 0, 600, 520, 0, 0), RangeError);
});
