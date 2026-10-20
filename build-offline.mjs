import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const get = name => readFile(join(root, 'game', name), 'utf8');
const [html, css, logic, app] = await Promise.all([get('index.html'), get('style.css'), get('logic.mjs'), get('app.mjs')]);
const script = logic.replace(/^export /gm, '') + '\n' + app.replace(/^import .*;\r?\n/, '');
const output = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`)
  .replace('<script type="module" src="app.mjs"></script>', `<script type="module">${script}</script>`);
await writeFile(join(root, 'game', 'offline.html'), output, 'utf8');
console.log('Saved game/offline.html. Inline CSS and JavaScript; no asset requests required.');
