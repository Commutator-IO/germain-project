import { Footer, Header } from './components/Frame.tsx';
import { BOOKS, TOTAL_PAGES, UNEDITED, cotesOf, pagesOf } from './content/books.ts';
import { BY_ID, COTES, GROUPS } from './content/catalogue.ts';
import { availableFor, batchCount, useManifest } from './lib/batches.ts';

/**
 * The front page: what this corpus is, whose it is, and where to open it.
 *
 * The volumes were never one fonds: nineteen mathematicians' papers, spread
 * across the BnF's series and one partner's. So the page leads with the names,
 * by period, before offering a way in.
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
  const people = GROUPS.filter((g) => !g.id.startsWith('recueils'));

  return (
    <>
      <Header path="/" />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <header className="max-w-[46em]">
          <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-brand-600">
            Manuscrits de mathématiciens · Gallica, Bibliothèque nationale de France
          </p>
          <h1 className="titre mt-2 text-[40px] leading-[1.1] text-ink-900">
            The manuscripts of mathematicians that anyone can open in Gallica
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-700">
            Mersenne's letters from Descartes, Pascal's own sheets for the Pensées, Émilie du
            Châtelet's Newton, Fourier's twenty volumes on equations and heat, Sophie Germain's
            papers: the BnF has put the archives of nineteen mathematicians online, catalogued
            by fonds and number and read by almost no one. This site gathers them into one
            catalogue, and puts a transcription beside each leaf so that every reading can be
            checked against the hand it came from.
          </p>
        </header>

        <div className="tabular mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-ink-600">
          <Figure value={people.length} label="mathematicians" />
          <Figure value={COTES.length} label="digitised volumes" />
          <Figure value={TOTAL_PAGES} label="Gallica views to read" />
        </div>

        <Mathematicians />

        <Disclaimer />

        <Progress done={done} />

        <section className="mt-12">
          <h2 className="titre text-[24px] text-ink-900">Three cahiers, one to a period</h2>
          <p className="mt-2 max-w-[46em] text-[14px] leading-relaxed text-ink-600">
            The groupings are ours, and say so at the head of the page: the BnF catalogues by
            fonds, not by mathematician. Each cahier gives one section to each mathematician of
            its period, with every volume Gallica serves of them.
          </p>

          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {BOOKS.map((b) => {
              const cotes = cotesOf(b);
              return (
                <li key={b.key} className="card flex flex-col p-5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="titre text-[20px] text-ink-900">
                      <a href={b.path} className="hover:text-brand-700">
                        {b.title}
                      </a>
                    </h3>
                  </div>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-wide text-ink-400">
                    {b.period}
                  </p>
                  <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-ink-600">
                    {b.subtitle}
                  </p>
                  <p className="tabular mt-4 flex flex-wrap gap-x-4 text-[12.5px] text-ink-500">
                    <span>{b.sections.length} sections</span>
                    <span>
                      {cotes.length} volumes · {pagesOf(b).toLocaleString('en-GB')} views
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
            <h2 className="titre text-[22px] text-ink-900">What these volumes are</h2>
            <p className="mt-3">
              <strong>Working papers, letters and fair copies</strong>, from Maurolico's
              opuscules to Libri's correspondence: what the mathematicians wrote for themselves
              and for each other rather than for print. Some volumes are autograph, some are
              copies made in the period; the catalogue title says which where it knows.
            </p>
            <p>
              They came to the BnF by every route it has — the royal collection, the Latin series,
              purchases, the seizure of Libri's collection in 1848 — and are catalogued
              accordingly, by fonds and number. The one rule of selection here is that{' '}
              <strong>Gallica serves the whole volume</strong>, free, to anyone. The{' '}
              <a
                href="https://github.com/Commutator-IO/germain-project/issues/1"
                className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
              >
                inventory
              </a>{' '}
              says how the list was made and what it leaves out.
            </p>
          </div>

          <div className="prose-fonds">
            <h2 className="titre text-[22px] text-ink-900">What is being made of them</h2>
            <p className="mt-3">
              Every volume yields two documents per batch of twenty views, in the language of the
              volume. The <strong>transcription</strong> is the leaves as written — the writer's
              notation, spelling and paragraphing, and a critical apparatus that keeps what was
              read apart from what was guessed. An illegible word stays illegible.
            </p>
            <p>
              The <strong>modernised reading</strong> is the same mathematics in current notation
              and names, opening with a summary for someone who has not met the subject. It is the
              one document allowed to depart from the page, and is held to being correct as it
              stands: where the manuscript is wrong, it says what is true and footnotes what the
              page has.
            </p>
            <p>
              Both are LaTeX and both open in the browser. Whatever is transcribed is marked in
              the volume lists, so it is visible at a glance what has been done and what has not.
            </p>
          </div>

          <div className="prose-fonds">
            <h2 className="titre text-[22px] text-ink-900">Why nothing passes through here</h2>
            <p className="mt-3">
              The facsimile is Gallica's own file, read from its IIIF service at the moment you
              turn the page. Gallica answers a browser on any origin — its images carry{' '}
              <code>Access-Control-Allow-Origin: *</code> — so this site needs no relay, no
              mirror and no copy: the bytes go from the BnF to you, and this origin never holds
              them.
            </p>
            <p>
              What Gallica asks in return is the source line, and it is under every image:{' '}
              <em>Source gallica.bnf.fr / Bibliothèque nationale de France</em>. Non-commercial
              reuse of its public-domain digitisations is free on that condition; this site is
              non-commercial.
            </p>
            <p>
              The{' '}
              <a
                href="/sources/"
                className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
              >
                sources page
              </a>{' '}
              says what the conditions permit and what this site therefore does.
            </p>
          </div>
        </section>

        <section className="card mt-12 max-w-[52em] px-5 py-4">
          <p className="text-[13.5px] leading-relaxed text-ink-600">
            Nothing here is an edition. A machine pass over a centuries-old hand produces a
            reading, checkable against the facsimile on the same screen — that is its whole value
            and its whole claim. Where a scholarly edition of a volume already exists, the{' '}
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
 * The nineteen, by period — the first thing a reader looks for is a name.
 */
function Mathematicians() {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-3">
      {BOOKS.map((b) => (
        <div key={b.key} className="card border-l-4 border-l-brand-400 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">
            <a href={b.path} className="hover:underline">
              {b.title}
            </a>
          </p>
          <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-700">
            {GROUPS.filter((g) => g.century === b.key).map((g) => (
              <li key={g.id}>
                <strong className="font-semibold text-ink-900">{g.title}</strong>{' '}
                <span className="tabular text-ink-500">
                  · {g.cotes.length} vol. · {g.cotes.reduce((s, id) => s + (BY_ID.get(id)?.pages ?? 0), 0).toLocaleString('en-GB')} views
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

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
        scholar has edited a volume, that edition is better than anything here and is theirs;
        this site links to it and does not copy it.
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
