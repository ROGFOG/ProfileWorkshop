/** Best completed attempt for each circuit, kept only for the current visit. */
export function createProgress(levelCount) {
  if (!Number.isInteger(levelCount) || levelCount < 1) throw new RangeError('Invalid circuit count.');
  const best = new Map();
  return {
    has: index => best.has(index),
    record(index, turns) {
      if (!Number.isInteger(index) || index < 0 || index >= levelCount) throw new RangeError('Unknown circuit.');
      if (!Number.isInteger(turns) || turns < 1) throw new RangeError('Invalid turn count.');
      const wasComplete = best.size === levelCount;
      if (!best.has(index) || turns < best.get(index)) best.set(index, turns);
      return !wasComplete && best.size === levelCount;
    },
    summary() {
      return { completed: best.size, total: levelCount, complete: best.size === levelCount,
        turns: [...best.values()].reduce((sum, value) => sum + value, 0) };
    },
    reset() { best.clear(); },
  };
}
