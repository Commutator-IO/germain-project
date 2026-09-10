#!/usr/bin/env node
/**
 * Writes `dist/sitemap.xml`: every page the build actually publishes.
 *
 * It reads the built site rather than a list kept by hand, and that is the
 * whole point. The routes exist in three places already — the Rollup inputs in
 * `vite.config.ts`, the navigation in `Frame.tsx`, and the directories on
 * disk — and a fourth list would be the one nobody updates. A sitemap that
 * omits a page is merely incomplete; one that advertises a page that 404s
 * teaches a crawler to distrust the file. Deriving it from `dist/` makes both
 * impossible: what is listed is what was built.
 *
 * That matters most for the transcripts, which are the only part of this site
 * that grows. They are not versioned — the deploy renders them from
 * `transcripts/*.tex` — so on any given build there are exactly as many
 * reading views as there are finished transcriptions, and this file follows
 * without being touched.
 *
 * Runs after `vite build`, from `npm run build`.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, basename, posix } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist');

/**
 * The origin, taken from the same file that tells GitHub Pages what to serve.
 *
 * `public/CNAME` is the one place the custom domain is written down, and the
 * deploy workflow fails the build if it is missing from the artifact — Pages
 * would otherwise drop the domain. So it is the one string here worth
 * trusting, and it cannot go stale without the deployment breaking first.
 * `BASE_PATH` mirrors `vite.config.ts`: a project site would live under
 * `/<repo>/`, and the sitemap has to say so too.
 */
async function origin() {
  const host = (await readFile(resolve(ROOT, 'public', 'CNAME'), 'utf8')).trim();
  const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');
  return `https://${host}${base}`;
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

/**
 * The URL a built file is reachable at, or null if it is not a page.
 *
 * Two kinds of document are worth listing, and the rest of `dist/` — assets,
 * the KaTeX vendor bundle, the manifest, the download PDFs — is not a page a
 * reader would ever land on.
 */
function locOf(rel) {
  if (basename(rel) === 'index.html') {
    const dir = posix.dirname(rel);
    return dir === '.' ? '/' : `/${dir}/`;
  }

  if (!rel.startsWith('transcripts/') || !rel.endsWith('.html')) return null;

  // The `.tex.html` views show the same transcription as its LaTeX source.
  // Listing both would offer a crawler two URLs for one text, which is the
  // textbook way to have neither ranked; the reading view is the one meant to
  // be read.
  if (rel.endsWith('.tex.html')) return null;

  // `_specimen` is the worked example the transcription skill is checked
  // against — a fixture, not a folder of the fonds.
  if (rel.startsWith('transcripts/_specimen/')) return null;

  return `/${rel}`;
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function writeSitemap() {
  const site = await origin();

  const locs = (await walk(DIST))
    .map((p) => locOf(relative(DIST, p).split(/[\\/]/).join('/')))
    .filter((l) => l !== null)
    // Root first, then the rest in path order: a sitemap is read by machines,
    // but it is diffed by people.
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

  /**
   * No `lastmod`, and none of `changefreq` or `priority`.
   *
   * The last two are ignored by every major crawler and have been for years.
   * `lastmod` is read — which is exactly why it is left out: the only date
   * this script could stamp is the build's, and the build runs on every push
   * to any file. That would tell a crawler the whole fonds changed this
   * morning, every morning. The deploy checks out at depth 1, so the git dates
   * that would be honest are not available here either. Better to say nothing
   * than to say something a crawler is entitled to believe.
   */
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    locs.map((l) => `  <url><loc>${escape(site + l)}</loc></url>\n`).join('') +
    '</urlset>\n';

  await writeFile(resolve(DIST, 'sitemap.xml'), xml);
  return { site, locs };
}

const { site, locs } = await writeSitemap();
const transcripts = locs.filter((l) => l.startsWith('/transcripts/')).length;
process.stdout.write(
  `dist/sitemap.xml  ${locs.length} URLs on ${site}` +
    `  (${locs.length - transcripts} pages, ${transcripts} reading views)\n`,
);
