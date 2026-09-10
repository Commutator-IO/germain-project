import { useCallback, useEffect, useRef, useState } from 'react';
import {
  batchCount,
  batchRange,
  gallicaView,
  holderOf,
  iiifFull,
  iiifImage,
  sourceUrl,
} from '../lib/batches.ts';
import { REPO } from '../lib/report.ts';
import type { Volume } from '../lib/types.ts';

/**
 * The facsimile, opened in a pane to the right of the transcript.
 *
 * This is the gesture of anyone transcribing: the page on one side, what one
 * makes of it on the other. Doing it inside the page avoids the round trip
 * between tabs, which costs the reading position every time.
 *
 * The parent project needed a relay for this — Montpellier forbade framing and
 * served an expired certificate. **Nothing of the kind is needed here.** Gallica
 * publishes every digitised volume through the IIIF Image API with
 * `Access-Control-Allow-Origin: *`, so the pane asks the BnF for one image at
 * one width and shows it in an `<img>`. The bytes go from Gallica to the
 * reader; this origin never sees them, stores nothing, and re-serves nothing.
 * The attribution Gallica's conditions ask for is printed under every image.
 *
 * Two things the pane cannot do, both said on the pane rather than left to be
 * discovered. It cannot show a volume that is not online — the Académie's
 * memoirs, the Florence papers — and it says instead where they are. And it
 * cannot know the folio: Gallica labels every view « NP », so the pane counts
 * views, and the foliation pencilled on the leaf is what the transcription
 * records with `\folio{}`.
 */

const WIDTH_KEY = 'germain.facsimile.width';
const MIN_WIDTH = 380;
const DEFAULT_WIDTH = 640;
const MAX_SHARE = 0.72;

export interface OpenBatch {
  volume: Volume;
  /** Batch number within the volume, from 1. */
  batch: number;
  /** The Gallica view to show, when the transcript says which one is being read. */
  page?: number;
  /**
   * Whether the reading open on the left covers the whole volume — the
   * modernised reading does — so that its `\pagerange{}` markers may name any
   * view of it, not only this batch's twenty.
   */
  wholeFolder?: boolean;
}

function clamp(w: number): number {
  return Math.min(Math.max(w, MIN_WIDTH), window.innerWidth * MAX_SHARE);
}

/** The view to show: the transcript's, clamped to the batch, else the batch's first. */
function viewOf(b: OpenBatch): number {
  const { first, last } = b.wholeFolder
    ? { first: 1, last: b.volume.pages }
    : batchRange(b.batch, b.volume.pages);
  return b.page ? Math.min(Math.max(b.page, first), last) : first;
}

/**
 * The view, held back until the reader stops moving.
 *
 * `onPage` fires on every marker the transcript scrolls past, and each distinct
 * view is a request to Gallica. A fast scroll crosses several markers a
 * second; this turns that into one request once scrolling stops.
 */
