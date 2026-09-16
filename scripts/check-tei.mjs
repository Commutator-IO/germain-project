#!/usr/bin/env node
/**
 * Checks that the TEI reading view says what the `.tex` reading view says.
 *
 *   npm run check-tei              every batch with both views
 *   npm run check-tei -- fr-9115   one volume
 *
 * Run after `npm run render`, `npm run tei` and `npm run tei-view`. For each
 * `batch-NN.fr.html` (from the `.tex`) and `batch-NN.fr.tei.html` (from the TEI
 * export) it compares, **page by page**, the text a reader gets — with
 * deletions shown, which is the default of both — and typesets every formula of
 * both views with KaTeX, `throwOnError: true`, under the macros the page itself
 * declares.
 *
 * The point is the switch of source: the reading view is to be renderable from
 * TEI. That is only safe if nothing a reader sees today is lost on the way
 * through the export, so a difference is reported, with its direction, and never
 * normalised away. Two kinds are expected and are named as such rather than
 * hidden: content the TEI export does not carry (a footnote, say), and residue
 * of render.mjs — macros it leaves on the page as literal text where tei.mjs
 * maps them.
 *
 * Normalisation is limited to what cannot be seen: runs of whitespace, and
 * whitespace just inside math delimiters (tei.mjs trims a formula's source,
 * render.mjs does not; KaTeX sets both identically).
 */

import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import katex from 'katex';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'public', 'transcripts');
const SOURCE = resolve(ROOT, 'transcripts');

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

/** The macros the reading view hands KaTeX, read off the page itself. */
function pageMacros(html) {
  const m = /var TR_MACROS = (\{[\s\S]*?\});/.exec(html);
  if (!m) throw new Error('no TR_MACROS in the page');
  return new Function(`return ${m[1]}`)();
}

function article(html) {
  const a = html.indexOf('<article class="ltx_document">');
  const b = html.lastIndexOf('</article>');
  if (a === -1 || b === -1) throw new Error('no <article> in the page');
  return html.slice(a, b);
}

/** Text of a fragment. */
function textOf(fragment) {
  const t = fragment
    // The watermark tile and the TEI view's link to its own XML: page
    // furniture, not text of the batch.
    .replace(/<div class="tr-demo-diag"[^>]*><\/div>/g, '')
    .replace(/<p class="tei-source">[\s\S]*?<\/p>/g, '')
    .replace(/<br>/g, ' ')
    .replace(/<[^>]+>/g, '');
  return decode(t)
    .replace(/\s+/g, ' ')
    .replace(/\\([([])\s+/g, '\\$1')
    .replace(/\s+\\([)\]])/g, '\\$1')
    .trim();
}

/** Splits an article at its page markers: [{ page, html }], front matter first. */
function pages(art) {
  const head = /<p class="tr-head">[\s\S]*?<\/p>/.exec(art);
  const body = head ? art.slice(head.index + head[0].length) : art;
  const parts = body.split(/(?=<span class="tr-page" data-page="\d+")/);
  return {
    head: head ? textOf(head[0]) : '',
    pages: parts.map((html) => ({
      page: /^<span class="tr-page" data-page="(\d+)"/.exec(html)?.[1] ?? 'front',
      html,
    })),
  };
}

/** Every formula a view will typeset, with where it sits. */
function formulas(art) {
  const out = [];
  for (const m of art.matchAll(/<span class="ltx_Math( ltx_display)?">\\[([]([\s\S]*?)\\[)\]]<\/span>/g)) {
    out.push({ tex: decode(m[2]), display: Boolean(m[1]), at: m.index });
  }
  return out;
}

function katexErrors(art, macros) {
  const errors = [];
  for (const f of formulas(art)) {
    try {
      katex.renderToString(f.tex, {
        displayMode: f.display,
        throwOnError: true,
        strict: 'ignore',
        macros: { ...macros },
      });
    } catch (e) {
      errors.push({ ...f, message: e.message.replace(/\s+/g, ' ').slice(0, 140) });
    }
  }
  return errors;
}

/** A word-level diff, small enough for a page: [{ side, words }] runs. */
function diffWords(a, b) {
  const x = a.split(' ');
  const y = b.split(' ');
  const n = x.length;
  const m = y.length;
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
  }
  const runs = [];
  const push = (side, w, ctx) => {
    const last = runs[runs.length - 1];
    if (last && last.side === side && last.open) last.words.push(w);
    else runs.push({ side, words: [w], before: ctx, open: true });
  };
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) {
      runs.forEach((r) => (r.open = false));
      i++;
      j++;
    } else if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) {
      push('tex', x[i], x.slice(Math.max(0, i - 6), i).join(' '));
      i++;
    } else {
      push('tei', y[j], x.slice(Math.max(0, i - 6), i).join(' '));
      j++;
    }
  }
  return runs;
}

/**
 * Macros scripts/tei.mjs maps and scripts/render.mjs does not, so that the
 * `.tex` view prints them as literal text where the TEI view prints what they
 * mean. `\\` at the end of a line of verse is the one that actually occurs
 * here; the rest are listed so that the next one to appear is named rather
 * than merely counted.
 */
