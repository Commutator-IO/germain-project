#!/usr/bin/env node
/**
 * Builds his lexicon out of the transcriptions, for the next pass to read.
 *
 *   npm run lexicon
 *   npm run lexicon -- --min 4        rarer words dropped
 *
 * What this is for. A pass reading a hard leaf is not usually choosing between
 * a word and no word; it is choosing between candidates, and the candidate
 * that wins is the one that belongs to *this* material. Folder 29 page 170
 * carries a stroke that reads « p—uncaux »; it is *principaux*, and nothing in
 * the ink says so — what says so is that the surrounding lines are classing
 * covering families, where principal is the word that occurs. A frequency list
 * of the register does not read a page, but it narrows the field, and it is
 * the one artefact here that can be built **now**, from what already exists.
 *
 * And it can be built from unverified transcriptions without circularity,
 * because it does not claim anything about ink. Whether page 170 really says
 * *principaux* is exactly the question a first pass cannot settle; that the
 * word *principal* is common in this material is settled by hundreds of other
 * occurrences, most of them nowhere near a doubtful stroke. A noisy corpus is
 * a poor teacher of letterforms and a perfectly good witness to vocabulary.
 *
 * Three things are kept apart on purpose, because conflating them is how a
 * guess would launder itself into an authority:
 *
 * — **Sure prose** — his words as read plainly, plus `\struck{}` (struck out
 *   but read) and `\marginal{}` (his margin, not ours).
 * — **Doubtful prose** — the contents of `\uncertain{}`, counted separately
 *   and reported separately. A word appearing *only* here is a reading this
 *   project has never once been confident about, and the file says so.
 * — **Ours, and therefore excluded** — `\note{}`, `\add{}`, every section
 *   heading, and the whole preamble. That prose is the transcriber's French,
 *   not Germain's, and it would otherwise swamp the list with the
 *   vocabulary of the apparatus itself.
 *
 * Only `.fr.tex` is read. The modernised readings are in current notation and
 * current names by design; a lexicon built from them would describe the
 * editor's French of 2026, which is the opposite of what is wanted here.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'transcripts');
const OUT = resolve(ROOT, '.claude', 'skills', 'transcribe-germain', 'references');

/** Below this a word is noise — one bad reading, one proper name. */
const DEFAULT_MIN = 3;

/** How many rows each table shows. The JSON carries everything. */
const SHOWN = 120;

/**
 * Grammar, not register — in both languages, because the corpus is in both.
 * These carry no information about the material and would otherwise be the
 * whole top of the list.
 */
const GRAMMAR = new Set(`
a à ai ainsi alors au aucun aussi autre autres aux avec avoir avons

bien

ça car ce ceci cela celle celles celui ces cet cette ceux chaque chez comme
comment

dans de des donc dont du

elle elles en encore entre est et étant état été être eu eux

fait faire fois font

ici il ils

je

la là le les leur leurs lui

ma mais me même mes moi mon

ne ni nos notre nous

on ont ou où oui

par pas peu peut plus pour pourquoi près puis

qu que quel quelle quelles quels qui quoi

sa sans se sera ses si sien soit son sont sous sur

ta te tel telle telles tels toi ton tous tout toute toutes tu

un une

va vers voici voilà voir vos votre vous

y

a an and any are as at be been but by can could did do does for from had has
have he her him his how i if in into is it its me my no not of on one only or
our out she should so some such than that the their them then there these they
this those to too was we were what when which who will with would you your
`.trim().split(/\s+/));

// ---------------------------------------------------------------------------

/** `%` starts a comment unless escaped. */
const stripComments = (s) => s.replace(/(^|[^\\])%.*$/gm, '$1');

/**
 * The text of `\macro{…}`, matching braces so that nested mathematics survives
 * — `\note{the $\varphi_{*}$ here is struck}` is the common case, and a
 * non-greedy regex would cut it in half.
 */
function* macroBodies(text, name) {
  const open = new RegExp(`\\\\${name}\\{`, 'g');
  let m;
  while ((m = open.exec(text))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < text.length && depth > 0) {
      if (text[i] === '\\') i++;
      else if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      i++;
    }
    if (depth === 0) yield { body: text.slice(start, i - 1), from: m.index, to: i };
  }
}

/** Removes `\macro{…}` and its contents entirely. */
function dropMacro(text, name) {
  const cuts = [...macroBodies(text, name)].reverse();
  for (const c of cuts) text = text.slice(0, c.from) + ' ' + text.slice(c.to);
  return text;
}

/** Replaces `\macro{x}` by `x`, keeping the contents. */
function unwrapMacro(text, name) {
  for (const c of [...macroBodies(text, name)].reverse()) {
    text = text.slice(0, c.from) + c.body + text.slice(c.to);
  }
  return text;
}

