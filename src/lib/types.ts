/**
 * Where a manuscript physically is, and on what terms it can be shown.
 *
 * Every volume this site reads is digitised and freely viewable in Gallica —
 * that is the whole selection rule. Nearly all are the BnF's own (département
 * des Manuscrits, Bibliothèque de l'Arsenal); a few belong to partners whose
 * manuscripts Gallica serves under the same IIIF service (the École des ponts
 * for Prony). The holder is still named on every volume, because it is whose
 * catalogue the title comes from and whose conditions apply.
 */
export type HolderId = 'bnf' | 'enpc';

export interface Holder {
  id: HolderId;
  name: string;
  /** For chips and the facsimile header. */
  short: string;
  city: string;
  url: string;
  /** `iiif` — page images served under an open API this site may display. */
  access: 'iiif';
  /** What the holder's own conditions say, in one sentence, with the source. */
  terms: string;
  termsUrl?: string | null;
}

/**
 * A *volume* — one shelfmark, the catalogue's own unit, and this site's.
 *
 * At the BnF a shelfmark is a bound volume, from a single letter to several
 * hundred leaves. The
 * field names keep the shape the reading panes expect: `pages` counts what the
 * facsimile can turn — **Gallica views**, one per scanned image, which is the
 * only numbering the IIIF manifest exposes (every canvas is labelled « NP »).
 * Folio numbers, where the leaf carries one, are recorded by the
 * transcription with `\folio{}` and never by this catalogue.
 */
export interface Volume {
  /** `fr-9115`, `naf-4073`, `latin-10247` — a slug, also the transcripts directory. */
  id: string;
  holder: HolderId;
  /** As the holder writes it: « Français 9115 », « NAF 4073 ». */
  shelfmark: string;
  /** The catalogue's title, verbatim; in [brackets] when we supplied one. */
  title: string;
  /** The catalogue's dating, verbatim. */
  date: string;
  /** Gallica views. */
  pages: number;
  /** Leaves, as the catalogue counts them; null when the catalogue does not say. */
  folios: number | null;
  /** The rest of the physical description, verbatim. */
  extent: string;
  /** The holder's catalogue notice. */
  notice: string | null;
  /** Gallica ark identifier — `btv1b90724875` — when digitised there. */
  ark: string | null;
  /** What the volume holds and how it came to be there, in a sentence or two. */
  note: string;
  /** The mathematician whose archive this is — an `ArchiveGroup` id. */
  group: string;
}

/**
 * A grouping on the archive page: one mathematician's volumes (or an album of
 * several hands), with the century whose cahier lists them.
 */
export interface ArchiveGroup {
  id: string;
  /** The mathematician, as usually named: « Joseph Fourier ». */
  title: string;
  /** Life dates. */
  date: string;
  century: BookKey;
  cotes: string[];
}

/**
 * A *piece* — a manuscript the literature has located inside a volume.
 *
 * The catalogue stops at the binding: « Recueil de dissertations et problèmes
 * mathématiques et physiques, 372 feuillets ». What is on folio 348 is known
 * only because somebody read it and published where. This is that record,
 * with its source, so that a reader knows whose location they are trusting.
 * `views` is filled once a pass has found the folios among the images — the
 * manifest gives no foliation, so the correspondence is established by
 * looking, and is null until it has been.
 */
export interface Piece {
  id: string;
  volume: string;
  /** As the source cites it: « ff. 198r–208v ». */
  folios: string;
  title: string;
  /** Who located it there, and where they say so. */
  source: string;
  /** Gallica views, once found. Null until a pass has located them. */
  views: { first: number; last: number } | null;
  note?: string;
}

/**
 * A *cahier* — this site's unit of reading: one period.
 *
 * The volumes come from a dozen fonds catalogued in as many ways — the BnF's
 * Français and Nouvelles acquisitions, the Latin series, Rothschild, the
 * Arsenal, the École des ponts. A cahier puts side by side the mathematicians
 * of one period, one section each, so that Mersenne's correspondents sit next
 * to Mersenne. The grouping is ours; `inventoryGroup` stays `null`.
 */
