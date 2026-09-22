---
name: transcribe
description: Transcribes a batch of twenty Gallica views from a volume in this site's catalogue — the digitised archives of mathematicians in Gallica (Fourier, Mersenne, Descartes, Fermat, Pascal, Roberval, Sluse, Viète, Émilie du Châtelet, d'Alembert, Lagrange, Condorcet, Sophie Germain, Libri, Prony…) — into clean LaTeX with a critical apparatus: what was read, what was guessed, what is illegible, and the folio where the library's foliation can be read. Use whenever someone asks to transcribe, decipher, read or put into LaTeX any views of these manuscripts, or names a volume (fr-22510, naf-5160, latin-10247…), a batch, a mathematician, or one of the cahiers (XVIIᵉ, XVIIIᵉ, XIXᵉ). Transcription only — the modernised reading has its own skill, /modernize. Also covers revisions — correcting a reading, filling a skipped view, locating a folio the literature cites.
---

# Transcribing a batch of a mathematician's manuscripts

**Runs on Opus 5.5 or Opus 5, and on nothing else.** Before reading a single
view, check which model the session is on:

- **Opus 5.5 (`claude-opus-5-5`)** — the default. Choose it unless there is a
  reason not to.
- **Opus 5 (`claude-opus-5`)** — permitted. It made most of the passes so far,
  and a revision of one of its batches may stay on it.
- **Anything else** — stop, say which model the session is on, and do not
  transcribe. A pass on a model nobody chose produces a file whose provenance
  is an accident.

**The header comment must record the model actually used**, in the form
`% Pass: Opus 5.5 (claude-opus-5-5), <date> — first pass, unchecked against
the views by a human.` Report the model in the closing message too.

**Comparing models.** A run made to compare re-transcribes a batch that already
has a transcription, and must not overwrite it: work on a git branch
(`git switch -c opus-fr-9115-3`) so the two readings can be diffed. Only a batch
with no transcription yet is written straight to `main`.

## What this produces

For **one batch of twenty views**, one LaTeX file:

| File | Contents |
|---|---|
| `transcripts/<volume>/batch-NN.fr.tex` | The transcription — the views as written, in the language of the volume, with the apparatus |

The suffix stays `.fr` whatever the language of the leaves: it names the
edition (the transcription), not the language. One further edition derives from
it, with its own skill, run afterwards and **per volume, not per batch**:
`/modernize <volume>` writes `<volume>.modern.tex` once every batch of the
volume is transcribed.

**Two things govern everything below.**

**The LaTeX is clean and about what was written.** Not a diplomatic edition.
The binding, the microfilm's targets, the library's stamps, a blank verso — not
the subject. What stays is the mathematics and the prose around it, which is
often the best of it: a letter says why a route was taken.

**The edition stays separate.** No summary opens it, no modernisation creeps
into it. The derived edition is another skill's work, done afterwards, from
this file and never from the images.

**One batch per pass, never two. One batch per conversation.** Past twenty
views the quality of reading degrades towards the end of the pass with nothing
to signal it. A fresh context per batch is what keeps view 18 read as carefully
as view 2.

## Before anything: what these views are, and what they are not

### Only a volume in the catalogue, and only from the mirror

The catalogue is `src/content/holdings.json` (generated into
`src/content/catalogue.ts`): 78 volumes, every one digitised and served whole by
Gallica, grouped by mathematician. **Nothing else is transcribed here** — not a
manuscript that is not digitised, not one Gallica merely references on a
partner's site, and this skill refuses to work from anything but Gallica's
images of a volume in the catalogue:

- **not from a reproduction in a publication**, whoever's photograph it is;
- **not from somebody else's transcription or edition.** Many of these volumes
  are edited — the Pensées many times over, Descartes's letters in Adam and
  Tannery, Fermat's in his Œuvres, Germain's letters to Gauss. Those texts are
  theirs, or are a different object. Never open them to seed a reading, never
  copy a line, never use one to settle an illegible word. If asked to, say why
  not and point at `/sources/`.

The pass reads the local mirror:

```bash
npm run archive -- fr-22510 --batches 3     # once; git-ignored; paused
```

