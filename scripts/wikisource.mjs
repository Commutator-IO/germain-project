#!/usr/bin/env node
/**
 * Converts a volume's transcription to wikitext, one file per Gallica view,
 * ready to paste into the Page: namespace of Wikisource (issue #10).
 *
 *   npm run wikisource -- naf-5166                  one volume
 *   npm run wikisource -- naf-5166 --check-math     and validate every formula
 *   npm run wikisource -- naf-5166 --notes=none     without the reading notes
 *   npm run wikisource -- naf-5166 --offset=1 --file="Lagrange - NAF 5166.pdf"
 *   npm run wikisource -- --site                    the site's Wikisource tab
 *
 * Two outputs from one conversion. Without --site, wikisource/<volume>/ gets a
 * file per view and an index.md, for pasting by hand. With --site, every
 * transcribed batch gets public/transcripts/<volume>/batch-NN.fr.wiki.html:
 * the reading pane's « Wikisource » tab, one section per view with a preview
 * and the wikicode behind a copy button. That second output answers the
 * Scriptorium (Seudo, 28 September 2026): rather than pour on Wikisource
 * pages nobody may ever proofread, publish the wikicode here, under CC0, for
 * a Wikisource contributor to take the day they mean to correct a text.
 *
 * Why a third serialisation. Wikisource wants the text page by page against
 * the facsimile, in wikitext, with its own templates for the apparatus. The
 * `.tex` stays the source of record; this script reads nothing else, and its
 * output is derived and unversioned (wikisource/, ignored like public/).
 *
 * The mapping, like tei.mjs's, is one-to-one with the apparatus:
 *
 *   \page{17}          a new file, vue-017.wiki → Page:<file>/<17 + offset>
 *   \struck{x}         {{Rature|1=x}}             in math: \cancel{x}
 *   \ill{}             {{Illisible}}              in math: \text{[illisible]}
 *   \uncertain{x}      x [?]                      in math: x\,\text{[?]}
 *   \add{x}            [x]                        in math: [x]
 *   \marginal{x}       [''en marge :'' x]
 *   \note{x}           <ref>x</ref> when it is attached to text. A note that
 *                      stands alone as a paragraph describes the leaf (paper,
 *                      stamps, hands) rather than a reading; it is left out,
 *                      since the site keeps it, unless --notes=all.
 *                      --notes=none leaves every note out.
 *   \folio{x}          nothing in the text; listed in the volume's index.md,
 *                      for the <pagelist/> of the Livre: page
 *   $…$  \[…\]         <math>…</math>, <math display="block">…</math>
 *   align*, gather*    rewritten as aligned, gathered — MediaWiki's math has
 *                      no top-level alignment environments
 *
 * {{Rature}} and {{Illisible}} exist on fr.wikisource (checked 28 September
 * 2026). There is no template there for an uncertain reading or an insertion,
 * hence the brackets; the Scriptorium may prefer something else, and this
 * table is where to change it. The Latin volumes go to la.wikisource, whose
 * templates have not been checked.
 *
 * `--check-math` sends every distinct formula to Wikimedia's own validator
 * (the REST endpoint behind <math>) and lists those it refuses, by view: a
 * formula KaTeX renders on the site is not always one MediaWiki accepts.
 *
 * Same discipline as tei.mjs: an unknown environment raises, an unknown macro
 * left in the text is reported, never silently dropped.
 */

import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { escapeHtml, readingPage } from './render.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'transcripts');
const OUT = resolve(ROOT, 'wikisource');
const GALLICA = 'https://gallica.bnf.fr';
const SITE = 'https://germain.commutator.io';
const MATH_CHECK = 'https://wikimedia.org/api/rest_v1/media/math/check/tex';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : fallback;
};
const VOLUMES = args.filter((a) => !a.startsWith('--'));
const NOTES = flag('notes', 'ref');
const OFFSET = Number(flag('offset', '1'));
const CHECK_MATH = args.includes('--check-math');
const SITE_MODE = args.includes('--site');
const PUBLIC = resolve(ROOT, 'public', 'transcripts');

if (!['ref', 'all', 'none'].includes(NOTES)) throw new Error(`--notes=${NOTES}: expected ref, all or none`);

/** The catalogue's volumes, read as tei.mjs reads them. */
const CATALOGUE = await (async () => {
  const src = await readFile(resolve(ROOT, 'src', 'content', 'catalogue.ts'), 'utf8');
  const i = src.indexOf('export const COTES');
  const j = src.indexOf('= [', i) + 2;
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '[') depth++;
    else if (src[k] === ']' && --depth === 0) {
      return new Map(JSON.parse(src.slice(j, k + 1)).map((v) => [v.id, v]));
    }
  }
  return new Map();
})();

// ---------------------------------------------------------------------------
// Brace-matched macros.

