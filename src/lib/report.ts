import { batchName, gallicaView } from './batches.ts';

/**
 * Reporting a defect in a reading.
 *
 * Everything on this site was produced by a model on a first pass, and the
 * project says so on the home page. That admission is worth nothing without a
 * way to act on it: a reader who spots a misread word is, at that moment, the
 * only person in the world who knows. The cost of telling us has to be one
 * click, or it does not happen.
 *
 * It goes to the repository's issue tracker rather than to a form of our own:
 * the site is static, and an issue is public, so a disputed reading stays
 * visible next to the file it disputes, which is what an apparatus is for.
 */
export const REPO = 'https://github.com/Commutator-IO/germain-project';

/** Raw file host for the same repository, for downloading a skill directly. */
export const RAW = 'https://raw.githubusercontent.com/Commutator-IO/germain-project/main';

export interface ReportContext {
  cote: string;
  /** The Gallica ark, when the volume is digitised, so the report links the very view. */
  ark?: string | null;
  /** Absent when reporting on a whole volume rather than one batch. */
  batch?: number;
  /** The view on screen, when the reader is in the reading view. */
  page?: number;
}

export function issueUrl({ cote, ark, batch, page }: ReportContext): string {
  const where = batch ? `${cote}, ${batchName(batch)}` : `volume ${cote}`;
  const title = `[${where}] `;

  const body = [
    `**Volume** ${cote}`,
    batch ? `**Batch** ${batchName(batch)}` : null,
    `**View** ${page ? page : '<which Gallica view?>'}`,
    '**Edition** transcription (`.fr`) / modernised reading (`.modern`) — delete one',
    '',
    '### What the reading says',
    '',
    '### What the page shows',
    '',
    '### Anything else',
    '',
    '---',
    ark ? `Facsimile: ${gallicaView(ark, page ?? 1)}` : 'Facsimile: not online — say how you consulted it.',
    'Reported from the reading view. These editions are first-pass machine work;',
    'corrections are the point of publishing them.',
  ]
    .filter((l) => l !== null)
    .join('\n');

  return `${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('reading')}`;
}
