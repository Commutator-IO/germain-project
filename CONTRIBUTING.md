# Contributing

Everything on the site is first-pass machine work, and it says so on every
page. That admission is worth nothing without a way to act on it. Three routes,
cheapest first.

## 1. Report a reading — one click

Every open batch carries a **Report a reading** button and every transcribed
volume a **Report** link. Both open a GitHub issue with the shelfmark, the batch
and the Gallica view already filled in. A GitHub account is all you need.

## 2. Correct a reading — a pull request

The `.tex` under `transcripts/` is the source of record; the HTML, PDF and TEI
are rebuilt from it on every deploy. A correction is one edit to one file.

```bash
gh repo fork Commutator-IO/germain-project --clone
cd germain-project && npm install
git checkout -b fr-9115-batch-1
# edit transcripts/fr-9115/batch-01.fr.tex — and nothing under public/
npm run lint && npm run render && npm run pdf
git commit -am "Français 9115, batch 1: correct the exponent at view 212"
gh pr create --fill
```

## 3. Transcribe a batch — an afternoon

Only a digitised volume, and only from the mirror:

```bash
npm run archive -- fr-9115 --batches 3
npm run tiles -- fr-9115 3
claude
  /transcribe-germain fr-9115 3      # one batch per conversation
```

Then, once every batch of a volume is done, `/modernize-germain fr-9115`.

## Rules of the road

- **Never fill a gap with a plausible word.** Illegible stays `\ill{}`,
  doubtful stays `\uncertain{}`.
- **Never correct Germain.** A wrong calculation on the leaf is wrong in the
  transcription, with a `\note{}`. The modernised reading states what is true
  and footnotes what the leaf has.
- **Never copy anybody else's transcription.** Not Grun's, not Del Centina's,
  not a line, not to check a word. Where a manuscript is not online the honest
  state of this site is no reading at all, and a link.
- **Never commit an image or a PDF.** `.gitignore` refuses them; the mirror
  under `archives/` stays on your machine.
- **Never infer a folio.** `\folio{}` records the BnF's pencil where it can be
  read, and nothing else.
- **Never tick `checked`** unless you compared the batch with the views, one
  by one.
- **Change only the source.** `public/transcripts/`, `public/manifest.json`
  and `src/content/catalogue.ts` are generated.
- **Both editions move together.**
- **Stay inside the LaTeX subset.** `scripts/render.mjs` fails loudly on
  anything else, on purpose.
- **Go gently on Gallica.** Never fetch in a loop by hand; the scripts pause
  and name the site, and that is how it should stay.

## The editions are written in French

Whoever runs the pass. Everything around them — this file, the code, the
commit messages — is English.

## Licence

CC0 1.0. By contributing you agree to release your contribution under it.
