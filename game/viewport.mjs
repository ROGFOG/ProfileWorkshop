/** Indices for the visible window plus one cell of overscan on each side. */
export function visibleCells(size, step, width, height, left, top) {
  if (!Number.isSafeInteger(size) || size < 2 || ![step, width, height].every(value => Number.isFinite(value) && value > 0) || ![left, top].every(Number.isFinite)) throw new RangeError('Invalid viewport.');
  const startRow = Math.max(0, Math.min(size - 1, Math.floor(top / step) - 1));
  const startColumn = Math.max(0, Math.min(size - 1, Math.floor(left / step) - 1));
  const endRow = Math.min(size, Math.ceil((Math.max(0, top) + height) / step) + 1);
  const endColumn = Math.min(size, Math.ceil((Math.max(0, left) + width) / step) + 1);
  const cells = [];
  for (let row = startRow; row < endRow; row++) {
    for (let column = startColumn; column < endColumn; column++) cells.push(row * size + column);
  }
  return cells;
}
