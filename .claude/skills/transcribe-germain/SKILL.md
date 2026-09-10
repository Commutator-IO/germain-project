---
name: transcribe-germain
description: Transcribes a batch of twenty Gallica views from the digitised papers of Sophie Germain (Bibliothèque nationale de France, Français 9115, 9117, 9118, NAF 4073) into clean LaTeX with a critical apparatus — what was read, what was guessed, what is illegible, and the folio where the pencil can be read. Use whenever someone asks to transcribe, decipher, read or put into LaTeX any views of Germain's manuscripts, or names a volume, a batch, or one of the cahiers (élasticité, Fermat, nombres, correspondance). Transcription only — the modernised reading has its own skill, /modernize-germain. Also covers revisions — correcting a reading, filling a skipped view, locating a folio the literature cites.
---

# Transcribing a batch of the Sophie Germain papers

**Runs on Fable 5.1 or Opus 5, and on nothing else.** Before reading a single
view, check which model the session is on:

- **Fable 5.1 (`claude-fable-5-1`)** — the default. Choose it unless there is a
  reason not to.
- **Opus 5 (`claude-opus-5`)** — permitted, for the standing question of
  whether it reads a hand of 1810 better and at what cost.
- **Anything else** — stop, say which model the session is on, and do not
  transcribe. A pass on a model nobody chose produces a file whose provenance
  is an accident.

**The header comment must record the model actually used**, in the form
`% Pass: Fable 5.1 (claude-fable-5-1), <date> — first pass, unchecked against
the views by a human.` Report the model in the closing message too.

**Comparing models.** A run made to compare re-transcribes a batch that already
has a transcription, and must not overwrite it: work on a git branch
(`git switch -c opus-fr-9115-3`) so the two readings can be diffed. Only a batch
with no transcription yet is written straight to `main`.

## What this produces

For **one batch of twenty views**, one LaTeX file:

| File | Contents |
|---|---|
| `transcripts/<volume>/batch-NN.fr.tex` | The transcription — the views as written, in French, with the apparatus |

One further edition derives from it, with its own skill, run afterwards and
**per volume, not per batch**: `/modernize-germain <volume>` writes
`<volume>.modern.tex` once every batch of the volume is transcribed.

**Two things govern everything below.**

**The LaTeX is clean and about what she wrote.** Not a diplomatic edition. The
binding, the microfilm's targets, the BnF's stamps, a blank verso — not the
subject. What stays is the mathematics and the prose around it, which in
Germain's case is often the best of it: she explains what she is trying to do.

**The edition stays separate.** No summary opens it, no modernisation creeps
into it. The derived edition is another skill's work, done afterwards, from
this file and never from the images.

**One batch per pass, never two. One batch per conversation.** Past twenty
views the quality of reading degrades towards the end of the pass with nothing
to signal it. A fresh context per batch is what keeps view 18 read as carefully
as view 2.

## Before anything: what these views are, and what they are not

### Only what is online can be transcribed — and only from the mirror

Four volumes are digitised, all at the BnF: Français 9115 (750 views),
Français 9117 (113), Français 9118 (103), NAF 4073 (44). **Nothing else.** The
three prize memoirs at the Académie, Français 9114 and 9116, the Florence
papers and the Göttingen letters are not online, and this skill refuses to
work from anything but Gallica's images of a digitised volume:

- **not from a reproduction in a publication** (the France Mémoire article
  reproduces two extracts credited to the Académie — those are the Académie's
  photographs and are not read here);
- **not from somebody else's transcription.** Grun's Annexe D transcribes the
  three memoirs; Del Centina transcribes the Florence draft and the 1819 letter.
  Those texts are theirs. Never open them to seed a reading, never copy a line,
  and never write a file under `ads-1811`, `moreniana-nfl` or `sub-gauss`. If
  asked to, say why not and point at `/sources/`.

The pass reads the local mirror:

```bash
npm run archive -- fr-9115 --batches 3      # once; git-ignored; paused
npm run tiles -- fr-9115 3                  # six regions per view, from Gallica
```

`archives/fr-9115/f0041.jpg` … `f0060.jpg` are the batch. Never fetch from
Gallica in a loop yourself: Gallica rate-limits and answered a burst with
connection resets on 10 September 2026.

### They are her working papers, unsorted

The BnF bound what Libri had as « Recueil de dissertations et problèmes
mathématiques et physiques », three volumes, numbered by the archive and by
nobody else. A fair copy of a Fermat manuscript sits next to a leaf of
arithmetic; number theory next to plates. **Do not sort.** A batch is twenty
consecutive views, whatever they hold, and the file's header says what they
turned out to hold — that sentence is, for now, the only subject index the
volume has.

### Three numberings overlap

1. **Gallica's views** — `f1`, `f2`, … one per image, labelled « NP » in the
   manifest. **`\page{N}` always takes the view number.** It is the only
   numbering a machine can address, and it drives the facsimile.
2. **The BnF's pencilled foliation** — « 198 » on the recto, the same leaf's
   verso being 198v. This is what the literature cites: Laubenbacher and
   Pengelley's Manuscript C is « Français 9115, ff. 348r–349r ». Where the
   pencil is legible, record it once per view: `\page{41}\folio{20r}`. **Never
   infer a folio** from the view number — the relation is not two-to-one, there
   are guard leaves and blanks. A folio the pencil does not give is not written.
