import { useEffect, useState } from 'react';
import { BY_ID, HOLDER_BY_ID } from '../content/catalogue.ts';
import type { Edition, Holder, Manifest, TranscriptEntry, Volume } from './types.ts';

/**
 * The twenty-view batch, shared by the reading panes and by the skill.
 *
 * Twenty is not a round number picked for tidiness. It is about as much as a
 * model holds in one pass before the tail of the output degrades, and about as
 * much as a person re-reads in one sitting when checking a transcription
 * against the page. The unit here is the Gallica **view** — one scanned image,
 * usually one side of a leaf — because that is the only numbering the IIIF
 * manifest exposes: every canvas of every Germain volume is labelled « NP ».
 */
export const BATCH_SIZE = 20;

export const batchCount = (pages: number) => Math.max(1, Math.ceil(pages / BATCH_SIZE));

/** The views a batch covers, numbered as Gallica numbers them (`f1`, `f2`, …). */
export function batchRange(k: number, pages: number): { first: number; last: number } {
  return { first: (k - 1) * BATCH_SIZE + 1, last: Math.min(k * BATCH_SIZE, pages) };
}

export const batchId = (cote: string, batch: number) => `${cote}#${batch}`;

export const batchName = (k: number) => `batch-${String(k).padStart(2, '0')}`;

/**
 * Gallica's IIIF Image API, which the browser reads directly.
 *
 * No relay stands between this site and the BnF, and none is needed: the
 * manifests and the images are served with `Access-Control-Allow-Origin: *`
 * (measured 10 September 2026), the certificate is valid, and Gallica's own
 * blog invites sites to embed documents this way. So the pane asks Gallica for
 * exactly the image a reader is looking at, at the width the pane is, and the
 * bytes go from the BnF to the reader without touching this origin. Nothing is
 * stored here, and nothing is re-served.
 *
 * `width` is rounded to a step of 200 px so that a pane dragged a few pixels
 * wider does not defeat the browser's cache and ask Gallica for a fresh image.
 */
export const GALLICA = 'https://gallica.bnf.fr';

export function iiifImage(ark: string, view: number, width: number): string {
  const w = Math.max(200, Math.round(width / 200) * 200);
  return `${GALLICA}/iiif/ark:/12148/${ark}/f${view}/full/${w},/0/native.jpg`;
}

/** The full-resolution image, for the zoomed state. Several megabytes. */
export const iiifFull = (ark: string, view: number) =>
  `${GALLICA}/iiif/ark:/12148/${ark}/f${view}/full/full/0/native.jpg`;

/** The view as Gallica's own reader shows it — the citation to give. */
export const gallicaView = (ark: string, view: number) =>
  `${GALLICA}/ark:/12148/${ark}/f${view}.item`;

/**
 * Where the reader is sent for the original.
 *
 * Gallica's viewer for a digitised volume; the holder's catalogue notice for
 * the rest. Never a copy on this origin — there is none.
 */
export function sourceUrl(v: Volume, view?: number): string {
  if (v.ark) return view ? gallicaView(v.ark, view) : `${GALLICA}/ark:/12148/${v.ark}`;
  return v.notice ?? HOLDER_BY_ID.get(v.holder)?.url ?? '#';
}

export const holderOf = (v: Volume): Holder => HOLDER_BY_ID.get(v.holder)!;

export const volume = (id: string): Volume | undefined => BY_ID.get(id);

export const transcriptUrl = (cote: string, k: number, edition: Edition, ext: string) =>
  `/transcripts/${cote}/${batchName(k)}.${edition}.${ext}`;

/**
 * The same, for an edition whose unit is the volume rather than the batch.
 *
 * `fr-9115.modern.tex` covers a shelfmark entire. The name repeats the
 * shelfmark rather than saying `volume`, because these files are offered as
 * downloads and `volume.modern.pdf` in a downloads directory says nothing.
 */
export const folderTranscriptUrl = (cote: string, edition: Edition, ext: string) =>
  `/transcripts/${cote}/${cote}.${edition}.${ext}`;

export const folderEntry = (m: Manifest | null, cote: string): TranscriptEntry | undefined =>
  m?.folders?.[cote];

export function servedByFolder(
  m: Manifest | null,
  cote: string,
  edition: Edition,
  ext: 'html' | 'tex' | 'pdf' | 'xml',
): boolean {
  return (folderEntry(m, cote)?.[ext] ?? []).includes(edition);
}

/** Where a batch's edition actually lives: the volume-wide file wins when it exists. */
export function editionUrl(
  m: Manifest | null,
  cote: string,
  k: number,
  edition: Edition,
  ext: 'html' | 'tex' | 'pdf' | 'xml',
): string {
  return servedByFolder(m, cote, edition, ext)
    ? folderTranscriptUrl(cote, edition, ext)
    : transcriptUrl(cote, k, edition, ext);
}

/** Every edition available for a batch, counting the volume-wide ones. */
export function availableFor(m: Manifest | null, cote: string, k: number): TranscriptEntry {
  const own = transcript(m, cote, k);
  const whole = folderEntry(m, cote);
  if (!whole) return own;
  const merge = (a: Edition[], b: Edition[]) => [...new Set([...a, ...b])];
  return {
    html: merge(own.html, whole.html),
    tex: merge(own.tex, whole.tex),
    pdf: merge(own.pdf, whole.pdf),
    xml: merge(own.xml ?? [], whole.xml ?? []),
  };
}

/**
 * What is actually present locally.
 *
 * The site ships without a single image of any volume — the facsimile is
 * Gallica's, read at view time — and the manifest says which transcripts
 * exist. A missing manifest is not an error: it is a freshly cloned
 * repository, and the site still works as a catalogue.
 */
export function useManifest(): Manifest | null {
  const [m, setM] = useState<Manifest | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setM(j))
      .catch(() => {
        // Nothing generated yet: the site still works, as a catalogue.
      });
    return () => {
      alive = false;
    };
  }, []);
  return m;
}

export function transcript(m: Manifest | null, cote: string, k: number) {
  return m?.transcripts?.[batchId(cote, k)] ?? { html: [], tex: [], pdf: [], xml: [] };
}

/** What exists for a batch, as the state model consumes it. */
export function evidence(m: Manifest | null, cote: string, k: number) {
  const html = availableFor(m, cote, k).html;
  return { transcribed: html.includes('fr'), modernised: html.includes('modern') };
}

/** How far the volume's transcription has got, batch by batch. */
export function folderTranscription(m: Manifest | null, cote: string, pages: number) {
  const total = batchCount(pages);
  const missing: number[] = [];
  for (let k = 1; k <= total; k++) if (!evidence(m, cote, k).transcribed) missing.push(k);
  return { total, missing, done: total - missing.length, complete: missing.length === 0 };
}

/** What was claimed for a batch in `transcripts/status.json`. */
export function declared(m: Manifest | null, cote: string, k: number) {
  return m?.declared?.[batchId(cote, k)];
}

/** The volume's tags, from the modernised reading's `\keywords{}` line. Empty until one exists. */
export function folderTags(m: Manifest | null, cote: string): string[] {
  return m?.tags?.[cote] ?? [];
}
