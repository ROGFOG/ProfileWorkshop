import { DIRECTIONS, rotate, traceSignal, createLevel, LEVEL_COUNT } from './logic.mjs';
import { createProgress } from './progress.mjs';

const $ = selector => document.querySelector(selector);
const board = $('#board');
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOverride = null;
let current = createLevel(0);
let tiles = [...current.tiles];
let moves = 0;
let solved = false;
const progress = createProgress(LEVEL_COUNT);

function showFinale() {
  const summary = progress.summary();
  $('#final-count').textContent = `${summary.completed} / ${summary.total}`;
  $('#final-turns').textContent = summary.turns;
  $('#final-description').textContent = `Every receiver has a signal. All ${summary.total} circuits are complete.`;
  if (!$('#finale').open) $('#finale').showModal();
}

$('#play-again').addEventListener('click', () => {
  $('#finale').close();
  progress.reset();
  loadLevel(0);
  board.children[current.source].focus();
});
$('#review-circuits').addEventListener('click', () => {
  $('#finale').close();
  $('#next').focus();
});
$('#run-summary').addEventListener('click', showFinale);

if (new URLSearchParams(window.location.search).get('theme') === 'paper') {
  document.documentElement.dataset.theme = 'paper';
  document.querySelector('meta[name="theme-color"]').content = '#f4f1e9';
  $('.back-link').href = '../index.html?theme=paper';
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

function renderPicker() {
  const picker = $('#level-picker');
  picker.replaceChildren();
  for (let index = 0; index < LEVEL_COUNT; index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(index + 1).padStart(2, '0');
    button.setAttribute('aria-label', `${createLevel(index).name}${progress.has(index) ? ', completed' : ''}`);
    if (index === current.id) button.setAttribute('aria-current', 'step');
    if (progress.has(index)) button.classList.add('completed');
    button.addEventListener('click', () => loadLevel(index));
    picker.append(button);
  }
}

function renderSignal(announce = false) {
  const result = traceSignal(tiles, current.size, current.source, current.target);
  const justSolved = !solved && result.solved;
  solved = result.solved;
  board.classList.toggle('solved', solved);
  board.querySelectorAll('button').forEach((button, index) => {
    const live = result.powered.has(index);
    button.classList.toggle('live', live);
    button.innerHTML = tileSvg(tiles[index]);
    const ports = DIRECTIONS.filter(({ bit }) => tiles[index] & bit).map(({ name }) => name).join(' and ');
    const endpoint = index === current.source ? ', source tile' : index === current.target ? ', receiver tile' : '';
    button.setAttribute('aria-label', `Row ${Math.floor(index / current.size) + 1}, column ${index % current.size + 1}${endpoint}. Ports ${ports}. ${live ? 'Signal live.' : 'No signal.'} Rotate clockwise.`);
  });
  $('#moves').textContent = moves;
  $('#powered').textContent = result.powered.size;
  $('#status-title').textContent = solved ? 'Connection established' : result.powered.size ? 'Finding a way through' : 'Awaiting connection';
  $('#status-title').classList.toggle('success', solved);
  $('#level-note').textContent = solved ? `Signal delivered in ${moves} ${moves === 1 ? 'turn' : 'turns'}. ${current.id === LEVEL_COUNT - 1 ? 'Final circuit complete. Explore any circuit again.' : 'Your next circuit is ready.'}` : current.note;
  $('#next').disabled = !solved;
  $('#next').innerHTML = current.id === LEVEL_COUNT - 1 ? 'Back to first circuit <span aria-hidden="true">↗</span>' : 'Next circuit <span aria-hidden="true">↗</span>';
  let finishedRun = false;
  if (justSolved) { finishedRun = progress.record(current.id, moves); renderPicker(); }
  $('#run-summary').hidden = !progress.summary().complete;
  if (solved && progress.summary().complete) $('#level-note').textContent = `Signal delivered in ${moves} turns. All circuits complete. Your run summary is available below.`;
  if (announce) $('#announcement').textContent = solved ? `Connection established. Circuit ${current.id + 1} complete in ${moves} turns.` : `Turn ${moves}. ${result.powered.size} tiles live.`;
  if (finishedRun) showFinale();
}

function rotateTile(index) {
  tiles[index] = rotate(tiles[index]);
  moves += 1;
  renderSignal(true);
}

function loadLevel(index, announce = true) {
  current = createLevel(index);
  tiles = [...current.tiles];
  moves = 0;
  solved = false;
  board.replaceChildren();
  board.style.setProperty('--size', current.size);
  board.setAttribute('aria-label', `${current.name}, ${current.size} rows and ${current.size} columns. Rotate tiles clockwise to connect source to receiver.`);
  $('.source-label').style.setProperty('--row', Math.floor(current.source / current.size));
  $('.receiver-label').style.setProperty('--row', Math.floor(current.target / current.size));
  $('.board-surround').style.setProperty('--size', current.size);
  for (let index = 0; index < tiles.length; index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tile';
    if (index === current.source) button.classList.add('source');
    if (index === current.target) button.classList.add('receiver');
    button.addEventListener('click', () => rotateTile(index));
    button.addEventListener('keydown', event => {
      const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -current.size, ArrowDown: current.size }[event.key];
      if (offset === undefined) return;
      event.preventDefault();
      const row = Math.floor(index / current.size), column = index % current.size;
      if ((event.key === 'ArrowLeft' && column === 0) || (event.key === 'ArrowRight' && column === current.size - 1) || (event.key === 'ArrowUp' && row === 0) || (event.key === 'ArrowDown' && row === current.size - 1)) return;
      board.children[index + offset].focus();
    });
    board.append(button);
  }
  $('#level-name').textContent = current.name;
  $('#level-number').textContent = `${String(current.id + 1).padStart(2, '0')} / ${String(LEVEL_COUNT).padStart(2, '0')}`;
  renderPicker();
  renderSignal();
  if (announce) $('#announcement').textContent = `${current.name}. Circuit ${current.id + 1} loaded.`;
}

$('#reset').addEventListener('click', () => loadLevel(current.id));
$('#next').addEventListener('click', () => {
  if (!solved) return;
  loadLevel((current.id + 1) % LEVEL_COUNT);
  board.children[current.source].focus();
});
loadLevel(0, false);
