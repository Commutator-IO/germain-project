---
name: modernize
description: Produces the modernised reading of an already-transcribed volume of the catalogue — a mathematician's manuscripts digitised in Gallica (Fourier, Mersenne, Descartes, Fermat, Pascal, Sophie Germain…) — taken whole, all its batches in one pass, as a single document for the shelfmark — a summary (« Résumé ») that orients a reader new to the subject, then the mathematics in current notation and current names, in French, mathematically correct as it stands, with footnotes carrying everything the transcription's critical apparatus carried and every translation of the period's notation. Use when someone asks to modernise, restate, summarise or explain a transcribed volume ("modernize fr-9115", "give the modern reading", "explain these leaves"), or after /transcribe has transcribed a volume's batches. Also covers revisions.
---

# The modernised reading of a volume

**Runs on Fable 5.1 or Opus 5, and on nothing else.** Check before reading a
line of the transcription; stop if the session is on anything else. The header
records which one ran.

## What this produces

**The unit is the volume, not the batch.** Transcription is cut to twenty
views because reading that much handwriting is as far as one pass carries.
This edition reads typed LaTeX and has the opposite need: to make an argument
run continuously, and an argument does not stop at view 20 — Germain's memoir
on the curvature of surfaces runs over forty-seven views.

```
/modernize fr-9115
```

writes, in that one pass, **one file for the whole shelfmark**:

| File | Contents |
|---|---|
| `transcripts/<volume>/<volume>.modern.tex` | one résumé, then the mathematics in today's notation and names — **in French** |

It is an **interpretation, not a transcription**. Where it and the
transcription disagree in substance, the transcription is the record. Anyone
citing the manuscript cites `batch-NN.fr.tex`; this edition is for reading.

**Precondition: the transcriptions exist.** This skill reads
`batch-NN.fr.tex`, never the images, and never anybody else's transcription or
edition — not a printed Pensées, not Adam and Tannery, not the Œuvres de Fermat
as a substitute for a manuscript. If a batch has no
transcription, stop and say which. Where a volume is only partly transcribed,
say so and offer the choice; do not decide it silently.

## The one thing that differs from the parent skill: the notation is centuries old

The parent project modernises a hand of the 1960s into the 1990s. Here the
distance is from 1575, 1640 or 1810 to today, and every translation is a claim.
Say what the leaf wrote, the first time, in a footnote; then write today's form.
The kinds of translation that recur:

- **Notation → notation.** Viète's cossic « A quadratum in B » and his
  homogeneity; Descartes's sign of equality; Fermat's « adæqualitas »; Legendre's
  « $a$ est résidu $p^{\text{ième}}$ de $\theta$ » in Germain, which becomes
  « $a$ est une puissance $p$-ième modulo $\theta$ »; Fourier's integrals and
  series before the notation settled.
- **Words → names.** « Nombres premiers de la forme $2Np+1$ » → auxiliary
  primes, with the modern statement of Sophie Germain's theorem where the leaf
  proves it — footnoting that the name is Legendre's 1823 attribution. Sums of
  curvatures → the biharmonic operator. The « surface des distances moyennes » →
  mean curvature. A name is attached only where the statement coincides.
- **Derivation → proof.** Where a derivation is not one by today's standards,
  say so plainly, and say what would make it one.
- **What the writer could not have known.** Later results — Kummer, Kirchhoff,
  Cauchy's rigour, the modern proof of Fermat — are named where they illuminate,
  with a footnote that the leaf predates them. This is where priority questions
  live; do not imply a writer cited work they did not.

## The summary

`\section*{Résumé}` first, inside `\begin{resume} … \end{resume}`, one page or
two, for someone with a first degree in mathematics and no more — and **do not
say so**. Four questions in order: de quoi ces feuillets parlent-ils ; quel
problème ; quelle idée ; où cela mène-t-il, et quels noms modernes chercher.
One thing belongs here whenever the volume offers it: **the writer's own
account of what they were trying to do** — letters and the openings of fair
copies are full of it, and it needs no background at all.

The résumé closes with

```latex
\keywords{Sophie Germain's theorem, auxiliary primes, power residues}
```

**in English**, three to six terms for a short volume, more for a large one —
the single source of the volume's tags.

## The standard: correct as it stands

Held to being **mathematically correct as written**. Where the leaf is loose,
elliptical or wrong, state what is true and footnote what the leaf has.
A modernised reading that repeated a claim the leaf does not prove would
launder the error — Laubenbacher and Pengelley show that several of Germain's
claims about $N$ hold only for $N = 1$ and $2$. Four failure modes to check:
implicit hypotheses (a prime assumed without saying), containments upgraded to
equalities, a case claimed and not proved, and modern names attached to
statements that do not quite coincide.

## The apparatus becomes footnotes

No `\ill{}`, no `\uncertain{}`, no brackets — everything the transcription's
apparatus carried moves into `\footnote{}`. **No `\page{}` — but
`\pagerange{first}{last}` at each section**, in Gallica views, as the first
thing in the block with the `\section*`, grounded in the transcription's own
`\page{}` marks. Folios cited by the literature go in the section title as
prose: « Le manuscrit sur les exposants pairs (ff. 348r–349r, vues 700 à 703) ».
A Latin or Italian volume is still read in French; quotations of the leaf stay
in its language, translated in a footnote.

## Language and form

**In French.** Modern names in their French forms. The document takes
`\input{../preamble/germain}` and the volume's metadata — `\folder`,
`\shelfmark`, `\pages{first}{last}` for the whole span, `\dating` copied from
the transcriptions, `\foldertitle` ending « — lecture modernisée du volume
entier », and **no `\batch`**. Then the pass header comment, and

```latex
\watermark{Lecture automatique\\interprétation non vérifiée}
```

Structure with `\section*` and `\subsection*` following the argument, not the
views. Stay inside the transcribe skill's LaTeX subset plus `\footnote{}` and
`\pagerange{}{}`.

## The sequence

1. Read **every** `batch-NN.fr.tex` of the volume, in order, twice — once for
   the mathematics, once listing every `\uncertain{}`, `\ill{}`, `\note{}` and
   `\folio{}`. Read the header comments: they say what each batch turned out
   to hold, which for an unsorted volume is the map.
2. Identify the **spine**. For an unsorted volume there may be several: the pieces
   the literature located, and the runs of leaves that belong together though
   nobody has said so. Write the plan down. A volume that is number theory on
   one leaf and plates on the next gets sections that say so, and the résumé
   says the volume is unsorted rather than pretending a thread.
3. Write the body, in the order the plan gives, holding to the standard.
   Every departure from the leaf gets a footnote at the point of departure.
4. Write the résumé **last**, and close it with `\keywords{}`.
5. Re-read against the plan.
6. `npm run render && npm run pdf && npm run manifest` — confirm the manifest
   keys the reading **by volume**, zero `katex-error`, no overfull lines.

## What not to do

- **Transcribe**, or read the images.
- **Read another edition to fill a gap.** If the transcription is missing a
  word, the reading says so; it does not fetch the word from a printed
  edition.
- **Preserve an error out of respect.** Footnote it and state the truth.
- **Claim priority.** « Il est le premier » needs a date the leaf does not
  have; the findings skill is where such a claim is examined, against sources.
- **Write English**, except `\keywords{}`.
- **Split the volume across one file per batch.**
