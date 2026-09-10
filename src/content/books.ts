import raw from './books.json';
import editionsRaw from './editions.json';
import piecesRaw from './pieces.json';
import { BY_ID, COTES } from './catalogue.ts';
import type { Book, BookKey, BookSection, Piece, PublishedEdition, Volume } from '../lib/types.ts';

export const EDITIONS = editionsRaw as PublishedEdition[];
export const PIECES = piecesRaw as Piece[];

/**
 * The four cahiers, read back from the JSON the mirroring script also reads.
 *
 * Typing is applied here rather than in the JSON: this is the one place where
 * a volume cited by a cahier but absent from the catalogue would show, and it
 * is better that it show on start-up than when a pane opens empty.
 */
export const BOOKS: Book[] = raw as Book[];

export const BY_KEY = new Map(BOOKS.map((b) => [b.key, b]));

export function book(key: BookKey): Book {
  const b = BY_KEY.get(key);
  if (!b) throw new Error(`Unknown cahier: ${key}`);
  return b;
}

/**
 * Volumes somebody has already edited or transcribed, and by whom.
 *
 * Only the `published` and `transcribed` kinds count: a paper *about* a
 * volume does not make it edited. And the distinction matters for what this
 * site may do next. A volume with a public-domain printed edition can be
 * transcribed here freely, with the print beside it as a check. A volume with
 * a recent scholarly transcription is one where the better reading already
 * exists and belongs to somebody — the memoirs at the Académie are the case —
 * and this site's part is to link to it, not to duplicate it and not to copy.
 */
const EDITED = new Map<string, PublishedEdition>();
for (const e of EDITIONS) {
  if (e.kind === 'analysis') continue;
  for (const c of e.cotes) if (!EDITED.has(c)) EDITED.set(c, e);
}

export const editionOf = (id: string) => EDITED.get(id);

/** Every work in the list that bears on a volume, analyses included. */
export const literatureFor = (id: string) => EDITIONS.filter((e) => e.cotes.includes(id));

/** The pieces the literature has located in a volume. */
export const piecesIn = (id: string) => PIECES.filter((p) => p.volume === id);

export const piece = (id: string) => PIECES.find((p) => p.id === id);

/**
 * The volumes nobody has transcribed — the work this project is for.
 *
 * Counting against everything measures the corpus; counting against these
 * measures the job. Anything shown against this denominator shows the other
 * one too.
 */
export const UNEDITED: Volume[] = COTES.filter((c) => !EDITED.has(c.id));
export const EDITED_COTES: Volume[] = COTES.filter((c) => EDITED.has(c.id));

/** The volumes with images online — the only ones a pass can read here. */
export const ONLINE: Volume[] = COTES.filter((c) => c.pages > 0);
export const OFFLINE: Volume[] = COTES.filter((c) => c.pages === 0);

/**
 * Volumes inside a cahier that is being worked through now. Not a claim that
 * any view of them is transcribed — that is read off the files — but the
 * weaker fact that they are spoken for.
 */
export const IN_PROGRESS: ReadonlySet<string> = new Set(
  BOOKS.filter((b) => b.inProgress).flatMap((b) => b.sections.flatMap((s) => s.cotes)),
);

export const hiddenBy = (b: Book, id: string) => (b.excludeEdited ? EDITED.get(id) : undefined);

/** A cahier's volumes, in section order, deduplicated — a volume may sit in two sections. */
export function cotesOf(b: Book): Volume[] {
  const seen = new Set<string>();
  return b.sections.flatMap((s) =>
    s.cotes
      .filter((id) => !hiddenBy(b, id) && !seen.has(id) && seen.add(id))
      .map((id) => {
        const c = BY_ID.get(id);
        if (!c) throw new Error(`Volume ${id} cited by “${b.title}” but absent from the catalogue.`);
        return c;
      }),
  );
}

export function excludedOf(b: Book, s: BookSection): { cote: Volume; edition: PublishedEdition }[] {
  return s.cotes.flatMap((id) => {
    const e = hiddenBy(b, id);
    const c = BY_ID.get(id);
    return e && c ? [{ cote: c, edition: e }] : [];
  });
}

/** Views a cahier can actually show — its digitised volumes' views. */
export const pagesOf = (b: Book) => cotesOf(b).reduce((s, c) => s + c.pages, 0);

/** The whole corpus online, for the figure that gives it as it stands. */
export const TOTAL_PAGES = COTES.reduce((s, c) => s + c.pages, 0);
