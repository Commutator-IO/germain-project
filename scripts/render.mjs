#!/usr/bin/env node
/**
 * Turns the transcripts' LaTeX into the reading view the left pane shows.
 *
 *   npm run render                 every transcript
 *   npm run render -- 19           one volume
 *
 * The `.tex` under `transcripts/` is the source of record: it is what gets
 * cited, corrected, compiled and folded into a larger document. This script
 * derives an HTML reading view from it, and never the other way round. Two
 * files that could each be edited would diverge within a week, and nothing
 * would say which one was the transcription.
 *
 * The rendering deliberately covers a **restricted subset** of LaTeX, the one
 * the transcription skill is instructed to stay inside. That is a feature: a
 * converter that accepted everything would silently mangle what it did not
 * understand, and a transcription that renders wrongly without saying so is
 * worse than one that fails loudly. Anything outside the subset raises here.
 *
 * Mathematics is not converted at all. Delimiters are passed through untouched
 * and KaTeX typesets them in the browser, so what appears on screen comes from
 * the same source the PDF is compiled from — there is no second, divergent
 * notion of what the formula says.
 */

import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'transcripts');
const OUT = resolve(ROOT, 'public', 'transcripts');

const EDITION_LABELS = {
  fr: { lang: 'fr', name: 'Transcription' },
  modern: { lang: 'fr', name: 'Lecture modernisée' },
};

// ---------------------------------------------------------------------------
// The supported subset. Anything else is an error, on purpose.

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * For attribute values, which additionally must not contain the quote that
 * delimits them.
 *
 * A diagram's arrows travel as JSON in `data-arrows`, and JSON is made of
 * quotes: escaping only `&<>` let the first `"` close the attribute, and the
 * rest of the diagram became stray markup.
 */
const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

/**
 * The legal notice, as a tile meant to be repeated down the page.
 *
 * Not pinned to the viewport, which cannot work here: the site frames this
 * document in an iframe that never scrolls — it is grown to the full height
 * of its content and the *page* does the scrolling — so inside these pages
 * the viewport is the whole document, and a `position: fixed` mark plants
 * itself once at the middle of a hundred thousand pixels and never moves. A
 * repeated tile is on every screenful by construction, and behaves the same
 * whether the file is read in the pane or opened on its own.
 *
 * `\\` has already become the line separator ` — ` by the time this is
 * called; each line becomes its own `<text>`, so the notice keeps the shape
 * the PDF gives it.
 */
function watermarkTile(text) {
  const lines = text.split(' — ');
  const w = 560;
  const h = 360;
  const cx = w / 2;
  const cy = h / 2;
  const step = 30;
  const top = cy - ((lines.length - 1) * step) / 2;
  const rows = lines
    .map((l, i) => `<text x="${cx}" y="${top + i * step}">${escapeHtml(l)}</text>`)
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<g transform="rotate(-30 ${cx} ${cy})" text-anchor="middle" ` +
    `font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" ` +
    `fill="#5a5040" fill-opacity="0.055">${rows}</g></svg>`;
  // The URI is carried in a double-quoted style attribute and wrapped in
  // url('…'), so the three characters that would close either — the
  // apostrophe of « l'œuvre » among them — have to go too. encodeURIComponent
  // leaves all three alone.
  const uri = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `url('data:image/svg+xml,${uri}')`;
}

/**
 * The marker left where a formula was lifted out, and the pattern that finds
 * it again.
 *
 * A private-use codepoint delimits it, for two properties. It cannot occur in
 * a transcription — that range is reserved for private agreement and nothing
 * in this pipeline agrees to anything else — so no pass in between (escaping,
 * macro expansion, paragraph splitting) has any reason to touch it. And if one
 * ever did escape into a reading view, it would show on the page as a missing
 * glyph rather than hide there.
 *
 * That second property is the lesson of the delimiter it replaced. The marker
 * was once wrapped in NUL and the pattern below matched only the `MATHn`
 * between the delimiters, so every formula in every reading view came back
 * carrying a pair of stray NULs — nine hundred and seventy in volume 135
 * alone, invisible on screen, and passed on to anything that read the text.
 * A delimiter one can see is a delimiter one notices leaking.
 */
const marker = (i) => `\ue000MATH${i}\ue000`;
const MARKED = () => /\ue000MATH(\d+)\ue000/g;

/**
 * Math is lifted out before anything else and put back at the very end.
 *
 * Everything in between — escaping, macro expansion, paragraph splitting —
 * would corrupt a formula: `<` is a relation, `\\` is a line break inside an
 * `align`, and a blank line inside a display would start a new paragraph.
 * Lifting it out first is the only way the two concerns stay separate.
 */
function liftMath(tex) {
  const held = [];
  const keep = (raw, display) => {
    held.push({ raw, display });
    return marker(held.length - 1);
  };
  const out = tex
    // tikz-cd first: a commutative diagram contains &, \\ and $-free math that
    // every later pass would mangle.
    .replace(/\\begin\{tikzcd\}[\s\S]*?\\end\{tikzcd\}/g, (m) => keep(m, 'diagram'))
    .replace(/\\begin\{(equation\*?|align\*?|gather\*?|cases|matrix|pmatrix|bmatrix|array)\}[\s\S]*?\\end\{\1\}/g,
      (m) => keep(m, true))
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => keep(m, true))
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => keep(m, true))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => keep(m, false))
    .replace(/(?<!\\)\$((?:[^$\\]|\\.)+)\$/g, (_, m) => keep(m, false));
  return { text: out, held };
}

/**
 * Footnotes, lifted whole before the text is cut into blocks.
 *
 * They are the modernised reading's entire apparatus: that edition drops the
 * brackets and underlines, so everything the transcription said in the margin
 * — an uncertain reading, a notation the author used differently, a gap in
 * the manuscript — has to be said in a footnote instead. Losing one to a
 * paragraph split would silently turn an interpretation into an assertion.
 */
function liftFootnotes(text) {
  const notes = [];
  let out = '';
  let i = 0;
  const open = '\\footnote{';
  while (i < text.length) {
    const at = text.indexOf(open, i);
    if (at === -1) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, at);
    let depth = 0;
    let j = at + open.length - 1;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}' && --depth === 0) break;
    }
    notes.push(text.slice(at + open.length, j));
    out += ` FOOTNOTE${notes.length - 1} `;
    i = j + 1;
  }
  return { text: out, notes };
}