/** Replaces every \name{arg} by wrap(arg), innermost-safe by brace counting. */
function replaceBraced(text, name, wrap) {
  const open = `\\${name}{`;
  let out = text;
  let from = 0;
  let i;
  while ((i = out.indexOf(open, from)) !== -1) {
    let depth = 0;
    let j = i + open.length - 1;
    for (; j < out.length; j++) {
      // \{ and \} are TeX's literal braces (a \left\{ in a formula), not groups.
      if (out[j] === '\\') j++;
      else if (out[j] === '{') depth++;
      else if (out[j] === '}' && --depth === 0) break;
    }
    if (j >= out.length) throw new Error(`unclosed \\${name}{ near: ${out.slice(i, i + 60)}`);
    const rep = wrap(out.slice(i + open.length, j));
    out = out.slice(0, i) + rep + out.slice(j + 1);
    from = i;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Mathematics: lifted out first, converted, put back last.

const marker = (i) => `MATH${i}`;
const MARKED = () => /MATH(\d+)/g;

function liftMath(tex) {
  const held = [];
  const keep = (raw, display) => {
    held.push({ raw, display });
    return marker(held.length - 1);
  };
  const text = tex
    .replace(/\\begin\{tikzcd\}[\s\S]*?\\end\{tikzcd\}/g, (m) => keep(m, 'diagram'))
    .replace(
      /\\begin\{(equation\*?|align\*?|gather\*?|cases|matrix|pmatrix|bmatrix|array|aligned)\}[\s\S]*?\\end\{\1\}/g,
      (m) => keep(m, true),
    )
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => keep(m, true))
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => keep(m, true))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => keep(m, false))
    .replace(/(?<!\\)\$((?:[^$\\]|\\.)+)\$/g, (_, m) => keep(m, false));
  return { text, held };
}

/**
 * One formula, as MediaWiki's <math> takes it. Returns the TeX and the notes
 * found inside it, which cannot stay there: a <ref> is wikitext, not TeX.
 */
function mathTeX(raw, held) {
  const expand = (s) => s.replace(MARKED(), (_, i) => expand(held[Number(i)].raw));
  let tex = expand(raw).trim();
  const notes = [];
  tex = replaceBraced(tex, 'note', (a) => {
    notes.push(a);
    return '';
  });
  tex = replaceBraced(tex, 'marginal', (a) => `\\text{[en marge : }${a}\\text{]}`);
  tex = replaceBraced(tex, 'struck', (a) => `\\cancel{${a}}`);
  tex = replaceBraced(tex, 'uncertain', (a) => `${a}\\,\\text{[?]}`);
  tex = replaceBraced(tex, 'add', (a) => `[${a}]`);
  tex = replaceBraced(tex, 'folio', () => '');
  tex = tex.replace(/\\ill\{\}|\\ill(?![a-zA-Z])/g, '\\text{[illisible]}');
  // Top-level alignment environments do not exist in MediaWiki's math; their
  // inner forms do, and render the same inside a display.
  tex = tex
    .replace(/\\begin\{(align|gather)\*?\}([\s\S]*?)\\end\{\1\*?\}/g, (_, env, b) =>
      `\\begin{${env === 'align' ? 'aligned' : 'gathered'}}${b}\\end{${env === 'align' ? 'aligned' : 'gathered'}}`,
    )
    .replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, '$1')
    // MediaWiki refuses \& inside \text{}, though it takes it in math mode:
    // « \text{ \&c.} » becomes « \text{ }\&\text{c.} ».
    .replace(/\\(text|mbox)\{([^{}]*)\}/g, (_, cmd, t) =>
      t.split('\\&').map((s) => (s ? `\\${cmd}{${s}}` : '')).join('\\&'),
    )
    .replace(/\\tag\*?\{[^{}]*\}/g, '')
    .replace(/\\label\{[^{}]*\}/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
  return { tex, notes };
}

// ---------------------------------------------------------------------------
// Text.

