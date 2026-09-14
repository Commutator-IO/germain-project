#!/usr/bin/env node
/**
 * Rebuilds `src/content/catalogue.ts` from `holdings.json` and Gallica.
 *
 *   npm run catalogue               ask Gallica for every digitised volume
 *   npm run catalogue -- --cached   use the manifests already under archives/
 *   npm run catalogue -- --missing  use the cache, and ask Gallica only for
 *                                   the manifests not yet in it
 *
 * The holdings file is the seed and stays hand-kept: it names every volume
 * this site reads — mathematicians' archives digitised in Gallica — and which
 * mathematician it belongs to. What this script adds is what the seed should
 * not retype: how many views Gallica serves for each volume, read from the
 * IIIF manifest, the same document the facsimile pane will read in the
 * browser, and — where the seed leaves them null — the holder's own title,
 * dating, physical description, leaf count and notice, from the manifest's
 * metadata. A count typed by hand would be right until the BnF re-digitised a
 * volume; this one follows.
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
const PAUSE_MS = Number(process.env.CATALOGUE_PAUSE_MS ?? 2500);

/** After a 429, as in scripts/archive.mjs: Gallica's quota is per minute. */
const RETRY_AFTER_MS = 45_000;
const ATTEMPTS = 4;

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
export async function manifest(ark, { cached = false, missing = false } = {}) {
  await mkdir(CACHE, { recursive: true });
  const file = resolve(CACHE, `${ark}.json`);
  try {
    const text = await readFile(file, 'utf8');
    if (cached || missing) return Object.assign(JSON.parse(text), { __cached: true });
  } catch {
    if (cached) return null;
  }
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const r = await fetch(manifestUrl(ark), { headers: { 'User-Agent': UA } });
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
      const text = await r.text();
      JSON.parse(text); // refuse to cache an error page
      await writeFile(file, text, 'utf8');
      return JSON.parse(text);
    } catch (e) {
      const last = attempt === ATTEMPTS - 1;
      process.stderr.write(`  ${ark}: ${e.message}${last ? '' : ' — waiting, then retrying'}\n`);
      if (last) break;
      // Gallica's quota is per minute: a 429 is answered by waiting well past
      // the minute, longer each time, as scripts/archive.mjs does.
      await sleep(e.status === 429 ? RETRY_AFTER_MS * (attempt + 1) : PAUSE_MS * (attempt + 2));
    }
  }
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

/** What the catalogue needs from a manifest: the view count, the first image's size, and the holder's metadata. */
export function summarise(m) {
  const canvases = m?.sequences?.[0]?.canvases ?? [];
  const first = canvases[0];
  const meta = Object.fromEntries((m?.metadata ?? []).map((e) => [e.label, typeof e.value === 'string' ? e.value : '']));
  const format = meta.Format ?? '';
  const folios = /(\d+)\s*feuillets/.exec(format);
  const notice = /https?:\/\/\S+/.exec(meta.Relation ?? '');
  return {
    views: canvases.length,
    width: first?.width ?? 0,
    height: first?.height ?? 0,
    label: m?.label ?? '',
    title: meta.Title ?? '',
    date: meta.Date ?? '',
    extent: format,
    folios: folios ? Number(folios[1]) : null,
    notice: notice ? notice[0].replace(/^http:/, 'https:') : null,
  };
}

async function main() {
  const cached = process.argv.includes('--cached');
  const missing = process.argv.includes('--missing');
  const seed = JSON.parse(await readFile(SEED, 'utf8'));

  // Whatever the last run recorded, so a volume Gallica will not answer for
  // today keeps yesterday's count rather than dropping to zero.
  let previous = {};
  try {
    const old = await readFile(OUT, 'utf8');
    // Parsed as the JSON array it is, so a group's id is never paired with a
    // volume's count.
    const i = old.indexOf('export const COTES');
    const j = old.indexOf('= [', i) + 2;
    let depth = 0;
    for (let k = j; i >= 0 && k < old.length; k++) {
      if (old[k] === '[') depth++;
      else if (old[k] === ']' && --depth === 0) {
        for (const v of JSON.parse(old.slice(j, k + 1))) previous[v.id] = v.pages;
        break;
      }
    }
  } catch {
    // First run.
  }

  const volumes = [];
  for (const v of seed.volumes) {
    let pages = 0;
    let fill = {};
    if (v.ark) {
      const m = await manifest(v.ark, { cached, missing });
      if (m) {
        const s = summarise(m);
        pages = s.views;
        // The seed's own words win; the manifest's fill only what it left empty.
        fill = { title: s.title, date: s.date, extent: s.extent, folios: s.folios, notice: s.notice };
        process.stdout.write(`  ${v.id.padEnd(18)} ${v.ark}  ${s.views} views  ${s.width}×${s.height}\n`);
      } else {
        pages = previous[v.id] ?? 0;
        process.stderr.write(`  ${v.id}: no manifest — keeping ${pages} views from the last run\n`);
      }
      if (!cached && !m?.__cached) await sleep(PAUSE_MS);
    }
    const filled = { ...v };
    for (const [k, val] of Object.entries(fill)) {
      if ((filled[k] === null || filled[k] === undefined || filled[k] === '') && val) filled[k] = val;
    }
    volumes.push({ ...filled, extent: filled.extent ?? '', pages });
  }

  const groups = seed.groups.map((g) => ({
    id: g.id,
    title: g.title,
    date: g.date,
    century: g.century,
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
