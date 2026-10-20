import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
// Publish this list only. Tests, workflows and local work files stay out of Pages.
export const SITE_FILES = [
  'index.html', 'workshop.css', 'signal.html', 'profile.css', 'profile.js',
  'how-it-works.html', 'LICENSE',
  'assets/header-signal.svg', 'assets/signal-preview.svg',
  'assets/policylens-preview.svg', 'assets/filesentinel-preview.svg', 'assets/repocards-preview.svg',
  'game/index.html', 'game/style.css', 'game/app.mjs', 'game/logic.mjs', 'game/levels.mjs',
  'game/progress.mjs', 'game/endless.mjs', 'game/viewport.mjs', 'game/README.md',
  'profile/README.md', 'profile/assets/header-signal.svg', 'profile/assets/signal-preview.svg',
  'profile/assets/policylens-preview.svg', 'profile/assets/filesentinel-preview.svg', 'profile/assets/repocards-preview.svg',
];

for (const file of SITE_FILES) {
  const output = join(root, 'dist', file);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, await readFile(join(root, file)));
}
await writeFile(join(root, 'dist', '.nojekyll'), '');
console.log(`Built ${SITE_FILES.length} files in dist/.`);