/** Escapes what wikitext would read as markup in the running text. */
const escapeWiki = (s) =>
  s
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/''/g, "'&#39;")
    .replace(/\[\[/g, '[&#91;')
    .replace(/\{\{/g, '{&#123;');

/** A template argument: pipes would split it. */
const arg = (s) => s.replace(/\|/g, '{{!}}');

function makeInline(unknown, notesOut) {
  return function inline(text) {
    let out = escapeWiki(text);
    out = replaceBraced(out, 'note', (a) => {
      if (NOTES === 'none') return '';
      notesOut.count++;
      return `<ref>${a.replace(/\s*\n\s*/g, ' ').trim()}</ref>`;
    });
    out = replaceBraced(out, 'folio', () => '');
    out = replaceBraced(out, 'struck', (a) => `{{Rature|1=${arg(a)}}}`);
    out = replaceBraced(out, 'uncertain', (a) => `${a} [?]`);
    out = replaceBraced(out, 'add', (a) => `[${a}]`);
    out = replaceBraced(out, 'marginal', (a) => `[''en marge :'' ${a}]`);
    out = replaceBraced(out, 'emph', (a) => `''${a}''`);
    out = replaceBraced(out, 'textit', (a) => `''${a}''`);
    out = replaceBraced(out, 'textbf', (a) => `'''${a}'''`);
    out = replaceBraced(out, 'texttt', (a) => `<code>${a}</code>`);
    out = replaceBraced(out, 'textsuperscript', (a) => `<sup>${a}</sup>`);
    out = replaceBraced(out, 'textsc', (a) => `{{sc|${arg(a)}}}`);
    out = replaceBraced(out, 'underline', (a) => `<u>${a}</u>`);
    out = replaceBraced(out, 'selectlanguage', () => '');
    out = out
      .replace(/\\ill\{\}|\\ill(?![a-zA-Z])/g, '{{Illisible}}')
      .replace(/\\l?dots(\{\})?/g, '…')
      .replace(/\\og\{?\}?\s*/g, '« ')
      .replace(/\s*\\fg\{?\}?/g, ' »')
      .replace(/\\guillemotleft\{?\}?\s*/g, '« ')
      .replace(/\s*\\guillemotright\{?\}?/g, ' »')
      .replace(/\\textbar(\{\})?/g, '{{!}}')
      .replace(/\\rule\{[^{}]*\}\{[^{}]*\}/g, '—')
      .replace(/\\(?:medskip|smallskip|bigskip|noindent|par|newpage|clearpage)(?![a-zA-Z])(\{\})?/g, '')
      .replace(/\\\\(\[[^\]]*\])?/g, '<br />')
      .replace(/\\-/g, '')
      .replace(/\\[ ,;:!]/g, ' ')
      .replace(/(?<!\\)\\(?=\r?\n)/g, ' ')
      .replace(/\\q?quad(\{\})?/g, ' ')
      .replace(/\\%/g, '%')
      .replace(/\\&/g, '&')
      .replace(/\\_/g, '_')
      .replace(/\\#/g, '#')
      .replace(/\\\{/g, '{')
      .replace(/\\\}/g, '}')
      .replace(/---/g, '—')
      .replace(/--/g, '–')
      .replace(/~/g, ' ');
    for (const m of out.matchAll(/\\([a-zA-Z]+)/g)) unknown.add(m[1]);
    // One line per paragraph: in wikitext a line starting with a space, a
    // star or a colon is markup.
    return out.replace(/\s*\n\s*/g, ' ').replace(/ {2,}/g, ' ').trim();
  };
}

// ---------------------------------------------------------------------------
// Blocks.

function liftEnvs(text) {
  const kept = [];
  let out = '';
  let i = 0;
  const openRe = /\\begin\{(itemize|enumerate|quote)\}/g;
  for (;;) {
    openRe.lastIndex = i;
    const m = openRe.exec(text);
    if (!m) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, m.index);
    const tok = /\\(begin|end)\{(itemize|enumerate|quote)\}/g;
    tok.lastIndex = m.index + m[0].length;
    let depth = 1;
    let end = -1;
    let t;
    while ((t = tok.exec(text))) {
      depth += t[1] === 'begin' ? 1 : -1;
      if (depth === 0) {
        end = t.index + t[0].length;
        break;
      }
    }
    if (end === -1) throw new Error(`unclosed \\begin{${m[1]}}`);
    kept.push(text.slice(m.index, end));
    out += `\n\nENVBLOCK${kept.length - 1}\n\n`;
    i = end;
  }
  return { text: out, kept };
}

function splitItems(body) {
  const items = [];
  let depth = 0;
  let cur = null;
  const tok = /\\(begin|end)\{(itemize|enumerate|quote)\}|\\item(?![a-zA-Z])/g;
  let t;
  while ((t = tok.exec(body))) {
    if (t[1] === 'begin') depth++;
    else if (t[1] === 'end') depth--;
    else if (depth === 0) {
      if (cur !== null) items.push(body.slice(cur, t.index));
      cur = t.index + t[0].length;
    }
  }
  if (cur !== null) items.push(body.slice(cur));
  return items;
}

function takeBracketed(text) {
  if (text[0] !== '[') return null;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']' && --depth === 0) return { label: text.slice(1, i), rest: text.slice(i + 1) };
  }
  return null;
}

/**
 * Renders one page's source to wikitext lines. Paragraphs are separated by a
 * blank line; a display formula stands on its own line.
 */
function renderPage(src, inline, headings, prefix = '') {
  const { text, kept } = liftEnvs(src);
  const blocks = text
    .replace(/(\\(?:sub)?section\*?\{)/g, '\n\n$1')
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out = [];
  for (const block of blocks) {
    if (NOTES !== 'all' && block.startsWith('\\note{') && !replaceBraced(block, 'note', () => '').trim()) continue;
    const env = /^ENVBLOCK(\d+)$/.exec(block);
    if (env) {
      out.push(renderEnv(kept[Number(env[1])].trim(), inline, prefix));
      continue;
    }
    const section = /^\\(sub)?section\*?\{/.exec(block);
    if (section) {
      // The heading's argument by brace counting: a note may follow it in the
      // same block, and belongs after the heading, on its line.
      let depth = 0;
      let j = section[0].length - 1;
      for (; j < block.length; j++) {
        if (block[j] === '\\') j++;
        else if (block[j] === '{') depth++;
        else if (block[j] === '}' && --depth === 0) break;
      }
      const head = inline(block.slice(section[0].length, j));
      const rest = block.slice(j + 1).trim();
      const tail = rest ? inline(rest) : '';
      // A starred heading is the writer's own title, set as it stands. An
      // unstarred one is, in most volumes, the transcription's title for a
      // piece (« Fourier à Sophie Germain, 29 septembre 1820 ») — not on the
      // paper, so not in the Page: text. It is kept as a comment, for the
      // chapter pages of the main namespace, and listed in index.md to check.
      if (!section[0].includes('*')) {
        headings.push(head);
        out.push(`<!-- titre de la transcription : ${head.replace(/--/g, '–')} -->` + tail);
        continue;
      }
      out.push((section[1] ? `{{c|1=''${arg(head)}''}}` : `{{c|1='''${arg(head)}'''}}`) + tail);
      continue;
    }
    const stray = /\\begin\{([a-z*]+)\}/.exec(block);
    if (stray) {
      throw new Error(`unsupported environment \\begin{${stray[1]}} — extend scripts/wikisource.mjs`);
    }
    out.push(inline(block));
  }
  return out.join('\n\n');
}

function renderEnv(block, inline, prefix) {
  const list = /^\\begin\{(itemize|enumerate)\}([\s\S]*)\\end\{\1\}$/.exec(block);
  if (list) {
    const mark = prefix + (list[1] === 'enumerate' ? '#' : '*');
    return splitItems(list[2])
      .map((raw) => {
        const body = raw.trim();
        const lab = takeBracketed(body);
        const label = lab ? inline(lab.label.replace(/^\{([\s\S]*)\}$/, '$1')) + ' ' : '';
        const rest = lab ? lab.rest : body;
        // A nested list keeps its own lines, one level deeper; the rest of the
        // item is one line, its paragraphs joined by a break.
        const { text, kept } = liftEnvs(rest);
        const parts = text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
        const own = [];
        const nested = [];
        for (const p of parts) {
          const e = /^ENVBLOCK(\d+)$/.exec(p);
          if (e) nested.push(renderEnv(kept[Number(e[1])].trim(), inline, mark));
          else own.push(inline(p));
        }
        const line = `${list[1] === 'enumerate' && lab ? prefix + '*' : mark} ${label}${own.join('<br />')}`;
        return [line, ...nested].join('\n');
      })
      .join('\n');
  }
  const quote = /^\\begin\{quote\}([\s\S]*)\\end\{quote\}$/.exec(block);
  if (quote) {
    const paras = quote[1].split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean).map(inline);
    return `<blockquote>${paras.join('<br /><br />')}</blockquote>`;
  }
  throw new Error(`unexpected environment block: ${block.slice(0, 40)}`);
}

// ---------------------------------------------------------------------------
// A batch, cut into pages.

function convertBatch(tex, file) {
  const body = /\\begin\{document\}([\s\S]*)\\end\{document\}/.exec(tex);
  if (!body) throw new Error(`${file}: no \\begin{document} … \\end{document}`);
  const { text, held } = liftMath(body[1]);
  const stripped = text.replace(/(?<!\\)%.*$/gm, '');
  const pages = [];
  const parts = stripped.split(/\\page\{(\d+)\}/);
  // A heading may open the batch before its first \\page{} — the letter's
  // title, set above the page it starts on. It belongs to that page.
  const before = parts[0].trim();
  for (let k = 1; k < parts.length; k += 2) {
    const view = Number(parts[k]);
    const src = (k === 1 && before ? before + '\n\n' : '') + parts[k + 1];
    const folios = [];
    replaceBraced(src, 'folio', (a) => {
      folios.push(a);
      return '';
    });
    const unknown = new Set();
    const notes = { count: 0 };
    const formulas = [];
    const inline = makeInline(unknown, notes);
    const headings = [];
    let wiki = renderPage(src, inline, headings);
    wiki = wiki.replace(MARKED(), (_, i) => {
      const { raw, display } = held[Number(i)];
      if (display === 'diagram') {
        unknown.add('tikzcd (figure: crop the view on Commons instead)');
        return '<!-- figure : diagramme, à recadrer depuis le fac-similé -->';
      }
      const { tex: m, notes: inner } = mathTeX(raw, held);
      formulas.push(m);
      const refs =
        NOTES === 'none'
          ? ''
          : inner.map((n) => {
              notes.count++;
              return `<ref>${inline(n)}</ref>`;
            }).join('');
      // A display formula is a line of its own, and a blank line would end the
      // paragraph around it; a colon-indented line keeps it in the flow.
      return display
        ? `\n<math display="block">${m}</math>${refs}\n`
        : `<math>${m}</math>${refs}`;
    });
    wiki = wiki.replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    pages.push({ view, wiki, folios, unknown, notes: notes.count, formulas, headings });
  }
  return pages;
}

// ---------------------------------------------------------------------------

/**
 * One request at a time, with a pause, backing off on 429: the endpoint is
 * rate-limited and shared by every wiki. Verdicts are cached in
 * wikisource/.math-cache.json, so a re-run only asks about what changed.
 */
async function checkMath(formulas) {
  const cachePath = resolve(OUT, '.math-cache.json');
  let cache = {};
  try {
    cache = JSON.parse(await readFile(cachePath, 'utf8'));
  } catch {
    // first run
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const refused = new Map();
  let unchecked = 0;
  for (const f of formulas) {
    if (!(f in cache)) {
      for (let attempt = 0, wait = 2000; attempt < 6; attempt++, wait *= 2) {
        const res = await fetch(MATH_CHECK, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'germain-project/wikisource.mjs (https://github.com/Commutator-IO/germain-project)',
          },
          body: new URLSearchParams({ q: f }),
        });
        if (res.ok) {
          cache[f] = null;
          break;
        }
        if (res.status === 400) {
          const j = await res.json().catch(() => ({}));
          cache[f] = String(j.detail?.error?.message || j.detail?.error?.found || JSON.stringify(j.detail ?? j)).slice(0, 200);
          break;
        }
        await sleep(wait);
      }
      await sleep(250);
    }
    if (!(f in cache)) unchecked++;
    else if (cache[f] !== null) refused.set(f, cache[f]);
  }
  await writeFile(cachePath, JSON.stringify(cache), 'utf8');
  if (unchecked) process.stderr.write(`  ⚠ ${unchecked} formulas could not be checked (rate limit); run again\n`);
  return refused;
}

/**
 * A view may be opened more than once — NAF 4073 repeats \\page{N} for each
 * letter that starts on it. The parts are one page on Wikisource, in order.
 */
function mergeViews(pages) {
  const byView = new Map();
  for (const p of pages) {
    const seen = byView.get(p.view);
    if (!seen) byView.set(p.view, p);
    else {
      seen.wiki = [seen.wiki, p.wiki].filter(Boolean).join('\n\n');
      seen.folios.push(...p.folios);
      seen.formulas.push(...p.formulas);
      seen.headings.push(...p.headings);
      seen.notes += p.notes;
      for (const u of p.unknown) seen.unknown.add(u);
    }
  }
  return [...byView.values()].sort((a, b) => a.view - b.view);
}

async function volume(id) {
  const entry = CATALOGUE.get(id);
  if (!entry) throw new Error(`${id}: not in the catalogue`);
  const dir = resolve(SOURCE, id);
  const files = (await readdir(dir)).filter((f) => /^batch-\d+\.fr\.tex$/.test(f)).sort();
  if (!files.length) throw new Error(`${id}: no transcription`);

  let pages = [];
  for (const file of files) pages.push(...convertBatch(await readFile(resolve(dir, file), 'utf8'), file));
  pages = mergeViews(pages);
  // A view whose only content was a leaf description has nothing left to
  // paste: it goes with the blank views, not into an empty file.
  const empty = new Set(pages.filter((p) => !p.wiki).map((p) => p.view));
  pages = pages.filter((p) => p.wiki);

  const target = resolve(OUT, id);
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  for (const p of pages) {
    await writeFile(resolve(target, `vue-${String(p.view).padStart(3, '0')}.wiki`), p.wiki + '\n', 'utf8');
  }

  let refused = new Map();
  if (CHECK_MATH) refused = await checkMath([...new Set(pages.flatMap((p) => p.formulas))]);

  const file = flag('file', `${entry.shelfmark}.pdf`);
  const transcribed = new Set(pages.map((p) => p.view));
  const blank = [];
  for (let v = 1; v <= entry.pages; v++) if (!transcribed.has(v) || empty.has(v)) blank.push(v);

  const lines = [
    `# ${entry.shelfmark} — pages pour Wikisource`,
    '',
    `Dérivé de \`transcripts/${id}/\` par \`scripts/wikisource.mjs\` le ${new Date().toISOString().slice(0, 10)}. Ne pas corriger ici : corriger le \`.tex\` et relancer.`,
    '',
    `- Fac-similé : ${GALLICA}/ark:/12148/${entry.ark} — ${entry.pages} vues.`,
    `- Fichier supposé sur Commons : \`${file}\` ; page Wikisource = vue + ${OFFSET}. **À vérifier sur le fichier réellement téléversé** avant de coller quoi que ce soit (\`--file\`, \`--offset\`).`,
    `- Notes de lecture : ${
      NOTES === 'none'
        ? 'omises (--notes=none)'
        : `en <ref>, à afficher par \`<references/>\` dans le pied de page${NOTES === 'ref' ? ' ; les notes qui décrivent le feuillet (papier, cachets, mains) sont omises, le site les garde (--notes=all pour les inclure)' : ''}`
    }.`,
    '',
    'Pour chaque page : ouvrir la page Page: ci-dessous, coller le contenu du fichier dans le corps, mettre `<references/>` dans le pied de page si la colonne « notes » n\'est pas vide, choisir **Non corrigée**, publier avec un résumé qui nomme la source (« transcription automatique, première passe, non relue — germain.commutator.io, ' + id + ' »).',
    '',
    '| Vue | Page Wikisource | Fichier | Folio | Notes | Formules |',
    '|---:|---|---|---|---:|---:|',
    ...pages.map(
      (p) =>
        `| ${p.view} | Page:${file}/${p.view + OFFSET} | vue-${String(p.view).padStart(3, '0')}.wiki | ${p.folios.join(', ')} | ${p.notes || ''} | ${p.formulas.length || ''} |`,
    ),
    '',
    `Sans texte (niveau « Sans texte ») : ${blank.length ? blank.join(', ') : 'aucune'}.`,
    '',
    `Retour vers le site pour la page Livre: : ${SITE}/`,
  ];
  const titled = pages.filter((p) => p.headings.length);
  if (titled.length) {
    lines.push(
      '',
      '## Titres de la transcription',
      '',
      'Ces titres (\\section sans étoile) ne sont pas reportés dans le texte des pages : ce sont, le plus souvent, les titres que la transcription donne aux pièces, pour les pages de l\'espace principal. **À vérifier sur le fac-similé** : si l\'un d\'eux est de la main de l\'auteur, il faut l\'ajouter à la page.',
      '',
      ...titled.flatMap((p) => p.headings.map((h) => `- vue ${p.view} : ${h}`)),
    );
  }
  if (refused.size) {
    lines.push('', '## Formules refusées par MediaWiki', '');
    for (const p of pages) {
      for (const f of p.formulas) if (refused.has(f)) lines.push(`- vue ${p.view} : \`${f}\` — ${refused.get(f)}`);
    }
  }
  await writeFile(resolve(target, 'index.md'), lines.join('\n') + '\n', 'utf8');

  const unknown = pages.filter((p) => p.unknown.size);
  for (const p of unknown) {
    process.stderr.write(`  ⚠ ${id} vue ${p.view}: left as text: ${[...p.unknown].map((u) => `\\${u}`).join(' ')}\n`);
  }
  const nFormulas = new Set(pages.flatMap((p) => p.formulas)).size;
  process.stdout.write(
    `${id}: ${pages.length} pages → wikisource/${id}/` +
      (CHECK_MATH ? ` (${nFormulas} formulas checked, ${refused.size} refused)` : '') +
      '\n',
  );
  return refused.size + unknown.length;
}

