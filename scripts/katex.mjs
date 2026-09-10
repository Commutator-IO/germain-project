#!/usr/bin/env node
/**
 * Copies KaTeX from `node_modules` into `public/vendor/katex/`.
 *
 * The transcript is displayed in an isolated frame — a separate document,
 * carrying the ar5iv stylesheet verbatim and sharing nothing with the rest of
 * the site. That frame therefore does not go through Vite: it needs files
 * served as they are. Copying them at install time rather than loading them
 * from a CDN keeps the site usable offline, which matters for transcription
 * work that runs over months.
 *
 * Only the fonts KaTeX actually uses, in WOFF2, are taken: the full directory
 * runs to 5 MB across three formats, two of which no current browser asks
 * for.
 */

import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const RACINE = resolve(import.meta.dirname, '..');
const SOURCE = resolve(RACINE, 'node_modules', 'katex', 'dist');
const CIBLE = resolve(RACINE, 'public', 'vendor', 'katex');

async function principal() {
  await mkdir(resolve(CIBLE, 'fonts'), { recursive: true });

  for (const f of ['katex.min.css', 'katex.min.js']) {
    await cp(resolve(SOURCE, f), resolve(CIBLE, f));
  }
  await cp(
    resolve(SOURCE, 'contrib', 'auto-render.min.js'),
    resolve(CIBLE, 'auto-render.min.js'),
  );

  const polices = (await readdir(resolve(SOURCE, 'fonts'))).filter((f) => f.endsWith('.woff2'));
  for (const f of polices) {
    await cp(resolve(SOURCE, 'fonts', f), resolve(CIBLE, 'fonts', f));
  }

  process.stdout.write(`KaTeX + ${polices.length} polices → public/vendor/katex/\n`);
}

principal().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
