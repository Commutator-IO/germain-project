/**
 * Where a manuscript physically is, and on what terms it can be shown.
 *
 * Sophie Germain had no institution, and her papers went where Guglielmo
 * Libri took them: most to the Bibliothèque nationale (seized from his Paris
 * apartment in 1848), a couple of hundred sheets to Florence (shipped with
 * the collection he kept), her letters to Gauss to Göttingen with Gauss's own
 * papers, and the three prize memoirs to the Académie that received them. So
 * unlike a fonds catalogued in one place, this corpus has five holders, and
 * what this site may do with a page depends on which one holds it.
 */
export type HolderId = 'bnf' | 'academie' | 'moreniana' | 'goettingen' | 'nypl';

export interface Holder {
  id: HolderId;
  name: string;
  /** For chips and the facsimile header. */
  short: string;
  city: string;
  url: string;
  /**
   * `iiif` — page images served under an open API this site may display;
   * `onsite` — no images online, the reading room is the only access;
   * `database` — a catalogue or letter database with some scans, on terms this
   * site has not verified and does not embed.
   */
  access: 'iiif' | 'onsite' | 'database';
  /** What the holder's own conditions say, in one sentence, with the source. */
  terms: string;
  termsUrl?: string | null;
}

/**
 * A *volume* — one shelfmark, the catalogue's own unit, and this site's.
 *
 * At the BnF a shelfmark is a bound volume of several hundred leaves; at the
 * Académie it is a prize dossier; in Florence a cassetta and an inserto. The
 * field names keep the shape the reading panes expect: `pages` counts what the
 * facsimile can turn — **Gallica views**, one per scanned image, which is the
 * only numbering the IIIF manifest exposes (every canvas is labelled « NP »).
 * Folio numbers, where the leaf carries one, are recorded by the
 * transcription with `\folio{}` and never by this catalogue.
 */
export interface Volume {
  /** `fr-9115`, `naf-4073`, `ads-1811` — a slug, also the transcripts directory. */
  id: string;
  holder: HolderId;
  /** As the holder writes it: « Français 9115 », « NAF 4073 ». */
  shelfmark: string;
  /** The catalogue's title, verbatim; in [brackets] when we supplied one. */
  title: string;
  /** The catalogue's dating, verbatim. */
  date: string;
  /** Gallica views. Zero when nothing is online. */
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
  /** The catalogue grouping this belongs to, for the archive page. */
  group: string;
}

/** A grouping on the archive page: one holder, or one series within it. */
export interface ArchiveGroup {
  id: string;
  title: string;
  date: string;
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
 * A *cahier* — this site's unit of reading.
 *
 * Nobody catalogued Germain by subject: the BnF bound what Libri had in three
 * volumes of « dissertations et problèmes », the Académie filed three memoirs
 * under three prize years, and the letters are wherever their recipients'
 * papers went. One reads otherwise — the elasticity memoirs together, the
 * Fermat manuscripts together with the 1819 letter that summarises them. A
 * cahier names that thread and says where it comes from. `inventoryGroup`
 * points at a catalogue unit when the cahier is one, and is `null` when the
 * grouping is ours, which for Germain it always is.
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

export type BookKey = 'elasticity' | 'fermat' | 'numbers' | 'letters';

/**
 * Which register a transcript is written in.
 *
 * Two, in order of distance from the page: the transcription is what is on
 * the paper; `modern` is a reading of it in today's mathematics, opening with a
 * summary for someone who has not met the subject. Both in French — hers.
 */
export type Edition = 'fr' | 'modern';

export type PaneView = Edition;

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
 * `published` work is Germain's own text in print, in the public domain since
 * long before anyone reading this was born: it may be quoted, framed and
 * transcribed freely. A `transcribed` edition is somebody's recent editorial
 * work on her manuscripts — Grun's transcription of the three memoirs, Del
 * Centina's of Manuscript D — and it belongs to them: this site links to it,
 * cites it, and never copies a line of it, however convenient copying would
 * be. An `analysis` is a paper about the manuscripts, cited for what it
 * establishes (where a piece is, what it says) and nothing more.
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
 * reasoning; one thing changes here. Germain's letters are dated and several
 * manuscripts can be placed by their contents, so a claim about *when* she
 * had a result is sometimes checkable — but only from a date on the page or in
 * a dated letter, never from an inference, and the entry must say which.
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