function dropMathBack(html, held) {
  /**
   * A display can hold an environment that was lifted before it.
   *
   * `\[ \varphi(e_i,e_j) = \begin{cases}…\end{cases} \]` is lifted twice: the
   * `cases` first, by the environment rule, and then the display — whose own
   * raw text now contains the marker left in the environment's place. String
   * replacement does not re-scan what it has just inserted, so that inner
   * marker travelled all the way to the page and was set as the word MATH2 in
   * the middle of the formula.
   *
   * Expanding markers inside a raw body, before it is escaped, puts the
   * environment back where it was written and hands KaTeX the display whole.
   * Nesting always points backwards — an inner block is lifted, and so
   * numbered, before the outer one that contains it — so the recursion ends.
   */
  const expand = (raw) => raw.replace(MARKED(), (_, i) => expand(held[Number(i)].raw));

  // A fresh pattern per call: the expansion above is recursive, and a shared
  // global regex carries its lastIndex into the nested replace.
  return html.replace(MARKED(), (_, i) => {
    const { raw, display } = held[Number(i)];
    if (display === 'diagram') return renderDiagram(raw);
    // KaTeX's auto-render walks text nodes looking for delimiters, so the
    // delimiters go back in rather than being replaced by markup.
    const body = escapeHtml(expand(raw));
    return display
      ? `<span class="ltx_Math ltx_display">\\[${body}\\]</span>`
      : `<span class="ltx_Math">\\(${body}\\)</span>`;
  });
}

// ---------------------------------------------------------------------------
// Commutative diagrams.

/**
 * `tikz-cd` into a CSS grid of KaTeX nodes, with arrows drawn at read time.
 *
 * These diagrams are not decoration in this fonds — they are the language
 * a geometer's argument is written in, and a page of them shown as
 * LaTeX source is a page the reader has to compile in their head. But KaTeX
 * cannot typeset tikz-cd, and the alternatives are both bad: shipping a TeX
 * engine to the browser costs megabytes, and pre-rendering to images loses the
 * selectable, searchable mathematics that is the whole point of transcribing.
 *
 * So the work is split where it naturally divides. The **nodes** are ordinary
 * mathematics, and KaTeX sets them. The **arrows** need to know where the
 * nodes ended up, which is only knowable after layout — so they are drawn in
 * SVG at read time, once, from the measured cell positions. Nothing is
 * rasterised and every symbol stays text.
 *
 * The parser covers the subset the skill permits, and no more: directions from
 * `u`/`d`/`l`/`r` (repeatable, as in `rr`), an optional quoted label with `'`
 * for the far side, and the `hook`, `hook'` and `Rightarrow` styles. Anything
 * outside that raises rather than being silently dropped — a diagram rendered
 * with an arrow missing asserts a commutation that was never written.
 */

/** Splits on a delimiter that is not inside braces or quotes. */
function splitTop(s, delim) {
  const out = [];
  let depth = 0;
  let quoted = false;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') {
      cur += c + (s[i + 1] ?? '');
      i++;
      continue;
    }
    if (c === '"') quoted = !quoted;
    if (!quoted) {
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') depth--;
      else if (c === delim && depth === 0) {
        out.push(cur);
        cur = '';
        continue;
      }
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

/** `[d, Rightarrow, "\widetilde{f}"]` → {dr, dc, label, flip, style}. */
function parseArrow(spec) {
  const arrow = { dr: 0, dc: 0, label: '', flip: false, style: 'to' };
  let seenDirection = false;

  for (const rawPart of splitTop(spec, ',')) {
    const part = rawPart.trim();
    if (!part) continue;

    const quoted = /^"((?:[^"\\]|\\.)*)"\s*(?:(')|(description))?$/.exec(part);
    if (quoted) {
      arrow.label = quoted[1];
      // In tikz-cd a trailing apostrophe puts the label on the other side of
      // the arrow. It is not decoration: on a dense diagram it is what keeps
      // two labels from landing on top of each other. `description` instead
      // sets the label on the shaft itself — the manuscript's variance marks
      // sit on the wheel's radii, not beside them.
      arrow.flip = Boolean(quoted[2]);
      arrow.desc = Boolean(quoted[3]);
      continue;
    }
    if (part === 'hook' || part === "hook'") {
      arrow.style = 'hook';
      arrow.hookFlip = part.endsWith("'");
      continue;
    }
    if (part === 'Rightarrow') {
      arrow.style = 'double';
      continue;
    }
    // A headless line is not an arrow at all — a figure's wheels carry
    // plain radii as scaffolding, and drawing a head on one would assert a
    // functor nobody wrote.
    if (part === 'no head') {
      arrow.style = 'none';
      continue;
    }
    // A broken shaft is the manuscript's way of saying "not yet constructed":
    // in volume 151 the two arrows that close the van Kampen square are drawn
    // as dotted lines, because they are precisely what the theorem is to
    // supply. Drawn solid, the diagram would assert what the page is asking.
    if (part === 'dashed' || part === 'dotted') {
      arrow.dashed = true;
      continue;
    }
    // Positive bend curves to the left of the direction of travel, as in
    // tikz. Rim arcs drawn with matched bends are what lets a wheel of
    // functor categories read as the circle the manuscript draws.
    const bend = /^bend (left|right)(?:\s*=\s*(\d+))?$/.exec(part);
    if (bend) {
      arrow.bend = (bend[1] === 'left' ? 1 : -1) * Number(bend[2] ?? 30);
      continue;
    }
    if (!seenDirection && /^[udlr]+$/.test(part)) {
      for (const c of part) {
        if (c === 'u') arrow.dr -= 1;
        else if (c === 'd') arrow.dr += 1;
        else if (c === 'l') arrow.dc -= 1;
        else arrow.dc += 1;
      }
      seenDirection = true;
      continue;
    }
    throw new Error(
      `unsupported tikz-cd arrow option "${part}" — extend scripts/render.mjs, ` +
        'or keep the diagram inside the documented subset',
    );
  }

  if (!seenDirection) throw new Error('tikz-cd arrow with no direction');
  return arrow;
}

// tikz-cd's named separations, in the reading view's units. The defaults are
// what the grid used before any diagram declared a separation, so a diagram
// that says nothing is laid out exactly as it was. A diagram that does say
// something said it for the PDF's sake — three arrows sharing one gap need
// the room — and the screen has the same crowding to answer.
const CD_SEP = {
  tiny: 0.25, scriptsize: 0.4, small: 0.55, normal: 1, large: 1.5, huge: 2.1,
};

function cdGap(opts, key, base) {
  const m = new RegExp(`${key}\\s+sep\\s*=\\s*([a-z]+)`).exec(opts || '');
  const f = m ? CD_SEP[m[1]] : undefined;
  if (m && f === undefined) {
    throw new Error(
      `unsupported tikz-cd "${key} sep=${m[1]}" — extend CD_SEP in ` +
        'scripts/render.mjs, or use one of ' + Object.keys(CD_SEP).join(', '),
    );
  }
  return (base * (f ?? 1)).toFixed(2);
}

