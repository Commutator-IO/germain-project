---
name: find-novelty
description: Reads a volume's modernised reading and its transcriptions and proposes candidate findings — statements the leaves establish that may not stand in the published literature on Sophie Germain, or facts about the object (a folio located, two drafts identified as one text) — each written as a claim about the literature rather than about Germain, with what was searched, what part of it is the edition's own, and what would settle it. Writes them into src/content/findings.ts. Use when someone asks what is new in a volume, what these leaves have that the literature does not, or to re-check candidates already listed. Never asserts priority from an inferred date.
---

# Looking for what is not in the literature

**Runs on the model that wrote the volume's modernised reading**, and on
nothing else; open the reading, read its header, stop if the session is on a
different model.

## The thing this skill is for, and the thing it must not do

Germain's number theory is, by the account of the people who have read most of
it, largely unread: Laubenbacher and Pengelley say plainly that they read the
part bearing on Fermat and that 150 to 200 pages remain; Del Centina and
Fiocca found results on power residues nobody had attributed to her. So a
volume of Français 9115 may well contain a statement the literature on Germain
does not record. Finding those is worth doing. It is also the most dangerous
operation in this project, because the failure mode is **a false claim about
what historians did not notice**, published under her name.

> **A novelty is a claim about the literature, not about the manuscript.**
> The manuscript can be read. The literature can only be *searched*, never
> exhausted. Every entry is therefore provisional, and says what was searched.

Three rules, not negotiable.

**Priority only from a date on paper.** Germain's letters are dated and the
memoirs are registered, so — unlike the parent project's fonds — a claim about
*when* she had a result is sometimes checkable. It is checkable **only** from a
date written on the leaf, a dated letter that cites the result, or the
Académie's registry; never from an inference about ink or content. An entry of
kind `historical` names the dated source; without one it is `unsearched` and
says why.

**Say what was searched, by name.** « Not in Laubenbacher and Pengelley 2010,
§§ 3–5, nor in Del Centina 2008, nor in Del Centina and Fiocca 2012 » is a
finding. « Not in the literature » is a feeling.

**Separate the manuscript's part from ours.** Where the modernised reading
supplied a hypothesis or completed a step, the `ours` field says so.

## The two sources this skill may read, and the ones it may not

It reads `transcripts/<volume>/batch-NN.fr.tex` and
`transcripts/<volume>/<volume>.modern.tex`. It **searches** the literature —
the open papers on arXiv and in the open archives of Historia Mathematica,
Grun's thesis, the printed « Recherches » — to see whether a statement is
there. It never copies from them, and it never reads the images.

## Kinds

- `mathematical` — a statement the leaves establish that the literature on
  Germain does not record.
- `historical` — a dating or attribution, from a dated source named in
  `basis`.
- `codicological` — about the object: a folio the literature cites located at
  a view; two drafts recognised as one text; a leaf bound out of sequence.
  These carry the least risk and the most immediate use — the first one this
  skill is likely to write is « Manuscript C, ff. 348r–349r, is at views N–M »,
  which is what lets `pieces.json` be filled.

## The entry

Entries live in `src/content/findings.ts`, typed by `Finding`:

| field | what it holds |
|---|---|
| `id` | stable slug, `<volume>-<short-name>` |
| `cote`, `pages` | the volume and the views the claim rests on |
| `kind` | `mathematical` · `historical` · `codicological` |
| `claim` | one sentence, English |
| `basis` | what in the volume supports it — for `historical`, the dated source |
| `ours` | what the edition supplied, or `null` |
| `literature` | the sources actually searched, by name and section |
| `status` | `unsearched` · `candidate` · `matched` · `confirmed` (a person only) |
| `settle` | the one check that would decide it |

## The sequence

1. Read the volume's transcriptions and its modernised reading, whole.
2. List every place the reading names a modern theorem, supplies a hypothesis,
   completes a step, or says the leaf leaves something unverified; and every
   `\folio{}` that matches a folio the literature cites.
3. Drop the matches. For each survivor, write the claim as a single sentence
   and ask what would refute it.
4. Search, by name and section. Record what was searched even when it found
   nothing.
5. Write the entries.
6. Check every entry against the transcription for `\uncertain{}` and `\ill{}`
   under it.
7. `npm run lint && npx tsc -b`.

## What not to do

- **Claim priority from an inference.**
- **Grow the list.** A pass that marks two old entries `matched` has done its
  job.
- **Write for effect.** « Remarkable », « ahead of her time » — out.
- **Set `confirmed`.** Only a person may.
