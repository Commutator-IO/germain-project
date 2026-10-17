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
 *
 * Sober by construction. On 17 October 2026 Gallica's firewall (Cloudflare,
 * in front of the BnF) blocked this machine outright — a 403 « Sorry, you have
 * been blocked » on every URL, the reading pages included — most likely after
 * the September mirrors. So the mirror now:
 *
 * — waits 10 s between images, with jitter, rather than 3;
 * — takes at most 150 images in any hour (`--per-hour N` to lower it), and
 *   sleeps when the hour is full instead of pressing on;
 * — stops the whole run at the first 403, or at a page that is not an image
 *   where an image was asked for: that is a block, not a hiccup, and retrying
 *   it is exactly what a firewall counts;
 * — stops the run, rather than moving on to the next view, when a view is
 *   still refused with 429 after its back-offs: the quota is per address, so
 *   the next view would only be refused too.
 *
 * A blocked address is lifted by asking the BnF, not by asking again.
 */

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { GALLICA, UA } from './catalogue.mjs';
import { writeManifest } from './manifest.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const MIRROR = resolve(ROOT, 'archives');

/** Twenty views: one transcription pass. Must agree with src/lib/batches.ts. */
const BATCH_SIZE = 20;

/**
 * Between two images, plus up to half again at random so the requests do not
 * tick like a metronome. Gallica answered a burst with resets (September 2026)
 * and later blocked the address altogether (October): this is not a burst.
 */
const PAUSE_MS = 10_000;
const pause = () => PAUSE_MS + Math.floor(Math.random() * PAUSE_MS * 0.5);

/** No more than this many images in any sliding hour. `--per-hour` lowers it. */
const PER_HOUR = 150;
const HOUR_MS = 3_600_000;

/**
 * After a 429. Gallica's quota is per minute, not per request: at one image
 * every 1.5 s it refused roughly every sixth view (10 September 2026), and
 * three retries a few seconds apart all fell inside the same refused minute.
 * So a refusal waits well past the minute, and waits longer each time.
 */
const RETRY_AFTER_MS = 45_000;
const ATTEMPTS = 5;

/**
 * A stalled connection, not a refusal. Gallica has answered a view in seconds
 * while the same run sat on an earlier one for ever (17 September 2026):
 * `fetch` has no timeout of its own, so without this a single hung socket
 * stops the mirror silently. Well clear of a slow large canvas.
 */
const FETCH_TIMEOUT_MS = 120_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Gallica has refused the address: stop everything, retry nothing. */
class Blocked extends Error {}

/** The start times of the requests of the last hour, for the hourly ceiling. */
const recent = [];
async function withinHourlyCeiling(perHour) {
  for (;;) {
    const now = Date.now();
    while (recent.length && now - recent[0] > HOUR_MS) recent.shift();
    if (recent.length < perHour) {
      recent.push(now);
      return;
    }
    const wait = HOUR_MS - (now - recent[0]) + 1000;
    process.stdout.write(`    ${perHour} images in the last hour — waiting ${Math.ceil(wait / 60000)} min\n`);
    await sleep(wait);
  }
}

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

async function fetchView(ark, view, target, perHour) {
  const url = `${GALLICA}/iiif/ark:/12148/${ark}/f${view}/full/full/0/native.jpg`;
  let refused = 0;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      await withinHourlyCeiling(perHour);
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (r.status === 403) {
        const ray = r.headers.get('cf-ray');
        throw new Blocked(
          `f${view}: HTTP 403 from Gallica${ray ? ` (Cloudflare Ray ID ${ray})` : ''} — this address is blocked. ` +
            'Stopping without retrying. Ask the BnF to lift the block (give the Ray ID); do not route around it.',
        );
      }
      if (r.status === 429) {
        refused++;
        // Honour the server's own figure when it gives one.
        const hinted = Number(r.headers.get('retry-after')) * 1000;
        const wait = Math.max(hinted || 0, RETRY_AFTER_MS * (attempt + 1));
        process.stderr.write(`    f${view}: HTTP 429 — waiting ${Math.round(wait / 1000)} s\n`);
        await sleep(wait);
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const type = r.headers.get('content-type') ?? '';
      // An HTML page where an image was asked for is a challenge or a block
      // page, whatever the status says.
      if (!type.startsWith('image/')) {
        throw new Blocked(`f${view}: Gallica answered ${type || 'something'} instead of an image — stopping.`);
      }
      await writeFile(target, Buffer.from(await r.arrayBuffer()));
      return true;
    } catch (e) {
      if (e instanceof Blocked) throw e;
      process.stderr.write(`    f${view}: ${e.message}${attempt < ATTEMPTS - 1 ? ' — waiting, then retrying' : ''}\n`);
      await sleep(PAUSE_MS * (attempt + 3));
    }
  }
  // Still refused after every back-off: the quota is the address's, so the
  // next view would be refused too. Stop the run rather than press on.
  if (refused === ATTEMPTS) {
    throw new Blocked(`f${view}: refused with 429 ${ATTEMPTS} times running — stopping. Try again in an hour or more.`);
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const bi = args.indexOf('--batches');
  const only = bi >= 0 ? args[bi + 1] : null;
  const hi = args.indexOf('--per-hour');
  // Lower only: the ceiling is a promise to Gallica, not a default to raise.
  const perHour = hi >= 0 ? Math.min(PER_HOUR, Math.max(1, Number(args[hi + 1]) || PER_HOUR)) : PER_HOUR;
  // The values after --batches and --per-hour are not volumes.
  const ids = args.filter((a, i) => !a.startsWith('--') && !(bi >= 0 && i === bi + 1) && !(hi >= 0 && i === hi + 1));
  if (!ids.length) {
    process.stderr.write('Usage: npm run archive -- <volume> [--batches 1-3] [--per-hour N]\n');
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
        if (await fetchView(v.ark, view, target, perHour)) fetched++;
        else missing.push(`${id} f${view}`);
        await sleep(pause());
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

main().catch(async (e) => {
  process.stderr.write(`${e.message}\n`);
  if (e instanceof Blocked) {
    // Keep what did arrive usable before leaving.
    await writeManifest().catch(() => {});
    process.exit(3);
  }
  process.exit(1);
});
