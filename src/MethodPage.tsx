import { H2, H3, LI, P, useHashTarget } from './components/Anchors.tsx';
import { Footer, Header } from './components/Frame.tsx';
import { BOOKS, cotesOf } from './content/books.ts';
import { batchCount, batchRange, declared, evidence, useManifest } from './lib/batches.ts';
import { STATES, shownState, type State } from './lib/progress.ts';

/**
 * Method, and where the transcription stands.
 *
 * Two things on one page, on purpose. A progress table without a method is a
 * scoreboard; a method without a progress table is a promise. Together they
 * are checkable.
 */
export function MethodPage() {
  const manifest = useManifest();
  useHashTarget();

  return (
    <>
      <Header path="/method/" />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <header className="max-w-[46em]">
          <h1 className="titre text-[34px] leading-tight text-ink-900">Method &amp; progress</h1>
          <P id="intro" className="mt-3 text-[15.5px] leading-relaxed text-ink-700">
            How these leaves are turned into LaTeX, what the process refuses to do, and how far it
            has got. The refusals matter more than the method: a transcription that silently
            guesses is worse than no transcription, because nothing on the page tells you which
            words were read and which were invented.
          </P>
          <p className="mt-2 text-[12.5px] text-ink-400">
            Every paragraph below has its own address: hover one and the mark in the margin copies
            a link straight to it.
          </p>
        </header>

        <StatusSequence />

        <Progress manifest={manifest} />

        <div className="mt-14 grid gap-x-10 gap-y-8 md:grid-cols-2">
          <section className="prose-fonds">
            <H2 id="how-they-wrote">What the leaves are like</H2>
            <P id="how-they-wrote-kinds">
              Three kinds of volume, and a pass reads each differently. <strong>Working
              papers</strong> — Fourier's calculations, Germain's « dissertations et problèmes »,
              Roberval's papers — were never meant to be read: fair copies next to scratch paper,
              unsorted, numbered by the archive and bound as they came. <strong>Letters</strong> —
              the three volumes addressed to Mersenne, Descartes's to him, Libri's correspondence —
              are dated, signed and mostly legible, and the prose is transcribed whole.{' '}
              <strong>Copies and fair copies</strong> — the copies of Pascal's Pensées, the Vicq
              d'Azyr copies of Fermat — are the easiest hands, and the ones where it matters most to
              say that the hand is not the author's.
            </P>
            <H3 id="hand">The hand, and the spelling</H3>
            <P id="hand-orthography">
              Three centuries of French and Latin cursive, from Maurolico's to Libri's. The spelling
              of the writer's time stays — « seroit », « avoit », « scavoir », the long <em>s</em>{' '}
              where it is one — and so do the abbreviations: « Mr », the ampersand, Latin
              contractions expanded only in a note. What earlier passes learn about a hand goes into
              a reference file the skill reads, one section per mathematician, so that no pass
              learns it twice.
            </P>
            <H3 id="notation">The notation of its period, not of today</H3>
            <P id="notation-period">
              Viète's cossic signs and « in » for multiplication, Descartes's ∝ for equality,
              Fermat's « adæqualitas », Legendre's residues in Germain, Fourier's integrals written
              before the notation settled: the transcription keeps every one of these. The modernised
              reading translates them, and footnotes the translation.
            </P>
            <H3 id="numbering">Three numberings</H3>
            <P id="numbering-views">
              Gallica counts <strong>views</strong>, one per image, and labels most « NP »: it is the
              only numbering a machine can address, so <code>\page{'{N}'}</code> takes the view number
              and drives the facsimile. The library pencilled a <strong>foliation</strong> on the
              leaves, « 198 », and that is what the literature cites. Where a pass can read it, it
              records it with <code>\folio{'{198r}'}</code>, on the recto only, and that line is what
              turns a citation into a view. And writers <strong>paginated</strong> their own fair
              copies; their numbers, where visible, go in a note.
            </P>
            <H3 id="dating">Dates are often absent</H3>
            <P id="dating-letters">
              The letters are dated; the working papers mostly are not. The catalogue's dating —
              « 1601-1700 », « XIXe siècle » — is copied verbatim into <code>\dating{'{}'}</code>, and
              a pass that can date a leaf from its content says so in a note, as its own inference.
            </P>
          </section>

          <section className="prose-fonds">
            <H2 id="how-it-proceeds">How transcription proceeds</H2>
            <H3 id="microbatches">Batches, and why twenty</H3>
            <P id="microbatches-why">
              Twenty views per pass. Past that, a model's reading degrades towards the end of the
              pass with nothing to signal it, and a transcription whose weakening point is unknown
              cannot be used. One batch per conversation, so that view 20 is read as carefully as
              view 2. Français 9115 is 750 views: thirty-eight passes; Fourier's twenty volumes are
              more than three hundred.
            </P>
            <H3 id="mirror">The pass reads a mirror; the reader does not</H3>
            <P id="mirror-why">
              The facsimile pane reads Gallica directly. The pass cannot — it needs image files it
              can open, crop and re-open — so <code>npm run archive</code> fetches the batch's
              twenty views from the IIIF service into <code>archives/</code>, once, with a pause
              between each, under a user agent that names this site. The directory is git-ignored;
              Gallica's terms permit the copy for this use, and nothing of it leaves the machine.
            </P>
            <H3 id="two-editions">Two editions, one source</H3>
            <P id="two-editions-tex">
              The <code>.tex</code> under <code>transcripts/</code> is the source of record and the
              only versioned artifact. The reading view, the PDF and the TEI export are derived
              from it at every deploy. The transcription is per batch; the modernised reading
              takes the volume whole, because an argument does not stop at view 20.
            </P>
            <H3 id="uncertainty">Uncertainty is marked, not resolved</H3>
            <P id="uncertainty-macros">
              Illegible stays <code>\ill{'{}'}</code>, doubtful stays <code>\uncertain{'{}'}</code>.
              An invented word that reads like the others is the worst possible outcome: nothing on
              the page distinguishes it from a sure reading.
            </P>
            <H3 id="not-transcribing">What a pass will not read</H3>
            <P id="not-transcribing-offline">
              Anything but Gallica's images of a volume in the catalogue. The skills refuse to work
              from a publication's reproduction of a page, from a thumbnail, or from somebody
              else's transcription or edition — a printed Pensées, the Adam–Tannery Descartes, the
              Œuvres de Fermat — not to seed a reading and not to check a word.
            </P>
          </section>
        </div>

        <section className="mt-14 max-w-[52em]">
          <H2 id="not-claimed">What this site does not claim</H2>
          <ul className="prose-fonds mt-3">
            <LI id="not-claimed-edition">
              <strong>That any of this is an edition.</strong> A reading, checkable against the
              leaf on the same screen. Where an edition exists it is marked and linked.
            </LI>
            <LI id="not-claimed-checked">
              <strong>That a person has checked anything</strong>, unless a batch is marked
              Checked in <code>transcripts/status.json</code>, where the claim can be reviewed in a
              diff.
            </LI>
            <LI id="not-claimed-complete">
              <strong>That the catalogue is complete.</strong> It was drawn from Gallica's search by
              name, and a fonds catalogued under another name can have escaped it; only twenty of
              Fourier's twenty-nine volumes and eight of Libri's came up. The inventory says how the
              list was made.
            </LI>
            <LI id="not-claimed-priority">
              <strong>That anyone was first at anything.</strong> The findings page records
              candidates against named sources; a claim of precedence needs a date, and only a
              date on the page or in a dated letter counts.
            </LI>
          </ul>
        </section>

        <Pipeline />
      </main>

      <Footer />
    </>
  );
}

