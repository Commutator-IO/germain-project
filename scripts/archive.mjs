#!/usr/bin/env node
/**
 * Mirrors the views of a digitised volume, for the transcription pass.
 *
 *   npm run archive -- fr-9115 --batches 1        twenty views
 *   npm run archive -- fr-9115 --batches 1-3      sixty
 *   npm run archive -- fr-9118                    the whole volume
 *
 * Why a mirror at all, when the site reads Gallica directly. The pass reads
 * image files: it opens a view, crops a doubtful line, opens it again. Doing
 * that against Gallica would be a request per glance, and Gallica rate-limits
 * an address that asks too fast. So a batch is fetched **once**, sequentially,
 * with a pause between images and a user agent naming this site, and the pass
 * then works offline.
 *
 * What is fetched is the full-resolution image of each view — `full/full` —
 * which for Français 9115 is about 5200 × 7100 pixels and a few megabytes.
 * Files land in `archives/<volume>/f0001.jpg`, outside `public/` so a build can
 * never carry them and git-ignored so a commit never can. Gallica's conditions
 * permit this copy for non-commercial use with the source stated; the source
 * is in the transcription's title block, and the mirror is for the pass and
 * nothing else.
 *
 * Nothing is re-fetched: a view already on disk is skipped, so re-running the
 * command after a reset picks up where the last one stopped.
 */

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { GALLICA, UA } from './catalogue.mjs';
import { writeManifest } from './manifest.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const MIRROR = resolve(ROOT, 'archives');

/** Twenty views: one transcription pass. Must agree with src/lib/batches.ts. */
const BATCH_SIZE = 20;

/** Between two images. Gallica answered a burst with resets; this is not a burst. */
const PAUSE_MS = 3000;

/**
 * After a 429. Gallica's quota is per minute, not per request: at one image
 * every 1.5 s it refused roughly every sixth view (10 September 2026), and
 * three retries a few seconds apart all fell inside the same refused minute.
 * So a refusal waits well past the minute, and waits longer each time.
 */
const RETRY_AFTER_MS = 45_000;
const ATTEMPTS = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The catalogue is a .ts file with JSON arrays in it; read the one we need. */
async function volumes() {
  const src = await readFile(resolve(ROOT, 'src', 'content', 'catalogue.ts'), 'utf8');
  const i = src.indexOf('export const COTES');
  const j = src.indexOf('= [', i) + 2;
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '[') depth++;
    else if (src[k] === ']' && --depth === 0) return JSON.parse(src.slice(j, k + 1));
  }
  throw new Error('COTES not found in catalogue.ts — run npm run catalogue');
}

function parseBatches(arg, count) {
  if (!arg) return Array.from({ length: count }, (_, i) => i + 1);
  const out = new Set();
  for (const part of arg.split(',')) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part.trim());
    if (!m) throw new Error(`Bad batch range: ${part}`);
    const a = Number(m[1]);
    const b = Number(m[2] ?? m[1]);
    for (let k = a; k <= b && k <= count; k++) out.add(k);
  }
  return [...out].sort((a, b) => a - b);
}

async function exists(path) {
  try {
    return (await stat(path)).size > 0;
  } catch {
    return false;
  }
}

async function fetchView(ark, view, target) {
  const url = `${GALLICA}/iiif/ark:/12148/${ark}/f${view}/full/full/0/native.jpg`;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 429) {
        // Honour the server's own figure when it gives one.
        const hinted = Number(r.headers.get('retry-after')) * 1000;
        const wait = Math.max(hinted || 0, RETRY_AFTER_MS * (attempt + 1));
        process.stderr.write(`    f${view}: HTTP 429 — waiting ${Math.round(wait / 1000)} s\n`);
        await sleep(wait);
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const type = r.headers.get('content-type') ?? '';
      if (!type.startsWith('image/')) throw new Error(`not an image (${type})`);
      await writeFile(target, Buffer.from(await r.arrayBuffer()));
      return true;
    } catch (e) {
      process.stderr.write(`    f${view}: ${e.message}${attempt < ATTEMPTS - 1 ? ' — waiting, then retrying' : ''}\n`);
      await sleep(PAUSE_MS * (attempt + 3));
    }
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const bi = args.indexOf('--batches');
  const only = bi >= 0 ? args[bi + 1] : null;
  // The value after --batches is not a volume.
  const ids = args.filter((a, i) => !a.startsWith('--') && i !== bi + 1);
  if (!ids.length) {
    process.stderr.write('Usage: npm run archive -- <volume> [--batches 1-3]\n');
    process.exit(1);
  }

  const all = await volumes();
  let fetched = 0;
  const missing = [];
  for (const id of ids) {
    const v = all.find((x) => x.id === id);
    if (!v) throw new Error(`Unknown volume: ${id}`);
    if (!v.ark || !v.pages) {
      process.stdout.write(`${id}: not online (${v.shelfmark}) — nothing to mirror.\n`);
      continue;
    }
    const count = Math.ceil(v.pages / BATCH_SIZE);
    const batches = parseBatches(only, count);
    const dir = resolve(MIRROR, id);
    await mkdir(dir, { recursive: true });
    process.stdout.write(`${id} — ${v.shelfmark}, ${v.pages} views, batches ${batches.join(', ')}\n`);

    for (const k of batches) {
      const first = (k - 1) * BATCH_SIZE + 1;
      const last = Math.min(k * BATCH_SIZE, v.pages);
      process.stdout.write(`  batch ${k}: views ${first}-${last}\n`);
      for (let view = first; view <= last; view++) {
        const target = resolve(dir, `f${String(view).padStart(4, '0')}.jpg`);
        if (await exists(target)) continue;
        if (await fetchView(v.ark, view, target)) fetched++;
        else missing.push(`${id} f${view}`);
        await sleep(PAUSE_MS);
      }
    }
  }

  process.stdout.write(`${fetched} views fetched from Gallica.\n`);
  await writeManifest();
  // A mirror with holes is worse than none: a pass would read around them
  // without knowing. Say so, and fail, so a loop stops here.
  if (missing.length) {
    process.stderr.write(`${missing.length} views still missing: ${missing.join(', ')}. Run again.\n`);
    process.exit(2);
  }
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
