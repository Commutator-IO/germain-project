#!/usr/bin/env node
/**
 * Checks that the sources this site depends on still answer as they did.
 *
 *   npm run check-sources
 *
 * Three questions, none of which the repository can answer by itself:
 *
 * — **Does Gallica still serve the manifests with CORS?** The whole reading
 *   pane rests on `Access-Control-Allow-Origin: *`. If the BnF withdrew it, the
 *   pane would go blank on every volume and nothing here would notice.
 * — **Are the view counts still what the catalogue says?** A re-digitisation
 *   changes them, and every `\page{N}` in the transcripts would then point
 *   one view off.
 * — **Are the literature links alive?** Theses move, journals re-platform.
 *
 * Sequential, paused, and one HEAD per literature URL: this is meant to be run
 * occasionally and to cost the hosts nothing.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { GALLICA, UA, manifestUrl } from './catalogue.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seed = JSON.parse(await readFile(resolve(ROOT, 'src/content/holdings.json'), 'utf8'));
const editions = JSON.parse(await readFile(resolve(ROOT, 'src/content/editions.json'), 'utf8'));
const catalogue = await readFile(resolve(ROOT, 'src/content/catalogue.ts'), 'utf8');

let bad = 0;

process.stdout.write('Gallica manifests\n');
for (const v of seed.volumes.filter((x) => x.ark)) {
  try {
    const r = await fetch(manifestUrl(v.ark), { headers: { 'User-Agent': UA } });
    const cors = r.headers.get('access-control-allow-origin');
    const m = await r.json();
    const views = m.sequences?.[0]?.canvases?.length ?? 0;
    const recorded = Number(new RegExp(`"id":\\s*"${v.id}"[\\s\\S]*?"pages":\\s*(\\d+)`).exec(catalogue)?.[1] ?? 0);
    const ok = r.ok && cors === '*' && views === recorded;
    if (!ok) bad++;
    process.stdout.write(
      `${ok ? ' ' : '!'} ${v.id.padEnd(12)} HTTP ${r.status}  CORS ${cors ?? 'none'}  ${views} views` +
        (views !== recorded ? `  (catalogue says ${recorded} — run npm run catalogue)` : '') + '\n',
    );
  } catch (e) {
    bad++;
    process.stdout.write(`! ${v.id.padEnd(12)} ${e.message}\n`);
  }
  await sleep(2500);
}

process.stdout.write('\nOne image, with CORS\n');
try {
  const r = await fetch(`${GALLICA}/iiif/ark:/12148/${seed.volumes.find((x) => x.ark).ark}/f1/full/200,/0/native.jpg`, {
    method: 'HEAD',
    headers: { 'User-Agent': UA },
  });
  const cors = r.headers.get('access-control-allow-origin');
  if (!r.ok || cors !== '*') bad++;
  process.stdout.write(`${r.ok && cors === '*' ? ' ' : '!'} HTTP ${r.status}  CORS ${cors ?? 'none'}  ${r.headers.get('content-type')}\n`);
} catch (e) {
  bad++;
  process.stdout.write(`! ${e.message}\n`);
}

process.stdout.write('\nLiterature\n');
for (const e of editions) {
  await sleep(800);
  try {
    const r = await fetch(e.url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': UA } });
    // 403 is what HAL, Springer and the Académie answer a script with; it is
    // not a dead link and is reported as such rather than counted.
    const dead = !r.ok && r.status !== 403 && r.status !== 405;
    if (dead) bad++;
    process.stdout.write(`${dead ? '!' : ' '} ${e.id.padEnd(28)} HTTP ${r.status}${r.status === 403 ? ' (bot wall; open it in a browser)' : ''}\n`);
  } catch (err) {
    bad++;
    process.stdout.write(`! ${e.id.padEnd(28)} ${err.message}\n`);
  }
}

process.stdout.write(`\n${bad ? `${bad} problem(s)` : 'Everything answers as recorded'}.\n`);
process.exit(bad ? 1 : 0);