function Progress({ manifest }: { manifest: ReturnType<typeof useManifest> }) {
  return (
    <section className="mt-10">
      <H2 id="where-it-stands">Where it stands</H2>
      <P id="where-it-stands-bars" className="mt-2 max-w-[46em] text-[13.5px] leading-relaxed text-ink-600">
        One bar per cahier, over its digitised volumes only. The grey portion is untouched, and
        the coloured portions are the states below. A cahier whose volumes are all offline has no
        bar, and says so.
      </P>

      <ul className="mt-6 space-y-5">
        {BOOKS.map((b) => {
          const cotes = cotesOf(b);
          const online = cotes.filter((c) => c.pages > 0);
          const batches = online.flatMap((c) =>
            Array.from({ length: batchCount(c.pages) }, (_, i) => {
              const { first, last } = batchRange(i + 1, c.pages);
              return { cote: c.id, batch: i + 1, pages: last - first + 1 };
            }),
          );
          const counts: Record<State, number> = { todo: 0, running: 0, drafted: 0, reviewed: 0, checked: 0, skipped: 0 };
          for (const x of batches) {
            counts[shownState(declared(manifest, x.cote, x.batch), evidence(manifest, x.cote, x.batch))] += 1;
          }
          const mirrored = batches.filter((x) => manifest?.facsimiles?.[x.cote]?.batches.includes(x.batch)).length;

          return (
            <li key={b.key} className="card px-5 py-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="titre text-[17px] text-ink-900">
                  <a href={b.path} className="hover:text-brand-700">
                    {b.title}
                  </a>
                </h3>
                <p className="tabular ml-auto text-[12.5px] text-ink-500">
                  {online.length} of {cotes.length} volumes online · {batches.length} batches · {mirrored} mirrored ·{' '}
                  <strong className="font-semibold text-relu-600">{counts.checked}</strong> checked
                </p>
              </div>
              {batches.length ? (
                <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-ink-200">
                  {(['checked', 'reviewed', 'drafted', 'running', 'skipped'] as State[]).map((s) =>
                    counts[s] ? (
                      <span key={s} className={BAR_COLOURS[s]} style={{ width: `${(counts[s] / batches.length) * 100}%` }} title={`${counts[s]} ${s}`} />
                    ) : null,
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[12.5px] text-ink-500">Nothing of this cahier is online; nothing can be transcribed here.</p>
              )}
            </li>
          );
        })}
      </ul>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-ink-500">
        {STATES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5" title={s.help}>
            <span className={`h-2.5 w-2.5 rounded-sm ${BAR_COLOURS[s.key]}`} />
            {s.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

const BAR_COLOURS: Record<State, string> = {
  todo: 'bg-ink-200',
  running: 'bg-encours-500',
  drafted: 'bg-brand-300',
  reviewed: 'bg-brand-600',
  checked: 'bg-relu-500',
  skipped: 'bg-alerte-200',
};

function Pipeline() {
  const steps = [
    ['npm run catalogue', 'asks Gallica how many views each digitised volume has and writes the typed catalogue; the seed is holdings.json, in the holders’ words'],
    ['npm run archive -- fr-9115 --batches 1', 'mirrors one batch of twenty views into archives/, git-ignored, with a pause between requests'],
    ['/transcribe fr-9115 1', 'one batch, one conversation: the LaTeX transcription with the apparatus, French, header naming the model'],
    ['/modernize fr-9115', 'once every batch of the volume is transcribed: one file for the whole shelfmark, résumé first, keywords last'],
    ['npm run render && npm run pdf && npm run tei && npm run manifest', 'the reading views, the PDFs, the TEI export, and the manifest the site reads at load'],
    ['npm run dev', 'read it beside the facsimile'],
  ];
  return (
    <section className="mt-14 max-w-[52em]">
      <H2 id="pipeline">The pipeline</H2>
      <P id="pipeline-intro" className="prose-fonds mt-3">
        Six commands, in order. Nothing from Gallica is committed at any step, and the only
        versioned output is the <code>.tex</code>.
      </P>
      <ol className="mt-4 space-y-2">
        {steps.map(([cmd, what]) => (
          <li key={cmd} className="card flex flex-col gap-1 px-4 py-3 md:flex-row md:items-baseline md:gap-4">
            <code className="shrink-0 font-mono text-[12.5px] text-ink-900">{cmd}</code>
            <span className="text-[13px] leading-relaxed text-ink-600">{what}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StatusSequence() {
  const SOURCE: Record<State, { from: string; observed: boolean }> = {
    todo: { from: 'Neither file exists', observed: true },
    running: { from: 'transcripts/status.json', observed: false },
    drafted: { from: 'batch-NN.fr.tex exists', observed: true },
    reviewed: { from: '<volume>.modern.tex exists', observed: true },
    checked: { from: 'transcripts/status.json', observed: false },
    skipped: { from: 'transcripts/status.json', observed: false },
  };

  return (
    <section className="mt-12 max-w-[52em]">
      <H2 id="six-states">The six states</H2>
      <P id="six-states-in-the-repository" className="prose-fonds mt-3">
        A batch moves through these in order. Three of the six are read off the files themselves,
        and the other three are written in <code>transcripts/status.json</code>, in the
        repository, where a change is a diff somebody can review.
      </P>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-ink-200 text-left text-[11px] font-bold uppercase tracking-wide text-ink-400">
              <th className="py-2 pr-4">State</th>
              <th className="py-2 pr-4">Means</th>
              <th className="py-2 pr-4">Comes from</th>
              <th className="py-2">Kind</th>
            </tr>
          </thead>
          <tbody className="text-ink-700">
            {STATES.map((s) => (
              <tr key={s.key} className="border-b border-ink-100 align-top">
                <td className="py-2 pr-4">
                  <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE[s.key]}`}>
                    {s.label}
                  </span>
                </td>
                <td className="py-2 pr-4 text-[12.5px] leading-relaxed">{s.help}</td>
                <td className="py-2 pr-4 font-mono text-[11.5px] text-ink-500">{SOURCE[s.key].from}</td>
                <td className="py-2 text-[12px]">
                  {SOURCE[s.key].observed ? <span className="text-relu-700">observed</span> : <span className="text-encours-700">declared</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <P id="six-states-report" className="prose-fonds mt-4">
        The step from <em>AI-reviewed</em> to <em>checked</em> is a person reading against the
        leaves, and readers are how it happens. Every transcribed volume carries a{' '}
        <strong className="font-semibold text-ink-800">Report</strong> button, and so does every
        open batch — it opens an issue with the shelfmark, the batch and the view on screen
        already filled in.
      </P>
    </section>
  );
}

const BADGE: Record<State, string> = {
  todo: 'bg-ink-200 text-ink-500',
  running: 'bg-encours-200 text-encours-700',
  drafted: 'bg-brand-100 text-brand-700',
  reviewed: 'bg-brand-200 text-brand-800',
  checked: 'bg-relu-200 text-relu-700',
  skipped: 'bg-alerte-100 text-alerte-700',
};
