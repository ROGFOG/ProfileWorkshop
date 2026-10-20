/** Prepared classic routes. Coordinates are [row, column], starting at zero. */
export const CLASSIC_LEVELS = [
  { name: 'First contact', size: 4, note: 'Connect the source on the left to the receiver on the right.', path: [[1,0],[1,1],[0,1],[0,2],[1,2],[2,2],[2,3]] },
  { name: 'The long way', size: 5, note: 'Connect both edges of the circuit.', path: [[3,0],[3,1],[2,1],[1,1],[1,2],[1,3],[2,3],[3,3],[3,4]] },
  { name: 'Switchback', size: 5, note: 'Connect both edges of the circuit.', path: [[0,0],[1,0],[2,0],[2,1],[2,2],[1,2],[0,2],[0,3],[0,4],[1,4],[2,4]] },
  { name: 'Across the network', size: 6, note: 'Connect both edges across the larger board.', path: [[4,0],[4,1],[4,2],[3,2],[2,2],[2,1],[1,1],[0,1],[0,2],[0,3],[1,3],[2,3],[2,4],[3,4],[4,4],[4,5]] },
];

/** Copy this valid draft into CLASSIC_LEVELS, then edit and run npm test. */
export const LEVEL_TEMPLATE = {
  name: 'New circuit', size: 5, note: 'Connect both edges of the circuit.',
  path: [[2,0],[2,1],[1,1],[1,2],[1,3],[2,3],[3,3],[3,4]],
};