`archives/fr-22510/f0041.jpg` … `f0060.jpg` are the batch. Never fetch from
Gallica in a loop yourself: Gallica rate-limits (HTTP 429, and connection resets
on 10 September 2026), and a batch can take the better part of an hour to
mirror. **Read from crops of the mirror, not from new requests.** The mirror's
JPEGs are the full-resolution IIIF canvases, so cutting them locally with
ImageMagick gives exactly the pixels `npm run tiles` would ask Gallica for, at
no cost to Gallica. What reads well: four full-width horizontal bands per view
(12 % overlap) resized to 2400 px wide, and a tight crop resized to ~1800 px for
a struck, overwritten or cramped word. A 1000-px thumbnail of each view is the
cheap way to find blank versos first. `npm run tiles` is for when there is no
mirror.

### Working papers are unsorted; do not sort

Several volumes are a writer's desk bound as it came — Fourier's calculations,
Germain's « dissertations et problèmes », Roberval's papers: fair copies next to
scratch paper, one subject next to another, numbered by the archive and by
nobody else. **Do not sort.** A batch is twenty consecutive views, whatever they
hold, and the file's header says what they turned out to hold — that sentence
is, for now, the only subject index the volume has. Letter volumes are the
opposite case: say where each letter begins and ends, who writes to whom, and
the date.

### Three numberings overlap

1. **Gallica's views** — `f1`, `f2`, … one per image, mostly labelled « NP » in
   the manifest. **`\page{N}` always takes the view number.** It is the only
   numbering a machine can address, and it drives the facsimile.
2. **The library's foliation** — usually pencilled, thin and grey, at the top
   right of the **recto** only; the verso of folio 198 is 198v. This is what the
   literature cites. Where it is legible, record it on that recto:
   `\page{41}\folio{20r}`. **Never infer a folio**: not from the view number
   (guard leaves and blanks break any ratio), not for a verso from the recto
   before it, not by counting on from a neighbour when the figure itself is
   unreadable. A folio the leaf does not give is not written; say in a note what
   is there instead.
3. **The writer's own pagination** — usually in ink, often struck through when
   the leaves were renumbered. It is not a folio: record it in a `\note{}`, and
   in the header, as read.

Tell 2 from 3 by the stroke, not by the position alone: the foliation is one
series, one number per leaf across the whole volume, in a finer, paler hand
than the text. Where a batch cannot tell, say so and write no `\folio{}`.

Locating a folio the literature cites is a legitimate task of this skill: read
the foliation on the views of a batch, and when a cited folio is found, say so
in the closing message so that `src/content/pieces.json` can record the view.

### The hand, the spelling, the notation

Read `references/hand.md` before the first view — it is organised by
mathematician; add to the right section what this pass settles. In short:

- **Spelling of the writer's time stays.** « seroit », « avoit », « scavoir »,
  « tems », Latin as written. Do not modernise; do not flag as sic. A long *s*
  is transcribed as *s*, and said once in the header.
- **Abbreviations stay** as written: « Mr », « &c », « c. à d. », Latin
  contractions. Expand one only in a `\note{}`.
- **The notation of the period stays** — Viète's cossic signs, Descartes's sign
  of equality, Legendre's residue language in Germain, round `d` for partial
  derivatives, integrals written before the notation settled. The modernised
  reading translates; this file does not.
- **Letters** are prose with mathematics in it; the prose is transcribed whole.
  Salutations, signatures, addresses and dates are content — a dated letter is
  one of the few dated things in many of these volumes.

### The catalogue's dating is copied verbatim

`\dating{}` takes the catalogue's own words — `1601-1700`, `1801-1900`,
`XVIIIe siècle`. Never convert to a year, never infer. A date on the leaf is
transcribed where it stands; a date a pass deduces from content goes in a
`\note{}` as the pass's own inference.

### The file declares its own status

Right after `\dating{}`:

```latex
\watermark{Lecture automatique\\non vérifiée}
```

The manuscripts are in the public domain; what this line declares is a
quality, not a right — an unverified first pass by a machine. The preamble
prints it in the title block and diagonally across every PDF page. Never omit
it.

### Titles in brackets are not the library's

The catalogue's title is the holder's and is copied into `\foldertitle{}`. A
title this project supplied is in [brackets] in `holdings.json`; keep the
brackets.

## The sequence