function useSettledView(open: OpenBatch, delay = 350): number {
  const target = viewOf(open);
  const [settled, setSettled] = useState(target);
  useEffect(() => {
    const t = setTimeout(() => setSettled(target), delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return settled;
}

export function FacsimilePane({
  open,
  onClose,
  onBatch,
  onView,
}: {
  open: OpenBatch;
  onClose: () => void;
  onBatch: (batch: number) => void;
  /** The reader stepped to a view by hand; the transcript may want to follow. */
  onView?: (view: number) => void;
}) {
  const view = useSettledView(open);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const widthRef = useRef(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const set = useCallback((w: number) => {
    widthRef.current = w;
    setWidth(w);
  }, []);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(WIDTH_KEY, String(Math.round(widthRef.current)));
    } catch {
      // Private browsing: nothing to remember, the pane still works.
    }
  }, []);

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(WIDTH_KEY));
      if (stored >= MIN_WIDTH) set(stored);
    } catch {
      // Default width: enough to read a scanned quarto leaf.
    }
  }, [set]);

  const widthCss = `min(${Math.round(width)}px, ${Math.round(MAX_SHARE * 100)}vw)`;

  useEffect(() => {
    document.documentElement.style.setProperty('--pane', widthCss);
    return () => {
      document.documentElement.style.removeProperty('--pane');
    };
  }, [widthCss]);

  const v = open.volume;
  const count = batchCount(v.pages);
  const { first, last } = batchRange(open.batch, v.pages);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && open.batch > 1) onBatch(open.batch - 1);
      if (e.key === 'ArrowRight' && open.batch < count) onBatch(open.batch + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onBatch, open.batch, count]);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer already released: the window listeners suffice.
    }
  };

  const endDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    persist();
  }, [persist]);

  useEffect(() => {
    if (!isDragging) return;
    const follow = (e: PointerEvent) => {
      if (!dragging.current) return;
      if (e.buttons === 0) {
        endDrag();
        return;
      }
      set(clamp(window.innerWidth - e.clientX));
    };
    window.addEventListener('pointermove', follow);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [isDragging, set, endDrag]);

  useEffect(
    () => () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    },
    [],
  );

  const onHandleKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 64 : 16;
    if (e.key === 'ArrowLeft') set(clamp(widthRef.current + step));
    else if (e.key === 'ArrowRight') set(clamp(widthRef.current - step));
    else if (e.key === 'Home') set(clamp(DEFAULT_WIDTH));
    else return;
    e.preventDefault();
    persist();
  };

  const holder = holderOf(v);

  return (
    <aside
      className="fixed right-0 top-0 z-50 hidden h-dvh flex-col border-l border-ink-200 bg-white shadow-[-8px_0_24px_-16px_rgb(19_18_16/.35)] lg:flex"
      style={{ width: widthCss }}
      aria-label={`Facsimile — ${v.shelfmark}, views ${first} to ${last}`}
    >
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Facsimile pane width"
        aria-valuenow={Math.round(Math.min(width, window.innerWidth * MAX_SHARE))}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={Math.round(window.innerWidth * MAX_SHARE)}
        onPointerDown={startDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={onHandleKey}
        className={`absolute left-0 top-0 h-full w-2 cursor-col-resize touch-none transition focus-visible:bg-brand-400 focus-visible:outline-none ${
          isDragging ? 'bg-brand-400' : 'bg-transparent hover:bg-brand-200'
        }`}
      />

      <header className="flex shrink-0 items-start gap-3 border-b border-ink-200 px-4 py-2.5 pl-5">
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
            {holder.short} · {v.shelfmark} · {v.date || 's.d.'}
          </p>
          <p className="truncate text-[13px] font-medium text-ink-800" title={v.title}>
            {v.title}
          </p>
        </div>
        <a
          href={v.ark ? gallicaView(v.ark, view) : sourceUrl(v)}
          target="_blank"
          rel="noopener noreferrer"
          title={v.ark ? 'This very view in Gallica’s own reader' : 'The holder’s catalogue notice'}
          className="mt-0.5 shrink-0 rounded-lg border border-ink-200 px-2.5 py-1 text-[12px] font-medium text-ink-600 transition hover:border-brand-500 hover:text-brand-700"
        >
          {v.ark ? 'Gallica' : 'Notice'} ↗
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded-lg border border-ink-200 px-2.5 py-1 text-[12px] font-medium text-ink-600 transition hover:border-alerte-500 hover:text-alerte-700"
        >
          Close
        </button>
      </header>

      {v.ark ? (
        <>
          <BatchBar
            batch={open.batch}
            count={count}
            first={first}
            last={last}
            pages={v.pages}
            view={view}
            onBatch={onBatch}
            onView={onView}
          />
          <ViewImage ark={v.ark} view={view} width={width} dragging={isDragging} />
          <p className="shrink-0 border-t border-ink-100 bg-ink-50 px-5 py-2 text-[11.5px] leading-relaxed text-ink-500">
            Source gallica.bnf.fr / Bibliothèque nationale de France — {v.shelfmark}, view{' '}
            {view}. Read from Gallica's IIIF service as you turn the pages; nothing is stored here.
          </p>
        </>
      ) : (
        <NotOnline volume={v} />
      )}
    </aside>
  );
}

/**
 * One view, at the pane's width, from Gallica.
 *
 * Fitted to the pane by default; a click toggles the full-resolution image,
 * which scrolls inside the pane — that is the state in which a doubtful word
 * is settled. Each is a separate request to Gallica and each is labelled while
 * it is in flight, because a blank pane and a slow pane look the same.
 */
function ViewImage({
  ark,
  view,
  width,
  dragging,
}: {
  ark: string;
  view: number;
  width: number;
  dragging: boolean;
}) {
  const [zoom, setZoom] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const src = zoom ? iiifFull(ark, view) : iiifImage(ark, view, width * dpr);

  useEffect(() => setState('loading'), [src]);

  return (
    <div
      className={`relative min-h-0 flex-1 overflow-auto bg-ink-100 ${dragging ? 'pointer-events-none' : ''}`}
    >
      {state === 'loading' && (
        <p className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-md bg-white/85 px-2.5 py-1 text-[12px] text-ink-500 shadow-sm">
          Asking Gallica for view {view}…
        </p>
      )}
      {state === 'failed' ? (
        <Failed ark={ark} view={view} onRetry={() => setState('loading')} />
      ) : (
        <img
          key={src}
          src={src}
          alt={`View ${view}`}
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
          onClick={() => setZoom(!zoom)}
          title={zoom ? 'Click to fit the pane' : 'Click for the full-resolution image'}
          className={zoom ? 'max-w-none cursor-zoom-out' : 'w-full cursor-zoom-in'}
          draggable={false}
        />
      )}
    </div>
  );
}

/**
 * Gallica did not answer.
 *
 * It happens: Gallica rate-limits, and an afternoon of fast page-turning can
 * earn a reset. Say so, offer the same view in their reader, and let the
 * reader try again — the request goes to the BnF, not to us, so there is
 * nothing on this side to fix.
 */