3. **Her own pagination**, on the fair copies. Where it is visible and useful,
   `\note{pagination de l'auteur : 13}`.

Locating a folio the literature cites is a legitimate task of this skill: read
the pencil on the views of a batch, and when a cited folio is found, say so in
the closing message so that `src/content/pieces.json` can record the view.

### The hand, the spelling, the notation

Read `references/hand.md` before the first view. In short:

- **Spelling of her time stays.** « seroit », « avoit », « connoître »,
  « très-grand », « tems ». Do not modernise; do not flag as sic.
- **Abbreviations stay** as written: « Mr », « Mlle », « &c », « c. à d. ».
- **Notation of 1800 stays.** The congruence sign as she draws it, Legendre's
  residue language, round `d` for partial derivatives, « le nombre 2Np + 1 »
  set as she sets it. The modernised reading translates; this file does not.
- **Her letters to and from correspondents** (Français 9118, NAF 4073) are
  prose with mathematics in it; the prose is transcribed whole. Salutations
  and dates are content — a dated letter is one of the few dated things in the
  corpus.

### Almost nothing is dated, and the catalogue's dating is copied verbatim

`\dating{}` takes the catalogue's own words — `1801-1900` for Français 9115,
`XVIIIe siècle` for NAF 4073 (which is the BnF's claim and plainly loose for
several letters). Never convert to a year, never infer. A date on the leaf is
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

### Titles in brackets are not hers

The catalogue's title is the BnF's and is copied into `\foldertitle{}`. A
title this project supplied is in [brackets] in `holdings.json`; keep the
brackets.

## The sequence

### 1. Read the twenty views through, before writing a line

Open every `f00NN.jpg` of the batch with the file-reading tool, and the tiles
under `archives/tiles/<volume>/f<N>/` for anything small. Make one complete
pass producing nothing, and note:

- **Which views carry text and which do not.** A blank verso, a guard leaf, a
  microfilm target: absent from the output, no placeholder. The gap in the
  numbering is the record.
- **What the batch is.** A fair copy or a draft? Number theory, elasticity, a
  letter? Where does a piece begin and end — does the text of view 41 continue
  on view 42, or is 42 a different sheet? Say so in the header comment; it is
  the only subject index there is.
- **The notation of this batch**, fixed once and held to.
- **The foliation**, view by view, where the pencil can be read.

### 2. Transcribe

`\page{N}` at the start of each transcribed view, in order, with `\folio{}`
when read. Then:

1. **Mathematics and her prose together.** Unlike the parent project's
   subject, Germain writes to explain; her sentences about why she takes a
   route are content. Transcribe them whole.
2. **Uncertainty is marked, not resolved.** `\ill{}` for what cannot be read,
   `\uncertain{}` for a reading offered with doubt. An invented word that reads
   like the others is the worst possible outcome.
3. **The language stays hers — and so does yours.** `\note{}` and `\marginal{}`
   are French. The whole file is French; only the header comment is English.
4. **What she struck out stays**, as `\struck{}`. A deletion in a draft shows
   the thought changing direction, and the Fermat drafts are full of them.
5. **A wrong calculation stays wrong**, with a `\note{}`. The 1811 equation was
   wrong; a transcription that fixed it would be transcribing nothing.

#### The apparatus

| Macro | Use |
|---|---|
| `\page{41}` | Gallica view 41 begins — drives the facsimile |
| `\folio{20r}` | the BnF's pencilled folio, where legible — never inferred |
| `\ill{}` | illegible — **never guessed** |
| `\uncertain{mot}` | a reading offered, and flagged as doubtful |
| `\add{s}` | an editorial addition |
| `\struck{mot}` | struck out by Germain |
| `\note{…}` | the transcriber's note — French, about the text |
| `\marginal{…}` | a marginal note **of hers** |

#### The permitted LaTeX subset

`scripts/render.mjs` understands a subset, deliberately. Allowed: `\section`
`\subsection` · paragraphs separated by a blank line · `\emph` `\textbf`
`\textit` `\texttt` · `itemize` `enumerate` `quote` · `$…$` `\(…\)` `\[…\]`
`equation` `align` `gather` `cases` `array` and the matrix environments · the
eight macros above. Stepping outside makes rendering fail loudly, which is
the wanted behaviour. Extending the subset means extending
`scripts/render.mjs` and `scripts/tei.mjs` in the same commit.

Old notation that LaTeX has no glyph for — her congruence sign drawn as a
triple bar with a hook, a bracket she uses for the residue — is set with the
nearest standard symbol and noted **once** in the header comment.

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
which views were skipped and why; every `\ill{}`; every folio read, and any
cited folio located (so `pieces.json` can be updated); anything the pass could
not settle.

## What not to do

- **Work from anything but the mirror of a digitised volume.** See above.
- **Copy a published transcription.** Not a line, not to check a word.
- **Guess a folio** from a view number.
- **Modernise** the spelling, the notation, or the argument.
- **Summarise.** The résumé is the modernised reading's, and it comes later.
- **Transcribe two batches in one conversation.**
- **Write English inside the file.** Only the header comment.