const TEI_ONLY_MACROS =
  /\\\\|\\(dots|guillemot\w*|textbar|rule|medskip|smallskip|bigskip|noindent|par|newpage|clearpage|underline)(?![a-zA-Z])|\\[#{}]/;

/** Why a run differs, where the pattern of it says so. */
function explain(run) {
  const w = run.words.join(' ');
  if (run.side === 'tex' && TEI_ONLY_MACROS.test(w)) {
    return 'render.mjs leaves this macro as literal text; tei.mjs maps it';
  }
  if (run.side === 'tex' && /\\footnote|FOOTNOTE/.test(w)) {
    return 'footnote — the TEI export has no mapping for it';
  }
  if (run.side === 'tei') return 'only in the TEI view';
  return 'only in the .tex view — missing from the TEI export';
}

/** Constructs in the source the TEI export does not carry at all. */
async function sourceGaps(folder, file) {
  let tex;
  try {
    tex = await readFile(resolve(SOURCE, folder, file.replace(/\.html$/, '.tex')), 'utf8');
  } catch {
    return [];
  }
  const body = /\\begin\{document\}([\s\S]*)\\end\{document\}/.exec(tex)?.[1] ?? '';
  const prose = body
    .replace(/(?<!\\)%.*$/gm, '')
    .replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?:[^$\\]|\\.)+\$/g, '');
  const gaps = [];
  for (const [re, what] of [
    [/\\footnote\{/g, '\\footnote (no TEI mapping)'],
    [/\\pagerange\{/g, '\\pagerange (no TEI mapping)'],
  ]) {
    const k = (prose.match(re) ?? []).length;
    if (k) gaps.push(`${k} × ${what}`);
  }
  return gaps;
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
let folders = (await readdir(OUT, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
if (only.length) folders = folders.filter((f) => only.includes(f));

let files = 0;
let pagesChecked = 0;
let pagesDiffer = 0;
let katexTotal = 0;
let problems = 0;

for (const folder of folders.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
  const names = (await readdir(resolve(OUT, folder))).filter((f) => /^batch-\d+\.fr\.html$/.test(f)).sort();
  for (const name of names) {
    const teiName = name.replace(/\.html$/, '.tei.html');
    let texHtml;
    let teiHtml;
    try {
      texHtml = await readFile(resolve(OUT, folder, name), 'utf8');
      teiHtml = await readFile(resolve(OUT, folder, teiName), 'utf8');
    } catch {
      process.stdout.write(`! ${folder}/${name}: no ${teiName} — run npm run tei && npm run tei-view\n`);
      problems++;
      continue;
    }
    files++;
    const a = pages(article(texHtml));
    const b = pages(article(teiHtml));
    const lines = [];

    if (a.head !== b.head) lines.push(`  head line differs:\n    .tex: ${a.head}\n    TEI:  ${b.head}`);

    const seqA = a.pages.map((p) => p.page).join(' ');
    const seqB = b.pages.map((p) => p.page).join(' ');
    if (seqA !== seqB) lines.push(`  page markers differ:\n    .tex: ${seqA}\n    TEI:  ${seqB}`);

    const byKey = (list) => {
      const seen = {};
      return new Map(list.map((p) => [`${p.page}#${(seen[p.page] = (seen[p.page] ?? 0) + 1)}`, p]));
    };
    const ma = byKey(a.pages);
    const mb = byKey(b.pages);
    const pageLines = [];
    for (const key of new Set([...ma.keys(), ...mb.keys()])) {
      const ta = ma.has(key) ? textOf(ma.get(key).html) : '';
      const tb = mb.has(key) ? textOf(mb.get(key).html) : '';
      pagesChecked++;
      if (ta === tb) continue;
      pagesDiffer++;
      const runs = diffWords(ta, tb);
      pageLines.push(`  p. ${key.replace(/#1$/, '')}: ${runs.length} difference(s)`);
      for (const r of runs.slice(0, 8)) {
        const words = r.words.join(' ');
        pageLines.push(
          `    ${r.side === 'tex' ? '− .tex' : '+ TEI '} …${r.before.slice(-50)} ⟨${words.slice(0, 160)}${words.length > 160 ? '…' : ''}⟩\n` +
            `             ${explain(r)}`,
        );
      }
      if (runs.length > 8) pageLines.push(`    … ${runs.length - 8} more`);
    }
    lines.push(...pageLines);

    for (const [label, html] of [['.tex view', texHtml], ['TEI view', teiHtml]]) {
      const errs = katexErrors(article(html), pageMacros(html));
      katexTotal += label === 'TEI view' ? errs.length : 0;
      for (const e of errs.slice(0, 5)) {
        lines.push(`  KaTeX error in ${label}: ${e.message}\n    ${e.tex.slice(0, 120)}`);
      }
      if (errs.length > 5) lines.push(`  … ${errs.length - 5} more KaTeX errors in ${label}`);
    }

    const gaps = await sourceGaps(folder, name);
    if (gaps.length) lines.push(`  not carried by the TEI export: ${gaps.join(', ')}`);

    const counts = `${a.pages.length} page segment(s), ${formulas(article(teiHtml)).length} formulas`;
    if (lines.length) {
      problems++;
      process.stdout.write(`✗ ${folder}/${name} — ${counts}\n${lines.join('\n')}\n`);
    } else {
      process.stdout.write(`✓ ${folder}/${name} — ${counts}, identical text, 0 KaTeX errors\n`);
    }
  }
}

process.stdout.write(
  `\n${files} batch(es) · ${pagesChecked} page segments · ${pagesDiffer} differ · ` +
    `${katexTotal} KaTeX error(s) in the TEI views\n`,
);
process.exit(problems ? 1 : 0);
