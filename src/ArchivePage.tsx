import { useMemo, useState } from 'react';
import { Footer, Header } from './components/Frame.tsx';
import { CorpusMosaic } from './components/CorpusMosaic.tsx';
import { FacsimilePane } from './components/FacsimilePane.tsx';
import { Reader, useReader } from './components/Reader.tsx';
import { BOOKS, EDITIONS, editionOf, piecesIn } from './content/books.ts';
import { COTES, GROUPS, HOLDER_BY_ID } from './content/catalogue.ts';
import { batchCount, declared, evidence, folderTags, sourceUrl } from './lib/batches.ts';
import { shownState } from './lib/progress.ts';
import type { PublishedEdition } from './lib/types.ts';

const KIND_STYLE: Record<PublishedEdition['kind'], string> = {
  published: 'bg-relu-100 text-relu-700 border-relu-200',
  transcribed: 'bg-brand-100 text-brand-700 border-brand-200',
  analysis: 'bg-ink-100 text-ink-600 border-ink-200',
};

const KIND_LABEL: Record<PublishedEdition['kind'], string> = {
  published: 'in print, public domain',
  transcribed: 'transcribed — theirs',
  analysis: 'analysis',
};

/**
 * Every manuscript, mathematician by mathematician.
 *
 * The three cahiers are ways in by period; this page is the thing itself:
 * every volume in the catalogue, under the mathematician whose archive it is,
 * with the holder's own title, dating and extent and whether this site has
 * anything to say about it yet. It exists so that nobody has to take our
 * groupings on trust.
 */