function renderDiagram(raw) {
  const opts = (/^\\begin\{tikzcd\}(\[[^\]]*\])/.exec(raw) || [])[1] || '';
  const body = raw
    .replace(/^\\begin\{tikzcd\}(\[[^\]]*\])?/, '')
    .replace(/\\end\{tikzcd\}$/, '')
    .trim();

  // Rows split on `\\` only at brace depth zero: a cell may hold a
  // `\substack{... \\ ...}` — the wheel's centre does — and a regex split
  // would tear the grid apart in the middle of that cell.
  const rowSrcs = [];
  {
    let depth = 0;
    let cur = '';
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === '\\' && body[i + 1] === '\\' && depth === 0) {
        rowSrcs.push(cur);
        cur = '';
        i++;
        continue;
      }
      if (c === '\\') {
        cur += c + (body[i + 1] ?? '');
        i++;
        continue;
      }
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') depth--;
      cur += c;
    }
    rowSrcs.push(cur);
  }
  const rows = rowSrcs.map((r) => splitTop(r, '&').map((c) => c.trim()));

  const cells = [];
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const arrows = [];
      // Bracket-matched rather than regex-bounded: a label may itself contain
      // braces, and `\arrow[d, "\widetilde{f}"]` must not end at the first `]`.
      let rest = '';
      for (let i = 0; i < cell.length; ) {
        if (cell.startsWith('\\arrow[', i)) {
          let depth = 0;
          let j = i + 6;
          for (; j < cell.length; j++) {
            if (cell[j] === '[') depth++;
            else if (cell[j] === ']' && --depth === 0) break;
          }
          arrows.push(parseArrow(cell.slice(i + 7, j)));
          i = j + 1;
        } else {
          rest += cell[i];
          i++;
        }
      }
      cells.push({ r, c, tex: rest.trim(), arrows });
    });
  });

  const cols = Math.max(...rows.map((r) => r.length));
  const nodes = cells
    .map(
      (n) =>
        `<span class="tr-cd-node" data-r="${n.r}" data-c="${n.c}"` +
        ` data-tex="${escapeAttr(n.tex)}"></span>`,
    )
    .join('');
  const arrows = cells.flatMap((n) => n.arrows.map((a) => ({ ...a, r: n.r, c: n.c })));

  return (
    `<span class="tr-cd" data-cols="${cols}" ` +
    `data-arrows="${escapeAttr(JSON.stringify(arrows))}">` +
    `<span class="tr-cd-grid" style="grid-template-columns:repeat(${cols},auto);` +
    `column-gap:${cdGap(opts, 'column', 3.4)}rem;row-gap:${cdGap(opts, 'row', 2.6)}rem">` +
    `${nodes}</span>` +
    `<svg class="tr-cd-svg" aria-hidden="true"></svg>` +
    // The source stays available underneath, folded away. A reader who
    // doubts an arrow can check it against what was transcribed without
    // opening the PDF.
    `<details class="tr-cd-src"><summary>LaTeX source</summary><pre>${escapeHtml(raw)}</pre></details>` +
    `</span>`
  );
}

/**
 * Macros taking one argument, replaced with brace matching rather than by
 * regex.
 *
 * `[^{}]*` was enough until a transcriber's note quoted a formula:
 * `\note{... $\varphi_{*}(F)$ ...}` stops at the first inner `}` and the rest
 * of the note leaks into the page as raw LaTeX. Notes about mathematics
 * naturally contain mathematics, so this is the common case, not the exotic
 * one.
 */
const BRACED = [
  // The transcription's own vocabulary. These carry the whole honesty of the
  // exercise: what was read, what was guessed, what was added, what was
  // crossed out by the author.
  ['uncertain', (a) => `<span class="tr-uncertain" title="uncertain reading">${a}</span>`],
  ['add', (a) => `<span class="tr-add" title="editorial addition">[${a}]</span>`],
  ['struck', (a) => `<span class="tr-struck" title="struck out by the author">${a}</span>`],
  ['note', (a) => `<span class="tr-note" title="transcriber's note">${a}</span>`],
  ['marginal', (a) => `<span class="tr-marginal" title="marginal note">${a}</span>`],
  // The BnF's pencilled foliation, where a pass could read it. Recorded, never
  // inferred: it is what the literature cites — « ff. 348r–349r » — and the one
  // line that turns a citation into a Gallica view.
  ['folio', (a) => `<span class="tr-folio" title="folio, as pencilled by the BnF">f. ${a}</span>`],
  // The modern vocabulary the volume should be found under. Kept in English
  // inside a French document on purpose: it is a search key, not prose, and
  // the manifest extracts it as the volume's tags.
  ['keywords', (a) => `<span class="tr-keywords"><span class="tr-keywords-k">Keywords</span> — ${a}</span>`],
  ['emph', (a) => `<em class="ltx_emph">${a}</em>`],
  ['textit', (a) => `<em class="ltx_emph">${a}</em>`],
  ['textbf', (a) => `<strong class="ltx_text ltx_font_bold">${a}</strong>`],
  ['texttt', (a) => `<code class="ltx_text ltx_font_typewriter">${a}</code>`],
  ['textsuperscript', (a) => `<sup>${a}</sup>`],
  ['selectlanguage', () => ''],
];

function expandBraced(text) {
  let out = text;
  for (const [name, wrap] of BRACED) {
    const open = `\\${name}{`;
    let i;
    while ((i = out.indexOf(open)) !== -1) {
      let depth = 0;
      let j = i + open.length - 1;
      for (; j < out.length; j++) {
        if (out[j] === '{') depth++;
        else if (out[j] === '}' && --depth === 0) break;
      }
      const arg = out.slice(i + open.length, j);
      out = out.slice(0, i) + wrap(arg) + out.slice(j + 1);
    }
  }
  return out;
}

/** Reads a leading `[...]` off an \item body, matching brackets. */
function takeBracketed(text) {
  if (text[0] !== '[') return null;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') {
      depth--;
      if (depth === 0) return { arg: text.slice(1, i), rest: text.slice(i + 1) };
    }
  }
  return null;
}