### 1. Read the twenty views through, before writing a line

Open every view of the batch (as bands and crops of the mirror, above). Make one
complete pass producing nothing, and note:

- **Which views carry text and which do not.** A blank verso, a guard leaf, a
  microfilm target: absent from the output, no placeholder. The gap in the
  numbering is the record.
- **What the batch is.** A fair copy, a draft, a copy in another hand, letters?
  Which subject? Where does a piece begin and end — does the text of view 41
  continue on view 42, or is 42 a different sheet? Say so in the header comment;
  it is the only subject index there is.
- **The notation of this batch**, fixed once and held to.
- **The numbers on the leaves**, view by view: foliation, pagination, anything
  else — and which is which.

Write each view's draft to a scratch file as soon as it is read, and assemble
the transcript from the drafts: a long pass can lose its earliest views to
context compaction, and a draft on disk cannot be lost.

### 2. Transcribe

`\page{N}` at the start of each transcribed view, in order, with `\folio{}`
when read. Then:

1. **Mathematics and prose together.** A writer's sentences about why a route
   is taken are content. Transcribe them whole.
2. **Uncertainty is marked, not resolved.** `\ill{}` for what cannot be read,
   `\uncertain{}` for a reading offered with doubt. An invented word that reads
   like the others is the worst possible outcome.
3. **The text stays in its language; the apparatus is French.** Latin is
   transcribed as Latin, Italian as Italian. `\note{}` is French. Only the
   header comment is English.
4. **What was struck out stays**, as `\struck{}`. A deletion in a draft shows
   the thought changing direction.
5. **A wrong calculation stays wrong**, with a `\note{}`. A transcription that
   fixed it would be transcribing nothing.

#### The apparatus

| Macro | Use |
|---|---|
| `\page{41}` | Gallica view 41 begins — drives the facsimile |
| `\folio{20r}` | the library's folio on a recto, where legible — never inferred |
| `\ill{}` | illegible — **never guessed** |
| `\uncertain{mot}` | a reading offered, and flagged as doubtful |
| `\add{s}` | an editorial addition |
| `\struck{mot}` | struck out by the writer |
| `\note{…}` | the transcriber's note — French, about the text |
| `\marginal{…}` | a marginal note **of the writer's** |

#### The permitted LaTeX subset

`scripts/render.mjs` understands a subset, deliberately. Allowed: `\section`
`\subsection` · paragraphs separated by a blank line · `\emph` `\textbf`
`\textit` `\texttt` `\textsuperscript` · `itemize` `enumerate` `quote` · `$…$`
`\(…\)` `\[…\]` `equation` `align` `gather` `cases` `array` and the matrix
environments · the eight macros above. Stepping outside makes rendering fail
loudly, which is the wanted behaviour. Extending the subset means extending
`scripts/render.mjs` and `scripts/tei.mjs` in the same commit.

Old notation that LaTeX has no glyph for is set with the nearest standard symbol
and noted **once** in the header comment. A figure or a plate is not drawn:
describe it in a `\note{}`, with its lettering.

Write files with a heredoc, the Write tool or a script — not with zsh's `echo`,
which turns `\e` in `\end{document}` into an escape byte.

### 3. Check

```bash
npm run render      # fails loudly if the subset was left
npm run pdf         # compiles the PDF
npm run manifest    # declares the file to the site
```

Then read the rendered view **beside the facsimile**, on the cahier page —
`npm run dev`, open the volume, open the batch. Scrolling the transcript turns
the views. The reading view must contain zero `katex-error` nodes, and the PDF
no overfull lines.

### 4. Report

In the closing message: the model; what the twenty views turned out to hold;
which views were skipped and why; every `\ill{}`; every number read on the
leaves and which kind it is; any cited folio located (so `pieces.json` can be
updated); anything the pass could not settle.

## What not to do

- **Work from anything but the mirror of a volume in the catalogue.** See above.
- **Copy a published transcription or edition.** Not a line, not to check a word.
- **Guess a folio** — from a view number, from the recto before, from the series.
- **Modernise** the spelling, the notation, or the argument.
- **Summarise.** The résumé is the modernised reading's, and it comes later.
- **Transcribe two batches in one conversation.**
- **Write English inside the file.** Only the header comment.