/** Everything inside `$…$`, `\(…\)`, `\[…\]` and the display environments. */
function splitMath(text) {
  const math = [];
  const prose = text
    .replace(/\\begin\{(equation|align|gather|cases|array|tikzcd|[bpvBV]?matrix)\*?\}[\s\S]*?\\end\{\1\*?\}/g,
      (m) => (math.push(m), ' '))
    .replace(/\\\[[\s\S]*?\\\]/g, (m) => (math.push(m), ' '))
    .replace(/\\\([\s\S]*?\\\)/g, (m) => (math.push(m), ' '))
    .replace(/\$[^$]*\$/g, (m) => (math.push(m), ' '));
  return { prose, math: math.join('\n') };
}

/**
 * Everything that is LaTeX rather than language. Without this the top of the
 * list is `emph`, `item`, `page`, `textbf` — the markup counted as vocabulary,
 * which is both wrong and the sort of wrong that looks plausible in a table.
 */
const stripLatex = (s) =>
  s
    .replace(/\\(?:begin|end)\{[^}]*\}/g, ' ')
    .replace(/\\[A-Za-z]+\*?/g, ' ')
    .replace(/\\[^A-Za-z]/g, ' ')
    .replace(/[{}[\]&~^_]/g, ' ');

const WORD = /[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’-]*/gu;

const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);

