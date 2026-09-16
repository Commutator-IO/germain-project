#!/usr/bin/env node
/**
 * Renders the reading view from the TEI export instead of from the `.tex`.
 *
 *   npm run tei-view               every exported transcription
 *   npm run tei-view -- fr-9115    one volume
 *
 * Reads `public/transcripts/<cote>/batch-NN.fr.xml` (written by scripts/tei.mjs)
 * and writes `batch-NN.fr.tei.html` beside it. The file is what the TEI button
 * of the « Source & print » row opens, and what the fragment
 * `#<cote>/<batch>/tei` shows in the reading pane; the Transcription tab still
 * renders from the `.tex`.
 *
 * **It must look identical** to the view render.mjs makes from the `.tex`, so
 * that switching is a change of source and not of design: the page shell, the
 * stylesheet and the KaTeX script are render.mjs's own (`readingPage`), and
 * every TEI element maps to the class the `.tex` view already uses.
 * `scripts/check-tei.mjs` checks the claim page by page.
 *
 * **It is strict, like render.mjs.** Only the elements tei.mjs emits are
 * understood; any other element, attribute value or entity throws. A view that
 * silently dropped an element it did not know would present an incomplete page
 * as a complete one. One element tei.mjs *can* emit is deliberately left out:
 * `<figure type="diagram">`, the tikz-cd wrapper. No transcription in this
 * repository contains a commutative diagram — the macro is in the preamble and
 * used nowhere — so rather than carry an untested second copy of render.mjs's
 * diagram renderer, the first diagram to appear will stop this script, and CI
 * with it, which is the moment to import `renderDiagram` from render.mjs.
 *
 * The apparatus is additionally tagged with `tei-*` classes, and two root
 * classes on `<html>` switch it: `.reading` hides deletions and prints supplied
 * and unclear text plain; `.no-notes` hides the transcriber's notes. Nothing
 * sets them yet except `?view=reading,no-notes` on the file's own URL.
 *
 * The one thing this view carries that the `.tex` view cannot: `<pb>` keeps its
 * `@facs`, the very Gallica view the page break points at, on the page marker
 * as `data-facs`. Invisible, so the drawing is unchanged, and the pane's scroll
 * watcher still turns the facsimile through `data-page`, exactly as it does for
 * the `.tex` view.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EDITION_LABELS, escapeHtml, readingPage } from './render.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'public', 'transcripts');

const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// A strict XML reader, for the XML tei.mjs writes and nothing more general.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(s, where) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);|&/g, (m, e) => {
    if (!e) throw new Error(`bare & in ${where}`);
    if (e[0] === '#') {
      return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    }
    if (!(e in ENTITIES)) throw new Error(`unknown entity &${e}; in ${where}`);
    return ENTITIES[e];
  });
}

/** Parses into `{ name, attrs, children }` elements and plain strings. */
export function parseXml(xml) {
  let i = 0;
  const root = { name: '#document', attrs: {}, children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];

  while (i < xml.length) {
    const lt = xml.indexOf('<', i);
    if (lt === -1) {
      top().children.push(decode(xml.slice(i), 'text'));
      break;
    }
    if (lt > i) top().children.push(decode(xml.slice(i, lt), 'text'));

    if (xml.startsWith('<?', lt)) {
      i = xml.indexOf('?>', lt) + 2;
      continue;
    }
    if (xml.startsWith('<!--', lt)) {
      i = xml.indexOf('-->', lt) + 3;
      continue;
    }
    if (xml.startsWith('<!', lt)) throw new Error('DOCTYPE or CDATA: not emitted by tei.mjs');

    const gt = xml.indexOf('>', lt);
    if (gt === -1) throw new Error('unterminated tag');
    const tag = xml.slice(lt + 1, gt);
    i = gt + 1;

    if (tag[0] === '/') {
      const name = tag.slice(1).trim();
      const open = stack.pop();
      if (!open || open.name !== name) {
        throw new Error(`mismatched </${name}> (open: <${open?.name}>)`);
      }
      continue;
    }

    const selfClosing = tag.endsWith('/');
    const m = /^([A-Za-z][\w:.-]*)([\s\S]*?)\/?$/.exec(tag);
    if (!m) throw new Error(`malformed tag <${tag}>`);
    const attrs = {};
    const attrRe = /\s+([\w:.-]+)="([^"]*)"/g;
    const rest = m[2];
    let a;
    let consumed = '';
    while ((a = attrRe.exec(rest))) {
      attrs[a[1]] = decode(a[2], `attribute ${a[1]}`);
      consumed += a[0];
    }
    if (consumed.replace(/\s+/g, '') !== rest.replace(/\s+/g, '')) {
      throw new Error(`malformed attributes in <${tag}>`);
    }
    const el = { name: m[1], attrs, children: [] };
    top().children.push(el);
    if (!selfClosing) stack.push(el);
  }
  if (stack.length !== 1) throw new Error(`unclosed <${top().name}>`);
  return root;
}

