---
name: modernize-germain
description: Produces the modernised reading of an already-transcribed volume of the Sophie Germain papers — taken whole, all its batches in one pass, as a single document for the shelfmark — a summary (« Résumé ») that orients a reader new to the subject, then the mathematics in current notation and current names, in French, mathematically correct as it stands, with footnotes carrying everything the transcription's critical apparatus carried and every translation of her 1800s notation. Use when someone asks to modernise, restate, summarise or explain a transcribed volume ("modernize fr-9115", "give the modern reading", "explain these leaves"), or after /transcribe-germain has transcribed a volume's batches. Also covers revisions.
---

# The modernised reading of a volume

**Runs on Fable 5.1 or Opus 5, and on nothing else.** Check before reading a
line of the transcription; stop if the session is on anything else. The header
records which one ran.

## What this produces

**The unit is the volume, not the batch.** Transcription is cut to twenty
views because reading that much handwriting is as far as one pass carries.
This edition reads typed LaTeX and has the opposite need: to make an argument
run continuously, and Germain's arguments do not stop at view 20 — the
« Remarques » run to twenty sheets and thirteen sections.

```
/modernize-germain fr-9115
```

writes, in that one pass, **one file for the whole shelfmark**:

| File | Contents |
|---|---|
| `transcripts/<volume>/<volume>.modern.tex` | one résumé, then the mathematics in today's notation and names — **in French** |

It is an **interpretation, not a transcription**. Where it and the
transcription disagree in substance, the transcription is the record. Anyone
citing Germain cites `batch-NN.fr.tex`; this edition is for reading.

**Precondition: the transcriptions exist.** This skill reads
`batch-NN.fr.tex`, never the images, and never anybody else's transcription —
not Grun's of the memoirs, not Del Centina's of the Florence draft, not the
1821 « Recherches » as a substitute for a manuscript. If a batch has no
transcription, stop and say which. Where a volume is only partly transcribed,
say so and offer the choice; do not decide it silently.

## The one thing that differs from the parent skill: her notation is two centuries old

The parent project modernises a hand of the 1960s into the 1990s. Here the
distance is 1810 to today, and every translation is a claim:

- **Residues → congruences.** « $a$ est résidu $p^{\text{ième}}$ de $\theta$ »
  becomes « $a$ est une puissance $p$-ième modulo $\theta$ », with a footnote
  the first time saying what she wrote.
- **« Nombres premiers de la forme $2Np+1$ » → auxiliary primes**, and the
  modern statement of Sophie Germain's theorem where the leaf proves it —
  footnoting that the name is Legendre's 1823 attribution, not hers.
- **Sums of curvatures → the biharmonic operator.** The 1813 equation of the
  vibrating plate is $\partial^2 z/\partial t^2 + k^2\,\Delta^2 z = 0$ in
  today's notation; write it so, footnote her form, and say plainly where her
  derivation is not a derivation by today's standards (the 1811 memoir's
  sixth-order equation is simply wrong, and the reading says so — but the
  memoirs are not online and will not be read here; the same discipline
  applies to whatever leaves of Français 9115 concern plates).
- **What she could not have known.** Kummer, Kirchhoff, the modern proof of
  Fermat. Name them where they illuminate, and footnote that the leaf predates
  them. This is where priority questions live; do not imply she cited work she
  did not.

## The summary

`\section*{Résumé}` first, inside `\begin{resume} … \end{resume}`, one page or
two, for someone with a first degree in mathematics and no more — and **do not
say so**. Four questions in order: de quoi ces feuillets parlent-ils ; quel
problème ; quelle idée ; où cela mène-t-il, et quels noms modernes chercher.
One thing belongs here whenever the volume offers it: **her own account of
what she was trying to do** — the letters to Gauss and the openings of the fair
copies are full of it, and it needs no background at all.

The résumé closes with

```latex
\keywords{Sophie Germain's theorem, auxiliary primes, power residues}
```

**in English**, three to six terms for a short volume, more for Français 9115
— the single source of the volume's tags.

## The standard: correct as it stands

Held to being **mathematically correct as written**. Where the leaf is loose,
elliptical or wrong, state what is true and footnote what the leaf has.
Laubenbacher and Pengelley show that several of her claims about $N$ hold
only for $N = 1$ and $2$; a modernised reading that repeated the general claim
would launder the error. Four failure modes to check: implicit hypotheses
(a prime she assumes without saying), containments upgraded to equalities,
a case she claims and does not prove (Manuscript C's even exponents), and
modern names attached to statements that do not quite coincide.

## The apparatus becomes footnotes

No `\ill{}`, no `\uncertain{}`, no brackets — everything the transcription's
apparatus carried moves into `\footnote{}`. **No `\page{}` — but
`\pagerange{first}{last}` at each section**, in Gallica views, as the first
thing in the block with the `\section*`, grounded in the transcription's own
`\page{}` marks. Folios cited by the literature go in the section title as
prose: « Le manuscrit sur les exposants pairs (ff. 348r–349r, vues 700 à 703) ».

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
2. Identify the **spine**. For Français 9115 there may be several: the pieces
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
  word, the reading says so; it does not fetch the word from Grun or Del
  Centina.
- **Preserve an error out of respect.** Footnote it and state the truth.
- **Claim priority.** « Elle est la première » needs a date the leaf does not
  have; the findings skill is where such a claim is examined, against sources.
- **Write English**, except `\keywords{}`.
- **Split the volume across one file per batch.**