export function ArchivePage() {
  const [query, setQuery] = useState('');
  const { manifest, openCote, openBatch, edition, setEdition, page, onPage, setPage, goTo, close, landing } =
    useReader(COTES);

  const workOn = useMemo(() => {
    const m = new Map<string, { transcribed: number; modernised: number; batches: number }>();
    for (const c of COTES) {
      if (!c.pages) continue;
      const batches = batchCount(c.pages);
      const ks = Array.from({ length: batches }, (_, i) => i + 1);
      m.set(c.id, {
        batches,
        transcribed: ks.filter((k) => evidence(manifest, c.id, k).transcribed).length,
        modernised: ks.filter((k) => evidence(manifest, c.id, k).modernised).length,
      });
    }
    return m;
  }, [manifest]);

  const inBook = useMemo(() => {
    const m = new Map<string, { title: string; path: string }[]>();
    for (const b of BOOKS)
      for (const s of b.sections)
        for (const id of s.cotes) {
          const list = m.get(id) ?? [];
          if (!list.some((x) => x.path === b.path)) list.push({ title: b.navTitle ?? b.title, path: b.path });
          m.set(id, list);
        }
    return m;
  }, []);

  const needle = query.trim().toLowerCase();
  const matches = (id: string) => {
    if (!needle) return true;
    const c = COTES.find((x) => x.id === id);
    if (!c) return false;
    const who = GROUPS.find((g) => g.id === c.group);
    return `${who?.title ?? ''} ${c.id} ${c.shelfmark} ${c.title} ${c.date} ${c.note} ${folderTags(manifest, id).join(' ')} ${piecesIn(id)
      .map((p) => p.title)
      .join(' ')}`
      .toLowerCase()
      .includes(needle);
  };

  const visible = GROUPS.map((g) => ({ ...g, cotes: g.cotes.filter(matches) })).filter(
    (g) => g.cotes.length > 0,
  );
  const shown = visible.reduce((s, g) => s + g.cotes.length, 0);
  const online = COTES.filter((c) => c.pages > 0).length;

  return (
    <>
      <div
        className={`transition-[padding] duration-150 ${
          openBatch ? 'lg:pr-[var(--pane,0px)]' : ''
        }`}
      >
        <Header path="/archive/" />

        <main className="mx-auto max-w-6xl px-5 py-10">
          {openBatch && openCote ? (
            <Reader
              cote={openCote}
              batch={openBatch.batch}
              edition={edition}
              onEdition={setEdition}
              onPage={onPage}
              page={page}
              landing={landing}
              onClose={close}
              backLabel="All the manuscripts"
              state={shownState(
                declared(manifest, openCote.id, openBatch.batch),
                evidence(manifest, openCote.id, openBatch.batch),
              )}
            />
          ) : (
            <>
              <header className="max-w-[48em]">
                <h1 className="titre text-[34px] leading-tight text-ink-900">All the manuscripts</h1>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-700">
                  Every volume in the catalogue, under the mathematician whose archive it is, in
                  the holder's own words. All {online} are digitised and served whole by Gallica;
                  the selection, and what it leaves out, is set out in{' '}
                  <a
                    href="https://github.com/Commutator-IO/germain-project/issues/1"
                    className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
                  >
                    the inventory
                  </a>
                  .
                </p>
              </header>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a mathematician, a title, a shelfmark, a year…"
                  className="w-full max-w-md rounded-lg border border-ink-200 bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                />
                <p className="tabular text-[12.5px] text-ink-500">
                  {shown} of {COTES.length} volumes
                </p>
              </div>

              <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-ink-500">
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block h-3.5 w-6 rounded-sm border-l-[3px] border-l-brand-400 bg-brand-50" />
                  transcribed here
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block h-3.5 w-6 rounded-sm border-l-[3px] border-l-relu-500 bg-relu-50" />
                  edited or in print elsewhere
                </li>
              </ul>

              {/* Only when nothing is being searched: the wall is a view of the
                  whole, and a wall of three blocks would answer a question
                  nobody asked. */}
              {!needle && (
                <CorpusMosaic
                  transcribedHere={(id) => (workOn.get(id)?.transcribed ?? 0) > 0}
                  hasEdition={(id) => Boolean(editionOf(id))}
                  onOpen={(id) => goTo(id, 1)}
                />
              )}

              {visible.map((g) => (
                <section key={g.id} className="mt-9">
                  <h2 className="titre text-[19px] text-ink-900">{g.title}</h2>
                  {g.date && <p className="tabular mt-0.5 text-[12px] text-ink-500">{g.date}</p>}
                  <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-[var(--radius-card)] border border-ink-200 bg-white">
                    {g.cotes.map((id) => {
                      const c = COTES.find((x) => x.id === id)!;
                      const belongs = inBook.get(id) ?? [];
                      const published = editionOf(id);
                      const work = workOn.get(id);
                      const begun = Boolean(work && work.transcribed > 0);
                      const online = c.pages > 0;
                      const holder = HOLDER_BY_ID.get(c.holder)!;
                      return (
                        <li
                          key={id}
                          className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 pr-4 ${
                            begun
                              ? 'border-l-[3px] border-l-brand-400 pl-[13px] bg-brand-50/70'
                              : published
                                ? 'border-l-[3px] border-l-relu-500 pl-[13px] bg-relu-50/40'
                                : !online
                                  ? 'border-l-[3px] border-l-ink-300 pl-[13px] bg-ink-50/60'
                                  : 'pl-4'
                          }`}
                        >
                          <span className="tabular w-40 shrink-0 text-[12px] font-semibold text-ink-700">
                            {c.shelfmark}
                          </span>
                          <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-ink-800">
                            <button
                              type="button"
                              onClick={() => goTo(id, 1)}
                              title={online ? `Open ${c.shelfmark} beside its views` : `Open ${c.shelfmark} — where it is, and who has edited it`}
                              className="text-left underline decoration-ink-200 underline-offset-2 transition hover:text-brand-700 hover:decoration-brand-400"
                            >
                              {c.title}
                            </button>
                            {belongs.map((bk) => (
                              <a
                                key={bk.path}
                                href={bk.path}
                                className="ml-2 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 hover:bg-brand-100"
                              >
                                {bk.title}
                              </a>
                            ))}
                            {work && work.transcribed > 0 && (
                              <button
                                type="button"
                                onClick={() => goTo(id, 1, 'fr')}
                                className="ml-2 whitespace-nowrap rounded-full bg-relu-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-relu-700 transition hover:bg-relu-200"
                              >
                                {work.transcribed === work.batches
                                  ? 'transcribed'
                                  : `${work.transcribed}/${work.batches} transcribed`}
                              </button>
                            )}
                            {work && work.modernised > 0 && (
                              <button
                                type="button"
                                onClick={() => goTo(id, 1, 'modern')}
                                className="ml-1.5 whitespace-nowrap rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 transition hover:bg-brand-200"
                              >
                                {work.modernised === work.batches
                                  ? 'modernised'
                                  : `${work.modernised}/${work.batches} modernised`}
                              </button>
                            )}
                            {folderTags(manifest, id).map((tg) => (
                              <span
                                key={tg}
                                className="ml-1.5 whitespace-nowrap rounded-full border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-ink-500"
                              >
                                {tg}
                              </span>
                            ))}
                            {published && (
                              <a
                                href={published.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${published.title} — ${published.editors}, ${published.year}. ${published.rights}`}
                                className={`ml-2 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition hover:brightness-95 ${KIND_STYLE[published.kind]}`}
                              >
                                {KIND_LABEL[published.kind]} ↗
                                {published.mapping === 'likely' && <span title="correspondence is ours"> ?</span>}
                              </a>
                            )}
                          </span>
                          <span className="tabular shrink-0 text-[12px] text-ink-500">{holder.short}</span>
                          <span className="tabular shrink-0 text-[12px] text-ink-500">{c.date || 's.d.'}</span>
                          <span className="tabular w-28 shrink-0 text-right text-[12px] text-ink-500">
                            {online ? `${c.pages} v. · ${batchCount(c.pages)} b.` : c.folios ? `${c.folios} ff.` : '—'}
                          </span>
                          <a
                            href={sourceUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={online ? 'The volume in Gallica' : 'The holder’s notice'}
                            className="shrink-0 text-[12px] font-medium text-brand-600 hover:text-brand-700"
                          >
                            {online ? 'Gallica' : 'Notice'} ↗
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

              {!visible.length && (
                <p className="mt-10 text-[14px] text-ink-500">Nothing matches “{query}”.</p>
              )}

              <Literature />
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

/**
 * What has already been edited, transcribed or analysed.
 *
 * The most useful thing to know before transcribing a volume is whether
 * someone has already done it, and done it better — and, here, whether one
 * may. A scholar's recent transcription is theirs; a text printed long ago
 * belongs to everyone. The list says which is which.
 */
function Literature() {
  const kinds: PublishedEdition['kind'][] = ['transcribed', 'published', 'analysis'];
  const heading: Record<PublishedEdition['kind'], string> = {
    transcribed: 'Scholarly transcriptions — theirs, linked and never copied',
    published: 'In print, in the public domain',
    analysis: 'Analyses that located or read the manuscripts',
  };
  return (
    <section className="mt-14">
      <h2 className="titre text-[24px] text-ink-900">Already edited, printed, or read</h2>
      <p className="mt-2 max-w-[48em] text-[14px] leading-relaxed text-ink-600">
        Before transcribing anything, look here first. The three kinds are kept apart because the
        distinction is legal before it is scholarly: a public-domain printing may be quoted and
        framed at will; a scholar's recent transcription may be cited and linked and nothing more;
        an analysis is what tells us where a piece is.
      </p>

      {kinds.map((k) => (
        <div key={k} className="mt-8">
          <h3 className="titre text-[17px] text-ink-900">{heading[k]}</h3>
          <ul className="mt-3 space-y-3">
            {EDITIONS.filter((e) => e.kind === k).map((e) => (
              <li key={e.id} className={`card border-l-4 px-5 py-4 ${k === 'transcribed' ? 'border-l-brand-400' : k === 'published' ? 'border-l-relu-500' : 'border-l-ink-300'}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h4 className="titre text-[16px] text-ink-900">
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-ink-300 underline-offset-2 hover:text-brand-700 hover:decoration-brand-400"
                    >
                      {e.title} ↗
                    </a>
                  </h4>
                  {!e.open && (
                    <span className="rounded-full border border-ink-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                      paywalled
                    </span>
                  )}
                  <span className="tabular ml-auto text-[12px] text-ink-500">
                    {e.cotes.length ? e.cotes.join(', ') : 'no volume located'}
                    {e.mapping === 'likely' && <span className="ml-1 text-encours-700">(our reading)</span>}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-ink-600">
                  {e.editors} · {e.year} · <span className="italic">{e.venue}</span>
                </p>
                <p className="mt-2 max-w-[46em] text-[13px] leading-relaxed text-ink-500">{e.note}</p>
                <p className="mt-1.5 max-w-[46em] text-[12.5px] leading-relaxed text-ink-600">
                  <span className="font-semibold text-ink-700">Rights.</span> {e.rights}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