function Failed({ ark, view, onRetry }: { ark: string; view: number; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 py-8">
      <p className="text-[13px] font-semibold text-ink-800">Gallica did not return view {view}.</p>
      <p className="max-w-[34em] text-[13px] leading-relaxed text-ink-600">
        The image is requested from the BnF directly, not from this site, and Gallica limits how
        fast one address may ask. Wait a moment and try again, or open the view in their reader.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-brand-700"
        >
          Try again
        </button>
        <a
          href={gallicaView(ark, view)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-ink-200 px-3 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-700"
        >
          View {view} at Gallica ↗
        </a>
      </div>
    </div>
  );
}

/**
 * The volume is not online, and the pane says where it is instead.
 *
 * Deliberately no image and no placeholder: the Académie asserts rights on
 * reproductions of the memoirs, Florence has digitised nothing, and a pane
 * showing anything else would suggest the reader is looking at the manuscript.
 */
function NotOnline({ volume: v }: { volume: Volume }) {
  const holder = holderOf(v);
  return (
    <div className="flex min-h-0 flex-1 flex-col items-start gap-3 overflow-auto bg-ink-100 px-6 py-8">
      <p className="text-[13px] font-semibold text-ink-800">This volume is not online.</p>
      <p className="max-w-[36em] text-[13px] leading-relaxed text-ink-600">
        <strong className="font-semibold text-ink-800">{v.shelfmark}</strong> is held by the{' '}
        {holder.name}, {holder.city}. {v.note}
      </p>
      <p className="max-w-[36em] text-[12.5px] leading-relaxed text-ink-500">{holder.terms}</p>
      <div className="flex flex-wrap gap-2">
        {v.notice && (
          <a
            href={v.notice}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            Catalogue notice ↗
          </a>
        )}
        <a
          href={holder.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-700"
        >
          {holder.short} ↗
        </a>
      </div>
      <p className="max-w-[36em] text-[12.5px] leading-relaxed text-ink-500">
        Nothing can be transcribed here from a volume nobody can see. If a digitisation appears,
        or if you have consulted the original and want to add what you read, the{' '}
        <a
          href={`${REPO}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-ink-300 underline-offset-2 hover:text-brand-700"
        >
          issue tracker ↗
        </a>{' '}
        is where to say so.
      </p>
    </div>
  );
}

/** The twenty-view step, and the single view within it. */
function BatchBar({
  batch,
  count,
  first,
  last,
  pages,
  view,
  onBatch,
  onView,
}: {
  batch: number;
  count: number;
  first: number;
  last: number;
  pages: number;
  view: number;
  onBatch: (b: number) => void;
  onView?: (v: number) => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ink-100 bg-ink-50 px-4 py-1.5 pl-5">
      <button
        type="button"
        disabled={batch <= 1}
        onClick={() => onBatch(batch - 1)}
        className="rounded-md border border-ink-200 bg-white px-2 py-0.5 text-[12px] text-ink-600 transition enabled:hover:border-brand-500 enabled:hover:text-brand-700 disabled:opacity-35"
        aria-label="Previous batch"
      >
        ←
      </button>
      <label className="flex items-baseline gap-1.5 text-[12px] text-ink-600">
        <span className="font-medium">Batch</span>
        <input
          type="number"
          min={1}
          max={count}
          value={batch}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (n >= 1 && n <= count) onBatch(n);
          }}
          className="tabular w-14 rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-center text-[12px] text-ink-900"
        />
        <span className="text-ink-400">/ {count}</span>
      </label>
      <button
        type="button"
        disabled={batch >= count}
        onClick={() => onBatch(batch + 1)}
        className="rounded-md border border-ink-200 bg-white px-2 py-0.5 text-[12px] text-ink-600 transition enabled:hover:border-brand-500 enabled:hover:text-brand-700 disabled:opacity-35"
        aria-label="Next batch"
      >
        →
      </button>

      {/* The single view, steppable by hand. When a batch has no transcript
          yet there is no marker to drive the pane, and a reader — or a pass
          checking what a batch holds — still needs to turn one leaf at a time. */}
      <span className="tabular ml-auto flex items-center gap-1.5 text-[12px] text-ink-500">
        <button
          type="button"
          disabled={!onView || view <= first}
          onClick={() => onView?.(view - 1)}
          className="rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[11px] text-ink-600 transition enabled:hover:border-brand-500 enabled:hover:text-brand-700 disabled:opacity-35"
          aria-label="Previous view"
        >
          ‹
        </button>
        view <strong className="font-semibold text-brand-700">{view}</strong>
        <span className="text-ink-400">
          of {first}–{last} · {pages} views
        </span>
        <button
          type="button"
          disabled={!onView || view >= last}
          onClick={() => onView?.(view + 1)}
          className="rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[11px] text-ink-600 transition enabled:hover:border-brand-500 enabled:hover:text-brand-700 disabled:opacity-35"
          aria-label="Next view"
        >
          ›
        </button>
      </span>
    </div>
  );
}