/** Inline macros with no argument, applied to already-escaped text. */
const INLINE = [
  // `\ill` takes no argument, so both `\ill{}` and a bare `\ill` are valid
  // LaTeX and both compile into the PDF. Matching only the braced form let a
  // bare one survive as literal text in the reading view, so screen and PDF
  // disagreed about which words were read — the one thing this apparatus
  // exists to state. The negative lookahead keeps `\illsomething` out.
  [/\\ill\{\}|\\ill(?![a-zA-Z])/g, '<span class="tr-ill" title="illegible">[…]</span>'],
  // `\ldots{}` is as common as `\ldots` — the braces exist to stop TeX
  // eating the following space, and must not survive into the page.
  [/\\ldots(\{\})?/g, '…'],
  [/\\og\{?\}?\s*/g, '« '],
  [/\s*\\fg\{?\}?/g, ' »'],
  // Control space and the spacing macros: real spaces here, not literals.
  [/\\[ ,;:!]/g, ' '],
  // A backslash at end of line is the same control space: TeX turns the
  // newline into a space token, so `\ill\` wrapping onto the next line means
  // exactly what `\ill\ ` means mid-line. Left unmatched it printed a literal
  // backslash into the reading view while the PDF printed nothing — screen and
  // PDF disagreeing about the apparatus, which is the one thing they may not
  // do. The lookbehind keeps `\\` (an explicit line break) out of it.
  [/(?<!\\)\\(?=\r?\n)/g, ' '],
  [/\\q?quad/g, '  '],
  [/\\%/g, '%'],
  [/\\&amp;/g, '&amp;'],
  [/\\_/g, '_'],
  [/---/g, '—'],
  [/--/g, '–'],
  [/~/g, ' '],
];

function inline(text) {
  // Escape first, expand braced macros second, single tokens last: the
  // wrappers emit markup, so anything that escaped afterwards would eat it.
  let out = expandBraced(escapeHtml(text));
  for (const [re, to] of INLINE) out = out.replace(re, to);
  return out;
}

/**
 * The page marker, which is what makes the two panes one workspace.
 *
 * `\page{47}` becomes an anchor carrying `data-page`. The reading view watches
 * these as it scrolls and tells the facsimile which page to show. Without them
 * the two panes are merely adjacent.
 *
 * `\pagerange{5}{8}` is the modernised reading's coarser version, one section
 * at a time rather than one page at a time. It becomes the same `data-page`
 * anchor, at the range's first page — the reading view's scroll watcher does
 * not need to know the two macros apart, only the section's own text shows
 * the full range.
 */
function renderBlock(block) {
  const page = /^\\page\{(\d+)\}\s*/.exec(block);
  const range = !page && /^\\pagerange\{(\d+)\}\{(\d+)\}\s*/.exec(block);
  let prefix = '';
  if (page) {
    prefix = `<span class="tr-page" data-page="${page[1]}" id="page-${page[1]}">${page[1]}</span>`;
    block = block.slice(page[0].length);
  } else if (range) {
    prefix =
      `<span class="tr-page" data-page="${range[1]}" id="page-${range[1]}">` +
      `${range[1]}–${range[2]}</span>`;
    block = block.slice(range[0].length);
  }

  const section = /^\\(sub)?section\*?\{([\s\S]*)\}$/.exec(block.trim());
  if (section) {
    const tag = section[1] ? 'h3' : 'h2';
    const cls = section[1] ? 'ltx_title_subsection' : 'ltx_title_section';
    return `<${tag} class="ltx_title ${cls}">${prefix}${inline(section[2])}</${tag}>`;
  }

  const list = /^\\begin\{(itemize|enumerate)\}([\s\S]*)\\end\{\1\}$/.exec(block.trim());
  if (list) {
    const tag = list[1] === 'itemize' ? 'ul' : 'ol';
    let tagged = false;
    const items = list[2]
      .split(/\\item\b/)
      .slice(1)
      .map((i) => {
        // \item[(i)] — his own numbering. Where a list carries one, it
        // replaces the automatic marker rather than sitting beside it.
        const body = i.trim();
        const label = takeBracketed(body);
        if (!label) return `<li class="ltx_item">${inline(body)}</li>`;
        tagged = true;
        return `<li class="ltx_item ltx_item_tagged">`
          + `<span class="ltx_tag">${inline(label.arg)}</span>`
          + `${inline(label.rest.trim())}</li>`;
      })
      .join('\n');
    const cls = tagged ? 'ltx_itemize ltx_itemize_tagged' : 'ltx_itemize';
    return `${prefix}<${tag} class="${cls}">${items}</${tag}>`;
  }

  const resume = /^\\begin\{resume\}([\s\S]*)\\end\{resume\}$/.exec(block.trim());
  if (resume) {
    // Set smaller, and ruled off. It is the one passage that is not
    // mathematics, and the reader should know that before reading it.
    const inner = resume[1]
      .split(/\n\s*\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `<p class="ltx_p">${inline(s)}</p>`)
      .join('\n');
    return `<div class="tr-resume">${inner}</div>`;
  }

  const quote = /^\\begin\{quote\}([\s\S]*)\\end\{quote\}$/.exec(block.trim());
  if (quote) {
    return `<blockquote class="ltx_quote">${prefix}${inline(quote[1].trim())}</blockquote>`;
  }

  // An unrecognised environment must not be silently flattened into prose.
  const stray = /\\begin\{([a-z*]+)\}/.exec(block);
  if (stray) {
    throw new Error(
      `unsupported environment \\begin{${stray[1]}} — extend scripts/render.mjs, ` +
        'or keep the transcription inside the documented subset',
    );
  }

  return `<p class="ltx_p">${prefix}${inline(block.trim())}</p>`;
}

/** Metadata the skill writes in the preamble, and the page prints. */
function readMeta(tex) {
  const one = (name) => new RegExp(`\\\\${name}\\{([^{}]*)\\}`).exec(tex)?.[1] ?? '';
  const pages = /\\pages\{(\d+)\}\{(\d+)\}/.exec(tex);
  return {
    volume: one('volume'),
    batch: one('batch'),
    title: one('volumetitle'),
    // The holder's own dating, verbatim. Optional: a volume may have none,
    // and an empty string simply drops the line.
    dating: one('dating'),
    // The holder's shelfmark as they write it — « Français 9115 » — printed
    // in place of the slug when the file gives it.
    shelfmark: one('shelfmark'),
    // The legal notice the .tex declares about itself (demo edition, personal
    // interpretation). `\\` separates its lines in the PDF; here it becomes
    // an em dash. Absent line, absent notice — same rule as the dating.
    watermark: one('watermark').replace(/\\\\/g, ' — '),
    first: pages?.[1] ?? '',
    last: pages?.[2] ?? '',
  };
}

