import { useEffect, useRef, useState } from 'react';
import {
  BATCH_SIZE,
  batchRange,
  editionUrl,
  folderTranscription,
  holderOf,
  useManifest,
} from '../lib/batches.ts';
import { editionOf } from '../content/books.ts';
import type { Edition, PaneView, TranscriptEntry, Volume } from '../lib/types.ts';

/**
 * The transcript, rendered from LaTeX, in the left pane.
 *
 * Served as its own document in a frame rather than composed into this page:
 * the transcript wears the ar5iv stylesheet, which claims `:root`, `body` and
 * a hundred generic selectors, and dropped into a Tailwind page it would fight
 * everything. The frame is same-origin, so the parent can still read its
 * layout — which is what drives the facsimile beside it — and it never scrolls
 * itself: it is grown to the exact height of its content and the page does the
 * scrolling.
 */

export const EDITIONS: { key: Edition; label: string; help: string }[] = [
  { key: 'fr', label: 'Transcription', help: 'The leaves as written.' },
  {
    key: 'modern',
    label: 'Modernised',
    help: 'An interpretation in current notation, opening with a summary of the volume.',
  },
];

export function TranscriptPane({
  cote,
  batch,
  available,
  edition,
  onEdition,
  onPage,
}: {
  cote: Volume;
  batch: number;
  available: TranscriptEntry;
  edition: PaneView;
  onEdition: (e: PaneView) => void;
  /** Called with the Gallica view currently at the top of the reading area. */
  onPage: (page: number) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);
  const { first, last } = batchRange(batch, cote.pages);
  const present = available.html.includes(edition);
  const manifest = useManifest();
  const url = editionUrl(manifest, cote.id, batch, edition, 'html');
  const folder = folderTranscription(manifest, cote.id, cote.pages);

  useEffect(() => {
    if (!present) return;
    const el = frame.current;
    if (!el) return;

    let observer: ResizeObserver | undefined;
    const attachHeight = () => {
      const doc = el.contentDocument;
      if (!doc) return;
      const measure = () => setHeight(doc.documentElement.scrollHeight);
      measure();
      observer = new ResizeObserver(measure);
      observer.observe(doc.documentElement);
    };

    el.addEventListener('load', attachHeight);
    if (el.contentDocument?.readyState === 'complete') attachHeight();
    return () => {
      el.removeEventListener('load', attachHeight);
      observer?.disconnect();
    };
  }, [present, url]);

  /**
   * Scrolling the transcript turns the facsimile's pages.
   *
   * The transcript marks each view with `data-page="47"`. Whichever marker is
   * highest in the reading area names the view being read, and the facsimile
   * follows. Reading position, not intersection: the topmost marker above the
   * fold is always defined, and is what a reader would themselves point at.
   */
  useEffect(() => {
    if (!present) return;
    const el = frame.current;
    if (!el) return;

    let detach = () => {};
    const attach = () => {
      const doc = el.contentDocument;
      if (!doc) return;
      const marks = Array.from(doc.querySelectorAll<HTMLElement>('[data-page]'));
      if (!marks.length) return;

      let lastSeen = -1;
      const report = () => {
        const line = window.innerHeight * 0.25;
        const offset = el.getBoundingClientRect().top;
        let current = marks[0];
        for (const m of marks) {
          if (m.getBoundingClientRect().top + offset <= line) current = m;
          else break;
        }
        const page = Number(current.dataset.page);
        if (Number.isFinite(page) && page !== lastSeen) {
          lastSeen = page;
          onPage(page);
        }
      };

      report();
      window.addEventListener('scroll', report, { passive: true });
      detach = () => window.removeEventListener('scroll', report);
    };

    el.addEventListener('load', attach);
    if (el.contentDocument?.readyState === 'complete') attach();
    return () => {
      el.removeEventListener('load', attach);
      detach();
    };
  }, [present, url, onPage]);

  return (
    <section className="card mt-6 overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-ink-200 bg-ink-50 px-4 py-2">
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
            Transcript
          </p>
          <p className="tabular text-[13px] font-medium text-ink-800">
            {cote.shelfmark} · batch {batch}
            {cote.pages > 0 ? ` · views ${first}–${last}` : ''}
          </p>
        </div>

        <div className="ml-auto flex rounded-lg bg-ink-100 p-0.5" role="tablist">
          {EDITIONS.map((e) => (
            <button
              key={e.key}
              type="button"
              role="tab"
              aria-selected={edition === e.key}
              title={e.help}
              onClick={() => onEdition(e.key)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                edition === e.key
                  ? 'bg-white text-ink-900 shadow-[0_1px_3px_rgb(19_18_16/.12)]'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              {e.label}
              {!available.html.includes(e.key) && (
                <span className="ml-1 text-[9px] text-ink-300">○</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {present ? (
        <iframe
          key={url}
          ref={frame}
          src={url}
          title={`Transcript of ${cote.shelfmark}, views ${first}–${last}`}
          scrolling="no"
          style={{ height }}
          className="w-full border-0 bg-white"
        />
      ) : (
        <MissingTranscript
          cote={cote}
          batch={batch}
          edition={edition}
          first={first}
          last={last}
          folder={folder}
        />
      )}
    </section>
  );
}

const Skill = ({ children }: { children: string }) => (
  <code className="rounded border border-ink-200 bg-ink-50 px-1 py-0.5 font-mono text-[12px]">
    {children}
  </code>
);

/**
 * No transcript yet: say what produces one, and with which command — or say
 * why nothing can, when the volume is not online.
 */
function MissingTranscript({
  cote,
  batch,
  edition,
  first,
  last,
  folder,
}: {
  cote: Volume;
  batch: number;
  edition: Edition;
  first: number;
  last: number;
  folder: ReturnType<typeof folderTranscription>;
}) {
  const label = EDITIONS.find((e) => e.key === edition)!.label.toLowerCase();
  const published = editionOf(cote.id);
  const holder = holderOf(cote);

  if (cote.pages === 0) {
    return (
      <div className="flex flex-col items-start gap-3 px-6 py-10">
        <p className="text-[14px] font-semibold text-ink-800">
          Nothing can be transcribed here: the volume is not online.
        </p>
        <p className="max-w-[40em] text-[13.5px] leading-relaxed text-ink-600">
          {cote.shelfmark} is held by the {holder.name}, {holder.city}, and no image of it is
          published. The skills read a facsimile and nothing else, so a transcription of this
          volume can only come from somebody who has sat with the original.
        </p>
        {published && (
          <p className="max-w-[40em] rounded-[var(--radius-card)] border border-relu-200 bg-relu-50/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-700">
            It has been {published.kind === 'published' ? 'printed' : 'transcribed'} by{' '}
            {published.editors} —{' '}
            <a
              href={published.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-relu-700 underline decoration-relu-300 underline-offset-2 hover:text-relu-600"
            >
              {published.title} ↗
            </a>
            . {published.rights}
          </p>
        )}
        <a
          href="/sources/"
          className="text-[12.5px] font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 transition hover:text-brand-700"
        >
          Where every volume is, and on what terms — Sources &amp; rights
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 px-6 py-10">
      <p className="text-[14px] font-semibold text-ink-800">
        No {label} yet for views {first}–{last}.
      </p>

      {published && (
        <p className="max-w-[40em] rounded-[var(--radius-card)] border border-relu-200 bg-relu-50/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-700">
          This volume is in print — {published.editors},{' '}
          <a
            href={published.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-relu-700 underline decoration-relu-300 underline-offset-2 hover:text-relu-600"
          >
            {published.title} ↗
          </a>{' '}
          ({published.year}). {published.rights}
        </p>
      )}

      {edition === 'modern' ? (
        <>
          <p className="max-w-[40em] text-[13.5px] leading-relaxed text-ink-600">
            <Skill>modernize-germain</Skill> derives this edition — a « Résumé » that orients a
            reader new to the subject, then the mathematics in current notation and current
            names, in French. It reads the transcription, never the facsimile, and it takes the
            volume whole rather than one batch: the argument it restates runs across the batch
            boundaries.
          </p>
          {folder.complete ? (
            <>
              <code className="w-full max-w-[40em] rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-[12.5px] text-ink-900">
                /modernize-germain {cote.id}
              </code>
              <p className="max-w-[40em] text-[12.5px] leading-relaxed text-ink-500">
                All {folder.total} {folder.total === 1 ? 'batch' : 'batches'} of this volume are
                transcribed, so one pass writes the modernised reading for every one of them.
              </p>
            </>
          ) : (
            <>
              <p className="max-w-[40em] text-[13.5px] leading-relaxed text-ink-600">
                <strong className="font-semibold text-ink-800">It cannot run on this volume yet.</strong>{' '}
                It needs every batch transcribed first — {folder.done} of {folder.total}{' '}
                {folder.total === 1 ? 'is' : 'are'} done. A reading made without the rest would
                guess where the argument was going.
              </p>
              <code className="w-full max-w-[40em] rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-[12.5px] text-ink-900">
                /transcribe-germain {cote.id}, batch {folder.missing[0]}
              </code>
            </>
          )}
        </>
      ) : (
        <>
          <p className="max-w-[40em] text-[13.5px] leading-relaxed text-ink-600">
            <Skill>transcribe-germain</Skill> reads the very views shown on the right — mirrored
            locally from Gallica's IIIF service — and writes the LaTeX transcription. It works
            one batch at a time, {BATCH_SIZE} views per pass; past that the quality of reading
            falls away with nothing to signal it.
          </p>
          <code className="w-full max-w-[40em] rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-[12.5px] text-ink-900">
            npm run archive -- {cote.id} --batches {batch}
            {'\n'}/transcribe-germain {cote.id} {batch}
          </code>
          <p className="max-w-[40em] text-[12.5px] leading-relaxed text-ink-500">
            The mirror is for the pass, not for the site: it lands in <code>archives/</code>,
            git-ignored, and nothing from Gallica is ever committed.
          </p>
        </>
      )}

      <a
        href="/contribute/"
        className="text-[12.5px] font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 transition hover:text-brand-700"
      >
        Want to help? See how to install the skills and open a pull request.
      </a>
    </div>
  );
}
