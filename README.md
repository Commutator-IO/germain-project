# Mathematicians' Manuscripts in Gallica

**A catalogue and transcription workbench for the manuscripts of mathematicians
that anyone can open in Gallica — nineteen archives, from Viète to Libri, with
each leaf read beside its LaTeX transcription.**

→ **[germain.commutator.io](https://germain.commutator.io)** (the domain keeps the
name of the first archive it read, Sophie Germain's)

Sibling of [grothendieck.commutator.io](https://grothendieck.commutator.io),
built on the same tooling. What differs is the corpus, and everything that
follows from it.

## The point

The BnF has put online, whole and free, the manuscripts of a good number of
mathematicians — working papers, letters, fair copies — catalogued by fonds and
number and read by almost no one. The selection here is the inventory in
[issue #1](https://github.com/Commutator-IO/germain-project/issues/1): **78
volumes, 25,258 Gallica views, 19 mathematicians** (and two albums of several
hands), drawn from Gallica's search on 14 September 2026.

| Period | Mathematicians | Largest archives |
|---|---|---|
| XVIᵉ–XVIIᵉ | Maurolico, Viète, Mydorge, Mersenne, Descartes, Fermat, Roberval, Sluse, Pascal, L'Hospital, Varignon | Mersenne (10 vol., 3,297 views), Pascal (4 vol., 1,691), Roberval (5 vol., 1,441) |
| XVIIIᵉ | Émilie du Châtelet, d'Alembert, Lagrange, Condorcet | Du Châtelet (5 vol., 2,317 — her Principia translation), Condorcet (2 vol., 1,093) |
| XIXᵉ | Fourier, Sophie Germain, Libri, Prony | Fourier (20 vol., 6,173), Libri (8 vol., 2,970), Germain (4 vol., 1,010) |

**The one rule of selection is that Gallica serves the whole volume.** A
manuscript that is not digitised, or that Gallica only references on a partner's
site, is not in the catalogue — not as a row, not as a thumbnail.

This site does two things. It gives the **catalogue**, mathematician by
mathematician, in the holder's own words. And it puts the LaTeX transcription of
a view **beside the view itself**, read from Gallica's IIIF service, so that
scrolling the transcript turns the facsimile's pages. Sophie Germain's four
volumes are transcribed; the rest are waiting.

## The site

| Page | Contents |
|---|---|
| [`/`](https://germain.commutator.io/) | What the corpus is, the nineteen names, and the three cahiers |
| [`/xvii/`](https://germain.commutator.io/xvii/) | **Cahier du XVIIᵉ siècle** — Mersenne and his correspondents, Viète, Sluse, L'Hospital, Varignon |
| [`/xviii/`](https://germain.commutator.io/xviii/) | **Cahier du XVIIIᵉ siècle** — Émilie du Châtelet, d'Alembert, Lagrange, Condorcet |
| [`/xix/`](https://germain.commutator.io/xix/) | **Cahier du XIXᵉ siècle** — Fourier, Sophie Germain, Libri, Prony |
| [`/timeline/`](https://germain.commutator.io/timeline/) | **Timeline** — the nineteen lives on one scale, a paragraph each, with portraits from Wikimedia Commons |
| [`/archive/`](https://germain.commutator.io/archive/) | Every volume, by mathematician, with the literature that edited, printed or read it |
| [`/sources/`](https://germain.commutator.io/sources/) | **Sources & rights** — what Gallica permits, what was measured, what this site does |
| [`/method/`](https://germain.commutator.io/method/) | How transcription proceeds, what it refuses, where it stands |
| [`/findings/`](https://germain.commutator.io/findings/) | Candidate novelties, against named sources |
| [`/contribute/`](https://germain.commutator.io/contribute/) | Report a reading, correct one, transcribe a batch |

The cahiers are groupings of our own, one section to a mathematician, and each
says so: the BnF catalogues by fonds, not by mathematician.

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

1. **No image stored or re-served.** Gallica is read at view time; what Gallica
   does not serve whole is not listed — not a thumbnail, not a detail from a
   publication.
2. **Every image carries its source line**, « Source gallica.bnf.fr /
   Bibliothèque nationale de France », which is Gallica's one condition on
   non-commercial reuse of its public-domain digitisations. This site is
   non-commercial and its own work is CC0.
3. **Nobody else's transcription or edition is reproduced**, or used to seed a
   reading — not a printed Pensées, not Adam–Tannery, not a scholar's
   transcription of a letter. They are linked, cited, and never copied.

The manuscripts are in the public domain everywhere.

## The catalogue

`src/content/holdings.json` is the seed: every volume, the mathematician whose
archive it is (`group`), and the century whose cahier lists it. `npm run
catalogue` asks each volume's Gallica manifest how many views it has — and,
where the seed leaves them null, the holder's own title, dating, extent, leaf
count and notice — and writes the typed `src/content/catalogue.ts`. The
manifests are cached under `archives/`, git-ignored; `--cached` rebuilds
offline, and `--missing` asks Gallica only for the manifests not yet cached,
which is the way to finish a run Gallica throttled.

`src/content/pieces.json` records what the literature has located inside the
volumes — Germain's Manuscript C at Français 9115 ff. 348r–349r — with its
source. Gallica labels most views « NP », so a folio becomes a view only once a
pass has read the library's foliation; `views` is null until then, and the
cahier page says so.

`src/content/editions.json` is every work this site draws on, in three kinds
kept apart because the distinction is legal before it is scholarly:
`published` (the author's own text in print, public domain), `transcribed` (a
scholar's recent transcription, theirs), `analysis` (a paper that located or
read the manuscripts). Each carries a one-sentence rights position.

## Transcription

Two editions, one skill each, run in order — plus a third for the tags and a
fourth for findings. All under `.claude/skills/`, all accepting Opus 5.5
and Opus 5 and refusing anything else, and each file records in its header the
model that read it.

| Skill | Produces |
|---|---|
| [`/transcribe`](.claude/skills/transcribe/SKILL.md) | the transcription — twenty Gallica views per pass, the mathematics and the prose, with the apparatus and the folio where the library's foliation can be read |
| [`/modernize`](.claude/skills/modernize/SKILL.md) | the modernised reading — a volume at a time: a résumé, then current notation and names, every translation of the period's notation footnoted |
| [`/tag`](.claude/skills/tag/SKILL.md) | the volume's tags — the `\keywords{}` line closing the résumé |
| [`/find-novelty`](.claude/skills/find-novelty/SKILL.md) | candidate findings, against named sources; priority only from a date on paper |

The transcription is in the language of the volume — French for most, Latin for
Sluse, Maurolico, Varignon and part of Mersenne and Roberval — with the spelling,
abbreviations and notation of its period; its apparatus is French. The
modernised reading is in French, translates the notation (Legendre's residues
into congruences, sums of curvatures into the biharmonic operator) and
footnotes each translation.

`\page{N}` takes the **Gallica view number**, which is what drives the
facsimile; `\folio{198r}` records the library's foliation on a recto where a
pass can read it, never inferred. The apparatus is otherwise the parent's:
`\ill{}`, `\uncertain{}`, `\add{}`, `\struck{}`, `\note{}`, `\marginal{}`.

The skills work only from a local mirror of a digitised volume:

```bash
npm run archive -- fr-22510 --batches 1   # twenty views into archives/, paused, once
```

and read crops cut locally from that mirror (the full IIIF canvases), so a pass
costs Gallica nothing beyond the mirror. They refuse to work from a
publication's reproduction of a page, or from anybody else's transcription.

```bash
npm run render      # transcripts/*.tex → the reading views the left pane shows
npm run pdf         # → the PDFs the download buttons offer (tectonic or xelatex)
npm run tei         # → a TEI P5 file per transcription, facs pointing at Gallica
npm run manifest    # tell the site which files now exist
```

The `.tex` under `transcripts/` is the source of record and the only thing
versioned.

**Where it stands.** Sophie Germain's four volumes are transcribed (Français
9117, 9118 and NAF 4073 whole, Français 9115 in part), with modernised readings
of Français 9118 and NAF 4073. Nothing of the other eighteen archives is
transcribed yet. The progress figures on the site are counted from the files.

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
digitisations are the BnF's (and, for Prony's journals, the École des ponts')
under Gallica's conditions; the scholarship is its authors'. See [`/sources/`](https://germain.commutator.io/sources/).