// ---------------------------------------------------------------------------
// The site's Wikisource tab.

/** The preamble's metadata, as render.mjs reads it, for the page's head line. */
function readMeta(tex) {
  const one = (name) => new RegExp(`\\\\${name}\\{([^{}]*)\\}`).exec(tex)?.[1] ?? '';
  const pages = /\\pages\{(\d+)\}\{(\d+)\}/.exec(tex);
  return {
    volume: one('folder'),
    batch: one('batch'),
    title: one('foldertitle'),
    dating: one('dating'),
    shelfmark: one('shelfmark'),
    watermark: one('watermark').replace(/\\\\/g, ' — '),
    first: pages?.[1] ?? '',
    last: pages?.[2] ?? '',
  };
}

/**
 * An approximate rendering of the wikitext this script writes — and of
 * nothing else: <math>, <ref>, comments, the templates of the mapping, bold,
 * italic, lists and paragraphs. It shows a reader what the page will look
 * like before they paste it; the rendering that counts is Wikisource's.
 * Mathematics is handed to the page's KaTeX through render.mjs's delimiters.
 */
function wikiPreview(wiki) {
  const held = [];
  const hold = (html) => `${held.push(html) - 1}`;
  const notes = [];
  let t = wiki.replace(/<math( display="block")?>([\s\S]*?)<\/math>/g, (_, d, m) =>
    hold(d ? `<span class="ws-dmath">\\[${escapeHtml(m)}\\]</span>` : `\\(${escapeHtml(m)}\\)`),
  );
  t = t.replace(/<ref>([\s\S]*?)<\/ref>/g, (_, n) => {
    notes.push(n);
    return hold(`<sup class="ws-ref">[${notes.length}]</sup>`);
  });
  t = t.replace(/<!--\s*([\s\S]*?)\s*-->/g, (_, c) => hold(`<span class="ws-comment">${c}</span>`));

  const inline = (x) => {
    let out = x;
    // Innermost template first, until none is left: {{Rature|1=… {{Illisible}} …}}.
    for (let guard = 0; /\{\{[^{}]*\}\}/.test(out) && guard < 1000; guard++) {
      out = out.replace(/\{\{([^{}]*)\}\}/g, (_, body) => {
        const [name, ...rest] = body.split('|');
        const a = rest.join('|').replace(/^1=/, '');
        switch (name.trim()) {
          case '!':
            return '';
          case 'Rature':
            return `<s class="ws-rature">${a}</s>`;
          case 'Illisible':
            return '<span class="ws-ill">[illisible]</span>';
          case 'c':
            return `<span class="ws-c">${a}</span>`;
          case 'sc':
            return `<span class="ws-sc">${a}</span>`;
          default:
            return `<code>&#123;&#123;${body}&#125;&#125;</code>`;
        }
      });
    }
    return out.replace(/'''(.+?)'''/g, '<b>$1</b>').replace(/''(.+?)''/g, '<i>$1</i>');
  };

  const html = t
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const lines = b.split('\n');
      if (lines.every((l) => /^[*#]/.test(l))) {
        const items = lines.map((l) => {
          const m = /^([*#]+)\s*(.*)$/.exec(l);
          return `<li class="ws-depth-${m[1].length}">${inline(m[2])}</li>`;
        });
        return `<ul class="ws-list">${items.join('')}</ul>`;
      }
      const one = inline(lines.join('\n')).replace(/\n/g, ' ');
      return one.startsWith('<blockquote') ? one : `<p>${one}</p>`;
    })
    .join('\n');
  const noteList = notes.length
    ? `<ol class="ws-notes">${notes.map((n) => `<li>${inline(n)}</li>`).join('')}</ol>`
    : '';
  let out = html + noteList;
  while (/\d+/.test(out)) out = out.replace(/(\d+)/g, (_, i) => held[Number(i)]);
  return out.replace(//g, '|');
}

const COPY_ICON =
  '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 3.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

/**
 * One view: its page marker (which the reading pane watches to turn the
 * facsimile, as in every other view), a bar with the copy button, the preview,
 * and the wikicode itself, hidden until asked for — the button copies it
 * whether it is shown or not.
 */
function viewSection(p, ark) {
  const facs = ark ? `${GALLICA}/ark:/12148/${ark}/f${p.view}.item` : '';
  const bar =
    `<p class="ws-bar"><span class="tr-page" data-page="${p.view}" id="page-${p.view}">${p.view}</span>` +
    `<span class="ws-label">Vue ${p.view}</span>` +
    (p.notes
      ? `<span class="ws-hint">${p.notes} note${p.notes > 1 ? 's' : ''} : <code>&lt;references/&gt;</code> en pied de page</span>`
      : '') +
    (facs ? `<a class="ws-link" href="${facs}" target="_blank" rel="noopener">Gallica ↗</a>` : '') +
    (p.wiki
      ? `<button type="button" class="ws-toggle" aria-pressed="false">Wikicode</button>` +
        `<button type="button" class="ws-copy" data-src="ws-src-${p.view}" title="Copier le wikicode de la vue ${p.view}">${COPY_ICON}<span>Copier</span></button>`
      : '') +
    `</p>`;
  if (!p.wiki) {
    return (
      `<section class="ws-view">${bar}<p class="ws-empty">Rien à verser : la vue ne porte que ` +
      `la description du feuillet, que le site garde dans l'onglet Transcription.</p></section>`
    );
  }
  return (
    `<section class="ws-view">${bar}` +
    `<div class="ws-preview">${wikiPreview(p.wiki)}</div>` +
    `<pre class="ws-src" id="ws-src-${p.view}" hidden>${escapeHtml(p.wiki)}</pre>` +
    `</section>`
  );
}

const WS_STYLE = `
  .ws-intro { font-family: var(--sans); font-size: 12.5px; line-height: 1.55; color: #444;
              border: 1px solid #d9d4c7; border-radius: 8px; background: #faf8f3;
              padding: .7rem .9rem; margin: -.4rem 0 1.6rem; }
  .ws-intro p { margin: .25rem 0; }
  .ws-view { margin: 0 0 1.8rem; }
  .ws-bar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: 0 0 .5rem;
            font-family: var(--sans); font-size: 12px; color: #777;
            border-bottom: 1px solid #e6e1d5; padding-bottom: .3rem; }
  .ws-label { font-weight: 700; color: #333; }
  .ws-hint code { font-size: 11px; }
  .ws-link { margin-left: auto; color: #38539d; text-decoration: none; font-weight: 600; }
  .ws-link:hover { text-decoration: underline; }
  .ws-bar button { font: inherit; font-weight: 600; border: 1px solid #cfc8b8; border-radius: 6px;
                   background: #fff; color: #333; padding: .15rem .55rem; cursor: pointer;
                   display: inline-flex; align-items: center; gap: .3rem; }
  .ws-bar button:hover { border-color: #38539d; color: #38539d; }
  .ws-bar .ws-copy.done { border-color: #2f7d4a; color: #2f7d4a; }
  .ws-src { white-space: pre-wrap; word-break: break-word; font-size: 12px; line-height: 1.5;
            background: #f6f4ee; border: 1px solid #e6e1d5; border-radius: 6px; padding: .6rem .8rem; }
  .ws-preview p { margin: 0 0 .7rem; }
  .ws-dmath { display: block; margin: .4rem 0; }
  .ws-rature { color: #8a8a8a; }
  .ws-ill { color: #b53d1d; font-size: smaller; font-style: italic; }
  .ws-c { display: block; text-align: center; }
  .ws-sc { font-variant: small-caps; }
  .ws-comment { display: block; font-family: var(--sans); font-size: 11.5px; color: #9a8f78; }
  .ws-comment::before { content: "commentaire, invisible sur Wikisource : "; font-style: italic; }
  .ws-ref { font-size: 10px; }
  .ws-notes { font-size: 12.5px; color: #555; border-top: 1px solid #eee; padding-top: .4rem;
              margin: .4rem 0 0; }
  .ws-list { margin: 0 0 .7rem; padding-left: 1.2rem; }
  .ws-depth-2 { margin-left: 1.2rem; }
  .ws-depth-3 { margin-left: 2.4rem; }
  .ws-empty { font-family: var(--sans); font-size: 12.5px; color: #9a8f78; font-style: italic; }
`;

const WS_SCRIPT = `<script>
document.addEventListener('click', function (e) {
  var copy = e.target.closest('.ws-copy');
  if (copy) {
    var text = document.getElementById(copy.dataset.src).textContent;
    var done = function () {
      var label = copy.querySelector('span');
      copy.classList.add('done');
      label.textContent = 'Copié';
      setTimeout(function () { copy.classList.remove('done'); label.textContent = 'Copier'; }, 1600);
    };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      done();
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    return;
  }
  var toggle = e.target.closest('.ws-toggle');
  if (toggle) {
    var view = toggle.closest('.ws-view');
    var src = view.querySelector('.ws-src');
    var showSource = src.hidden;
    src.hidden = !showSource;
    view.querySelector('.ws-preview').hidden = showSource;
    toggle.textContent = showSource ? 'Aperçu' : 'Wikicode';
    toggle.setAttribute('aria-pressed', String(showSource));
  }
});
</script>
`;

/** Every batch of one volume, as the reading pane's Wikisource tab. */
async function siteVolume(id) {
  const entry = CATALOGUE.get(id);
  const dir = resolve(SOURCE, id);
  const files = (await readdir(dir)).filter((f) => /^batch-\d+\.fr\.tex$/.test(f)).sort();
  if (!files.length) return 0;
  const latin = /^(Latin|NAL)\b/.test(entry?.shelfmark ?? '');
  await mkdir(resolve(PUBLIC, id), { recursive: true });
  let n = 0;
  for (const file of files) {
    const tex = await readFile(resolve(dir, file), 'utf8');
    const meta = readMeta(tex);
    const pages = mergeViews(convertBatch(tex, `${id}/${file}`));
    for (const p of pages) {
      if (p.unknown.size) {
        process.stderr.write(
          `  ⚠ ${id} vue ${p.view}: left as text: ${[...p.unknown].map((u) => `\\${u}`).join(' ')}\n`,
        );
      }
    }
    const intro =
      `<div class="ws-intro">` +
      `<p><b>Wikicode pour l'espace Page: de Wikisource</b>, une section par vue de Gallica. ` +
      `Cette transcription est dans le domaine public (CC0) : reprenez-la librement, sans condition.</p>` +
      `<p>Pour corriger une page sur Wikisource : copier le wikicode de la vue, le coller dans le corps ` +
      `de la page, ajouter <code>&lt;references/&gt;</code> en pied de page si la vue a des notes, et ` +
      `la verser au niveau « Non corrigée » : c'est une première lecture automatique, que personne n'a relue.</p>` +
      (latin
        ? `<p>Volume en latin : il relève de la.wikisource (Vicifons), dont les modèles n'ont pas été vérifiés.</p>`
        : '') +
      `<p>L'aperçu est approché ; le rendu qui fait foi est celui de Wikisource. Les notes qui ne font ` +
      `que décrire le feuillet restent dans l'onglet Transcription.</p>` +
      `</div>`;
    const html = intro + '\n' + pages.map((p) => viewSection(p, entry?.ark)).join('\n');
    const page = readingPage({ meta, lang: 'fr', name: 'Wikisource', html, extraStyle: WS_STYLE });
    await writeFile(
      resolve(PUBLIC, id, file.replace(/\.tex$/, '.wiki.html')),
      page.replace('</body>', `${WS_SCRIPT}</body>`),
      'utf8',
    );
    n++;
  }
  return n;
}

async function main() {
  if (SITE_MODE) {
    const all = (await readdir(SOURCE, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    let n = 0;
    for (const id of VOLUMES.length ? VOLUMES : all) n += await siteVolume(id);
    process.stdout.write(`${n} Wikisource views → public/transcripts/\n`);
    return;
  }
  if (!VOLUMES.length) throw new Error('name a volume: npm run wikisource -- naf-5166');
  let problems = 0;
  for (const id of VOLUMES) problems += await volume(id);
  if (problems) process.exitCode = 1;
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
