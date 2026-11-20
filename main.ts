// Entry point: copy app/ and screenshots/ into the output directory and
// write dossier.json there with the vendored make.fun library.
// Run with: node main.ts   (output dir from MAKEFUN_OUTPUT_DIR, else /output)
// The clean-copy step below keeps repeated runs byte-identical.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });

// Start from a clean copy so repeated runs write identical bytes.
for (const name of ['app', 'screenshots', 'dossier.json']) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });

const shotsFrom = join(here, 'screenshots');
if (existsSync(shotsFrom)) {
  cpSync(shotsFrom, join(outDir, 'screenshots'), { recursive: true });
} else {
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('wrote ' + join(outDir, 'dossier.json') + ' (' + dossier.length + ' bytes)');
