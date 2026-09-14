import { useMemo, useState } from 'react';
import { Footer, Header } from './components/Frame.tsx';
import { FacsimilePane } from './components/FacsimilePane.tsx';
import { Reader, STATE_COLOURS, useReader } from './components/Reader.tsx';
import { book, cotesOf, editionOf, hiddenBy, piece } from './content/books.ts';
import { HOLDER_BY_ID } from './content/catalogue.ts';
import {
  BATCH_SIZE,
  batchCount,
  batchRange,
  declared,
  evidence,
  folderTags,
  sourceUrl,
  useManifest,
} from './lib/batches.ts';
import { STATES, shownState, tally, type State } from './lib/progress.ts';
import { issueUrl } from './lib/report.ts';
import type { BookKey, Piece, Volume } from './lib/types.ts';

/**
 * A cahier: its volumes, and — once a batch is open — a two-pane workspace.
 *
 * The page rests on one idea: what you click in the list is exactly what gets
 * transcribed. Each digitised volume unfolds into twenty-view batches, and
 * each batch is at once a set of Gallica images, a row of progress, and the
 * argument to a command. A volume that is not online is listed too, with where
 * it is and who has edited it, and opens on a pane that says so rather than on
 * a blank one.
 */
export function BookPage({ bookKey }: { bookKey: BookKey }) {
  const b = book(bookKey);
  const cotes = useMemo(() => cotesOf(b), [b]);
  const { manifest, openCote, openBatch, edition, setEdition, page, onPage, setPage, goTo, close } =
    useReader(cotes);

  const online = cotes.filter((c) => c.pages > 0);
  const allBatches = online.flatMap((c) =>
    Array.from({ length: batchCount(c.pages) }, (_, i) => {
      const { first, last } = batchRange(i + 1, c.pages);
      return {
        cote: c.id,
        batch: i + 1,
        pages: last - first + 1,
        state: shownState(declared(manifest, c.id, i + 1), evidence(manifest, c.id, i + 1)),
      };
    }),
  );
  const t = tally(allBatches);
  const transcribedBatches = allBatches.filter((x) => evidence(manifest, x.cote, x.batch).transcribed).length;
  const modernisedBatches = allBatches.filter((x) => evidence(manifest, x.cote, x.batch).modernised).length;

  return (
    <>
      <div
        className={`transition-[padding] duration-150 ${
          openBatch ? 'lg:pr-[var(--pane,0px)]' : ''
        }`}
      >
        <Header path={b.path} />

        <main className="mx-auto max-w-6xl px-5 py-10">
          {openBatch && openCote ? (
            <Reader
              cote={openCote}
              batch={openBatch.batch}
              edition={edition}
              onEdition={setEdition}
              onPage={onPage}
              page={page}
              onClose={close}
              backLabel="Cahier"
              state={shownState(
                declared(manifest, openCote.id, openBatch.batch),
                evidence(manifest, openCote.id, openBatch.batch),
              )}
            />
          ) : (
            <>
              <header className="max-w-[48em]">
                <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-brand-600">
                  {b.period}
                </p>
                <h1 className="titre mt-2 text-[34px] leading-tight text-ink-900">{b.title}</h1>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-700">{b.subtitle}</p>

                <p className="tabular mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-500">
                  <span>
                    <strong className="font-semibold text-ink-800">{cotes.length}</strong> volumes
                  </span>
                  <span>
                    <strong className="font-semibold text-ink-800">{online.length}</strong> online
                  </span>
                  <span>
                    <strong className="font-semibold text-ink-800">
                      {t.pagesTotal.toLocaleString('en-GB')}
                    </strong>{' '}
                    views
                  </span>
                  <span>
                    <strong className="font-semibold text-ink-800">{allBatches.length}</strong>{' '}
                    batches of {BATCH_SIZE}
                  </span>
                  <span title="Batches with a transcript, counted from the manifest">
                    <strong className="font-semibold text-relu-600">{transcribedBatches}</strong>{' '}
                    transcribed
                  </span>
                  <span title="Batches with a modernised reading — read again by machine">
                    <strong className="font-semibold text-brand-600">{modernisedBatches}</strong>{' '}
                    modernised
                  </span>
                  <span title="Batches a person compared against the leaves — a declaration">
                    <strong className="font-semibold text-ink-800">{t.byState.checked}</strong>{' '}
                    checked
                  </span>
                </p>
              </header>

              <Provenance rationale={b.rationale} />

              {b.sections.map((s) => {
                const kept = s.cotes.filter((id) => !hiddenBy(b, id));
                const pieces = (s.pieces ?? []).map(piece).filter((p): p is Piece => Boolean(p));
                return (
                  <section key={s.title} className="mt-9">
                    <h2 className="titre text-[21px] text-ink-900">{s.title}</h2>
                    <p className="mt-1.5 max-w-[46em] text-[13.5px] leading-relaxed text-ink-600">
                      {s.intro}
                    </p>
                    {pieces.length > 0 && <Pieces pieces={pieces} onOpen={goTo} />}
                    {kept.length > 0 && (
                      <ul className="mt-4 space-y-2.5">
                        {kept.map((id) => {
                          const cote = cotes.find((c) => c.id === id)!;
                          return (
                            <CoteCard key={id} cote={cote} manifest={manifest} onOpen={goTo} />
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })}

              <MirrorCommand cotes={online} />
            </>
          )}
        </main>

        <Footer />
      </div>

      {openBatch && (
        <FacsimilePane
          open={openBatch}
          onClose={close}
          onBatch={(n) => goTo(openBatch.volume.id, n)}
          onView={setPage}
        />
      )}
    </>
  );
}

/** Where this grouping comes from — always ours, and said so. */
function Provenance({ rationale }: { rationale: string }) {
  return (
    <div className="card mt-7 max-w-[52em] border-l-4 border-l-encours-500 px-5 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">
        Editorial grouping
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{rationale}</p>
    </div>
  );
}

/**
 * The pieces the literature has located in a section's volumes.
 *
 * Each names its source, because the location is somebody's finding and not
 * the catalogue's. A piece whose views have been found opens the reader on
 * them; one whose views are unknown says so, and that sentence is the task.
 */
function Pieces({
  pieces,
  onOpen,
}: {
  pieces: Piece[];
  onOpen: (cote: string, batch: number, ed?: 'fr' | 'modern', view?: number) => void;
}) {
  return (
    <ul className="mt-4 space-y-2">
      {pieces.map((p) => {
        const v = p.views;
        const batch = v ? Math.ceil(v.first / BATCH_SIZE) : null;
        return (
          <li key={p.id} className="rounded-[var(--radius-card)] border border-brand-200 bg-brand-50/50 px-4 py-3">
            <p className="text-[14px] font-medium leading-snug text-ink-900">
              {p.title}
              <span className="tabular ml-2 text-[12px] font-normal text-ink-500">{p.folios}</span>
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">
              <span className="font-semibold text-ink-700">Located by</span> {p.source}.
              {p.note && <> {p.note}</>}
            </p>
            {v && batch ? (
              <button
                type="button"
                onClick={() => onOpen(p.volume, batch, 'fr', v.first)}
                className="mt-2 rounded-lg border border-brand-300 bg-white px-2.5 py-1 text-[12px] font-medium text-brand-700 transition hover:border-brand-500"
              >
                Open at view {v.first}
              </button>
            ) : (
              <p className="mt-1.5 text-[12px] text-ink-500">
                Views not yet located in the images
                {p.volume === 'fr-9115' ? ' — the folio has to be found by reading.' : '.'}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A volume, unfolded into twenty-view batches — or, offline, into where it is. */
function CoteCard({
  cote,
  manifest,
  onOpen,
}: {
  cote: Volume;
  manifest: ReturnType<typeof useManifest>;
  onOpen: (cote: string, batch: number) => void;
}) {
  const count = batchCount(cote.pages);
  const [unfolded, setUnfolded] = useState(false);
  const ks = Array.from({ length: count }, (_, i) => i + 1);
  const transcribed = cote.pages ? ks.filter((k) => evidence(manifest, cote.id, k).transcribed).length : 0;
  const modernised = cote.pages ? ks.filter((k) => evidence(manifest, cote.id, k).modernised).length : 0;
  const holder = HOLDER_BY_ID.get(cote.holder)!;
  const published = editionOf(cote.id);
  const online = cote.pages > 0;

  return (
    <li
      className={`card overflow-hidden ${
        transcribed ? 'border-l-4 border-l-relu-500' : !online ? 'border-l-4 border-l-ink-300' : ''
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setUnfolded(!unfolded)}
          aria-expanded={unfolded}
          disabled={!online}
          className="mt-0.5 shrink-0 rounded-md border border-ink-200 px-1.5 py-0.5 text-[11px] text-ink-500 transition enabled:hover:border-brand-400 enabled:hover:text-brand-700 disabled:opacity-30"
        >
          {unfolded ? '▾' : '▸'}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-snug text-ink-900">
            {cote.title}
            {!online && (
              <span className="ml-2 whitespace-nowrap rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                not online
              </span>
            )}
            {transcribed > 0 && (
              <span className="ml-2 whitespace-nowrap rounded-full bg-relu-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-relu-700">
                {transcribed === count ? 'transcribed' : `${transcribed}/${count} transcribed`}
              </span>
            )}
            {modernised > 0 && (
              <span className="ml-1.5 whitespace-nowrap rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                {modernised === count ? 'modernised' : `${modernised}/${count} modernised`}
              </span>
            )}
            {published && (
              <a
                href={published.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${published.title} — ${published.editors}, ${published.year}. ${published.rights}`}
                className="ml-1.5 inline-block whitespace-nowrap rounded-full border border-relu-200 bg-relu-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-relu-700 hover:brightness-95"
              >
                {published.kind === 'published' ? 'in print' : 'transcribed by ' + published.editors.split(' ').pop()} ↗
              </a>
            )}
          </p>
          <p className="tabular mt-1 flex flex-wrap gap-x-3 text-[12px] text-ink-500">
            <span className="font-semibold text-ink-700">{cote.shelfmark}</span>
            <span>{holder.short}</span>
            <span>{cote.date || 's.d.'}</span>
            {cote.folios && <span>{cote.folios} leaves</span>}
            {online ? (
              <span>
                {cote.pages} views · {count} batch{count > 1 ? 'es' : ''}
              </span>
            ) : null}
          </p>
          <p className="mt-1.5 max-w-[60em] text-[12.5px] leading-relaxed text-ink-500">{cote.note}</p>
          {folderTags(manifest, cote.id).length > 0 && (
            <p className="mt-1.5 flex flex-wrap gap-1.5">
              {folderTags(manifest, cote.id).map((tg) => (
                <span
                  key={tg}
                  className="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[10.5px] font-medium text-ink-500"
                >
                  {tg}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
          {transcribed > 0 && (
            <a
              href={issueUrl({ cote: cote.id, ark: cote.ark })}
              target="_blank"
              rel="noopener noreferrer"
              title={`Report a problem with the reading of ${cote.shelfmark}`}
              className="rounded-lg border border-ink-200 px-2 py-1 text-[12px] font-medium text-ink-500 transition hover:border-relu-400 hover:text-relu-700"
            >
              Report
            </a>
          )}
          <a
            href={sourceUrl(cote)}
            target="_blank"
            rel="noopener noreferrer"
            title={online ? 'The volume in Gallica' : 'The holder’s catalogue notice'}
            className="rounded-lg border border-ink-200 px-2 py-1 text-[12px] font-medium text-ink-500 transition hover:border-brand-400 hover:text-brand-700"
          >
            {online ? 'Gallica' : 'Notice'} ↗
          </a>
          <button
            type="button"
            onClick={() => onOpen(cote.id, 1)}
            className="rounded-lg border border-ink-200 px-2.5 py-1 text-[12px] font-medium text-ink-600 transition hover:border-brand-500 hover:text-brand-700"
          >
            Open
          </button>
        </div>
      </div>

      {unfolded && online && (
        <ol className="grid grid-cols-2 gap-px border-t border-ink-100 bg-ink-100 sm:grid-cols-3 lg:grid-cols-4">
          {ks.map((k) => (
            <BatchRow
              key={k}
              cote={cote}
              batch={k}
              state={shownState(declared(manifest, cote.id, k), evidence(manifest, cote.id, k))}
              onOpen={() => onOpen(cote.id, k)}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

function BatchRow({
  cote,
  batch,
  state,
  onOpen,
}: {
  cote: Volume;
  batch: number;
  state: State;
  onOpen: () => void;
}) {
  const { first, last } = batchRange(batch, cote.pages);
  const label = STATES.find((s) => s.key === state)!;
  return (
    <li className="flex items-center gap-2 bg-white px-3 py-1.5">
      <button
        type="button"
        onClick={onOpen}
        className="tabular min-w-0 flex-1 text-left text-[12.5px] text-ink-700 transition hover:text-brand-700"
      >
        <span className="font-medium">Batch {batch}</span>{' '}
        <span className="text-ink-400">
          f. {first}–{last}
        </span>
      </button>
      <span
        title={label.help}
        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATE_COLOURS[state]}`}
      >
        {label.label}
      </span>
    </li>
  );
}

/**
 * Mirroring, which reading does not require.
 *
 * The pane reads Gallica directly. A local copy is for the transcription pass,
 * which reads image files: twenty JPEGs in a directory, fetched once from the
 * IIIF service with a pause between each, and never committed.
 */
function MirrorCommand({ cotes }: { cotes: Volume[] }) {
  if (!cotes.length) return null;
  return (
    <section className="card mt-12 max-w-[52em] px-5 py-4">
      <h2 className="titre text-[17px] text-ink-900">Mirroring, for transcription</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">
        Not needed to read — the pane asks Gallica for each view as you turn it. The
        transcription pass works from a local batch of {BATCH_SIZE} images:
      </p>
      <code className="mt-3 block rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-[12.5px] text-ink-900">
        npm run archive -- {cotes[0].id} --batches 1-3
      </code>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">
        Files land in <code className="font-mono">archives/</code>, which is git-ignored; no image
        of any volume is ever versioned. Gallica's terms allow this for non-commercial use with the
        source stated, and the script states it in its user agent and pauses between requests.
      </p>
    </section>
  );
}
