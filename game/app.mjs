import { DIRECTIONS, rotate, traceSignal, createLevel, LEVEL_COUNT } from './logic.mjs';
import { createProgress } from './progress.mjs';
import { createEndlessRun } from './endless.mjs';
import { visibleCells } from './viewport.mjs';

const $ = selector => document.querySelector(selector);
const board = $('#board');
const viewport = $('#board-viewport');
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const progress = createProgress(LEVEL_COUNT);
let motionOverride = null;
let mode = 'classic';
let zoom = 56;
let cell = 56;
let step = 62;
let endlessRun = null;
let endlessBoard = null;
const nodes = new Map();

function freshBoard(level) {
  return { level, changes: new Map(), moves: 0, solved: false, result: { powered: new Set(), solved: false }, points: 0 };
}
let classicBoard = freshBoard(createLevel(0));
const active = () => mode === 'classic' ? classicBoard : endlessBoard;
const maskAt = index => active().changes.get(index) ?? (active().level.initialAt ? active().level.initialAt(index) : active().level.tiles[index]);
function newEndlessRun() {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  endlessRun = createEndlessRun(seed);
  endlessBoard = freshBoard(endlessRun.level());
}

if (new URLSearchParams(window.location.search).get('theme') === 'paper') {
  document.documentElement.dataset.theme = 'paper';
  document.querySelector('meta[name="theme-color"]').content = '#f4f1e9';
}
function updateMotion() {
  const reduced = motionOverride ?? media.matches;
  document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  $('#motion-toggle').setAttribute('aria-pressed', String(reduced));
  $('#motion-toggle').textContent = reduced ? 'Motion reduced' : 'Reduce motion';
}
$('#motion-toggle').addEventListener('click', () => {
  motionOverride = document.documentElement.dataset.motion !== 'reduced';
  updateMotion();
});
media.addEventListener('change', updateMotion);
updateMotion();

