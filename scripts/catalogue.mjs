#!/usr/bin/env node
/**
 * Rebuilds `src/content/catalogue.ts` from `holdings.json` and Gallica.
 *
 *   npm run catalogue              ask Gallica for every digitised volume
 *   npm run catalogue -- --cached  use the manifests already under archives/
 *
 * The holdings file is the seed and stays hand-kept: it names every place a
 * Germain manuscript is known to be, in the holder's own words. What this
 * script adds is the one fact the seed cannot know — how many views Gallica
 * serves for each digitised volume — read from the IIIF manifest, the same
 * document the facsimile pane will read in the browser. A count typed by
 * hand would be right until the BnF re-digitised a volume; this one follows.
 *
 * Manifests are cached under `archives/manifests/` (git-ignored, like every
 * other byte fetched from a holder), for two reasons. Gallica rate-limits:
 * a dozen requests in quick succession from one address were answered with
 * connection resets on 10 September 2026, and a build must not depend on
 * being under the limit. And the cache is what `--cached` reads, so the
 * catalogue can be rebuilt offline from what was last seen.
 *
 * Only two things travel to Gallica: the ark and a user agent that names this
 * site. Requests are sequential, with a pause between them.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SEED = resolve(ROOT, 'src', 'content', 'holdings.json');
const OUT = resolve(ROOT, 'src', 'content', 'catalogue.ts');
const CACHE = resolve(ROOT, 'archives', 'manifests');

export const GALLICA = 'https://gallica.bnf.fr';
export const UA = 'germain.commutator.io catalogue (+https://germain.commutator.io/sources/)';

/** Between two requests. Generous on purpose: nothing here is in a hurry. */
const PAUSE_MS = 2500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const manifestUrl = (ark) => `${GALLICA}/iiif/ark:/12148/${ark}/manifest.json`;

/**
 * The manifest, from cache or from Gallica.
 *
 * A reset connection is retried twice with a longer pause: it is how Gallica
 * says "slower", not "no". A manifest that still cannot be had is reported and
 * the volume keeps whatever count the last catalogue recorded, so one bad
 * network day does not zero a volume's views.
 */
export async function manifest(ark, { cached = false } = {}) {
  await mkdir(CACHE, { recursive: true });
  const file = resolve(CACHE, `${ark}.json`);
  try {
    const text = await readFile(file, 'utf8');
    if (cached) return JSON.parse(text);
  } catch {
    if (cached) return null;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(manifestUrl(ark), { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      JSON.parse(text); // refuse to cache an error page
      await writeFile(file, text, 'utf8');
      return JSON.parse(text);
    } catch (e) {
      process.stderr.write(`  ${ark}: ${e.message}${attempt < 2 ? ' — retrying' : ''}\n`);
      await sleep(PAUSE_MS * (attempt + 2));
    }
  }
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

/** What the catalogue needs from a manifest: the view count and the first image's size. */
export function summarise(m) {
  const canvases = m?.sequences?.[0]?.canvases ?? [];
  const first = canvases[0];
  return {
    views: canvases.length,
    width: first?.width ?? 0,
    height: first?.height ?? 0,
    label: m?.label ?? '',
  };
}

async function main() {
  const cached = process.argv.includes('--cached');
  const seed = JSON.parse(await readFile(SEED, 'utf8'));

  // Whatever the last run recorded, so a volume Gallica will not answer for
  // today keeps yesterday's count rather than dropping to zero.
  let previous = {};
  try {
    const old = await readFile(OUT, 'utf8');
    for (const m of old.matchAll(/"id":\s*"([^"]+)"[\s\S]*?"pages":\s*(\d+)/g)) {
      previous[m[1]] = Number(m[2]);
    }
  } catch {
    // First run.
  }

  const volumes = [];
  for (const v of seed.volumes) {
    let pages = 0;
    if (v.ark) {
      const m = await manifest(v.ark, { cached });
      if (m) {
        const s = summarise(m);
        pages = s.views;
        process.stdout.write(`  ${v.id.padEnd(18)} ${v.ark}  ${s.views} views  ${s.width}×${s.height}\n`);
      } else {
        pages = previous[v.id] ?? 0;
        process.stderr.write(`  ${v.id}: no manifest — keeping ${pages} views from the last run\n`);
      }
      if (!cached) await sleep(PAUSE_MS);
    }
    volumes.push({ ...v, pages });
  }

  const groups = seed.groups.map((g) => ({
    id: g.id,
    title: g.title,
    date: g.date,
    cotes: volumes.filter((v) => v.group === g.id).map((v) => v.id),
  }));

  const online = volumes.filter((v) => v.pages > 0);
  const totalViews = online.reduce((s, v) => s + v.pages, 0);
  const banner =
    `// Generated by \`npm run catalogue\` — do not edit by hand; edit holdings.json.\n` +
    `// ${volumes.length} volumes with ${seed.holders.length} holders; ${online.length} digitised, ` +
    `${totalViews} Gallica views. Manifests read ${new Date().toISOString().slice(0, 10)}.\n\n`;

  const body =
    `import type { ArchiveGroup, Holder, Volume } from '../lib/types.ts';\n\n` +
    `export const HOLDERS: Holder[] = ${JSON.stringify(seed.holders, null, 2)};\n\n` +
    `export const GROUPS: ArchiveGroup[] = ${JSON.stringify(groups, null, 2)};\n\n` +
    `export const COTES: Volume[] = ${JSON.stringify(
      volumes.map(({ group, ...v }) => ({ ...v, group })),
      null,
      2,
    )};\n\n` +
    `export const BY_ID = new Map(COTES.map((c) => [c.id, c]));\n` +
    `export const HOLDER_BY_ID = new Map(HOLDERS.map((h) => [h.id, h]));\n`;

  await writeFile(OUT, banner + body, 'utf8');
  process.stdout.write(
    `\nCatalogue: ${volumes.length} volumes, ${online.length} online, ${totalViews} views → src/content/catalogue.ts\n`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
