import { editionUrl, useManifest } from '../lib/batches.ts';
import { issueUrl } from '../lib/report.ts';
import type { Edition, TranscriptEntry } from '../lib/types.ts';
import { EDITIONS } from './TranscriptPane.tsx';

/**
 * Every edition of a batch, in source and in print.
 *
 * A transcript that can only be read on this site is a transcript one cannot
 * use. The `.tex` is the artifact that matters — it is what gets cited,
 * corrected, and folded into a larger document — and the `.pdf` is what one
 * sends to someone who will not compile anything. Both are offered per edition
 * rather than as one bundle: the person who wants the French transcription and
 * the person who wants the modernised reading are almost never the same
 * person.
 *
 * **These open rather than download.** Wanting to glance at a formula is far
 * commoner than wanting a file on disk, and a click that silently drops
 * something in Downloads answers the rarer question. The PDF opens in the
 * browser's own viewer; the `.tex` opens in a page that displays it, because
 * a static host labels `.tex` as `application/x-tex` and every browser saves
 * that instead of showing it. The raw file is one link away inside, for
 * whoever actually wants it.
 *
 * Buttons appear only for files that exist. A link that 404s teaches the
 * reader to distrust every other button on the page.
 */
export function Downloads({
  cote,
  ark,
  batch,
  page,
  available,
}: {
  cote: string;
  /** The Gallica ark, so a report links the very view. */
  ark?: string | null;
  batch: number;
  /** The page the reader is on, so a report arrives already located. */
  page?: number;
  available: TranscriptEntry;
}) {
  const manifest = useManifest();
  const rows = EDITIONS.map((e) => ({
    ...e,
    tex: available.tex.includes(e.key),
    pdf: available.pdf.includes(e.key),
    // The TEI export, derived from the `.tex` by `npm run tei`. Only the
    // transcription has one: it is the edition whose apparatus TEI encodes.
    xml: (available.xml ?? []).includes(e.key),
  })).filter((r) => r.tex || r.pdf || r.xml);

  if (!rows.length) {
    return (
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-500">
        Nothing to open for this batch yet — the skill writes the LaTeX, and{' '}
        <code className="rounded border border-ink-200 bg-ink-50 px-1 py-0.5 font-mono text-[11.5px]">
          npm run pdf
        </code>{' '}
        compiles it.
      </p>
    );
  }

  /* Reporting sits in this row rather than at the foot of the transcript:
     the moment a reader doubts a word is the moment they are looking at it,
     and a link they have to scroll to find is a link nobody uses. */
  const report = (
    <a
      href={issueUrl({ cote, ark, batch, page })}
      target="_blank"
      rel="noopener noreferrer"
      title="Open a prefilled issue — the shelfmark, batch and view come with it"
      className="ml-auto flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-ink-600 transition hover:border-relu-400 hover:text-relu-700"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none">
        <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.6v4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11.2" r="0.85" fill="currentColor" />
      </svg>
      Report a reading
    </a>
  );

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">
        Source &amp; print
      </p>
      <ul className="flex flex-wrap gap-2">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5">
            <span className="text-[12.5px] font-medium text-ink-700" title={r.help}>
              {r.label}
            </span>
            {(['tex', 'pdf', 'xml'] as const).map((ext) =>
              r[ext] ? (
                <a
                  key={ext}
                  // The source opens through its wrapper page; the PDF opens
                  // in the browser's viewer; the TEI opens as a reading view
                  // rendered from the XML (`npm run tei-view`), which links the
                  // XML itself to open or download. None downloads.
                  href={
                    ext === 'xml'
                      ? editionUrl(manifest, cote, batch, r.key as Edition, ext).replace(
                          /\.xml$/,
                          '.tei.html',
                        )
                      : editionUrl(manifest, cote, batch, r.key as Edition, ext) +
                        (ext === 'tex' ? '.html' : '')
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  title={
                    ext === 'xml'
                      ? `Open the ${r.label.toLowerCase()} rendered from its TEI P5 export in a new tab — the XML is linked there to open or download`
                      : `Open the ${r.label.toLowerCase()} ${ext.toUpperCase()} in a new tab`
                  }
                  className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-ink-600 transition hover:bg-brand-100 hover:text-brand-700"
                >
                  {ext === 'xml' ? 'tei' : ext}
                </a>
              ) : null,
            )}
          </li>
        ))}
      </ul>
      {report}
    </div>
  );
}