function countWords(raw, into) {
  const text = stripLatex(raw);
  for (const m of text.matchAll(WORD)) {
    const w = m[0].toLowerCase().replace(/[-'’]+$/, '');
    if (w.length < 2 || GRAMMAR.has(w)) continue;
    bump(into, w);
  }
}

/**
 * `loc. noeth.`, `fid. plat`, `p. ex.`, `qu.-cpt` — the shorthand is half of
 * how he writes, and it is exactly what defeats a reader coming to the hand
 * cold. Caught by the full stop, which ordinary French words do not carry.
 */
function countAbbreviations(raw, into) {
  const text = stripLatex(raw);
  for (const m of text.matchAll(/(?<![.\w])([A-Za-zÀ-ÖØ-öø-ÿ]{1,5}\.(?:\s?-?[a-zà-ÿ]{1,5}\.)?)/gu)) {
    const a = m[1].replace(/\s+/g, ' ').trim();
    bump(into, a);
  }
}

function countMacros(math, into) {
  for (const m of math.matchAll(/\\([A-Za-z]+)/g)) bump(into, `\\${m[1]}`);
}

// ---------------------------------------------------------------------------

async function transcriptions() {
  const out = [];
  for (const folder of (await readdir(SOURCE, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name !== 'preamble' && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort()) {
    for (const file of (await readdir(resolve(SOURCE, folder))).sort()) {
      if (/^batch-\d+\.fr\.tex$/.test(file)) out.push({ folder, file, path: resolve(SOURCE, folder, file) });
    }
  }
  return out;
}

async function build(min) {
  const sure = new Map();
  const doubtful = new Map();
  const abbrev = new Map();
  const macros = new Map();
  const folders = new Set();
  let files = 0;
  let pages = 0;

  for (const t of await transcriptions()) {
    let text = stripComments(await readFile(t.path, 'utf8'));
    const body = text.split(/\\begin\{document\}/)[1];
    if (!body) continue;

    files++;
    folders.add(t.folder);
    pages += (body.match(/\\page\{/g) ?? []).length;

    // Ours, and out. Headings included: they are the transcriber's summary of
    // a run, not anything he wrote.
    let his = dropMacro(body, 'note');
    his = dropMacro(his, 'add');
    his = his.replace(/\\(?:sub)?section\*?\{[^}]*\}/g, ' ');
    his = his.replace(/\\(?:folder|batch|pages|dating|watermark|foldertitle|keywords)\{[^}]*\}/g, ' ');

    // Doubtful readings are pulled aside before the sure text is counted, so
    // that no word is credited to both.
    const uncertainText = [...macroBodies(his, 'uncertain')].map((c) => c.body).join('\n');
    his = dropMacro(his, 'uncertain');

    // His, and kept: struck out is still written, and his margin is his.
    his = unwrapMacro(his, 'struck');
    his = unwrapMacro(his, 'marginal');
    his = his.replace(/\\ill\b\{?\}?/g, ' ');

    const split = splitMath(his);
    countWords(split.prose, sure);
    countAbbreviations(split.prose, abbrev);
    countMacros(split.math, macros);

    countWords(splitMath(uncertainText).prose, doubtful);
  }

  const rank = (map, floor = min) =>
    [...map].filter(([, n]) => n >= floor).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  // `fini.` is a sentence ending; `noeth.` is an abbreviation. What separates
  // them is that *fini* is itself an ordinary word of this corpus and *noeth*
  // is not — so an entry whose stem is common on its own is a full stop, not
  // shorthand, and is dropped. Nothing else in the counting distinguishes them.
  for (const [a] of abbrev) {
    const stem = a.replace(/\.$/, '').toLowerCase();
    if (/^[a-zà-ÿ]+$/.test(stem) && (sure.get(stem) ?? 0) >= 2 * (abbrev.get(a) ?? 0)) {
      abbrev.delete(a);
    }
  }

  // A word never once read with confidence, anywhere in the corpus. These are
  // the entries to distrust, and the reason the two counts are kept apart.
  const onlyDoubtful = rank(
    new Map([...doubtful].filter(([w]) => !sure.has(w))),
    Math.max(2, min - 1),
  );

  return {
    files, folders: [...folders].sort(), pages, min,
    sure: rank(sure), doubtful: rank(doubtful), onlyDoubtful,
    abbreviations: rank(abbrev), macros: rank(macros, 2),
  };
}

// ---------------------------------------------------------------------------

const table = (rows, head) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

function markdown(x) {
  const cols = (rows) => {
    // Three pairs across, so a long list stays one screen rather than five.
    const out = [];
    const third = Math.ceil(rows.length / 3);
    for (let i = 0; i < third; i++) {
      out.push([0, 1, 2].flatMap((k) => rows[i + k * third] ?? ['', '']).map(String));
    }
    return out;
  };

  return `<!-- Generated by \`npm run lexicon\`. Do not edit by hand. -->

# His lexicon, counted from the transcriptions

Built from **${x.files} batch files across ${x.folders.length} folders, ${x.pages} transcribed pages**, by \`scripts/lexicon.mjs\`. Words appearing fewer than ${x.min} times are omitted here; \`lexicon.json\` carries the full counts.

> **This is a witness to vocabulary, not to ink.** It is derived from first-pass
> machine transcriptions, **none of which has been checked against the leaves by
> a human** (\`transcripts/status.json\` records the checked ones, and there are
> none). Use it the way it is meant: to narrow a field of candidates for a
> stroke you cannot read. Never cite it as evidence that a particular page says
> a particular word — that is exactly the claim it cannot support.

Counted from his prose only. The transcriber's \`\\note{}\`, the editorial
\`\\add{}\`, the section headings and the preamble are excluded, or the list
would describe the apparatus rather than the material. \`\\struck{}\` and
\`\\marginal{}\` are counted — struck out is still written, and his margin is
his. Only \`.fr.tex\` is read: the modernised readings are in current French by
design.

**The corpus is bilingual, and not all of it is his.** Whole runs are in English
— his own reading notes on a typescript, and correspondence in both directions.
Letters *to* him are transcribed like everything else and cannot be separated
out mechanically, so a few hundred words here are Murre's rather than
Germain's. Grammar words of both languages are filtered; the rest stands.

## His register

${table(cols(x.sure.slice(0, SHOWN * 3)), ['word', 'n', 'word', 'n', 'word', 'n'])}

## Abbreviations

Half of how he writes, and what most defeats a reader coming to the hand cold.

${table(cols(x.abbreviations.slice(0, SHOWN)), ['abbr.', 'n', 'abbr.', 'n', 'abbr.', 'n'])}

## Notation

Macros counted inside mathematics — what the notation of this fonds actually consists of.

${table(cols(x.macros.slice(0, SHOWN)), ['macro', 'n', 'macro', 'n', 'macro', 'n'])}

## Read only as doubtful, never plainly

Every occurrence of these is inside \`\\uncertain{}\`. **No pass has once been
confident of them.** A word here is a standing question, and finding it in a
candidate list is a reason to look harder at the page, not a reason to accept it.

${table(cols(x.onlyDoubtful.slice(0, SHOWN)), ['word', 'n', 'word', 'n', 'word', 'n'])}
`;
}

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--min');
  const min = i >= 0 ? Number(args[i + 1]) : DEFAULT_MIN;
  if (!Number.isFinite(min) || min < 1) throw new Error('--min wants a number ≥ 1');

  const x = await build(min);
  if (!x.files) throw new Error(`no transcriptions under ${SOURCE.replace(ROOT + '/', '')}`);

  await mkdir(OUT, { recursive: true });
  await writeFile(resolve(OUT, 'lexicon.md'), markdown(x));
  await writeFile(
    resolve(OUT, 'lexicon.json'),
    `${JSON.stringify(
      {
        generatedFrom: { files: x.files, folders: x.folders, pages: x.pages, min: x.min },
        caveat:
          'Derived from unverified first-pass transcriptions. A witness to vocabulary, not to ink.',
        register: Object.fromEntries(x.sure),
        abbreviations: Object.fromEntries(x.abbreviations),
        macros: Object.fromEntries(x.macros),
        doubtful: Object.fromEntries(x.doubtful),
        onlyDoubtful: Object.fromEntries(x.onlyDoubtful),
      },
      null,
      2,
    )}\n`,
  );

  process.stdout.write(
    `${x.files} batches, ${x.pages} pages → ` +
      `${x.sure.length} words, ${x.abbreviations.length} abbreviations, ` +
      `${x.macros.length} macros, ${x.onlyDoubtful.length} doubtful-only\n` +
      `  ${resolve(OUT, 'lexicon.md').replace(ROOT + '/', '')}\n` +
      `  ${resolve(OUT, 'lexicon.json').replace(ROOT + '/', '')}\n`,
  );
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
