#!/usr/bin/env node
/**
 * Cuts a batch's views into overlapping tiles, large enough to read.
 *
 *   npm run tiles -- fr-9115 3                   the batch's twenty views
 *   npm run tiles -- fr-9115 3 --views 47-49     only the hard run
 *
 * The parent project rendered PDF pages with poppler and cut them by hand.
 * Here the cutting is Gallica's: the IIIF Image API serves any **region** of a
 * view at full resolution, so a tile is one request —
 * `/f47/<x>,<y>,<w>,<h>/full/0/native.jpg` — and no image library is needed.
 * Six overlapping tiles per view, three rows by two columns, with 15 %
 * overlap so that no line falls in a seam.
 *
 * Two things it is deliberately not. It is not an enlargement of the
 * evidence: the scan is what it is, and a tile only presents the same pixels
 * large. And it is not OCR: nothing here proposes a reading.
 *
 * Six requests per view, sequential, with a pause. A batch of twenty is 120
 * requests over about four minutes; run it once, before reading, not per word.
 * Tiles land in `archives/tiles/<volume>/f<view>/`, git-ignored.
 */

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { GALLICA, UA, manifest } from './catalogue.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const TILES = resolve(ROOT, 'archives', 'tiles');
const BATCH_SIZE = 20;
const PAUSE_MS = 1800;
const GRID = { rows: 3, cols: 2, overlap: 0.15 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function volumes() {
  const src = await readFile(resolve(ROOT, 'src', 'content', 'catalogue.ts'), 'utf8');
  const i = src.indexOf('export const COTES');
  const j = src.indexOf('= [', i) + 2;
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '[') depth++;
    else if (src[k] === ']' && --depth === 0) return JSON.parse(src.slice(j, k + 1));
  }
  throw new Error('COTES not found in catalogue.ts');
}

function parseViews(arg, first, last) {
  if (!arg) return Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const out = [];
  for (const part of arg.split(',')) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part.trim());
    if (!m) throw new Error(`Bad view range: ${part}`);
    for (let v = Number(m[1]); v <= Number(m[2] ?? m[1]); v++) if (v >= first && v <= last) out.push(v);
  }
  return out;
}

/** The six rectangles, from the canvas size the manifest gives. */
function rectangles(width, height) {
  const { rows, cols, overlap } = GRID;
  const tw = Math.round(width / (cols - overlap * (cols - 1)));
  const th = Math.round(height / (rows - overlap * (rows - 1)));
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = Math.min(Math.round(c * tw * (1 - overlap)), width - tw);
      const y = Math.min(Math.round(r * th * (1 - overlap)), height - th);
      out.push({ name: `r${r + 1}c${c + 1}`, x, y, w: tw, h: th });
    }
  }
  return out;
}

async function fetchRegion(ark, view, rect, target) {
  try {
    if ((await stat(target)).size > 0) return false;
  } catch {
    // Not there yet.
  }
  const url = `${GALLICA}/iiif/ark:/12148/${ark}/f${view}/${rect.x},${rect.y},${rect.w},${rect.h}/full/0/native.jpg`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await writeFile(target, Buffer.from(await r.arrayBuffer()));
      return true;
    } catch (e) {
      process.stderr.write(`    f${view} ${rect.name}: ${e.message}\n`);
      await sleep(PAUSE_MS * (attempt + 3));
    }
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const [id, batchArg] = args.filter((a) => !a.startsWith('--'));
  const vi = args.indexOf('--views');
  if (!id || !batchArg) {
    process.stderr.write('Usage: npm run tiles -- <volume> <batch> [--views 47-49]\n');
    process.exit(1);
  }
  const v = (await volumes()).find((x) => x.id === id);
  if (!v?.ark) throw new Error(`${id} is not a digitised volume`);
  const k = Number(batchArg);
  const first = (k - 1) * BATCH_SIZE + 1;
  const last = Math.min(k * BATCH_SIZE, v.pages);
  const views = parseViews(vi >= 0 ? args[vi + 1] : null, first, last);

  const m = await manifest(v.ark, { cached: true }) ?? (await manifest(v.ark));
  const canvases = m.sequences[0].canvases;
  let n = 0;
  for (const view of views) {
    const c = canvases[view - 1];
    const dir = resolve(TILES, id, `f${view}`);
    await mkdir(dir, { recursive: true });
    const rects = rectangles(c.width, c.height);
    await writeFile(resolve(dir, 'tiles.json'), JSON.stringify({ view, width: c.width, height: c.height, tiles: rects }, null, 2));
    for (const rect of rects) {
      if (await fetchRegion(v.ark, view, rect, resolve(dir, `${rect.name}.jpg`))) {
        n++;
        await sleep(PAUSE_MS);
      }
    }
    process.stdout.write(`  f${view}: ${rects.length} tiles\n`);
  }
  process.stdout.write(`${n} tiles fetched → archives/tiles/${id}/\n`);
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