const isEl = (n) => typeof n !== 'string';
const textOf = (n) => (typeof n === 'string' ? n : n.children.map(textOf).join(''));
const blank = (n) => typeof n === 'string' && !n.trim();

function unexpected(el, where) {
  const attrs = Object.entries(el.attrs)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  return new Error(
    `unsupported <${el.name}${attrs}> in ${where} — extend scripts/tei-view.mjs ` +
      'together with scripts/tei.mjs',
  );
}

/** An attribute tei.mjs always writes with one value. Anything else throws. */
function fixed(el, name, value, where) {
  if (el.attrs[name] !== value) throw unexpected(el, where);
}

/** No attribute beyond the listed ones, so a new one cannot pass unnoticed. */
function onlyAttrs(el, names, where) {
  for (const k of Object.keys(el.attrs)) {
    if (!names.includes(k)) throw unexpected(el, where);
  }
}

// ---------------------------------------------------------------------------
// The header: what the `.tex` view prints in its head line.

/** Every element the header may contain, and nothing else. */
const HEADER_ELEMENTS = new Set([
  'teiHeader', 'fileDesc', 'titleStmt', 'title', 'author', 'respStmt', 'resp', 'date',
  'name', 'orgName', 'editionStmt', 'edition', 'publicationStmt', 'publisher', 'pubPlace',
  'availability', 'licence', 'p', 'ref', 'sourceDesc', 'msDesc', 'msIdentifier', 'country',
  'settlement', 'repository', 'collection', 'idno', 'head', 'msContents', 'summary',
  'history', 'origin', 'origDate', 'note', 'additional', 'surrogates', 'bibl', 'hi',
  'encodingDesc', 'projectDesc', 'editorialDecl', 'appInfo', 'application', 'label',
  'profileDesc', 'langUsage', 'language', 'revisionDesc', 'change',
]);

function find(el, name) {
  for (const c of el.children) {
    if (!isEl(c)) continue;
    if (c.name === name) return c;
    const inner = find(c, name);
    if (inner) return inner;
  }
  return null;
}

/**
 * The head line's fields, read back out of the header tei.mjs wrote.
 *
 * `title` is the holder's title of the volume, which the `.tex` view prints
 * after the edition's name. It is `\foldertitle{}`, and tei.mjs carries it as
 * the `<head>` of the `<msDesc>`; reading it back from there is what keeps the
 * two head lines word for word the same (#6).
 */
function readHeader(header, batchDiv) {
  (function walk(el) {
    if (!HEADER_ELEMENTS.has(el.name)) throw unexpected(el, 'teiHeader');
    el.children.filter(isEl).forEach(walk);
  })(header);

  const title = textOf(find(header, 'title') ?? { children: [] });
  const t = /, vues (\d*)–(\d*) — transcription$/.exec(title);
  if (!t) throw new Error(`title not in the form tei.mjs writes: « ${title} »`);
  const msDesc = find(header, 'msDesc');
  const msHead = msDesc?.children.find((c) => isEl(c) && c.name === 'head');
  const idno = find(header, 'idno');
  const dating = find(header, 'origDate');
  const edition = find(header, 'edition');
  return {
    // `<idno type="shelfmark">` holds `\shelfmark{}`, which is what the head
    // line prints; `volume` is its fallback, the folder slug, which tei.mjs
    // writes into the same `<idno>` when a file gives no shelfmark.
    shelfmark: idno ? textOf(idno) : '',
    volume: '',
    batch: batchDiv.attrs.n ?? '',
    title: msHead ? textOf(msHead) : '',
    dating: dating ? textOf(dating) : '',
    watermark: edition ? textOf(edition) : '',
    first: t[1],
    last: t[2],
  };
}

// ---------------------------------------------------------------------------
// The body.

/**
 * The page marker render.mjs writes, plus the facsimile the TEI knows about.
 * `data-page` is what the reading pane watches as it scrolls, so the two views
 * turn the facsimile the same way; `data-facs` is the Gallica view `@facs`
 * points at, carried rather than dropped, and painted by nothing.
 */
function pageSpan(n, facs) {
  return (
    `<span class="tr-page" data-page="${n}"` +
    `${facs ? ` data-facs="${escapeAttr(facs)}"` : ''} id="page-${n}">${n}</span>`
  );
}

