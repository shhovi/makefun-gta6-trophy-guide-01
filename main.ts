// Entry point for the GTA VI trophy tracker entry.
// Copies the static app and any screenshots into the output folder,
// then asks the make.fun kit to build the dossier file there.
// The caps below mirror the bounty's gate limits, so a local run fails
// in the same places the scorer would.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(fromName: string, toName: string): void {
  const src = join(here, fromName);
  const dst = join(outDir, toName);
  rmSync(dst, { recursive: true, force: true });
  if (existsSync(src)) {
    cpSync(src, dst, { recursive: true });
  } else {
    mkdirSync(dst, { recursive: true });
  }
}

mkdirSync(outDir, { recursive: true });
copyTree('app', 'app');
copyTree('screenshots', 'screenshots');

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier written to ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