function render(tex, edition) {
  const body = /\\begin\{document\}([\s\S]*)\\end\{document\}/.exec(tex);
  if (!body) throw new Error('no \\begin{document} … \\end{document}');

  const meta = readMeta(tex);
  const { text, held } = liftMath(body[1]);

  /**
   * Block environments are taken out whole before paragraphs are split.
   *
   * They contain blank lines of their own — a summary runs to four paragraphs,
   * a list has one per item — and splitting on blank lines first tore them into
   * fragments, none of which then matched its own opening. Nothing failed
   * quietly: the renderer refused the file. But the fix belongs here, in the
   * order of operations, not in a looser pattern.
   */
  const ENVS = 'resume|itemize|enumerate|quote';
  const kept = [];
  const stripped = text.replace(/(?<!\\)%.*$/gm, ''); // LaTeX comments
  const { text: cleaned, notes } = liftFootnotes(stripped);
  const lifted = cleaned.replace(
    new RegExp(`\\\\begin\\{(${ENVS})\\}[\\s\\S]*?\\\\end\\{\\1\\}`, 'g'),
    (m) => {
      kept.push(m);
      return `\n\nENVBLOCK${kept.length - 1}\n\n`;
    },
  );

  const blocks = lifted
    // A page marker always starts a block, even mid-paragraph: a page turns
    // where the paper turns, not where the argument does.
    .replace(/\\page\{/g, '\n\n\\page{')
    .replace(/(\\(?:sub)?section\*?\{)/g, '\n\n$1')
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const env = /^ENVBLOCK(\d+)$/.exec(b);
      return env ? kept[Number(env[1])] : b;
    });

  let html = blocks.map(renderBlock).join('\n');
  // The leading space is swallowed and the trailing one kept: a footnote marker
  // hugs the word it follows, as it does in print.
  html = html.replace(
    / ?FOOTNOTE(\d+)( ?)/g,
    (_, n, post) =>
      `<sup class="tr-fnref" id="fnref-${Number(n) + 1}">` +
      `<a href="#fn-${Number(n) + 1}">${Number(n) + 1}</a></sup>${post}`,
  );
  if (notes.length) {
    html +=
      '\n<section class="tr-footnotes"><h2>Notes</h2><ol>' +
      notes
        .map(
          (nt, k) =>
            `<li id="fn-${k + 1}">${inline(nt.trim())} ` +
            `<a class="tr-fnback" href="#fnref-${k + 1}">↩</a></li>`,
        )
        .join('\n') +
      '</ol></section>';
  }
  html = dropMathBack(html, held);
  const { lang, name } = EDITION_LABELS[edition];

  return `<!doctype html>
<!-- Light forced. ar5iv ships \`color-scheme: light dark\` and follows the OS,
     which left a dark transcript sitting inside a light site — the two panes
     read as two different applications. The site chrome is light-only, so the
     frame inside it has to be too; \`data-theme\` is ar5iv's own override. -->
<html lang="${lang}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(meta.shelfmark || meta.volume)}, vues ${meta.first}–${meta.last} — ${name}</title>
<!-- The ar5iv stylesheet, verbatim: the same one LaTeXML produces for arXiv
     articles. Serving this view as its own document is what lets the sheet be
     used unmodified rather than scoped by hand. -->
<link rel="stylesheet" href="/vendor/ar5iv.css">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
<style>
  /* ar5iv exposes its body font through a token, and its default is Noto
     Serif — a font this document does not load, so the value was resolving to
     a generic serif and the text was set in whatever the browser had. Hooking
     the site's own stack into the token fixes every selector at once, which is
     what tipe.commutator.io does with the same stylesheet. */
  :root {
    color-scheme: light;
    --serif: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif;
    --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif;
    --mono: 'SF Mono', ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace;
    --text-font-family: var(--sans);
    --headings-font-family: var(--sans);
    --ink: #12120f; --ink2: #3f3e3a; --ink3: #6f6d66; --ink4: #9a988f;
    --rule: #e2e0da; --rule2: #eeece7; --surf3: #f4f2ed;
  }
  /* Titles in serif, as on the report: a heading that shares the body's face
     stops being a heading. */
  .ltx_title { font-family: var(--serif); }
  /* ar5iv scales paragraphs down from the body; on this page that left the
     text at 13px and made the resume, already smaller, indistinguishable from
     it. The three sizes are therefore set outright, so the hierarchy is a
     decision rather than a by-product: body, then resume, then notes. */
  .ltx_p { font-size: 15.5px; line-height: 1.62; }
  b, strong { font-weight: 650; }
  code { font-family: var(--mono); font-size: .9em; background: var(--surf3);
         padding: 1px 5px; border-radius: 4px; }
  pre { font-family: var(--mono); }
  var { font-family: var(--serif); font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
  th { text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .07em;
       text-transform: uppercase; color: var(--ink3); padding: 0 12px 8px 0; }
  td { padding: 6px 12px 6px 0; border-top: 1px solid var(--rule2); }
  /* border-box, because ar5iv gives the body an explicit width: with the
     default content-box the horizontal padding is added *outside* it, and the
     whole document overflowed its frame by exactly that padding. */
  /* The stack is set on the body as well as on ar5iv's token. The token alone
     is not enough here: ar5iv spends it on ltx_para, ltx_text and friends —
     the wrappers LaTeXML emits — while this renderer writes bare ltx_p, so
     every paragraph fell through to the browser default and came out in
     Times. */
  /* Positioned, so that the watermark's inset spans the whole document
     rather than the frame's idea of a viewport. */
  body { box-sizing: border-box; margin: 0; padding: 1.5rem 1.75rem 2rem;
             background: #fff; font-family: var(--sans); color: var(--ink);
             font-size: 15px; line-height: 1.6; position: relative; }
  /* ar5iv sets a fixed \`width\` for the article, sized for a full browser
     window. In a resizable side pane that overflowed horizontally at every
     width below it — \`max-width\` alone does not undo a fixed \`width\`. */
  /* Stacked above the watermark, which is absolutely positioned and would
     otherwise paint over ordinary flow content. */
  .ltx_document { width: auto; max-width: 100%; position: relative; z-index: 1; }
  /* Long formulas and wide diagrams scroll inside themselves rather than
     pushing the whole column sideways. */
  .ltx_Math.ltx_display, table { max-width: 100%; overflow-x: auto; }
  .tr-head { border-bottom: 1px solid var(--rule); padding-bottom: .6rem;
             margin-bottom: 1.4rem; font-family: var(--sans); font-size: 12px;
             font-weight: 500; line-height: 1.5; color: var(--ink3); }
  /* The inventory's dating, set apart from the shelfmark line: it is the
     archivists' claim, not ours, and the brackets in it are theirs. */
  .tr-dating { color: var(--ink4, #9d9787); font-weight: 400; }
  /* The legal notice: a visible line in the head, and the same words laid
     diagonally under the text — light enough to read through, present on
     every screenful so a capture of any part of the page carries it. */
  .tr-demo { color: #a04b2e; font-weight: 600; }
  /* Repeated rather than pinned — see watermarkTile for why fixing it to the
     viewport cannot work in the reading pane. It sits *under* the text, where
     the PDF's sits over it: on screen the glyphs break it up, which is as
     present as it needs to be and easier to read through. */
  .tr-demo-diag { position: absolute; inset: 0; z-index: 0; pointer-events: none;
             user-select: none; background-repeat: repeat;
             background-position: center top; }
  /* The page number sits in the margin, out of the reading line: it is an
     apparatus, not part of the text. */
  .tr-page { float: left; margin-left: -2.6rem; width: 2rem; text-align: right;
             font-family: var(--mono); font-size: 10.5px; font-weight: 600;
             line-height: 1.9; color: var(--ink4); user-select: none; }
  @media (max-width: 46rem) { .tr-page { float: none; margin: 0 .5rem 0 0; } }
  .tr-ill { color: #b53d1d; }
  .tr-uncertain { border-bottom: 1px dotted #b53d1d; }
  .tr-add { color: #38539d; }
  .tr-struck { text-decoration: line-through; color: #9d9787; }
  .tr-folio { font-family: var(--sans); font-size: 11px; color: var(--ink4); margin-right: .5em; }
  .tr-note, .tr-marginal { display: block; margin: .4rem 0; padding-left: .7rem;
             border-left: 2px solid var(--rule); font-size: .88em; color: var(--ink3); }
  /* A list whose items carry his own labels prints those and nothing else.
     The hanging position of the tag is ar5iv's (it pulls .ltx_tag back by the
     list's default 2.5rem padding), so nothing here may touch that padding. */
  .ltx_itemize_tagged { list-style: none; }
  .ltx_Math.ltx_display { display: block; margin: .9rem 0; text-align: center; }
  /* Commutative diagrams: a grid of KaTeX nodes with an SVG arrow layer over
     it. The gaps are what the arrows are drawn in, so they are generous. */
  .tr-cd { display: block; position: relative; margin: 1.4rem 0; overflow-x: auto; }
  .tr-cd-grid { display: inline-grid; justify-items: center; align-items: center;
             column-gap: 3.4rem; row-gap: 2.6rem; padding: .4rem 1rem; position: relative; }
  .tr-cd-node { display: inline-block; }
  .tr-cd-svg { position: absolute; left: 0; top: 0; overflow: visible;
             pointer-events: none; }
  /* z-index lifts labels above the SVG layer: a "description" label sits on
     the shaft itself and its background must knock the line out. */
  .tr-cd-label { position: absolute; font-size: .82em; background: #fff;
             padding: 0 .12em; transform: translate(-50%, -50%); white-space: nowrap;
             z-index: 1; }
  .tr-cd-src { margin-top: .5rem; }
  .tr-cd-src summary { font-family: var(--sans); font-size: 10px; font-weight: 600;
             line-height: 1.4; letter-spacing: .07em;
             text-transform: uppercase; color: #9d9787; cursor: pointer; }
  /* The résumé: set smaller than the body and ruled off. It is the one
     passage of the document that is not mathematics, and the eye should know
     that before reading a word of it. */
  .tr-resume { color: var(--ink2); margin: 0 0 1.6rem;
             padding-bottom: 1.1rem; border-bottom: 1px solid var(--rule); }
  .tr-resume .ltx_p { font-size: 13.5px; line-height: 1.6; margin: 0 0 .6rem; }
  .tr-resume .ltx_p:last-child { margin-bottom: 0; }
  .tr-keywords { display: block; font-size: 12px; color: var(--ink3); font-style: italic; }
  .tr-keywords-k { font-family: var(--sans); font-size: 10px; font-weight: 700;
             letter-spacing: .09em; text-transform: uppercase; color: var(--ink4);
             font-style: normal; }
  /* Notes are apparatus, and set smaller than the text they annotate — the
     printed convention, and it keeps a page of them from competing with the
     mathematics they hang off. */
  .tr-fnref { font-size: .72em; font-weight: 600; }
  .tr-fnref a { text-decoration: none; color: #38539d; }
  .tr-footnotes { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--rule); }
  .tr-footnotes h2 { font-family: var(--sans); font-size: 10.5px; font-weight: 700;
             line-height: 1.4; letter-spacing: .09em; text-transform: uppercase;
             color: var(--ink4); margin: 0 0 .6rem; }
  .tr-footnotes ol { margin: 0; padding-left: 1.4rem; }
  .tr-footnotes li { margin-bottom: .55rem; font-size: 12.5px; line-height: 1.55;
             color: var(--ink3); }
  .tr-footnotes li .ltx_p { font-size: inherit; line-height: inherit; }
  .tr-footnotes li .ltx_Math { font-size: .95em; }
  .tr-fnback { text-decoration: none; color: var(--ink4); }
  .tr-cd-src pre { white-space: pre; overflow-x: auto; margin: .4rem 0 0;
             font: 12px/1.5 ui-monospace, monospace; color: #575348;
             background: #f8f7f3; border: 1px solid #e4e0d5; border-radius: .4rem;
             padding: .6rem .8rem; }
</style>
</head>
<body>
<article class="ltx_document">
<p class="tr-head">${escapeHtml(meta.shelfmark || meta.volume)}${meta.batch ? ` · lot ${meta.batch}` : ''} · vues ${meta.first}–${meta.last}
 · ${name}${meta.title ? ` · ${escapeHtml(meta.title)}` : ''}${
   meta.dating
     ? `<br><span class="tr-dating">Datation du catalogue : ${escapeHtml(meta.dating)}</span>`
     : ''
 }<br><span class="tr-dating">Source gallica.bnf.fr / Bibliothèque nationale de France</span>${
   meta.watermark ? `<br><span class="tr-demo">${escapeHtml(meta.watermark)}</span>` : ''
 }</p>
${meta.watermark ? `<div class="tr-demo-diag" aria-hidden="true" style="background-image:${watermarkTile(meta.watermark)}"></div>` : ''}
${html}
</article>
<script defer src="/vendor/katex/katex.min.js"></script>
<script defer src="/vendor/katex/auto-render.min.js"></script>
<script>
// DOMContentLoaded rather than an onload handler: deferred scripts have all
// executed by then, so KaTeX is certainly present, and the order of the two
// passes below is guaranteed. Nodes must be typeset before arrows are drawn —
// arrow geometry is read off the laid-out cells.
// The critical apparatus reaches inside the mathematics: an illegible
// exponent, a term of a sequence that cannot be read. The prose expansion
// above never sees those — they sit between the math delimiters, which pass
// through untouched — so KaTeX has to know the macro too, or a gap in the
// reading comes out as the literal word "\\ill" on screen while the PDF prints
// the marker. Screen and PDF must agree about which words were read.
var TR_MACROS = {
  '\\\\ill': '\\\\textcolor{#b53d1d}{[\\\\ldots]}',
  // The other three apparatus macros reach math too — he strikes a single
  // symbol, doubts a single operator — and KaTeX drops what it does not know
  // *silently*, so without these the strike simply disappears on screen while
  // the PDF prints it. Same rule as \\ill: screen and PDF must agree.
  '\\\\struck': '\\\\sout{#1}',
  '\\\\uncertain': '\\\\underline{#1}',
  // The colour goes through \\addcolour rather than sitting in \\add's body.
  // KaTeX counts the #N in a macro body to infer how many arguments it takes,
  // and #38539d reads as parameter 3: \\add came out a three-argument macro
  // and threw at expansion, killing every diagram on the page. \\ill escapes
  // this only because #b is not a digit.
  '\\\\addcolour': '#38539d',
  '\\\\add': '\\\\textcolor{\\\\addcolour}{[#1]}',
};

document.addEventListener('DOMContentLoaded', function () {
  renderMathInElement(document.body, {
    delimiters: [
      { left: '\\\\[', right: '\\\\]', display: true },
      { left: '\\\\(', right: '\\\\)', display: false },
    ],
    throwOnError: false,
    macros: TR_MACROS,
  });
  drawDiagrams();
});

/**
 * Draws the arrows of every commutative diagram, from the measured grid.
 *
 * Re-run on resize because the pane is resizable and the grid reflows: an
 * arrow drawn for the old geometry points at nothing.
 */
function drawDiagrams() {
  document.querySelectorAll('.tr-cd').forEach(drawDiagram);
}

var resizeTimer;
addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawDiagrams, 120);
});

function drawDiagram(cd) {
  var grid = cd.querySelector('.tr-cd-grid');
  var svg = cd.querySelector('.tr-cd-svg');
  var nodes = {};

  // Cleared before measuring: the padding added at the end of the last pass
  // is what we are about to recompute, and leaving it in would make the box
  // grow a little further on every redraw.
  cd.style.paddingTop = '0px';
  cd.style.paddingBottom = '0px';

  // Typeset the nodes once. On a redraw they are already done.
  cd.querySelectorAll('.tr-cd-node').forEach(function (n) {
    if (!n.dataset.done) {
      katex.render(n.dataset.tex || '', n, { throwOnError: false, displayMode: false, macros: TR_MACROS });
      n.dataset.done = '1';
    }
    nodes[n.dataset.r + ',' + n.dataset.c] = n;
  });

  var base = grid.getBoundingClientRect();
  svg.setAttribute('width', base.width);
  svg.setAttribute('height', base.height);
  svg.setAttribute('viewBox', '0 0 ' + base.width + ' ' + base.height);
  svg.innerHTML =
    '<defs><marker id="cdhead" viewBox="0 0 10 10" refX="9" refY="5" ' +
    'markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,1 L9,5 L0,9" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    '</marker></defs>';
  cd.querySelectorAll('.tr-cd-label').forEach(function (l) { l.remove(); });

  function box(n) {
    var r = n.getBoundingClientRect();
    return {
      x: r.left - base.left, y: r.top - base.top,
      w: r.width, h: r.height,
      cx: r.left - base.left + r.width / 2,
      cy: r.top - base.top + r.height / 2,
    };
  }

  // Where the segment from the centre leaves the node's box, padded so the
  // arrow starts clear of the glyphs rather than touching them.
  function edge(b, dx, dy, pad) {
    var hw = b.w / 2 + pad;
    var hh = b.h / 2 + pad;
    var sx = dx === 0 ? Infinity : hw / Math.abs(dx);
    var sy = dy === 0 ? Infinity : hh / Math.abs(dy);
    var s = Math.min(sx, sy);
    return { x: b.cx + dx * s, y: b.cy + dy * s };
  }

  JSON.parse(cd.dataset.arrows || '[]').forEach(function (a) {
    var from = nodes[a.r + ',' + a.c];
    var to = nodes[(a.r + a.dr) + ',' + (a.c + a.dc)];
    if (!from || !to) return;

    var b1 = box(from);
    var b2 = box(to);
    var dx = b2.cx - b1.cx;
    var dy = b2.cy - b1.cy;
    var len = Math.hypot(dx, dy) || 1;
    var ux = dx / len;
    var uy = dy / len;

    var p1 = edge(b1, ux, uy, 6);
    var p2 = edge(b2, -ux, -uy, 6);

    var ns = 'http://www.w3.org/2000/svg';

    // A bent arrow is a quadratic Bézier. The control point sits off the
    // chord's midpoint on the side tikz calls "left of travel" — on screen,
    // with y running down, that side is (uy, -ux). tan(bend) makes the
    // endpoint tangents leave at the angle the bend parameter names, which
    // is what lets eight rim arcs at matching bends close into a circle.
    var ctrl = null;
    if (a.bend) {
      var bh = Math.tan((a.bend * Math.PI) / 180) * (len / 2);
      ctrl = {
        x: (p1.x + p2.x) / 2 + uy * bh,
        y: (p1.y + p2.y) / 2 - ux * bh,
      };
    }

    function line(off) {
      var l = document.createElementNS(ns, 'line');
      // Perpendicular offset, used only to separate the two rules of a
      // double arrow.
      l.setAttribute('x1', p1.x - uy * off);
      l.setAttribute('y1', p1.y + ux * off);
      l.setAttribute('x2', p2.x - uy * off);
      l.setAttribute('y2', p2.y + ux * off);
      l.setAttribute('stroke', 'currentColor');
      l.setAttribute('stroke-width', '1');
      if (a.dashed) l.setAttribute('stroke-dasharray', '3 3');
      svg.appendChild(l);
      return l;
    }
    function curve() {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute(
        'd',
        'M ' + p1.x + ' ' + p1.y +
          ' Q ' + ctrl.x + ' ' + ctrl.y + ' ' + p2.x + ' ' + p2.y,
      );
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', 'currentColor');
      p.setAttribute('stroke-width', '1');
      if (a.dashed) p.setAttribute('stroke-dasharray', '3 3');
      svg.appendChild(p);
      return p;
    }

    if (a.style === 'double') {
      line(1.6);
      line(-1.6).setAttribute('marker-end', 'url(#cdhead)');
    } else if (a.style === 'none') {
      if (ctrl) curve();
      else line(0);
    } else {
      var main = ctrl ? curve() : line(0);
      main.setAttribute('marker-end', 'url(#cdhead)');
      if (a.style === 'hook') {
        // The hooked tail of a monomorphism. A half-circle at the start,
        // curling to the side the apostrophe selects.
        var r = 4;
        var s = a.hookFlip ? -1 : 1;
        var path = document.createElementNS(ns, 'path');
        var hx = p1.x + ux * r;
        var hy = p1.y + uy * r;
        path.setAttribute(
          'd',
          'M ' + hx + ' ' + hy + ' A ' + r + ' ' + r + ' 0 1 ' +
            (s > 0 ? 1 : 0) + ' ' + p1.x + ' ' + p1.y,
        );
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1');
        svg.appendChild(path);
      }
    }

    if (a.label) {
      var span = document.createElement('span');
      span.className = 'tr-cd-label';
      // Anchor at the shaft's true midpoint — for a Bézier that is the curve
      // at t = 1/2, not the chord's. A description label sits on the shaft
      // (offset zero, background knocking out the line); the others hang
      // beside it, on the side the apostrophe picked.
      // tikz's unprimed side is "left of travel" in its own y-up frame, which
      // on screen — y running down — is the normal (uy, -ux), not (-uy, ux):
      // a label above a rightward arrow, and to the page-right of a downward
      // one. The offset below is applied along (-uy, ux), so the unprimed
      // case takes the negative sign. Getting this backwards put every label
      // on the wrong side of its arrow, and screen and PDF then disagreed
      // about which arrow a name belonged to.
      var mx = ctrl ? (p1.x + 2 * ctrl.x + p2.x) / 4 : (p1.x + p2.x) / 2;
      var my = ctrl ? (p1.y + 2 * ctrl.y + p2.y) / 4 : (p1.y + p2.y) / 2;
      var off = a.desc ? 0 : a.flip ? 13 : -13;
      span.style.left = mx - uy * off + 'px';
      span.style.top = my + ux * off + 'px';
      grid.appendChild(span);
      katex.render(a.label, span, { throwOnError: false, macros: TR_MACROS });
    }
  });

  // A deep bend and the label riding it reach well outside the node grid,
  // and the box clips: overflow-x:auto, which wide diagrams need, forces
  // overflow-y to auto with it. Measure what sticks out above and below and
  // pad the box by that much. Unpadded, the six functors of a recollement
  // lose four of their six names — and a diagram missing a name is worse
  // than no diagram, because nothing on screen says a name is missing.
  var gh = grid.offsetHeight;
  var over = 0;
  var under = 0;
  function span_(top, bottom) {
    if (-top > over) over = -top;
    if (bottom - gh > under) under = bottom - gh;
  }
  grid.querySelectorAll('.tr-cd-label').forEach(function (l) {
    // The label is centred on its anchor by a translate(-50%, -50%), so its
    // painted box is half a line above and below what offsetTop reports.
    var h = l.offsetHeight;
    span_(l.offsetTop - h / 2, l.offsetTop + h / 2);
  });
  svg.querySelectorAll('path').forEach(function (p) {
    var b;
    try { b = p.getBBox(); } catch (_) { return; }
    span_(b.y, b.y + b.height);
  });
  if (over > 0) cd.style.paddingTop = Math.ceil(over) + 'px';
  if (under > 0) cd.style.paddingBottom = Math.ceil(under) + 'px';
}
</script>
</body>
</html>
`;
}

