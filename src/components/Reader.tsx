import { useCallback, useEffect, useState } from 'react';
import { Downloads } from './Downloads.tsx';
import type { OpenBatch } from './FacsimilePane.tsx';
import { TranscriptPane } from './TranscriptPane.tsx';
import { availableFor, batchCount, servedByFolder, useManifest } from '../lib/batches.ts';
import { STATES, type State } from '../lib/progress.ts';
import type { PaneView, Volume } from '../lib/types.ts';

/**
 * The two-pane reader, shared by the cahiers and the archive.
 *
 * One component for both, because the one thing this view promises is that
 * the transcript and the facsimile stay in step, and two readers would drift.
 * The state is here too, in `useReader`: which batch is open, which edition,
 * and which view the transcript last reported are three facts the two panes
 * share.
 */

export const STATE_COLOURS: Record<State, string> = {
  todo: 'bg-ink-200 text-ink-500',
  running: 'bg-encours-200 text-encours-700',
  drafted: 'bg-brand-100 text-brand-700',
  reviewed: 'bg-brand-200 text-brand-800',
  checked: 'bg-relu-200 text-relu-700',
  skipped: 'bg-alerte-100 text-alerte-700',
};

/**
 * Everything the reader needs, driven by the URL fragment.
 *
 * `#fr-9115/3` names the third batch of Français 9115 — what one writes in a
 * notebook when noting where to resume, and what the transcription skill cites
 * in the header of the file it produces. A third segment may name the edition,
 * `#fr-9115/3/modern`, and a fourth a view, `#fr-9115/3/fr/47`, so that a
 * link can land a reader on the very leaf.
 */
export function useReader(cotes: Volume[]) {
  const manifest = useManifest();

  const [open, setOpen] = useState<{ cote: string; batch: number } | null>(null);
  const [edition, setEdition] = useState<PaneView>('fr');
  const [page, setPage] = useState<number | undefined>(undefined);
  const onPage = useCallback((n: number) => setPage(n), []);

  useEffect(() => {
    const readHash = () => {
      const h = /^#([\w-]+)\/(\d+)(?:\/(fr|modern))?(?:\/(\d+))?$/.exec(location.hash);
      setOpen(h ? { cote: h[1], batch: Number(h[2]) } : null);
      if (h?.[3]) setEdition(h[3] as PaneView);
      if (h?.[4]) setPage(Number(h[4]));
    };
    readHash();
    addEventListener('hashchange', readHash);
    return () => removeEventListener('hashchange', readHash);
  }, []);

  const goTo = useCallback((cote: string, batch: number, ed?: PaneView, view?: number) => {
    history.replaceState(
      null,
      '',
      `#${cote}/${batch}${ed ? `/${ed}` : ''}${view ? `${ed ? '' : '/fr'}/${view}` : ''}`,
    );
    setOpen({ cote, batch });
    if (ed) setEdition(ed);
    setPage(view);
  }, []);

  const close = useCallback(() => {
    history.replaceState(null, '', location.pathname);
    setOpen(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (/^#[\w-]+\/\d+\/(fr|modern)/.test(location.hash)) return;
    setEdition('fr');
  }, [open, manifest]);

  const openCote = open ? cotes.find((c) => c.id === open.cote) : undefined;
  const openBatch: OpenBatch | null =
    open && openCote
      ? {
          volume: openCote,
          batch: Math.min(open.batch, batchCount(openCote.pages)),
          page,
          wholeFolder: servedByFolder(manifest, openCote.id, edition, 'html'),
        }
      : null;

  return { manifest, openCote, openBatch, edition, setEdition, page, onPage, setPage, goTo, close };
}

/** The left-hand half: heading, downloads, transcript. */
export function Reader({
  cote,
  batch,
  edition,
  onEdition,
  onPage,
  page,
  onClose,
  backLabel,
  state,
}: {
  cote: Volume;
  batch: number;
  edition: PaneView;
  onEdition: (e: PaneView) => void;
  onPage: (n: number) => void;
  page?: number;
  onClose: () => void;
  backLabel: string;
  state: State;
}) {
  const manifest = useManifest();
  const available = availableFor(manifest, cote.id, batch);
  const label = STATES.find((s) => s.key === state)!;
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-ink-200 px-2.5 py-1 text-[12.5px] font-medium text-ink-600 transition hover:border-brand-500 hover:text-brand-700"
        >
          ← {backLabel}
        </button>
        <h1 className="titre min-w-0 flex-1 truncate text-[21px] text-ink-900" title={cote.title}>
          {cote.title}
        </h1>
        <span
          title={label.help}
          className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATE_COLOURS[state]}`}
        >
          {label.label}
        </span>
      </div>

      <p className="tabular mt-1 text-[12.5px] text-ink-500">
        {cote.shelfmark} · {cote.date || 's.d.'} ·{' '}
        {cote.pages > 0 ? `${cote.pages} views` : 'not online'}
        {cote.folios ? ` · ${cote.folios} leaves` : ''}
      </p>

      <Downloads cote={cote.id} ark={cote.ark} batch={batch} page={page} available={available} />

      <TranscriptPane
        cote={cote}
        batch={batch}
        available={available}
        edition={edition}
        onEdition={onEdition}
        onPage={onPage}
      />

      <p className="mt-4 max-w-[46em] text-[12.5px] leading-relaxed text-ink-500">
        Scrolling the transcript turns the facsimile: whichever view is marked highest in the
        reading area is the one shown on the right. Use ← and → to step between batches, ‹ and ›
        in the pane to step one view, and Escape to close the facsimile.
      </p>
    </>
  );
}
