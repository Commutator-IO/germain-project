import type { Finding } from '../lib/types.ts';

/**
 * Candidate findings, written by `/find-novelty` and never by hand.
 *
 * Every entry is a claim about the literature, not about the manuscript. The
 * manuscript can be read; the literature can only be searched, never
 * exhausted. `literature` therefore says what was searched, by name, and
 * distinguishes what was read from what was only seen through a search
 * result — an entry that does not name what was searched fails the build
 * rather than reaching a reader.
 *
 * First harvest: NAF 4073, 12 September 2026, on claude-opus-5, the model
 * that wrote that volume's modernised reading. Nothing here is `confirmed`;
 * only a person may set that.
 */
export const FINDINGS: Finding[] = [
  {
    id: 'naf-4073-galois-letter-folios',
    cote: 'naf-4073',
    pages: 'views 27–29 (ff. 20r–21v)',
    kind: 'codicological',
    claim:
      "Sophie Germain's letter to Libri of 18 April 1831 — the one that reports Galois's expulsion from the École normale — occupies ff. 20r–21v of NAF 4073, which are Gallica views 27–29. The letter is much published; the literature searched here cites it by shelfmark alone, without folios and without a view.",
    basis:
      "The BnF's pencilled foliation read on the rectos: 20 at the head of view 27, 21 at view 28, and the verso 21v at view 29. The four written pages run continuously from the dateline « Paris ce 18 avril 1831 » to the signature « Sophie Germain », with no leaf of another piece between them.",
    ours:
      'The folio-to-view mapping, and only that. The text of the letter is not ours and is not claimed as unpublished: it was printed in 1879.',
    literature: [
      'Henry 1879, « Les manuscrits de Sophie Germain et leur récent éditeur. Documents nouveaux », Revue philosophique de la France et de l’étranger 8, 619–641 — reported by search results to print this letter at 631–632, citing « MS. Fr. (Nouv. Acq.) 4073 » with no folio. Not read here.',
      'Bucciarelli and Dworsky 1980, 121–122 — reported to give the letter in English, shelfmark only. Not read here.',
      'Del Centina and Fiocca 2018, « On the Correspondence of Sophie Germain » (Springer) — searched, not read: paywalled. Its stated aim is a thorough account of the presently known correspondence, so it is the first place this claim can fail.',
      'Del Centina 2005, Historia Mathematica 32; Del Centina 2008, Archive for History of Exact Sciences 62; Del Centina and Fiocca 2012, AHES 66; Laubenbacher and Pengelley 2010, Historia Mathematica 37 — searched for a folio-level citation of NAF 4073; none surfaced.',
    ],
    status: 'candidate',
    settle:
      'Open Del Centina and Fiocca 2018 and look at its inventory of NAF 4073. If it cites this letter by folio, the entry becomes `matched`; if it cites the shelfmark only, the mapping stands as the first published one.',
  },
  {
    id: 'naf-4073-triangular-note',
    cote: 'naf-4073',
    pages: 'view 42 (f. 32v)',
    kind: 'codicological',
    claim:
      'NAF 4073 f. 32v — the address leaf of the unsigned letter of 13 March 1814 — carries an unattributed mathematical note in a hand that is not the letter’s, stating what in modern notation is T(n−1)² + T(n)² = T(n²). It is the only formula in the volume, and no catalogue or study searched here records that this correspondence volume contains mathematics at all.',
    basis:
      'The leaf gives the identity as ((n²−n)/2)² + ((n²+n)/2)² = (n⁴+n²)/2 together with the sentence that reads it, « le triangulaire d’un quarré est la somme des quarrés des deux Triangulaires consécutifs ». The note is in ink, written head-to-foot against the address, and must postdate the letter it covers, hence 13 March 1814.',
    ours:
      'The identification of the leaf’s (n²∓n)/2 with the triangular numbers T(n−1) and T(n), and the terminus post quem drawn from the leaf having served as a cover. The identity itself is classical and is claimed as nobody’s discovery — the finding is that this note exists here, not that its mathematics is new. The hand is not attributed: the transcription records a resemblance to the hand of the letter of 18 April 1831 and declines to conclude on fifteen words, and so does the reading.',
    literature: [
      'The BnF notice for NAF 4073 as recorded in this site’s catalogue — « Lettres de Delambre, Joseph Fourier, Sophie Germain, Lagrange, Lalande et G. Libri. Provient des papiers de Libri. » — which describes the volume as letters and mentions no note and no mathematics.',
      'Del Centina 2008, AHES 62, and Laubenbacher and Pengelley 2010, Historia Mathematica 37 — the two studies that work through her number-theoretic leaves; searched for any use of NAF 4073 as a mathematical source, none surfaced.',
      'Del Centina and Fiocca 2018 — searched, not read: paywalled.',
      'Not searched: Henry 1879, which printed « documents nouveaux » from these papers and is the likeliest place for a note of this kind to have been mentioned already.',
    ],
    status: 'candidate',
    settle:
      'Read Henry 1879, 619–641, for any mention of a note on the cover of the 1814 letter. Independently, a palaeographic comparison of these fifteen words against a dated corpus of her hand would settle whose note it is — which the present entry does not claim.',
  },
  {
    id: 'naf-4073-lagrange-berlin-leaves',
    cote: 'naf-4073',
    pages: 'views 31–34 (ff. 24r–26v)',
    kind: 'codicological',
    claim:
      'The three Lagrange leaves bound at NAF 4073 ff. 24–26 are three distinct letters written from Berlin to a correspondent at Turin, none of them addressed to Sophie Germain, and they do not all belong to the date « ce 10 Juillet 1776 » carried by the first: the third is of July 1778.',
    basis:
      'Only f. 24 carries a date and a signature. F. 25 has neither salutation nor signature and turns on Denina’s disgrace over a recent book, set against his history of Italy, and on a medal of the Empress of Russia struck for the last academic jubilee. F. 26 opens « Monsieur », breaks off unsigned with the next leaf wanting, and reports « les grandes armées qui sont maintenant en campagne » and « on assure que le Roi est entré en Boheme ». Frederick II entered Bohemia in July 1778, at the opening of the War of the Bavarian Succession.',
    ours:
      'The separation of the run into three pieces and the dating of the third from its war news; the Petersburg jubilee and the Denina affair are brought in as external checks. The addressee is not identified here. Note that the transcription marks the year on f. 24v as a doubtful reading, the third numeral being 7 or 5.',
    literature: [
      'Œuvres de Lagrange, t. XIII–XIV (correspondance) — not collated. This is the obvious place for these three letters to be already printed and identified, and the entry is written expecting that they may be.',
      'Searched, nothing surfaced: web search for these leaves as Lagrange letters held in NAF 4073, and for the phrase « le Roi est entré en Bohême » in his published correspondence.',
      'Del Centina and Fiocca 2018 — searched, not read: paywalled; it describes the correspondence of Germain, which by this entry’s own claim these letters are not.',
    ],
    status: 'candidate',
    settle:
      'Collate the three leaves against Œuvres de Lagrange t. XIV, letters to his Turin correspondents of 1776–1778. That would both test the tripartition and name the addressee — Saluzzo, who handled Lagrange’s affairs and his father at Turin, is the candidate the contents suggest and is deliberately not asserted here.',
  },
  {
    id: 'naf-4073-lagrange-germinal-date',
    cote: 'naf-4073',
    pages: 'view 29 (f. 22r)',
    kind: 'historical',
    claim:
      'Lagrange’s undated note to Germain, « Paris ce 17 germinal (mercredi) », can only be 6 April 1796 or 7 April 1802: across the fourteen years of the Republican calendar, 17 germinal fell on a Wednesday in the year IV and in the year X and in no other.',
    basis:
      'The dated source is the leaf itself, which carries the Republican day and the weekday in Lagrange’s own hand — « Paris ce 17 germinal (mercredi) », with « le 19 et le 20. (vendredi, et samedi) » following. No inference from ink or content enters the dating.',
    ours:
      'The calendar computation, run over years I to XIV on the usual concordance. Also a correction: the transcription treats the agreement of « 19 = vendredi, 20 = samedi » with « 17 (mercredi) » as corroborating the numeral 17, but that agreement holds automatically for any Wednesday-17 and corroborates nothing about which numeral was written. The whole dating rests on two readings — the numeral, which the transcription flags as a barred figure, and the word « mercredi ».',
    literature: [
      'Del Centina and Fiocca 2018, « On the Correspondence of Sophie Germain » — searched, not read: paywalled. A thorough account of her correspondence is where a date for this note would already stand.',
      'Searched, nothing surfaced: web search for a dated Lagrange note to Germain of 17 germinal, and for this note in the literature on their acquaintance.',
      'Not searched: Henry 1879, and the Lagrange Œuvres.',
    ],
    status: 'candidate',
    settle:
      'One look at the view decides the numeral and the word « mercredi »; if both hold, the two candidate days are arithmetic and only an external fact — where Lagrange was in April 1796 and April 1802 — can choose between them.',
  },
  {
    id: 'naf-4073-correspondents-beyond-notice',
    cote: 'naf-4073',
    pages: 'views 6, 40–42 (f. 1r; the 1814 letter, ending f. 32)',
    kind: 'codicological',
    claim:
      'NAF 4073 holds letters from two correspondents its BnF notice does not name: A. Choron, writing 29 January 1818 (f. 1r), and an unidentified writer whose letter of 13 March 1814 closes the volume (views 40–42).',
    basis:
      'The notice reads « Lettres de Delambre, Joseph Fourier, Sophie Germain, Lagrange, Lalande et G. Libri. Provient des papiers de Libri. » The Choron letter is signed and dated on f. 1r. The letter of 13 March 1814 runs across views 40 to 41, is dated at its end and is signed with a paraph in which no letter can be read; its address leaf is f. 32v. Its earlier leaf carries no legible pencilled folio and the transcription gives it none, so this entry cites the letter by view and not by a folio it cannot read.',
    ours: null,
    literature: [
      'The BnF notice for NAF 4073, as recorded in this site’s catalogue.',
      'Del Centina and Fiocca 2018 — searched, not read: paywalled; a thorough account of the known correspondence would list both if they are known.',
      'Not searched: Henry 1879, and the Europeana Transcribe volunteer transcription of this volume, either of which may name Choron already.',
    ],
    status: 'candidate',
    settle:
      'Check the inventory in Del Centina and Fiocca 2018 and the Europeana Transcribe record for NAF 4073. Identifying the 1814 writer is a separate question this entry does not open.',
  },
];