export interface Book {
  key: BookKey;
  path: string;
  title: string;
  navTitle?: string;
  subtitle: string;
  period: string;
  inventoryGroup: string | null;
  /** What was kept and on whose authority — printed at the top of the page. */
  rationale: string;
  excludeEdited?: boolean;
  inProgress?: boolean;
  sections: BookSection[];
}

export interface BookSection {
  title: string;
  intro: string;
  cotes: string[];
  /** Pieces the literature has located in these volumes, by id. */
  pieces?: string[];
}

export type BookKey = 'xvii' | 'xviii' | 'xix';

/**
 * Which register a transcript is written in.
 *
 * Two, in order of distance from the page: the transcription is what is on
 * the paper; `modern` is a reading of it in today's mathematics, opening with a
 * summary for someone who has not met the subject. Both in the language of the
 * volume — French for most, Latin transcribed as Latin.
 */
export type Edition = 'fr' | 'modern';

/**
 * What the pane may be showing. `tei` is the transcription rendered from its
 * TEI export (`npm run tei-view`) rather than from the `.tex` (#5). It has no
 * tab of its own: it is reachable only through the fragment
 * `#<cote>/<batch>/tei`, and the two renderings are checked against each other,
 * page by page, by `npm run check-tei` — the Transcription tab does not switch
 * over until that is green. Kept out of `Edition`, which is what indexes the
 * manifest: nothing that looks a file up should ever be handed `tei`.
 */
export type PaneView = Edition | 'tei';

/** Everything present locally, written by `npm run archive` and `npm run manifest`. */
export interface Manifest {
  batchSize: number;
  generated: string;
  /** Views mirrored under `archives/<volume>/`, as JPEGs, by batch. */
  facsimiles: Record<string, { views: number; batches: number[] }>;
  transcripts: Record<string, TranscriptEntry>;
  folders?: Record<string, TranscriptEntry>;
  declared: Record<string, 'running' | 'checked' | 'skipped'>;
  tags?: Record<string, string[]>;
  /** Views actually transcribed per volume, counted from the `\page{N}` marks. */
  read?: Record<string, number>;
}

/** Keyed by `<volume>#<batch>`. */
export interface TranscriptEntry {
  html: Edition[];
  tex: Edition[];
  pdf: Edition[];
  xml?: Edition[];
}

/**
 * What has already been edited, transcribed or analysed, by whom, and on what
 * terms this site may use it.
 *
 * Three kinds, and the distinction is legal before it is scholarly. A
 * `published` work is the mathematician's own text in print, in the public
 * domain: it may be quoted, framed and transcribed freely. A `transcribed`
 * edition is somebody's recent editorial work on the manuscripts, and it
 * belongs to them: this site links to it, cites it, and never copies a line of
 * it, however convenient copying would be. An `analysis` is a paper about the
 * manuscripts, cited for what it establishes (where a piece is, what it says)
 * and nothing more.
 */
export interface PublishedEdition {
  id: string;
  title: string;
  editors: string;
  year: string;
  venue: string;
  url: string;
  kind: 'published' | 'transcribed' | 'analysis';
  /** Volumes this work covers, as far as we can establish. */
  cotes: string[];
  mapping: 'certain' | 'likely' | 'unmapped';
  note: string;
  /** The rights position, in one sentence, and what follows for this site. */
  rights: string;
  /** Whether the full text is openly readable at `url`. */
  open: boolean;
}

/**
 * A candidate novelty: something a volume establishes that may not stand in
 * the published literature. See `Finding` in the parent project for the
 * reasoning; one thing changes here. Letters are dated and many manuscripts
 * can be placed by their contents, so a claim about *when* someone had a
 * result is sometimes checkable — but only from a date on the page or in a
 * dated letter, never from an inference, and the entry must say which.
 */
export interface Finding {
  id: string;
  cote: string;
  pages: string;
  kind: 'mathematical' | 'historical' | 'codicological';
  claim: string;
  basis: string;
  ours: string | null;
  literature: string[];
  status: 'unsearched' | 'candidate' | 'matched' | 'confirmed';
  settle: string;
}
