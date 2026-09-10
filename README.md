# The mathematics Sophie Germain wrote and never published

**A catalogue and transcription workbench for the manuscripts of Sophie
Germain (1776–1831) — wherever they are held, with each digitised leaf read
beside its LaTeX transcription.**

→ **[germain.commutator.io](https://germain.commutator.io)**

Sibling of [grothendieck.commutator.io](https://grothendieck.commutator.io),
built on the same tooling. What differs is the corpus, and everything that
follows from it.

## The point

Germain had no institution, and her papers went where her friend Guglielmo
Libri took them. Today they sit with five holders in four countries:

| Holder | What | Online? |
|---|---|---|
| **BnF, département des Manuscrits** | Français 9114–9116 (« Papiers », 945 leaves), 9117 (the philosophical essay), 9118 (letters received), NAF 4073 (letters from Libri's papers), NAF 5166 | **9115, 9117, 9118, 4073 — on Gallica, 1,010 views**. 9114 and 9116 are not digitised. |
| **Archives de l'Académie des sciences** | The three prize memoirs on vibrating elastic surfaces, 1811, 1813, 1815 | No |
| **Biblioteca Moreniana, Florence** | Some two hundred sheets: the draft of the « Remarques » on Fermat, experiments, drafts of letters, remarks on Cauchy and Navier; nine letters | No |
| **SUB Göttingen** | Her ten letters to Gauss, 1804–1819, with mathematical enclosures | Letter database; not embedded here |
| **New York Public Library** | One undated letter to Legendre | No |

This site does two things. It gives the **whole catalogue**, holder by holder,
in the holders' own words, saying on every row what is online and who has
edited what. And, for the four digitised volumes, it puts the LaTeX
transcription of a view **beside the view itself**, read from Gallica's IIIF
service, so that scrolling the transcript turns the facsimile's pages.

## The site

| Page | Contents |
|---|---|
| [`/`](https://germain.commutator.io/) | What the corpus is, where it is, what is online, and the four cahiers |
| [`/elasticite/`](https://germain.commutator.io/elasticite/) | **Cahier d'élasticité** — the three memoirs (not online), the working notes bound with everything else, the Florence remarks |
| [`/fermat/`](https://germain.commutator.io/fermat/) | **Cahier de Fermat** — the seven pieces Laubenbacher, Pengelley and Del Centina located, of which one is online |
| [`/nombres/`](https://germain.commutator.io/nombres/) | **Cahier de théorie des nombres** — Français 9115 and the enclosures to Gauss |
| [`/correspondance/`](https://germain.commutator.io/correspondance/) | **Correspondance** — Français 9118, NAF 4073, Göttingen, Florence, New York |
| [`/archive/`](https://germain.commutator.io/archive/) | Every volume and dossier, with the literature that edited, printed or read it |
| [`/sources/`](https://germain.commutator.io/sources/) | **Sources & rights** — what each holder permits, what was measured, what this site does |
| [`/method/`](https://germain.commutator.io/method/) | How transcription proceeds, what it refuses, where it stands |
| [`/findings/`](https://germain.commutator.io/findings/) | Candidate novelties, against named sources |
| [`/contribute/`](https://germain.commutator.io/contribute/) | Report a reading, correct one, transcribe a batch |

All four cahiers are groupings of our own, and each says so: no catalogue ever
sorted Germain by subject.

## Nothing of any manuscript is stored, anywhere

Not one image, not in the repository and not on any server of ours. The
facsimile pane asks **Gallica's IIIF Image API** for the view a reader is
looking at, at the width of the pane, and the bytes go from the BnF to the
reader's browser. `.gitignore` refuses `*.jpg` and `*.pdf` outright.

**No relay, and the absence is the point.** The parent project has to relay
Montpellier's PDFs through its own origin because that server forbids framing
and serves an expired certificate. Gallica does neither — measured on
10 September 2026:

- the IIIF manifests and images answer with **`Access-Control-Allow-Origin: *`**,
  so any origin may read them in the browser;
- the certificate is valid;
- the manifest's own `license` field points at Gallica's conditions.

So there is no `relay/` directory, no container to deploy and no repository
variable to set. There is one thing to be careful of instead: **Gallica
rate-limits.** A dozen requests in a few seconds from one address were answered
with connection resets. The pane debounces as you scroll and never prefetches;
the scripts pause between requests and name this site in their user agent.

### What the holders permit, and what this site does — in short

The whole position is on [`/sources/`](https://germain.commutator.io/sources/),
paragraph by paragraph, with links. The rules:

1. **No image stored or re-served.** Gallica is read at view time; what is not
   online is not shown — not a thumbnail, not a detail from a publication.
2. **Every image carries its source line**, « Source gallica.bnf.fr /
   Bibliothèque nationale de France », which is Gallica's one condition on
   non-commercial reuse of its public-domain digitisations. This site is
   non-commercial and its own work is CC0.
3. **Nobody else's transcription is reproduced** — not Nathalie Grun's of the
   three memoirs (Annexe D of her 2022 thesis, under her copyright), not Andrea
   Del Centina's of the Florence draft. They are linked, cited, and never
   copied, even where the manuscript is not online and theirs is the only text.
4. **The Académie asserts rights on its reproductions** of the memoirs, and
   nothing of them appears here.

Germain's own text is in the public domain everywhere; what she printed
herself — the « Recherches » of 1821, the « Remarques » of 1826 — may be
quoted, framed and transcribed freely, and is on Gallica and Wikisource.

## The catalogue

`src/content/holdings.json` is the seed: every volume and dossier, in the
holder's words — title, dating, extent, catalogue notice, Gallica ark. Titles
in `[brackets]` are ours, where a holder gives none. `npm run catalogue` asks
Gallica's manifests how many views each digitised volume has and writes the
typed `src/content/catalogue.ts`; the manifests are cached under `archives/`,
git-ignored, and `--cached` rebuilds offline.

`src/content/pieces.json` records what the literature has located inside the
volumes — Manuscript A at Français 9114 ff. 198r–208v, Manuscript C at
Français 9115 ff. 348r–349r — with its source. Gallica labels every view
« NP », so a folio becomes a view only once a pass has read the BnF's pencilled
foliation; `views` is null until then, and the cahier page says so.

`src/content/editions.json` is every work this site draws on, in three kinds
kept apart because the distinction is legal before it is scholarly:
`published` (Germain's own printings, public domain), `transcribed` (a
scholar's recent transcription, theirs), `analysis` (a paper that located or
read the manuscripts). Each carries a one-sentence rights position.

## Transcription

Two editions, one skill each, run in order — plus a third for the tags and a
fourth for findings. All under `.claude/skills/`, all accepting Fable 5.1 and
Opus 5 and refusing anything else, and each file records in its header the
model that read it.

| Skill | Produces |
|---|---|
| [`/transcribe-germain`](.claude/skills/transcribe-germain/SKILL.md) | the transcription — twenty Gallica views per pass, the mathematics and her prose, with the apparatus and the folio where the pencil can be read |
| [`/modernize-germain`](.claude/skills/modernize-germain/SKILL.md) | the modernised reading — a volume at a time: a résumé, then current notation and names, every translation of her 1800s notation footnoted |
| [`/tag-germain`](.claude/skills/tag-germain/SKILL.md) | the volume's tags — the `\keywords{}` line closing the résumé |
| [`/find-novelty`](.claude/skills/find-novelty/SKILL.md) | candidate findings, against named sources; priority only from a date on paper |

Both editions are French — hers. The transcription keeps the spelling of her
generation (« seroit », « avoit »), her abbreviations and her notation of 1800;
the modernised reading translates residues into congruences and sums of
curvatures into the biharmonic operator, and footnotes each translation.

`\page{N}` takes the **Gallica view number**, which is what drives the
facsimile; `\folio{198r}` records the BnF's pencilled foliation where a pass
can read it, never inferred. The apparatus is otherwise the parent's:
`\ill{}`, `\uncertain{}`, `\add{}`, `\struck{}`, `\note{}`, `\marginal{}`.

The skills work only from a local mirror of a digitised volume:

```bash
npm run archive -- fr-9115 --batches 1    # twenty views into archives/, paused, once
npm run tiles -- fr-9115 1                # six regions per view, from Gallica's IIIF
```

and refuse to work from a publication's reproduction of a page, or from
anybody else's transcription. Ten of the fourteen volumes are therefore outside
their reach, and the site says so on each.

```bash
npm run render      # transcripts/*.tex → the reading views the left pane shows
npm run pdf         # → the PDFs the download buttons offer (tectonic or xelatex)
npm run tei         # → a TEI P5 file per transcription, facs pointing at Gallica
npm run manifest    # tell the site which files now exist
```

The `.tex` under `transcripts/` is the source of record and the only thing
versioned.

**Nothing is transcribed yet.** The catalogue, the pages, the scripts and the
skills are in place; the first pass over Français 9115 has not run. The
progress figures on the site are counted from the files and say so.

## Development

```bash
npm install
npm run catalogue -- --cached   # or without --cached, to ask Gallica
npm run dev                     # http://localhost:5174
npm run lint && npx tsc -b && npm run build
npm run check-sources           # Gallica still answers with CORS; the links live
```

Deploys to GitHub Pages from `main` on push, via
`.github/workflows/deploy.yml`, on the custom domain in `public/CNAME`.

## Licence

CC0 1.0 for everything that is ours — transcriptions, readings, catalogue as
compiled, skills, code. The manuscripts are in the public domain; the
digitisations are the BnF's under Gallica's conditions; the scholarship is its
authors'. See [`/sources/`](https://germain.commutator.io/sources/).