function renderInline(nodes, where) {
  return nodes.map((n) => inlineNode(n, where)).join('');
}

function inlineNode(n, where) {
  if (typeof n === 'string') return escapeHtml(n);
  const inner = () => renderInline(n.children, `<${n.name}>`);
  switch (n.name) {
    case 'formula': {
      const tex = escapeHtml(textOf(n));
      onlyAttrs(n, ['notation', 'rend'], where);
      fixed(n, 'notation', 'TeX', where);
      if (n.attrs.rend === 'display') return `<span class="ltx_Math ltx_display">\\[${tex}\\]</span>`;
      if (n.attrs.rend !== undefined) throw unexpected(n, where);
      return `<span class="ltx_Math">\\(${tex}\\)</span>`;
    }
    case 'gap':
      onlyAttrs(n, ['reason'], where);
      fixed(n, 'reason', 'illegible', where);
      if (n.children.length) throw unexpected(n, where);
      return '<span class="tr-ill tei-gap" title="illegible">[…]</span>';
    case 'unclear':
      onlyAttrs(n, [], where);
      return `<span class="tr-uncertain tei-unclear" title="uncertain reading">${inner()}</span>`;
    case 'supplied':
      onlyAttrs(n, ['resp'], where);
      fixed(n, 'resp', '#pass', where);
      // The brackets are text, as in the `.tex` view, so the two read the same;
      // wrapped so `.reading` can drop them.
      return (
        '<span class="tr-add tei-supplied" title="editorial addition">' +
        `<span class="tei-br">[</span>${inner()}<span class="tei-br">]</span></span>`
      );
    case 'del':
      onlyAttrs(n, [], where);
      return `<span class="tr-struck tei-del" title="struck out by the author">${inner()}</span>`;
    case 'note':
      if (n.attrs.type === 'editorial') {
        onlyAttrs(n, ['type', 'resp'], where);
        fixed(n, 'resp', '#pass', where);
        return `<span class="tr-note tei-note-editorial" title="transcriber's note">${inner()}</span>`;
      }
      if (n.attrs.type === 'authorial' && n.attrs.place === 'margin') {
        onlyAttrs(n, ['type', 'place'], where);
        return `<span class="tr-marginal tei-note-margin" title="marginal note">${inner()}</span>`;
      }
      throw unexpected(n, where);
    case 'milestone': {
      // `\folio{}`: the BnF's pencilled foliation, where a pass could read it.
      // The TEI carries it as a milestone rather than a second `<pb>` — the
      // view is the page break the facsimile knows, the folio is a number
      // written on the leaf — and the view prints it exactly as render.mjs
      // prints `\folio{}`, « f. 348r » in the margin colour.
      onlyAttrs(n, ['unit', 'n'], where);
      fixed(n, 'unit', 'folio', where);
      if (n.attrs.n === undefined || n.children.length) throw unexpected(n, where);
      return (
        '<span class="tr-folio tei-folio" title="folio, as pencilled by the BnF">' +
        `f. ${escapeHtml(n.attrs.n)}</span>`
      );
    }
    case 'seg':
      onlyAttrs(n, ['type'], where);
      fixed(n, 'type', 'keywords', where);
      return `<span class="tr-keywords"><span class="tr-keywords-k">Keywords</span> — ${inner()}</span>`;
    case 'hi':
      onlyAttrs(n, ['rend'], where);
      switch (n.attrs.rend) {
        case 'italic': return `<em class="ltx_emph">${inner()}</em>`;
        case 'bold': return `<strong class="ltx_text ltx_font_bold">${inner()}</strong>`;
        case 'monospace': return `<code class="ltx_text ltx_font_typewriter">${inner()}</code>`;
        case 'sup': return `<sup>${inner()}</sup>`;
        case 'underline': return `<u class="tei-underline">${inner()}</u>`;
        default: throw unexpected(n, where);
      }
    case 'lb':
      onlyAttrs(n, [], where);
      if (n.children.length) throw unexpected(n, where);
      return '<br>';
    case 'figure':
      throw new Error(
        `<figure type="${n.attrs.type ?? ''}"> in ${where}: a tikz-cd diagram. No ` +
          'transcription here had one when scripts/tei-view.mjs was written, so the ' +
          "diagram renderer was not ported. Export `renderDiagram` from " +
          'scripts/render.mjs and render <formula notation="tikz-cd"> with it.',
      );
    default:
      throw unexpected(n, where);
  }
}