function tileSvg(mask) {
  const points = { 1: '50 0', 2: '100 50', 4: '50 100', 8: '0 50' };
  const path = DIRECTIONS.filter(({ bit }) => mask & bit).map(({ bit }) => `M50 50L${points[bit]}`).join('');
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path class="track" d="${path}"/><path class="wire" d="${path}"/><circle class="joint" cx="50" cy="50" r="5"/></svg>`;
}

function focusTile(index) {
  const { size } = active().level;
  const row = Math.floor(index / size), column = index % size;
  viewport.scrollLeft = Math.max(0, column * step - (viewport.clientWidth - cell) / 2);
  viewport.scrollTop = Math.max(0, row * step - (viewport.clientHeight - cell) / 2);
  renderBoard();
  nodes.get(index)?.focus({ preventScroll: true });
}

function makeTile(index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.addEventListener('click', () => rotateTile(index));
  button.addEventListener('keydown', event => {
    const { size } = active().level;
    const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -size, ArrowDown: size }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const row = Math.floor(index / size), column = index % size;
    if ((event.key === 'ArrowLeft' && column === 0) || (event.key === 'ArrowRight' && column === size - 1) || (event.key === 'ArrowUp' && row === 0) || (event.key === 'ArrowDown' && row === size - 1)) return;
    focusTile(index + offset);
  });
  return button;
}

function renderBoard() {
  const state = active(), { size, source, target } = state.level;
  const visible = visibleCells(size, step, viewport.clientWidth || 1, viewport.clientHeight || 1, viewport.scrollLeft, viewport.scrollTop);
  const wanted = new Set(visible);
  for (const [index, node] of nodes) {
    if (!wanted.has(index)) { node.remove(); nodes.delete(index); }
  }
  for (const index of visible) {
    let button = nodes.get(index);
    if (!button) { button = makeTile(index); nodes.set(index, button); board.append(button); }
    const mask = maskAt(index), live = state.result.powered.has(index);
    button.className = `tile${live ? ' live' : ''}${index === source ? ' source' : ''}${index === target ? ' receiver' : ''}`;
    Object.assign(button.style, { left: `${index % size * step}px`, top: `${Math.floor(index / size) * step}px`, width: `${cell}px`, height: `${cell}px` });
    const endpoint = index === source ? 'S' : index === target ? 'R' : '';
    if (button.dataset.mask !== String(mask)) {
      button.innerHTML = tileSvg(mask) + (endpoint ? `<span class="endpoint-tag" aria-hidden="true">${endpoint}</span>` : '');
      button.dataset.mask = String(mask);
    }
    const ports = DIRECTIONS.filter(({ bit }) => mask & bit).map(({ name }) => name).join(' and ');
    const label = index === source ? ', source tile' : index === target ? ', receiver tile' : '';
    const locked = mode === 'endless' && state.solved;
    button.setAttribute('aria-disabled', String(locked));
    button.setAttribute('aria-label', `Row ${Math.floor(index / size) + 1}, column ${index % size + 1}${label}. Ports ${ports}. ${live ? 'Signal live.' : 'No signal.'} ${locked ? 'Circuit complete.' : 'Rotate clockwise.'}`);
  }
  board.classList.toggle('solved', state.solved);
}

function geometry(reset = false) {
  const { size, source, target, name } = active().level;
  const width = viewport.clientWidth || 480;
  cell = mode === 'classic' ? Math.max(20, Math.floor((width - (size - 1) * 6) / size)) : zoom;
  step = cell + 6;
  const extent = size * step - 6;
  Object.assign(board.style, { width: `${extent}px`, height: `${extent}px` });
  viewport.style.height = `${mode === 'classic' ? extent : Math.min(520, extent)}px`;
  board.setAttribute('aria-label', `${name}, ${size} rows and ${size} columns. Rotate tiles clockwise to connect source to receiver.`);
  $('.board-surround').style.setProperty('--size', size);
  $('.source-label').style.setProperty('--row', Math.floor(source / size));
  $('.receiver-label').style.setProperty('--row', Math.floor(target / size));
  $('#zoom-label').textContent = `${Math.round(zoom / 56 * 100)}%`;
  $('#zoom-out').disabled = zoom <= 32;
  $('#zoom-in').disabled = zoom >= 88;
  if (reset) { viewport.scrollLeft = 0; viewport.scrollTop = 0; }
  renderBoard();
}
let scrollFrame = false;
viewport.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = true;
  requestAnimationFrame(() => { scrollFrame = false; renderBoard(); });
});
window.addEventListener('resize', () => geometry());
for (const [selector, change] of [['#zoom-out', -8], ['#zoom-in', 8]]) {
  $(selector).addEventListener('click', () => {
    const centerRow = (viewport.scrollTop + viewport.clientHeight / 2) / step;
    const centerColumn = (viewport.scrollLeft + viewport.clientWidth / 2) / step;
    zoom = Math.max(32, Math.min(88, zoom + change));
    geometry();
    viewport.scrollTop = Math.max(0, centerRow * step - viewport.clientHeight / 2);
    viewport.scrollLeft = Math.max(0, centerColumn * step - viewport.clientWidth / 2);
    renderBoard();
  });
}
$('#jump-source').addEventListener('click', () => focusTile(active().level.source));
$('#jump-receiver').addEventListener('click', () => focusTile(active().level.target));

function renderPicker() {
  const picker = $('#level-picker');
  picker.replaceChildren();
  if (mode === 'endless') return;
  for (let index = 0; index < LEVEL_COUNT; index++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(index + 1).padStart(2, '0');
    button.setAttribute('aria-label', `${createLevel(index).name}${progress.has(index) ? ', completed' : ''}`);
    if (index === classicBoard.level.id) button.setAttribute('aria-current', 'step');
    if (progress.has(index)) button.classList.add('completed');
    button.addEventListener('click', () => { classicBoard = freshBoard(createLevel(index)); mountBoard(); });
    picker.append(button);
  }
}

function renderState(announce = false) {
  const state = active(), { level } = state;
  const result = traceSignal(maskAt, level.size, level.source, level.target);
  const justSolved = !state.solved && result.solved;
  state.solved = result.solved;
  state.result = result;
  let finishedRun = false;
  if (justSolved) {
    if (mode === 'classic') { finishedRun = progress.record(level.id, state.moves); renderPicker(); }
    else state.points = endlessRun.complete();
  }
  $('#moves').textContent = state.moves;
  $('#powered').textContent = result.powered.size;
  $('#status-title').textContent = state.solved ? 'Connection established' : result.powered.size ? 'Finding a way through' : 'Awaiting connection';
  $('#status-title').classList.toggle('success', state.solved);
  $('#next').disabled = !state.solved;
  $('#reset').disabled = mode === 'endless' && state.solved;
  $('#run-summary').hidden = mode === 'classic' && !progress.summary().complete;
  if (mode === 'classic') {
    $('#next').innerHTML = level.id === LEVEL_COUNT - 1 ? 'Back to first circuit <span aria-hidden="true">↗</span>' : 'Next circuit <span aria-hidden="true">↗</span>';
    $('#level-note').textContent = state.solved ? `Signal delivered in ${state.moves} turns. ${progress.summary().complete ? 'All circuits complete. Your run summary is ready.' : 'Your next circuit is ready.'}` : level.note;
  } else {
    const run = endlessRun.snapshot();
    $('#score').textContent = run.score.toLocaleString('en-US');
    $('#cleared').textContent = run.cleared;
    $('#next').innerHTML = `Next: ${level.size + 1} × ${level.size + 1} <span aria-hidden="true">↗</span>`;
    $('#level-note').textContent = state.solved ? `+${state.points} points. The next circuit grows by one row and one column.` : 'Connect the receiver to earn points. Reset keeps your turn count.';
  }
  renderBoard();
  if (announce) $('#announcement').textContent = state.solved ? `${mode === 'endless' ? `Stage ${level.stage} complete. ${state.points} points.` : `Circuit ${level.id + 1} complete.`} ${state.moves} turns.` : `Turn ${state.moves}. ${result.powered.size} tiles live.`;
  if (finishedRun) showSummary();
}
function rotateTile(index) {
  const state = active();
  if (mode === 'endless' && !endlessRun.turn()) return;
  state.changes.set(index, rotate(maskAt(index)));
  state.moves++;
  renderState(true);
}
function mountBoard() {
  nodes.clear(); board.replaceChildren();
  const { level } = active();
  document.documentElement.dataset.mode = mode;
  $('#classic-mode').setAttribute('aria-pressed', String(mode === 'classic'));
  $('#endless-mode').setAttribute('aria-pressed', String(mode === 'endless'));
  $('#mode-label').textContent = mode === 'classic' ? 'SIGNAL ROUTE / CLASSIC' : 'SIGNAL ROUTE / ENDLESS';
  $('#mode-description').textContent = mode === 'classic' ? `${LEVEL_COUNT} prepared circuits. Turn the tiles and connect both edges.` : 'Each connection earns points and opens a larger circuit.';
  $('#classic-mode span').textContent = `${String(LEVEL_COUNT).padStart(2, '0')} circuits`;
  $('#level-name').textContent = level.name;
  $('#level-number').textContent = mode === 'classic' ? `${String(level.id + 1).padStart(2, '0')} / ${String(LEVEL_COUNT).padStart(2, '0')}` : `${level.size} × ${level.size}`;
  $('#classic-picker').hidden = mode !== 'classic';
  $('#score-panel').hidden = mode !== 'endless';
  $('#board-tools').hidden = mode !== 'endless';
  $('#bottom-note').textContent = mode === 'classic' ? `${LEVEL_COUNT} circuits. Your progress lasts for this visit.` : 'One row and one column larger after each win. Pan or zoom to explore. Progress lasts for this visit.';
  renderPicker();
  renderState();
  geometry(true);
  $('#announcement').textContent = `${level.name}. ${level.size} by ${level.size} circuit loaded.`;
}
function setMode(next) {
  if (next === mode) return;
  if (next === 'endless' && !endlessRun) newEndlessRun();
  mode = next;
  mountBoard();
}
$('#classic-mode').addEventListener('click', () => setMode('classic'));
$('#endless-mode').addEventListener('click', () => setMode('endless'));
$('#reset').addEventListener('click', () => {
  if (mode === 'classic') classicBoard = freshBoard(createLevel(classicBoard.level.id));
  else if (!endlessBoard.solved) endlessBoard.changes.clear();
  mountBoard();
});
$('#next').addEventListener('click', () => {
  if (!active().solved) return;
  if (mode === 'classic') classicBoard = freshBoard(createLevel((classicBoard.level.id + 1) % LEVEL_COUNT));
  else endlessBoard = freshBoard(endlessRun.advance());
  mountBoard();
  focusTile(active().level.source);
});

function showSummary() {
  const classic = mode === 'classic';
  const summary = classic ? progress.summary() : endlessRun.snapshot();
  $('#final-score-stat').hidden = classic;
  $('.final-stats').classList.toggle('endless-stats', !classic);
  $('#final-eyebrow').textContent = classic ? 'TRANSMISSION COMPLETE' : 'ENDLESS / RUN SUMMARY';
  $('#final-title').textContent = classic ? 'All circuits connected.' : 'Your endless run.';
  $('#final-description').textContent = classic ? `Every receiver has a signal. All ${summary.total} circuits are complete.` : `Stage ${summary.stage}. Current field: ${summary.size} × ${summary.size}. Keep going whenever you are ready.`;
  $('#final-count').textContent = classic ? `${summary.completed} / ${summary.total}` : summary.cleared;
  $('#final-turns').textContent = summary.turns;
  $('#final-score').textContent = classic ? '' : summary.score.toLocaleString('en-US');
  $('#final-note').textContent = classic ? 'Your best completed attempt on each circuit, this visit.' : 'Points are awarded once per circuit. All turns in this run are counted.';
  $('#play-again').textContent = classic ? 'Play again ↻' : 'New run ↻';
  $('#review-circuits').textContent = classic ? 'Keep exploring' : 'Continue run';
  if (!$('#finale').open) $('#finale').showModal();
}
$('#run-summary').addEventListener('click', showSummary);
$('#play-again').addEventListener('click', () => {
  $('#finale').close();
  if (mode === 'classic') { progress.reset(); classicBoard = freshBoard(createLevel(0)); }
  else newEndlessRun();
  mountBoard(); focusTile(active().level.source);
});
$('#review-circuits').addEventListener('click', () => {
  $('#finale').close();
  (active().solved ? $('#next') : $('#run-summary')).focus();
});
mountBoard();
if (new URLSearchParams(window.location.search).get('mode') === 'endless') setMode('endless');
