import { Footer, Header } from './components/Frame.tsx';
import { BOOKS, ONLINE, OFFLINE, TOTAL_PAGES, UNEDITED, cotesOf, pagesOf } from './content/books.ts';
import { COTES, HOLDERS } from './content/catalogue.ts';
import { availableFor, batchCount, useManifest } from './lib/batches.ts';

/**
 * The front page: what this corpus is, where it is, and where to open it.
 *
 * Germain's papers were never catalogued as a fonds. They went where Libri
 * took them, and today they sit with five holders in four countries, of which
 * one — the BnF — has put its share online. So the page has to do something
 * the parent project's did not: say plainly what can be read here and what
 * cannot, before offering a way in.
 */
export function HomePage() {
  const manifest = useManifest();

  const batches = UNEDITED.filter((c) => c.pages > 0).flatMap((c) =>
    Array.from({ length: batchCount(c.pages) }, (_, i) => availableFor(manifest, c.id, i + 1)),
  );
  const done = {
    total: batches.length,
    transcribed: batches.filter((b) => b.html.includes('fr')).length,
    modernised: batches.filter((b) => b.html.includes('modern')).length,
  };

  return (
    <>
      <Header path="/" />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <header className="max-w-[46em]">
          <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-brand-600">
            Papiers de Sophie Germain · BnF, Académie des sciences, Florence, Göttingen
          </p>
          <h1 className="titre mt-2 text-[40px] leading-[1.1] text-ink-900">
            The mathematics Sophie Germain wrote and never published
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-700">
            Three memoirs on vibrating plates that won the Académie's prize and were never
            printed as written; a plan to prove Fermat's Last Theorem that two centuries knew
            only through a footnote of Legendre's; two hundred pages of number theory nobody has
            read since. This site gives the catalogue of where all of it is, and puts a
            transcription beside each digitised leaf so that every reading can be checked
            against the hand it came from.
          </p>
        </header>

        <div className="tabular mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-ink-600">
          <Figure value={COTES.length} label="volumes and dossiers located" />
          <Figure value={HOLDERS.length} label="holders, in four countries" />
          <Figure value={ONLINE.length} label="volumes online, all at the BnF" />
          <Figure value={TOTAL_PAGES} label="Gallica views to read" />
        </div>

        <WhatIsOnline />

        <Disclaimer />

        <Progress done={done} />

        <section className="mt-12">
          <h2 className="titre text-[24px] text-ink-900">Four cahiers to begin with</h2>
          <p className="mt-2 max-w-[46em] text-[14px] leading-relaxed text-ink-600">
            All four are groupings of our own, and say so at the head of the page: no catalogue
            ever sorted Germain by subject. Each names the volumes it draws on, which are
            online and which are not, and who located what inside them.
          </p>

          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {BOOKS.map((b) => {
              const cotes = cotesOf(b);
              const online = cotes.filter((c) => c.pages > 0).length;
              return (
                <li key={b.key} className="card flex flex-col p-5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="titre text-[20px] text-ink-900">
                      <a href={b.path} className="hover:text-brand-700">
                        {b.title}
                      </a>
                    </h3>
                    <span className="rounded-full bg-encours-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-encours-700">
                      editorial
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-wide text-ink-400">
                    {b.period}
                  </p>
                  <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-ink-600">
                    {b.subtitle}
                  </p>
                  <p className="tabular mt-4 flex flex-wrap gap-x-4 text-[12.5px] text-ink-500">
                    <span>{cotes.length} volumes</span>
                    <span>
                      {online} online · {pagesOf(b).toLocaleString('en-GB')} views
                    </span>
                  </p>
                  <a
                    href={b.path}
                    className="mt-4 inline-block self-start rounded-lg bg-brand-600 px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-brand-700"
                  >
                    Open the cahier
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="prose-fonds">
            <h2 className="titre text-[22px] text-ink-900">What these pages are</h2>
            <p className="mt-3">
              <strong>Working papers of a mathematician with no institution.</strong> Germain
              (1776–1831) taught herself from her father's library, wrote to Lagrange, Legendre
              and Gauss under a man's name, and was the only entrant, three times running, to
              the Académie's prize on the vibrations of elastic surfaces. Nothing she wrote was
              filed anywhere but her own desk.
            </p>
            <p>
              After her death her friend Guglielmo Libri took her papers. Most were seized from
              his Paris apartment in 1848 and are now the BnF's{' '}
              <strong>Français 9114–9118</strong>; two hundred sheets went with him to Florence;
              her letters to Gauss stayed with Gauss's papers in Göttingen; the three memoirs
              stayed at the Académie that received them.
            </p>
            <p>
              The BnF bound its share as « dissertations et problèmes », unsorted and unnumbered
              except by the archive. Number theory sits beside physics leaf by leaf. Nobody has
              published which leaf is which.
            </p>
          </div>

          <div className="prose-fonds">
            <h2 className="titre text-[22px] text-ink-900">What is being made of them</h2>
            <p className="mt-3">
              Every digitised volume yields two documents per batch of twenty views, both in
              French. The <strong>transcription</strong> is the leaves as written — her notation,
              her spelling (« seroit », « avoit »), her paragraphing, and a critical apparatus
              that keeps what was read apart from what was guessed. An illegible word stays
              illegible.
            </p>
            <p>
              The <strong>modernised reading</strong> is the same mathematics in current notation
              and names — congruences where she writes residues, Kirchhoff–Love plates where she
              writes sums of curvatures — opening with a summary for someone who has not met
              the subject. It is the one document allowed to depart from the page, and is held to
              being correct as it stands: where the manuscript is wrong, and the 1811 memoir's
              equation was, it says what is true and footnotes what the page has.
            </p>
            <p>
              Both are LaTeX and both open in the browser. Whatever is transcribed is marked in
              the volume lists, so it is visible at a glance what has been done and what has not.
            </p>
          </div>

          <div className="prose-fonds">
            <h2 className="titre text-[22px] text-ink-900">Why nothing passes through here</h2>
            <p className="mt-3">
              The facsimile is the BnF's own file, read from Gallica's IIIF service at the moment
              you turn the page. Gallica answers a browser on any origin — its images carry{' '}
              <code>Access-Control-Allow-Origin: *</code> — so this site needs no relay, no
              mirror and no copy: the bytes go from the BnF to you, and this origin never holds
              them.
            </p>
            <p>
              What Gallica asks in return is the source line, and it is under every image:{' '}
              <em>Source gallica.bnf.fr / Bibliothèque nationale de France</em>. Non-commercial
              reuse of its public-domain digitisations is free on that condition; this site is
              non-commercial, and the manuscripts of a woman who died in 1831 are as public as a
              domain gets.
            </p>
            <p>
              The volumes that are not online are not shown at all — not a thumbnail, not a
              detail. The{' '}
              <a
                href="/sources/"
                className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
              >
                sources page
              </a>{' '}
              says, holder by holder, what each permits and what this site therefore does.
            </p>
          </div>
        </section>

        <section className="card mt-12 max-w-[52em] px-5 py-4">
          <p className="text-[13.5px] leading-relaxed text-ink-600">
            Nothing here is an edition. A machine pass over a two-hundred-year-old hand produces
            a reading, checkable against the facsimile on the same screen — that is its whole
            value and its whole claim. Where a scholarly transcription already exists — Grun's of
            the three memoirs, Del Centina's of the Florence draft — the{' '}
            <a
              href="/archive/"
              className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
            >
              archive page
            </a>{' '}
            marks the volume and links to it; use that instead, and know that it is theirs.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

/**
 * What can be read here, and what cannot — before anything else.
 *
 * On the parent site every folder was online and the question did not arise.
 * Here ten of fourteen volumes are not, including the three memoirs the whole
 * elasticity story turns on, and a reader who arrives for those must learn it
 * in the first screen rather than in an empty pane.
 */
function WhatIsOnline() {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-2">
      <div className="card border-l-4 border-l-brand-400 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
          Online, and readable here
        </p>
        <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-700">
          {ONLINE.map((v) => (
            <li key={v.id}>
              <strong className="font-semibold text-ink-900">{v.shelfmark}</strong>{' '}
              <span className="text-ink-500">· {v.pages} views</span> — {shortTitle(v.title)}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12.5px] text-ink-500">
          All at the BnF, digitised, served by Gallica. These are what the facsimile pane can
          show and what the skills can read.
        </p>
      </div>
      <div className="card border-l-4 border-l-ink-300 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
          Located, not online
        </p>
        <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-700">
          {OFFLINE.map((v) => (
            <li key={v.id}>
              <strong className="font-semibold text-ink-900">{v.shelfmark}</strong>{' '}
              <span className="text-ink-500">· {HOLDERS.find((h) => h.id === v.holder)?.short}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12.5px] text-ink-500">
          Catalogued here from the holders' notices and the literature, with who has edited
          what. Nothing of them is shown, and nothing can be transcribed from them here.
        </p>
      </div>
    </section>
  );
}

const shortTitle = (t: string) => (t.length > 70 ? `${t.slice(0, 67).trimEnd()}…` : t);

/**
 * Who made these documents, said plainly and early.
 *
 * High on the page rather than in a footer, because it changes how everything
 * below it should be read.
 */
function Disclaimer() {
  return (
    <section className="mt-8 max-w-[52em] rounded-[var(--radius-card)] border border-encours-200 bg-encours-50 px-5 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-encours-700">
        How these documents were made
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700">
        The transcriptions and modernised readings on this site are produced in 2026 by{' '}
        <strong className="font-semibold text-ink-900">Claude Fable 5.1</strong> and{' '}
        <strong className="font-semibold text-ink-900">Claude Opus 5</strong>, a volume at a
        time, the transcriptions twenty views at a time. <strong className="font-semibold text-ink-900">Each
        file records the model and the date of its pass in its own header, and that header is
        the authority</strong>, not this sentence.
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700">
        <strong className="font-semibold text-ink-900">None of it is a scholarly edition, and
        none of it has been verified by a person</strong> unless the batch says so. Where a
        scholar has transcribed a volume — and for the three memoirs one has — that
        transcription is better than anything here and is theirs; this site links to it and
        does not copy it.
      </p>
    </section>
  );
}

/** Where the work stands, in two numbers and a bar, counted against what is online. */
function Progress({ done }: { done: { total: number; transcribed: number; modernised: number } }) {
  const pct = (n: number) => (done.total ? (n / done.total) * 100 : 0);
  const asWords =
    done.transcribed === 0
      ? 'none yet'
      : `${((done.transcribed / done.total) * 100).toFixed(1)}% of it`;

  return (
    <section className="card mt-10 max-w-[52em] px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="titre text-[17px] text-ink-900">Where the work stands</h2>
        <p className="tabular ml-auto text-[12.5px] text-ink-500">
          {done.total.toLocaleString('en-GB')} batches of 20 views · {asWords}
        </p>
      </div>

      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
        Counted against the volumes that are online and unedited — the only ones a pass can read.
      </p>

      <div className="tabular mt-3 flex flex-wrap gap-x-7 gap-y-2 text-[13.5px] text-ink-600">
        <span>
          <strong className="titre text-[22px] text-relu-600">{done.transcribed}</strong>{' '}
          transcribed
        </span>
        <span>
          <strong className="titre text-[22px] text-brand-600">{done.modernised}</strong>{' '}
          modernised
        </span>
      </div>

      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-ink-200">
        <span className="bg-brand-500" style={{ width: `${pct(done.modernised)}%` }} />
        <span
          className="bg-relu-500"
          style={{ width: `${pct(done.transcribed - done.modernised)}%` }}
        />
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">
        Counted from the files themselves, not from a tally kept by hand. A batch counts as
        transcribed once its LaTeX exists, and as modernised once the modernised reading does —
        neither claims anyone has checked it against the leaves.{' '}
        <a
          href="/method/"
          className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
        >
          Method &amp; progress
        </a>{' '}
        breaks it down per cahier.
      </p>
    </section>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <strong className="titre text-[26px] text-ink-900">{value.toLocaleString('en-GB')}</strong>
      <span className="text-ink-500">{label}</span>
    </span>
  );
}
