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
  {
    id: 'latin-11195-burattini-flight-treatise',
    cote: 'latin-11195',
    pages: 'views 26\u201337 (title leaf 26 R; drawings 32 R and 37 R; treatise 33 R\u201337 L)',
    kind: 'codicological',
    claim:
      "The Italian treatise on views 33 R\u201337 L is Tito Livio Burattini's on flight \u2014 \u00ab Il volare non \u00e8 impossibile come fin hora vniuersalmente \u00e8 stato creduto \u00bb \u2014 and the two drawings on views 32 R and 37 R are the two known sketches of his Dragone Volante. This is NOT new: Clive Hart cited this very manuscript in 1979, by shelfmark and folios. The entry is kept, matched, because the identification had to be made again from the leaves to read them, and because Hart's folios settle a question the transcriptions could not.",
    basis:
      "Hart 1979, reference 4, cites \u00ab Paris, Biblioth\u00e8que nationale, MS Latin 11195, ff. 50r\u201361r, Polish-Italian-French, 1647 \u00bb. The transcription of batch 2, which had no access to Hart, read the ink number \u00ab 50 \u00bb at the head of view 26 R and \u00ab 61 \u00bb at the head of view 37 R \u2014 the two ends of Hart's range. On the leaves themselves: the treatise's incipit stands as its running title, its closing passage matches the one Hart's account quotes phrase for phrase (two men, \u00ab vno de' qualj basta che lauorj e l'altro pu\u00f2 riposar \u00bb, travel by night \u00ab con l'aiuto della bussola \u00bb, food and drink for some days, and a broken wing meaning \u00ab cadere giu pianamente \u00bb), and the French legend on view 32 L letters the machine as that account describes it: A and C the forward wings, B B B B the four that only sustain, D the tail, E a \u00ab couuerture mobile \u00bb that opens circularly to break a fall.",
    ours:
      "Nothing of the identification, which Hart made first. What is this edition's is the reading of the Italian text and of the French legend, and the concordance of Hart's folios to Gallica's views \u2014 see latin-11195-flight-dossier-folios. Hart dates the manuscript 1647 and calls it Polish-Italian-French; no leaf of the volume carries a date, this edition infers none, and it does not adopt Hart's.",
    literature: [
      "Clive Hart, \u00ab Burattini's flying dragon \u00bb, The Aeronautical Journal 83 (July 1979), DOI 10.1017/S0001924000031754 \u2014 the extract and reference list read on Cambridge Core, 19 September 2026; the body of the article is paywalled and was not read. Reference 4 gives the shelfmark and folios quoted above. This is the source that refutes the claim of novelty first written here.",
      'Clive Hart, The Prehistory of Flight, University of California Press, 1985, 135\u2013145 \u2014 not read; the same author\u2019s later treatment, which presumably repeats the citation.',
      "Treccani, Dizionario Biografico degli Italiani, \u00ab Tito Livio Burattini \u00bb \u2014 read: it reports the machine through a letter of Des Noyers to Mersenne of 29 February 1648 and a fragment communicated by Th\u00e9venot to Huygens in 1661, and names no manuscript. Its silence is not the literature's silence, as Hart shows.",
      "BnF Archives et manuscrits \u2014 searched for \u00ab Burattini \u00bb: \u00ab Aucun r\u00e9sultat \u00bb. The notice for Latin 11195 describes no contents. So the treatise is recorded in the aeronautical literature and not in the library's own catalogue, which is a gap in the catalogue and not a discovery.",
      'Huygens, \u0152uvres compl\u00e8tes, tome 3 (1660) \u2014 full text searched for Burattini: he appears only as a maker of telescopes in Poland, not for the flight treatise.',
    ],
    status: 'matched',
    settle:
      "Settled on 19 September 2026 against Hart 1979. One word is still worth re-reading on the leaf: the transcription gives \\uncertain{rastello} at view 36, in \u00ab l'altro pu\u00f2 riposar in modo come fosse in vn \u2026 \u00bb, where the published translation reads \u00ab as is done on board a ship \u00bb. That points to vascello, and the leaf \u2014 not the translation \u2014 must settle it; the transcription has not been altered.",
  },
  {
    id: 'latin-11195-flight-dossier-folios',
    cote: 'latin-11195',
    pages: 'views 24\u201338 (ff. 38, 50\u201362)',
    kind: 'codicological',
    claim:
      "In the flight dossier of Latin 11195 the ink number at the top right of each right-hand page is the library's foliation, and folio = view + 24: Hart's ff. 50r\u201361r are Gallica views 26 R\u201337 R, and view 38 is f. 62. Neither transcription would say this from the leaves alone, and no source searched gives the concordance, Hart citing folios for a manuscript that had not been digitised.",
    basis:
      "Two independent series meet. The transcription read, on the leaves and without knowledge of Hart, one ink figure per leaf at the top right of the right-hand page: 38 at views 24 and 25 (the same leaf exposed twice), then 50 to 62 on views 26 to 38, with no gap, ringed with an oval stroke from view 33 on. Hart 1979, reference 4, cites the treatise as ff. 50r\u201361r. The two ends coincide exactly \u2014 f. 50 at view 26 R, f. 61 at view 37 R \u2014 which is what identifies the series as the library's count rather than another hand's. The modern slip laid on view 25 reads \u00ab folios blancs 38 \u00e0 49 \u00bb and accounts for the jump: those eleven leaves were not filmed. 62 at the last view sits under the BnF's count of 64 ff.",
    ours:
      "The concordance itself, and only for views 24 to 38. It is NOT extended backwards: on views 2 to 23 the ink numbers are the writer's own pagination, 1 to 37, one per page and not one per leaf, and how the library foliated that part is not established here. No \\folio{} has been written into either transcription on the strength of this; the entry records the concordance, and changing the files is a separate decision.",
    literature: [
      "Clive Hart, \u00ab Burattini's flying dragon \u00bb, The Aeronautical Journal 83 (1979), reference 4 \u2014 read on Cambridge Core: \u00ab Paris, Biblioth\u00e8que nationale, MS Latin 11195, ff. 50r\u201361r \u00bb. Hart gives folios and, writing in 1979, no views.",
      'BnF Archives et manuscrits, notice for Latin 11195 \u2014 read: 64 ff., no foliation described, no contents.',
      'Not searched: whether any later study of Burattini prints a fuller foliation of the dossier, which would extend the concordance to the leaves this entry leaves out.',
    ],
    status: 'candidate',
    settle:
      'Read the pencil or ink foliation on the rectos of views 2 to 23 against the writer\u2019s pagination, and see whether a library series runs there too. That would give the whole volume a view-to-folio table and let pieces.json record both dossiers, not only the flight one.',
  },
  {
    id: 'latin-11195-recognitione-aequationum',
    cote: 'latin-11195',
    pages: 'views 2–23 (title leaf 2 R; text 3 R–23 R)',
    kind: 'codicological',
    claim:
      'Views 2 R–23 R of BnF Latin 11195 carry a complete anonymous Latin treatise headed « De Recognitione Æquationum », in Viète-school species notation, running to eighty-seven propositions in ten chapters on quadratics, cubics and quarto-quadratics, and citing Roberval by name for three lemmas. No description of this text was found in the BnF catalogue, which gives no contents for the volume, nor in any study searched here.',
    basis:
      "The title stands alone on view 2 R and the text runs continuously from view 3 R, paginated 1 to 37 by the writer, to a self-declared end in the middle of view 23 R on « de iis plura non dicemus ». Three lemmas of maximum are credited to « D. Rob. » on views 9 R and 10 R, and a marginal note in French — the only French in the treatise — sends the reader to « son traité de mechanique des plans inclinez », which answers to Roberval's Traité de mécanique des poids soutenus par des puissances sur des plans inclinés à l'horizontale, printed 1636. A second, finer hand annotates the margins throughout, copying each canonical form beside its proposition and numbering its own remarks 1 to 37.",
    ours:
      "The reading of the treatise and the identification of the work the marginal note points to. The treatise is attributed to nobody: it is anonymous on the leaf, and the two mentions of « D. Rob. » are citations of borrowed lemmas, which is evidence its author had read Roberval and not that Roberval wrote it. No date is claimed. The catalogue groups the volume under Roberval; the leaves do not.",
    literature: [
      'BnF Archives et manuscrits, notice for Latin 11195 and for the group Latin 11195–11197 — read. The title « Mélanges de physique et de mathématiques, comprenant des opuscules et des lettres de P. de Roberval, Huggens, Torricelli, Firmat et Fr. Herman Flayder » belongs to the three-volume group, not to this volume; the record for Latin 11195 adds only the old shelfmarks, 64 ff. and 230 × 170 mm. No contents are described, and no treatise on equations is named.',
      'Searched for a manuscript « De recognitione aequationum » connected with Roberval or the BnF; what surfaced was Viète\'s printed De aequationum recognitione et emendatione tractatus duo (1615, ed. Anderson), a different object, and a single library record listing a « De Recognitione aequationum » under Roberval\'s name which could not be opened from here.',
      'Not searched, and the first place this can fail: the Roberval literature proper — the Académie\'s Divers ouvrages de mathématiques et de physique (1693), which printed his remains, and any modern inventory of the Roberval manuscripts.',
    ],
    status: 'candidate',
    settle:
      "Check the contents of the 1693 Divers ouvrages and any inventory of Roberval's papers for a treatise on the recognition of equations, and open the library record that lists one under his name. Identifying the treatise is the prior question; until it is identified, nothing here says whose it is.",
  },
  {
    id: 'latin-11195-limitationes-are-discriminants',
    cote: 'latin-11195',
    pages: 'views 5, 9–11, 21–23',
    kind: 'mathematical',
    claim:
      'Every « limitatio » the treatise of views 2–23 derives — the inequality outside which it says the sides become fictitious — is, in modern terms, the condition that the corresponding discriminant be non-negative, and it is reached not by an algebraic invariant but by solving a maximum problem with three lemmas credited to Roberval. Its rule for the double root of a cubic is identically the root of the linear remainder in the Euclidean algorithm on P and P′.',
    basis:
      "For the quadratic the leaf gives « z pl. non debet esse maius quadrante quadrati x » (view 5 L), that is x² − 4z ≥ 0. For the reduced cubic A³ − zA + T the first lemma of view 10 L maximises zA − A³, giving T ≤ (2z/3)√(z/3), which squared is 27T² ≤ 4z³ — the discriminant condition. The double-root rule of view 9 R, written by the leaf as a compound fraction, is identically (xz − 9T)/2(x² − 3z), which is where 2(x² − 3z)A − (xz − 9T), the last remainder of the algorithm on A³ − xA² + zA − T and its derivative, vanishes. The treatise states the generality itself: the equal side « se découvrira par le même artifice » at every degree, with more equations to set up.",
    ours:
      "The translation into discriminants and into gcd(P, P′), the verification of the double-root formula on the roots 2, 2, 5 and 3, 3, 1, and the remark that the bound is attained exactly at the double root — which the leaf does not say, though its two statements imply it. The leaf has neither the derivative nor the algorithm: it obtains its two starting equations by writing the condition B = C into the symmetric functions. Where the leaf is wrong the modernised reading says so rather than crediting it: its bound on T for A³ − xA² + T is a third of the cube of x where the true bound its own argument gives is x³/27, and the « possible if » of the same chapter states a necessary condition as a sufficient one.",
    literature: [
      'None that can be searched yet. The claim is about what the literature on this treatise records, and no study of the treatise was found — see latin-11195-recognitione-aequationum, on which this entry depends entirely. The mathematics itself is classical and is claimed as nobody\'s discovery: what would be new is that this text reaches it this way, and that cannot be asserted while the text is unidentified.',
      'Not searched: the literature on Viète\'s school and on seventeenth-century theories of equations — Anderson, Vaulezard, Ghetaldi, Beaugrand — where this manner of deriving limitations from maximum problems may well be described already.',
    ],
    status: 'unsearched',
    settle:
      'Identify the treatise first. Until it has a name or a known circle, there is no body of literature against which to ask whether this reading of its limitations is new.',
  },
  {
    id: 'latin-11195-collective-title-no-letters',
    cote: 'latin-11195',
    pages: 'views 1\u201338, whole',
    kind: 'codicological',
    claim:
      "BnF Latin 11195 contains no letters, by Roberval, Huygens, Torricelli, Fermat or anyone else, and no opusculum of Flayder \u2014 only a hand-copied page of his printed title. The title that promises them is the collective title of the three-volume group Latin 11195\u201311197, and at least one of the letters is demonstrably in the second volume, not this one: Adam and Tannery cite Roberval's reply to Torricelli of 1 January 1646 as Biblioth\u00e8que nationale, lat. 11196, f. 1. The BnF describes the contents of none of the three.",
    basis:
      'All thirty-eight views were transcribed. They hold two dossiers and nothing else: the Latin treatise on equations (views 2 R\u201323 R) and the flight dossier (views 26 R\u201337 R), separated by blank leaves and sharing no hand, no ink and no cross-reference. Nine views are wholly blank. Of Flayder there is the title page of his De arte volandi (T\u00fcbingen, Werlin, 1627) copied by hand on view 27 R, and no text of his. The BnF record gives the title at the level of Latin 11195\u201311197 \u2014 \u00ab 3 volumes. Reliure basane. Manuscrit en latin \u00bb \u2014 and for each volume only old shelfmarks and a leaf count: Suppl\u00e9ment latin 218/1 (64 ff.), 218/2 (55 ff. + 7bis, with ff. 7bis, 8, 12, 13, 24\u201328, 42\u201345 blank, r\u00e9col\u00e9 2 November 1888), 218/3 (40 ff.). The group was acquired by 10 March 1756, entered in the register as \u00ab Trois volumes en veau consernant les math\u00e9matiques Torricelli, Robertval, Carcavi, de Fermat etc. \u00bb',
    ours:
      "The reading of the leaves, and the collation of the three BnF records against it. Nothing is claimed about what else Latin 11196 and 11197 hold: neither is digitised \u2014 their notices carry no \u00ab Documents de substitution \u00bb section, where Latin 11195's names both a microfilm and a digitisation \u2014 so neither could be read here, and this edition does not read manuscripts it has not seen. The group's language field, \u00ab Manuscrit en latin \u00bb, is also incomplete for this volume, which carries a whole treatise in Italian and a legend in French.",
    literature: [
      'BnF Archives et manuscrits, records for Latin 11195, Latin 11196, Latin 11197 and the group Latin 11195\u201311197 \u2014 all four read, 19 September 2026. None describes contents. Only Latin 11195 is digitised.',
      "Adam and Tannery, \u0152uvres de Descartes, tome IV, 571, note \u2014 read via Wikisource: \u00ab Roberval ne r\u00e9pondit pas \u00e0 Torricelli avant le 1er janvier 1646. C'est dans cette lettre (Bibl. Nat., lat. 11196, f. 1), \u00e9dit\u00e9e seulement en partie, qu'il commen\u00e7a \u00e0 soulever contre le savant italien ses r\u00e9clamations de priorit\u00e9 au sujet des propri\u00e9t\u00e9s de la cyclo\u00efde. \u00bb This is the evidence that the group title is distributed across the volumes.",
      "Jean Itard, \u00ab La lettre de Torricelli \u00e0 Roberval d'octobre 1643 \u00bb, Revue d'histoire des sciences 28 (1975), 113\u2013124 \u2014 read on Pers\u00e9e: it prints the letter from Mersenne's Correspondance, tome XII, 328\u2013333, and names no manuscript.",
      "Mersenne's Correspondance ed. de Waard \u2014 sought and NOT read: of the seventeen volumes only tome 1 (1933) and tome 5 (1959) are on the Internet Archive, and tome 1 is access-restricted. The volumes that carry the relevant letters \u2014 tome 12 for October 1643, tomes 14\u201315 for 1646\u201347 \u2014 are not digitised anywhere reachable from here. Tome 5, which is searchable, contains no occurrence of \u00ab 11197 \u00bb or \u00ab Suppl. latin \u00bb, but it covers 1635\u201336 and cannot bear on the question. De Waard's citation style there is \u00ab Paris, Bibl. nat., fonds frs. nouv. acquis., 6205, fol. 238 recto \u00bb.",
      "Early Modern Letters Online, the Mersenne catalogue (built on de Waard) \u2014 searched by its Shelfmark field, 19 September 2026: \u00ab 11196 \u00bb and \u00ab 11197 \u00bb each return one letter of the Hartlib Papers at Sheffield and nothing at the BnF. EMLO does carry BnF shelfmarks for Mersenne where de Waard gave them (nouv. acq. 6204, 6205), so the silence is some evidence \u2014 but weak: its Roberval and Fermat letters are entered from printed editions with no manuscript at all, so an absent shelfmark there does not mean an absent shelfmark in de Waard.",
    ],
    status: 'candidate',
    settle:
      'Open de Waard\u2019s Correspondance du P. Marin Mersenne, tome 12 (for the Torricelli letter of October 1643) and tomes 14\u201315 (for 1646\u201347), in a library: they are not online, and that is why this is still open. Failing that, read Latin 11196 and 11197 in the reading room. Either would give the contents of the two undigitised volumes and show whether Flayder\u2019s opusculum and the Huygens letters of the group title are there. What is already settled is that they are not in Latin 11195, and that at least one of the letters is in Latin 11196.',
  },
  // NAF 5176 — /find-novelty, 22 September 2026, on claude-opus-5-5, the model
  // that wrote transcripts/naf-5176/naf-5176.modern.tex. To be merged into
  // FINDINGS in src/content/findings.ts by the coordinator. Search conditions
  // for every entry below: the web_search tool returned HTTP 403 for the whole
  // session, and Google, DuckDuckGo and Bing were unusable (consent wall,
  // CAPTCHA, irrelevant results), so nothing here rests on a general web
  // search. What was read was fetched directly: the BnF notice, Delisle 1888 and
  // the Œuvres de Fermat and of Descartes on archive.org, Huygens's Œuvres
  // complètes on DBNL, and Persée's search page (titles only; its PDFs sit
  // behind a bot check that was not bypassed).
  {
    id: 'naf-5176-partis-huygens-sequence',
    cote: 'naf-5176',
    pages: 'views 40–42 (hand C); the modern note at view 6',
    kind: 'codicological',
    claim:
      "The French text on the division of stakes and on dice at views 40–42 of NAF 5176 follows, in order and largely in its numbers, propositions I–XII of Huygens's De ratiociniis in ludo aleae (1657), down to the unanswered question of proposition XII. It is nevertheless not a literal translation. None of the published sources read here records the text as a French version of Huygens: Delisle 1888 describes it only as « Calcul des probabilités », and the Œuvres complètes of Huygens name no French manuscript. The only identification found is an unsigned note of 21 May 1962 pasted in the volume.",
    basis:
      "On the leaves: the rule « hasard égal de 10 ou 12 vaut 11 », proved by a fair game in which the winner gives the loser the smaller sum (Huygens prop. I's proof); the p-and-q rule proved by a game among p + q players each staking the value (prop. III); the shares 3/4, 7/8, 11/16, 13/16, 15/16 (props. IV–VII) and the remark that 2 games to win against 4 is better than 1 against 2, by 1/16 (Huygens's comment after prop. VII); three players, 4/9, 4/9, 1/9 (as 12/27, 12/27, 3/27) and 17/27, 5/27, 5/27 for A lacking one game and B, C two (props. VIII–IX); the tables of the throws of two and three dice; 11/36, 91/216, 671/1296, 4651/7776, 31031/46656 with the same verbal approximations (« un peu moins que 3 contre 4 », « un peu moins que 3 contre 2 », « un peu moins que 2 contre 1 ») as prop. X; 71/1296, 3781/46656, 178991/1679616 and the 24-throw disadvantage and 25-throw advantage of prop. XI; the question « avec combien de dés entreprendre de faire du premier coup deux six », prop. XII, left without answer. Against a literal translation: the text reckons in écus, says « je » and « quidam », gives the value of each game in sixteenths and thirty-seconds (3/16, 3/16, 2/16; 5/32, 5/32, 4/32, 2/32), which Huygens does not, and carries the one-die series to seven throws where Huygens stops at six. The note at view 6 (transcription batch 1, header) reads: the text corresponds to Huygens's « de ratiociniis in ludo aleae », probably a French translation earlier than the version given to Van Schooten, « Date possible : 1656 », « Copiste et traducteur possible : Des Billettes ».",
    ours:
      "The proposition-by-proposition collation against the French translation printed in Huygens, Œuvres complètes XIV, and the observation that the text is an adaptation rather than a translation. The attribution to Huygens as source is the 1962 note's, not ours; the date and the copyist are the note's suggestions and are not adopted. One constraint follows from a dated source, but only conditionally: Œuvres XIV, Avertissement pp. 5–8, says the manuscript Huygens sent Van Schooten on 20 April 1656 probably lacked prop. IX, which he wrote after Carcavy's reply of early October 1656. If the leaves depend on Huygens at all, they depend on the text as it stood after October 1656. That dependence is itself an inference from the collation, not a fact on the leaf. Nothing on the leaves names Huygens, Pascal, Fermat, de Méré or Des Billettes.",
    literature: [
      "Delisle, Catalogue des manuscrits des fonds Libri et Barrois (1888), p. 167, no. CXXIII « Nouv. acq. franc. 5176 (Libri, 1848) » — read (archive.org full text). It describes « Huit feuillets réunis par Libri sous le titre de « Pascal, autographes et copies ». — Calcul des probabilités. « Règles auxquelles se peuvent rapporter les paris » » and the incipits of the pieces of hand D. It does not mention Huygens.",
      "BnF Archives et manuscrits, notice NAF 5176 (ark:/12148/cc408093) — read. Two sub-units, « Fol. 1 · Notes du Père Mersenne, se rapportant principalement à la théorie de la lumière » and « Fol. 31 · Notes réunies par Libri sous le titre de « Pascal, autographes et copies » ». Only bibliography: Delisle p. 167. No mention of Huygens.",
      "Huygens, Œuvres complètes XIV (1920), « Van rekeningh in spelen van geluck / Du calcul dans les jeux de hasard », Avertissement and text — read on DBNL (huyg003oeuv14_01_0001 to _0005, _0063, _0066), and searched for Billettes, 5176, Libri, Mersenne and « traduction française ». The only French translations mentioned are modern (Gallas 1898, and the edition's own). No manuscript French version is recorded.",
      "Persée, search « Des Billettes Huygens » — result titles only. Among them are R. Taton, « Tableau chronologique sommaire de la vie et des travaux scientifiques de Pascal », Revue d'histoire des sciences 15 (1962), and a review (Annales ESC 18, 1963) of P. Costabel, Leibniz et la dynamique (1960), which says Costabel identified Des Billettes's hand in copies kept at the Académie des sciences. Neither is read on the question: the 1962 article's text is behind Persée's bot check.",
      "Not searched, and the first places this can fail: J. Mesnard's edition of Pascal, Œuvres complètes (Desclée de Brouwer, from 1964), whose apparatus on the « règle des partis » is the likeliest printed place for the 1962 note's identification; E. Coumet's work on the partis; de Waard's Correspondance du P. Marin Mersenne for 1656 (not digitised).",
    ],
    status: 'candidate',
    settle:
      "Read Mesnard's apparatus on the problème des partis and on NAF 5176. If it prints or describes this text as a French Huygens, the entry becomes matched. Independently, identify the 1962 annotator, and compare hand C with the Des Billettes hand Costabel established from the Académie copies.",
  },
  {
    id: 'naf-5176-fermat-material-libri-1848',
    cote: 'naf-5176',
    pages: 'views 31–32 (hand A)',
    kind: 'codicological',
    claim:
      "NAF 5176 holds, at views 31–32, a French text of the tangent method by « adæqualité » and a note citing « M. Fermat dans sa derniere let. de Juillet 1638 ». Tannery and Henry, who went through Libri's portfolio no. 1848 in 1888 before it was split, say they found in it only one folder of Fermat pieces, now in NAL 2339. The ellipse-tangent text of view 31 was not found in Œuvres de Fermat I–II by the searches made here.",
    basis:
      "View 31: tangent to an ellipse by adequality in species notation (B in G, Aq, « bis »), yielding A = 2BG/(B − G), compared with Apollonius's construction. It closes: « Je pourrois adiouster plusieurs autres exemples tant du 1er que du 2 cas de ma methode … comme de l'invention des centres de gravité, dont j'ay envoyé les exemples à M. Roberval », then announces a « question à soudre » not written there. View 32: the note with « Juillet 1638 », the substitution (BA − BE)/A for x and D − E for y « sans rencontrer jamais une seule asymmetrie », a curve of degree ten, the charge against « M. de Cartes » that his method « s'embarrasse dans les asymmetries » (« page 344. l. 3. »), and four Latin questions (six semicircles; maximum or minimum; the surface of a scalene cone; right triangles in numbers with square area, or proof of impossibility). Tannery–Henry, Œuvres de Fermat I, Avertissement pp. xxi–xxii and n. 2: « on n'a retrouvé, sous le n° 1848 de Libri, qu'une seule chemise de pièces provenant de Fermat ». The pieces of no. 1848 are now in NAL 2339, 2340, 2341 and two NAF numbers, and « celles relatives à Fermat se trouvent dans le premier de ces cinq manuscrits ». The two NAF numbers are OCR'd « 517o, Sl'fi » and « ,jl7.'i, Si7f> » in the two archive.org scans, most likely 5175 and 5176; that reading needs checking on the page. Their piece XXXI (June 1638, Œuvres II, 154–162), known only through Arbogast's transcriptions of « une copie de Mersenne, aujourd'hui perdue », shares the vocabulary of view 32: (BA − BE)/A for x, D − E for y, asymmetries, a page of Descartes's Géométrie, an equation of high degree in x and y. It is not the same text: it cites page 342, its curve is of lower degree, and it closes on the centre of gravity of the parabolic conoid.",
    ours:
      "The collation, and nothing more. Whose text view 31 is, and whose note view 32 is, is not claimed. Hand A is Mersenne's only by inference (view 16), the name « Fermat » at view 32 is a doubtful reading, and the same page speaks of « ma methode » and « la ligne que j'appelle B ». Whether Tannery–Henry saw these leaves and judged them not to be Fermat's, or did not see them, cannot be told from their note.",
    literature: [
      "Tannery and Henry, Œuvres de Fermat I (1891), Avertissement pp. xxi–xxii and n. 2 — read (archive.org, two OCR copies).",
      "Œuvres de Fermat II (1894), pièce XXXI « Méthode de maximis et minimis expliquée et envoyée par M. Fermat à M. Descartes », pp. 154–162, and the letter of Descartes of 27 July 1638, p. 163 — read. Œuvres I–II were also searched by keyword for the closing sentences of view 31 (« second cas », « envoyé les exemples », « à soudre », « Pour l'ellipse ») and for the Latin questions (« scaleni », « semicirculi », « area … quadrato »): nothing matching surfaced. The OCR is poor, so this is weak evidence.",
      "Adam and Tannery, Œuvres de Descartes II — searched by keyword (archive.org OCR) for 5176 and for the four questions: nothing.",
      "Not searched: Œuvres de Fermat III–IV and the 1922 Supplément; Ch. Henry, Recherches sur les manuscrits de Pierre de Fermat (1880); de Waard's Mersenne correspondence for June–August 1638 (tome VII–VIII), where a copy of this kind would most likely be recorded.",
    ],
    status: 'candidate',
    settle:
      "Look up NAF 5176 in the index of manuscripts of de Waard's Correspondance du P. Marin Mersenne (tomes VII–VIII) and in the Fermat Supplément of 1922. Separately, read Tannery–Henry's note 2, p. xxii, on paper to fix its two NAF numbers.",
  },
  {
    id: 'naf-5176-frenicle-ellipses',
    cote: 'naf-5176',
    pages: 'views 12 R–13 (hand B)',
    kind: 'codicological',
    claim:
      "Hand B's problems 1–8 at views 12 R–13 of NAF 5176 work the question of rational ellipses on a common major axis that Frenicle put to Descartes in 1638–1639 and that Fermat answered in his letter of 25 December 1640. They use Fermat's condition and his very example triangle 29, 21, 20. Neither Adam–Tannery nor the Œuvres de Fermat, as searched here, cite this manuscript for the question.",
    basis:
      "The leaves ask for a major axis serving any number of ellipses whose axes and focal distance are integers, and, in problems 5–6, whose focal distance exceeds the minor axis and whose other lines (FO, OB) are rational. They take the major axis as a square, or twice a square, of a hypotenuse so that the perpendicular on the focus is an integer: 578 = 2·17², PH = 64. Problem 7 asks for triangles in which the hypotenuse times the least side exceeds the square of the other side, and takes « AC est 29. KI. 21. et BD. 20 ». Fermat, Œuvres II, p. 216 (letter XLV, 25 December 1640): the question reduces to a number that is hypotenuse to 12 triangles, each such that « la dite hypoténuse ait plus grande proportion au plus grand des deux autres côtés que le dit plus grand au moindre … comme, par exemple, 29, 21, 20 », whose square is the half-axis, « il le faut quarrer, afin que la perpendiculaire sur le foyer soit un nombre entier ». The editors' note there gives Frenicle's conditions: a − c, the minor axis, and the excess over the focal distance of the distance from a focus to the end of the ordinate through the other. Descartes's solution, AT II, 472–473 (9 January 1639), uses other numbers (422500, 42250, 8450, 253500).",
    ours:
      "The identification of the problem and the recomputation: every triple and every line on views 12–13 was checked and is right, save a « 6 ellipses » for 8 and an unexplained « 15 et 28 ». The date is the letters', not the leaves'. The leaves are undated and anonymous, and nothing here says whose working they are or when it was done. A word read « Carles » at view 13 (« … de Carles ») may be a proper name. « Cartes » is a possible reading that only the image can settle, and it is not adopted.",
    literature: [
      "Œuvres de Fermat II (1894), letter XLV of 25 December 1640, pp. 215–217 and n. 1 — read (archive.org).",
      "Adam and Tannery, Œuvres de Descartes II, letter CLIII of 9 January 1639, pp. 472–473, and the editors' éclaircissement pp. 478–479 — read (archive.org). The OCR of the whole volume was searched for 5176: nothing.",
      "Not searched: de Waard's Mersenne correspondence for 1639–1640, where Frenicle's question and any Paris working of it would be recorded; the Frenicle literature.",
    ],
    status: 'candidate',
    settle:
      "Check de Waard's Correspondance du P. Marin Mersenne (tomes VIII–X) for the Frenicle ellipse question and its manuscript witnesses. If NAF 5176 ff. 3–4 are cited there, the entry becomes matched.",
  },
  {
    id: 'naf-5176-foliation-series',
    cote: 'naf-5176',
    pages: 'views 9–51 (the ink series 1–42); view 39 = « Fol. 31 »',
    kind: 'codicological',
    claim:
      "The continuous ink series 1–42 that the three transcriptions read on NAF 5176, and decline to write as foliation because it is penned, is the foliation the BnF catalogue uses. The notice's sub-unit « Fol. 31 », Libri's « Pascal, autographes et copies », falls at view 39, the separator leaf numbered 31 in that series. Delisle's « huit feuillets » for that part are the eight written leaves 32–34 and 38–42 of the series.",
    basis:
      "Batch 2's header maps the series: v. 21 = 15, v. 29 = 21, v. 31 = 23, v. 33 = 25, v. 38 = 30, v. 39 = 31 (the modern separator « Pascal / autographe / et copies »), v. 40 = 32. Batch 3 continues 33 (v. 41 R) to 42 (v. 51 R), with 35–37 blank. The 1888 certificate's blank leaves (22, 24, 29, 35, 36) fall on blank leaves of the series, as the transcriptions note. The BnF notice divides the volume at Fol. 1 and Fol. 31. Delisle 1888 counts « huit feuillets » in Libri's Pascal part; the written leaves from 32 to 42 are 32, 33, 34, 38, 39, 40, 41, 42.",
    ours:
      "The concordance of the notice's « Fol. 31 » and Delisle's count with the transcriptions' series. No \\folio{} has been written on the strength of it. Delisle's « Seize feuillets écrits par le Père Mersenne » for ff. 1–30 was not reconciled: the series there counts pasted slips and printed figures as leaves, and which sixteen Delisle meant is not established.",
    literature: [
      "BnF Archives et manuscrits, notice NAF 5176 — read: sub-units at Fol. 1 and Fol. 31; 42 feuillets; microfilm MF 16621.",
      "Delisle 1888, p. 167 — read.",
    ],
    status: 'candidate',
    settle:
      "A person looks at the rectos of views 9–51 for a pencil foliation distinct from the ink series. If there is none, the ink series is the foliation and the three transcriptions can write \\folio{} from it, which would let pieces.json record the two parts at ff. 1–30 and 31–42.",
  },
  {
    id: 'naf-5176-genoese-lottery-odds',
    cote: 'naf-5176',
    pages: 'views 49 R–51 L (hand D)',
    kind: 'mathematical',
    claim:
      "Hand D's « Hasard » at views 49–51 of NAF 5176 computes, for a yearly draw of 5 names out of 100 « à Gennes » and bankers paying 20000, 5000, 300 and 4 for one on 5, 4, 3 and 2 hits, the full distribution of hits C(5,k)·C(95,5−k). It writes the binomials as figurate numbers (« triangle de 94 », « tetraedre de 93 », « triangle triangle de 92 ») and justifies them. It then derives the bettor's expected return, 21326600 in 75287520 (about 0.283 per pistole staked). This analysis could not be checked against the literature on the Genoese lotto; the entry claims no priority, the leaf being undated.",
    basis:
      "C(100,5) = 75287520 (« multiplier seulement 80 par 97, 98 et 99 »); 475, 44650, 1384150, 15917725 draws with 4, 3, 2, 1 of the five, and a remainder 57940519 = C(95,5) — all right. The sum 1·20000 + 475·5000 + 44650·300 + 1384150·4 = 21326600, set against 75287520 « comme 1 à un peu plus de 3 1/2 », and against it without the 2-hit payment « un peu plus de 4 3/4 » — both right. The « fondement » derives C(95,2) = 94 + 93 + … + 1 by a counting argument. Two intermediate odds are wrong on the leaf, 3764 3/4 for 3764 3/8 and 13 1/2 for 13 1/3. Delisle 1888 already records the piece by its incipit, reading « d'entre les cent sénateurs », which is where the transcription has illegible words.",
    ours:
      "The recomputation, the identification of the figurate numbers with binomial coefficients, and the reading of the final comparison as an expected return. The number 100 is taken from the leaf's arithmetic, not from Delisle.",
    literature: [
      "Delisle 1888, p. 167 — read: records the piece (« Hasars. C'est la coustume à Gennes d'eslire ou plutost de tirer au sort tous les ans d'entre les cent sénateurs… ») without its content.",
      "Wikipedia, « Lottery » (English) — read for orientation only: Genoese betting on 5 names drawn from 90 candidates of the Great Council twice a year. Not a source for the history of the probabilistic analysis.",
      "D. R. Bellhouse, « The Genoese Lottery », Statistical Science 6 (1991), 141–148 — sought on Project Euclid and NOT read: the request was refused. It is the obvious first place to check which early analyses of the Genoese lotto the literature records.",
      "Not searched: the eighteenth-century analyses usually cited for the lotto (Euler's memoirs on the « loterie génoise », Nicolaus Bernoulli), and any study of Libri's no. 1848.",
    ],
    status: 'unsearched',
    settle:
      "Read Bellhouse 1991 and the sources it cites for the earliest known computations of lotto odds. Only then can it be said whether an undated seventeenth-century French computation of this kind is recorded. A date for hand D would have to come from elsewhere; the leaf gives none.",
  },
];