/**
 * A run of block-level children.
 *
 * A `<pb>` is held and printed inside the next block, where render.mjs prints
 * the `\page{}` prefix — inside a paragraph, a heading or a quotation, before a
 * list. tei.mjs glues a `<pb>` to the block it opens and leaves a page break
 * that had nothing under it standing alone between two newlines, which is
 * render.mjs's own empty paragraph carrying the number; that adjacency is the
 * rule read here, and check-tei fails the moment the serialisation changes.
 */
function renderBlocks(children, where, sub = false, state = { pending: '' }, top = true) {
  const out = [];
  const take = () => {
    const p = state.pending;
    state.pending = '';
    return p;
  };

  for (let k = 0; k < children.length; k++) {
    const n = children[k];
    if (blank(n)) continue;
    if (typeof n === 'string') {
      throw new Error(`stray text « ${n.trim().slice(0, 40)} » in ${where}`);
    }
    switch (n.name) {
      case 'pb': {
        onlyAttrs(n, ['n', 'facs'], where);
        if (!/^\d+$/.test(n.attrs.n ?? '')) throw unexpected(n, where);
        const marker = pageSpan(n.attrs.n, n.attrs.facs);
        if (state.pending) out.push(`<p class="ltx_p">${take()}</p>`);
        // Glued to the block it opens, or standing on its own.
        if (isEl(children[k + 1])) state.pending = marker;
        else out.push(`<p class="ltx_p">${marker}</p>`);
        break;
      }
      case 'div': {
        const type = n.attrs.type;
        onlyAttrs(n, ['type', 'n'], where);
        if (type === 'summary') {
          if (state.pending) out.push(`<p class="ltx_p">${take()}</p>`);
          const inner = n.children
            .filter((c) => !blank(c))
            .map((c) => {
              if (!isEl(c) || c.name !== 'p') throw unexpected(isEl(c) ? c : { name: '#text', attrs: {} }, '<div type="summary">');
              return `<p class="ltx_p">${renderInline(c.children, '<p>')}</p>`;
            });
          out.push(`<div class="tr-resume">${inner.join('\n')}</div>`);
        } else if (type === 'section' || type === 'subsection' || type === undefined) {
          // A marker held before the division belongs to its first block.
          out.push(
            ...renderBlocks(n.children, `<div type="${type}">`, type === 'subsection', state, false),
          );
        } else {
          throw unexpected(n, where);
        }
        break;
      }
      case 'head': {
        onlyAttrs(n, [], where);
        const tag = sub ? 'h3' : 'h2';
        const cls = sub ? 'ltx_title_subsection' : 'ltx_title_section';
        out.push(`<${tag} class="ltx_title ${cls}">${take()}${renderInline(n.children, '<head>')}</${tag}>`);
        break;
      }
      case 'p':
        onlyAttrs(n, [], where);
        out.push(`<p class="ltx_p">${take()}${renderInline(n.children, '<p>')}</p>`);
        break;
      case 'quote':
        onlyAttrs(n, [], where);
        out.push(`<blockquote class="ltx_quote">${take()}${renderItemBody(n.children, '<quote>')}</blockquote>`);
        break;
      case 'list':
        out.push(take() + renderList(n, where));
        break;
      default:
        throw unexpected(n, where);
    }
  }
  if (top && state.pending) out.push(`<p class="ltx_p">${take()}</p>`);
  return out;
}

/** An item's or a quotation's body: mixed inline content, or blocks. */
function renderItemBody(children, where) {
  const blocky = children.some((c) => isEl(c) && ['p', 'list', 'pb', 'div', 'quote'].includes(c.name));
  return blocky ? renderBlocks(children, where).join('\n') : renderInline(children, where);
}

function renderList(list, where) {
  onlyAttrs(list, ['rend'], where);
  const rend = list.attrs.rend;
  if (rend !== 'itemize' && rend !== 'enumerate') throw unexpected(list, where);
  const tag = rend === 'itemize' ? 'ul' : 'ol';
  const items = [];
  let label = null;
  let tagged = false;
  for (const c of list.children) {
    if (blank(c)) continue;
    if (!isEl(c)) throw new Error('stray text in <list>');
    if (c.name === 'label') {
      onlyAttrs(c, [], '<list>');
      label = renderInline(c.children, '<label>');
    } else if (c.name === 'item') {
      onlyAttrs(c, [], '<list>');
      const body = renderItemBody(c.children, '<item>');
      if (label === null) {
        items.push(`<li class="ltx_item">${body}</li>`);
      } else {
        tagged = true;
        items.push(`<li class="ltx_item ltx_item_tagged"><span class="ltx_tag">${label}</span>${body}</li>`);
        label = null;
      }
    } else {
      throw unexpected(c, '<list>');
    }
  }
  if (label !== null) throw new Error('<label> with no <item> after it');
  const cls = tagged ? 'ltx_itemize ltx_itemize_tagged' : 'ltx_itemize';
  return `<${tag} class="${cls}">${items.join('\n')}</${tag}>`;
}

