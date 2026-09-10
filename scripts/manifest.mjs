#!/usr/bin/env node
/**
 * Writes `public/manifest.json`: what is actually present on this machine.
 *
 * The site ships without a byte of any manuscript and without a line of
 * transcription — the images are Gallica's and are read there, and the
 * transcripts are derived from the .tex at build. This file is what the site
 * reads at load time to know which batches it can open and which editions it
 * can offer for download. Everything else renders with the command that
 * produces it, rather than with a link that would 404.
 *
 * It is derived, never edited: it records what is on disk. A transcript listed
 * here but deleted would be a download button that lies, which teaches the
 * reader to distrust every other button on the page.
 *
 *   npm run manifest
 */

import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const MIRROR = resolve(ROOT, 'archives');
const TRANSCRIPTS = resolve(PUBLIC, 'transcripts');
const STATUS = resolve(ROOT, 'transcripts', 'status.json');

const BATCH_SIZE = 20;
const EDITIONS = ['fr', 'modern'];

async function dirs(path) {
  try {
    return (await readdir(path, { withFileTypes: true })).filter((d) => d.isDirectory());
  } catch {
    return [];
  }
}

/**
 * Which batches of a volume are mirrored, read off the JPEGs in
 * `archives/<volume>/` — `f0001.jpg`, `f0002.jpg`, … one per Gallica view.
 * A batch counts as mirrored when every one of its views is there; a partial
 * batch is a download that was interrupted, and offering it to a pass would
 * hand the pass fewer pages than it thinks it has.
 */
async function mirrored(volume) {
  let files;
  try {
    files = await readdir(resolve(MIRROR, volume));
  } catch {
    return { views: 0, batches: [] };
  }
  const views = new Set(
    files.map((f) => Number(/^f(\d+)\.jpg$/.exec(f)?.[1])).filter(Number.isFinite),
  );
  const top = Math.max(0, ...views);
  const batches = [];
  for (let k = 1; (k - 1) * BATCH_SIZE < top; k++) {
    const first = (k - 1) * BATCH_SIZE + 1;
    const last = k * BATCH_SIZE;
    let whole = true;
    for (let v = first; v <= Math.min(last, top); v++) if (!views.has(v)) whole = false;
    if (whole) batches.push(k);
  }
  return { views: views.size, batches };
}

export async function writeManifest() {
  const facsimiles = {};
  for (const d of await dirs(MIRROR)) {
    if (d.name === 'manifests' || d.name === 'tiles' || d.name === 'latex') continue;
    const m = await mirrored(d.name);
    if (m.batches.length) facsimiles[d.name] = m;
  }

  /**
   * Transcripts are keyed `<folder>#<batch>` and split by extension.
   *
   * Three editions times three extensions is nine possible files per batch, and
   * almost never are all nine present: an English translation typically exists
   * long before anyone has compiled its PDF. Recording each extension
   * separately is what lets the reading view offer the HTML while the download
   * row offers only the `.tex`.
   */
  const transcripts = {};
  /**
   * Readings whose unit is the folder, not the batch.
   *
   * `fr-9115.modern.tex` covers a shelfmark entire. Keyed by volume, it is offered against every batch of that
   * volume, which is what it actually covers.
   */
  const folders = {};
  /**
   * Folder tags come out of the modernised readings themselves: the
   * `\keywords{...}` line each one carries at the end of its résumé. There is
   * deliberately no tags file to edit — a tag with no modernised reading
   * behind it would be a claim about content nobody has read yet. Several
   * batches of one folder union their keywords.
   */
  const tags = {};
  /**
   * How many pages of each folder a transcription actually carries.
   *
   * Counted from the `\page{N}` marks, which are the archivists' numbering, so
   * this is directly comparable with the inventory's page count. The two differ
   * because a page carrying no mathematics — an administrative verso, a blank,
   * a separator — is skipped rather than transcribed, and the gap in the
   * numbering is the only record of it. The ratio is the one measurement this
   * project has of how much of a folder is actually readable content, and the
   * archive page uses it to say what a folder is likely to yield before anyone
   * opens it.
   */
  const read = {};
  for (const d of await dirs(TRANSCRIPTS)) {
    for (const f of await readdir(resolve(TRANSCRIPTS, d.name))) {
      const m = /^(?:batch-(\d+)|(.+?))\.(fr|modern)\.(html|tex|pdf|xml)$/.exec(f);
      // m[1] is set for `batch-NN.*`; m[2] for the folder-wide file, which must
      // be named for the folder it sits in — anything else is not ours.
      if (!m || (m[2] !== undefined && m[2] !== d.name)) continue;
      const entry = m[1]
        ? (transcripts[`${d.name}#${Number(m[1])}`] ??= { html: [], tex: [], pdf: [], xml: [] })
        : (folders[d.name] ??= { html: [], tex: [], pdf: [], xml: [] });
      if (!entry[m[4]].includes(m[3])) entry[m[4]].push(m[3]);
      if (m[3] === 'fr' && m[4] === 'tex') {
        const tex = await readFile(resolve(TRANSCRIPTS, d.name, f), 'utf8');
        const seen = (read[d.name] ??= new Set());
        for (const p of tex.matchAll(/\\page\{(\d+)\}/g)) seen.add(Number(p[1]));
      }
      if (m[3] === 'modern' && m[4] === 'tex') {
        const tex = await readFile(resolve(TRANSCRIPTS, d.name, f), 'utf8');
        for (const k of tex.matchAll(/\\keywords\{([^}]*)\}/g)) {
          const list = (tags[d.name] ??= []);
          // A keyword wrapped across a source line carries its newline here;
          // collapse any whitespace run to the single space the tag means.
          for (const t of k[1].split(',').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)) {
            if (!list.includes(t)) list.push(t);
          }
        }
      }
    }
  }
  for (const entry of [...Object.values(transcripts), ...Object.values(folders)]) {
    for (const ext of ['html', 'tex', 'pdf', 'xml']) {
      entry[ext].sort((a, b) => EDITIONS.indexOf(a) - EDITIONS.indexOf(b));
    }
  }

  /**
   * The declared states, carried through from the repository.
   *
   * Only the three no file can prove: a pass in flight, a human comparison
   * against the pages, a batch decided to hold nothing. `drafted` and
   * `reviewed` are never written down — they are read off the files above, so
   * they cannot go stale.
   */
  let declared = {};
  try {
    declared = JSON.parse(await readFile(STATUS, 'utf8')).status ?? {};
  } catch {
    // No status file: nothing has been claimed, which is a legitimate state.
  }

  await mkdir(PUBLIC, { recursive: true });
  await writeFile(
    resolve(PUBLIC, 'manifest.json'),
    JSON.stringify(
      {
        batchSize: BATCH_SIZE,
        generated: new Date().toISOString(),
        facsimiles,
        transcripts,
        folders,
        tags,
        read: Object.fromEntries(Object.entries(read).map(([k, v]) => [k, v.size])),
        declared,
      },
      null,
      2,
    ),
    'utf8',
  );

  process.stdout.write(
    `\nManifest: ${Object.keys(facsimiles).length} volumes mirrored, ` +
      `${Object.keys(transcripts).length} batches transcribed, ` +
      `${Object.keys(folders).length} volumes read whole, ` +
      `${Object.keys(declared).length} declared → public/manifest.json\n`,
  );
}

// Also usable on its own, after transcripts have been added or compiled.
if (import.meta.url === `file://${process.argv[1]}`) {
  writeManifest().catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