/** The LaTeX source, wrapped so a browser will show it instead of saving it. */
function sourcePage(tex, file, edition) {
  const { name } = EDITION_LABELS[edition];
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(file)} — LaTeX source</title>
<style>
  :root { color-scheme: light; }
  body { box-sizing: border-box; margin: 0; padding: 1.5rem 1.75rem 4rem;
         background: #fff; color: #2a2823;
         font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  header { border-bottom: 1px solid #e4e0d5; padding-bottom: .6rem; margin-bottom: 1.2rem; }
  h1 { margin: 0; font-size: 15px; }
  p { margin: .35rem 0 0; font-size: 12.5px; color: #726d5f; }
  a { color: #38539d; }
  pre { white-space: pre-wrap; word-break: break-word; margin: 0;
        font: 12.5px/1.6 ui-monospace, Menlo, monospace; color: #413e36; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(file)}</h1>
  <p>${escapeHtml(name)} — LaTeX source, the artifact of record.
     <a href="./${escapeHtml(file)}" download>Download the file</a></p>
</header>
<pre>${escapeHtml(tex)}</pre>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

  let volumes = [];
  try {
    volumes = (await readdir(SOURCE, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    process.stdout.write('No transcripts/ directory yet — nothing to render.\n');
    return;
  }
  if (only.length) volumes = volumes.filter((f) => only.includes(f));

  let n = 0;
  for (const volume of volumes) {
    const files = (await readdir(resolve(SOURCE, volume))).filter((f) => f.endsWith('.tex'));
    if (!files.length) continue;
    await mkdir(resolve(OUT, volume), { recursive: true });

    for (const file of files) {
      // Two units, two namings. `batch-NN` covers twenty pages; the shelfmark
      // itself — `161-3.modern.tex` — covers the volume whole, because the
      // modernised reading's argument runs across the batch boundaries and a
      // reading of volume 161-3 filed as "batch 1" would claim to be a third
      // of itself. The volume-wide name repeats the shelfmark rather than
      // saying `volume`, so that a file downloaded on its own still says which
      // volume it is; requiring it to equal the directory keeps the two from
      // drifting apart unnoticed.
      const m = /^(?:batch-(\d+)|(.+?))\.(fr|modern)\.tex$/.exec(file);
      if (!m || (m[2] !== undefined && m[2] !== volume)) {
        process.stderr.write(`  ⚠ ${volume}/${file}: name outside the convention, skipped\n`);
        continue;
      }
      const tex = await readFile(resolve(SOURCE, volume, file), 'utf8');
      try {
        const html = render(tex, m[3]);
        await writeFile(resolve(OUT, volume, basename(file, '.tex') + '.html'), html, 'utf8');
        // The source travels with its rendering. `.tex` is the artifact that
        // matters — it is what gets cited, corrected and folded into a larger
        // document — and the file row offers it first. Leaving it outside
        // `public/` made that button a 404.
        await copyFile(resolve(SOURCE, volume, file), resolve(OUT, volume, file));
        // …and again wrapped in a page, because a browser will not display a
        // `.tex`: GitHub Pages labels it `application/x-tex`, which every
        // browser downloads rather than shows. The wrapper is what the source
        // button opens; the raw file is still there, one link away, for anyone
        // who actually wants the download.
        await writeFile(
          resolve(OUT, volume, `${file}.html`),
          sourcePage(tex, file, m[3]),
          'utf8',
        );
        n += 1;
      } catch (e) {
        process.stderr.write(`  ⚠ ${volume}/${file}: ${e.message}\n`);
      }
    }
  }

  process.stdout.write(`${n} reading views → public/transcripts/\n`);
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