// ---------------------------------------------------------------------------

/** The apparatus switches. Empty unless a root class is set. */
const TEI_STYLE = `  /* TEI view: the apparatus, switchable from the root. */
  .reading .tei-del { display: none; }
  .reading .tei-br { display: none; }
  .reading .tei-supplied { color: inherit; }
  .reading .tei-unclear { border-bottom: 0; }
  .no-notes .tei-note-editorial { display: none; }
  .tei-underline { text-decoration: underline; }
  /* The file this view is rendered from, one click away to open or keep. */
  .tei-source { margin: -.8rem 0 1.4rem; font-family: var(--sans); font-size: 12px;
             color: var(--ink3); }
  .tei-source a { color: #38539d; text-decoration: none; font-weight: 600; }
  .tei-source a:hover { text-decoration: underline; }
`;

/** Testing hook only: `?view=reading,no-notes` sets the root classes. */
const TEI_SCRIPT = `<script>
(function () {
  var v = new URLSearchParams(location.search).get('view');
  if (!v) return;
  v.split(',').forEach(function (c) {
    if (c === 'reading' || c === 'no-notes') document.documentElement.classList.add(c);
  });
})();
</script>
`;

export function teiToHtml(xml, file) {
  const doc = parseXml(xml);
  const tei = doc.children.find(isEl);
  if (!tei || tei.name !== 'TEI') throw new Error('root element is not <TEI>');
  const kids = tei.children.filter((c) => !blank(c));
  const [header, text] = kids;
  if (kids.length !== 2 || header.name !== 'teiHeader' || text.name !== 'text') {
    throw new Error('<TEI> must hold exactly <teiHeader> and <text>');
  }
  const body = text.children.filter((c) => !blank(c));
  if (body.length !== 1 || body[0].name !== 'body') throw new Error('<text> must hold one <body>');
  const batchDivs = body[0].children.filter((c) => !blank(c));
  if (batchDivs.length !== 1 || batchDivs[0].name !== 'div' || batchDivs[0].attrs.type !== 'batch') {
    throw new Error('<body> must hold one <div type="batch">');
  }
  const meta = readHeader(header, batchDivs[0]);
  const html = renderBlocks(batchDivs[0].children, '<div type="batch">').join('\n');
  // The language of the page is the document's own `@xml:lang`, which tei.mjs
  // writes from the repository's single French frame even where the leaves are
  // Latin — the same value render.mjs puts there. The volumes are multilingual;
  // the apparatus, the résumé and the head line are not.
  const { lang, name } = EDITION_LABELS.fr;
  // Where a researcher gets the XML itself: opened in the browser, or saved.
  // Outside the head line, so the head stays the `.tex` view's word for word.
  const source = file
    ? `\n<p class="tei-source">TEI P5 source — <a href="./${escapeHtml(file)}" target="_blank" rel="noopener">open the XML</a>` +
      ` · <a href="./${escapeHtml(file)}" download>download ${escapeHtml(file)}</a></p>`
    : '';
  const page = readingPage({ meta, lang, name, html, extraStyle: TEI_STYLE });
  const headEnd = page.indexOf('</p>', page.indexOf('<p class="tr-head">')) + '</p>'.length;
  return (page.slice(0, headEnd) + source + page.slice(headEnd)).replace(
    '</body>',
    `${TEI_SCRIPT}</body>`,
  );
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  let folders = (await readdir(OUT, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  if (only.length) folders = folders.filter((f) => only.includes(f));

  let n = 0;
  let failed = 0;
  for (const folder of folders) {
    const files = (await readdir(resolve(OUT, folder))).filter((f) => /^batch-\d+\.fr\.xml$/.test(f));
    for (const file of files) {
      try {
        const xml = await readFile(resolve(OUT, folder, file), 'utf8');
        await writeFile(
          resolve(OUT, folder, basename(file, '.xml') + '.tei.html'),
          teiToHtml(xml, file),
          'utf8',
        );
        n += 1;
      } catch (e) {
        failed += 1;
        process.stderr.write(`  ⚠ ${folder}/${file}: ${e.message}\n`);
      }
    }
  }
  process.stdout.write(
    `${n} TEI reading views → public/transcripts/${failed ? ` (${failed} failed)` : ''}\n`,
  );
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
