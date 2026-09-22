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
  // --- NAF 9544 — /find-novelty, 22 September 2026, on claude-opus-5-5, the
  // model that wrote transcripts/naf-9544/naf-9544.modern.tex. Six entries, to
  // be appended to FINDINGS in src/content/findings.ts by the coordinator.
  // Search conditions for this pass: the web_search tool returned HTTP 403,
  // the BnF Archives et manuscrits site and Gallica's SRU returned 403 to
  // WebFetch, and the Google Books API returned 429; what was searched was
  // therefore EMLO's Solr index, the Internet Archive (full text of the
  // volumes named below) and DBNL. Every entry says which.
  {
    id: 'naf-9544-mersenne-petau-de-waard',
    cote: 'naf-9544',
    pages: 'views 33, 37–40 (the letter on the leaf the running ink series numbers 25)',
    kind: 'codicological',
    claim:
      "Mersenne's letter to Denis Petau and the sheet of observations it sent — the pole height at Paris from β Ursae Minoris on 3 January 1621, from the polar star on 2–5 January 1621 and from the Sun on 23 and 25 December 1620 — are NOT new: de Waard printed them as letter 28 of the Correspondance du P. Marin Mersenne, tome I, pp. 208–214, and EMLO catalogues the letter at « nouv. acq. fr. 9544, f. 25r ». The entry is kept, matched, for the folio, which it lets this edition use, and for the arithmetic, which this edition checked.",
    basis:
      "The letter (view 39 R, dorse view 40) is signed « Mar. Mers. M. », asks Petau to return « quelques observations … de Jan. 1621 » on « la hauteur du pole pour latitude de Paris », and names « le R. pere Grandamy » (read with doubt). The observation sheet (view 38, verso view 39 L) is folded as a letter and addressed « Au Reverend pere Denis Petau de la Société de Jesus Au College de Clermont ». The sale cutting on view 33 (« Vente Charavay, 6 février 1889 ») describes both. EMLO's record of the letter adds, in a note, that « in an appendix to this letter, Mersenne passes on some astronomical observations ».",
    ours:
      "The recomputation of the sheet, and only that. The ecliptic-to-equatorial conversion, done on the leaf by ruler and compass on a projection onto the solstitial colure and by sine tables, is exactly sin δ = sin β cos ε + cos β sin ε sin λ; every sine, product and difference on the leaf is right, and the declination 75°47′20″ is one second from the exact value. The one error is 90° − 75°47′20″ written 14°12′35″ for 14°12′40″, so that the pole height 48°47′35″ should be 48°47′40″ on the sheet's own data; the transcription had flagged it. The polar-star mean 48°45′37½″ and half-difference 2°43′7½″ are right, and the two solar declinations agree with Tycho's obliquity to 3″. Whether de Waard's edition notes the 5″ slip was not checked. EMLO dates the letter 1625, marked inferred and uncertain (« Mersenne writes in this letter about topics which interested him in April 1625 »); the leaf carries no date and this edition adopts none.",
    literature: [
      "Early Modern Letters Online, Solr index (emlo.bodleian.ox.ac.uk/solr/works and /solr/manifestations), queried 22 September 2026 — read: work 3ee3e977-f10e-4ebf-8208-8e2d1344fb3c, « 1625: Mersenne, Marin … to Pétau, Denis », language « French (main language), Latin (some) »; manuscript manifestation « nouv. acq. fr. 9544, f. 25r »; printed manifestation « Correspondance du P. Marin Mersenne, ed. Cornelis de Waard et al., vol. 1, letter 28, pp. 208–14 ». A search of the manifestations for « 9544 » returns this letter and no other item of NAF 9544.",
      'De Waard, Correspondance du P. Marin Mersenne, tome I (1933) — NOT read: on the Internet Archive it is access-restricted (see latin-11195-collective-title-no-letters). Known here only through EMLO.',
    ],
    status: 'matched',
    settle:
      "Settled against EMLO on 22 September 2026. What remains is to open de Waard t. I, letter 28, and check (a) that its appendix is this sheet, (b) its folio citation for the observation sheet (the running series gives 24), and (c) whether it notes the 14°12′35″ slip. The transcription must not be corrected from de Waard's text: its unread words stay unread until a human reads the leaf.",
  },
  {
    id: 'naf-9544-running-ink-series-is-foliation',
    cote: 'naf-9544',
    pages: 'views 4–54 (ff. 1–36)',
    kind: 'codicological',
    claim:
      "In NAF 9544 the thin ink figure at the top right of each leaf, running 1 (view 4) to 36 (view 54) without a gap, is the foliation the literature cites: EMLO gives Mersenne's letter as « nouv. acq. fr. 9544, f. 25r », and the letter's leaf (view 39 R) carries that series' figure, read 25 or 26 by the transcription and forced to 25 by its neighbours. This yields a view-to-folio table for the whole album, which no source searched gives, the album having been cited by folio only.",
    basis:
      "The three transcriptions read the series independently, batch by batch, and each declined to write \\folio{} from a greyscale scan: 1 (v. 4), 2 (v. 5), 3 (v. 6 R), 4 (v. 7), 5 (v. 8), 6 (v. 9 R), 7 (v. 11), 8 (v. 12), 9 (v. 14), 10 (v. 15 R), 11 (v. 17, receipt), 12 (v. 17, wrapper), 13 (v. 18), 14 (v. 20, wrapper), 15 (v. 20, slip), 16 (v. 21), 17 (v. 22 R), 18 (v. 24), 19 (v. 27), 20 (v. 30), 21 (v. 31), 22 (v. 32 R), 23 (v. 33), 24 (v. 38), 25 or 26 (v. 39 R), 26 (v. 41), 27 (v. 42), 28 (v. 44 R), 29 (v. 45 R), 30 (v. 46 R), 31 (v. 47 R), 32 (v. 48 R), 33 (v. 51), 34 (v. 52 R), 35 (v. 53 R), 36 (v. 54 R). It ends on 36, the count of the binder's certificate on view 3 (« Volume de 36 Feuillets — 27 Novembre 1899 »). EMLO's « f. 25r » for the letter coincides with the figure on its leaf, and with 24 on the leaf before and 26 on the leaf after, which fixes the doubtful figure on view 39 R as 25.",
    ours:
      "The concordance itself. It rests on one external citation, EMLO's, and on the unbroken run; the series was not seen on the images by this pass, which read only the transcriptions. No \\folio{} has been written into any transcription on the strength of this entry, and changing the files is a separate decision. Versos are not numbered, so f. Nv is the left page of the view after f. Nr where the leaf is shown opened.",
    literature: [
      "EMLO, manuscript manifestation c26f0df2-6416-4d33-93f1-17575f4c67f3 — read: « nouv. acq. fr. 9544, f. 25r ».",
      'BnF Archives et manuscrits, notice for NAF 9544 — NOT read: the site returned HTTP 403 to this pass. Whether the notice gives a leaf count or a contents list by folio is therefore unknown here.',
    ],
    status: 'candidate',
    settle:
      "One look at view 39 R and at any two other leaves on the full-resolution images, to confirm that the figure is the library's (not a dealer's) and reads 25 there; or the BnF notice, if it lists the contents by folio. Either would let the three transcriptions write \\folio{} and pieces.json record the album piece by piece.",
  },
  {
    id: 'naf-9544-libri-description-supplement-latin-218',
    cote: 'naf-9544',
    pages: 'views 41–55 (the description); views 54–55 (supplément latin 218)',
    kind: 'codicological',
    claim:
      "Views 41–55 of NAF 9544 carry a French description of five Roberval manuscripts headed « Manuscrit de Roberval. par G. Libri », and its account of « MS. suppl. lat. 218 », three volumes, describes today's Latin 11195 as its tome I, mark for mark, and gives a contents list, folio by folio, for tomes II and III — the two volumes of the group Latin 11195–11197 that the BnF does not describe and has not digitised. No source searched cites this description.",
    basis:
      "Libri: tome I « porte au r. du 2e feuillet le n° 171 et le titre : [De] recognitione æquationum, au v. le n° 26. L'ouvrage commence au feuillet suivant et contient 37 pages », with quadratics in four chapters, cubics in six, quarto-quadratics in ten, and ends with « une petite dissertation latine sur l'art de voler ; et … un article italien avec figures » naming Galileo and Archimedes. The project's transcription of Latin 11195 reads, independently: the old shelfmark « Suppl.t lat. 218. A. » on the flyleaf (v. 1) and « Suppl.t Lat. no 218. » / « Suppl.t l. 218. + I. » on v. 3; the title leaf v. 2 R with an ink « 171 » over « De Recognitione Æquationum »; « 26 » on its verso (v. 3 L); the treatise paginated 1 to 37 (v. 3 R – 23 R), Caput 1–4 quadratic, six cubic capita, ten quarto-quadratic; then « Ars Volandi », Latin notes on flight and an Italian treatise with two drawings naming Galileo, Sagredo and Archimedes (v. 26–37). For tome II (41 ff., « n° 27 » on f. 2v, « n° 119 » on f. 3r) Libri lists an Appendix ad tractatum de legitimo Dioptrarum usu (f. 3r), a problem to Mersenne of 10 November 1642 (f. 17r), a letter extract to Mersenne of 3 June 1639 (f. 19r) and the De Vacuo to Des Noyers of May 1648 (f. 25r); for tome III (« 68 » ff., second figure blotted; « n° 28 » on f. 1v, « n° 172 » on f. 2r) ten items from f. 2r to f. 55r: Roberval to Torricelli, Kalends of January 1646; Huygens, Leiden, [2?] October 1646; Torricelli to Roberval and to Mersenne, 7 July 1646; Torricelli to Carcavi, 8 July 1646; Fermat's new use of radicals in analysis; a copy of Fermat to Carcavi, 20 August 1650; and others.",
    ours:
      "The concordance of tome I with Latin 11195, from the two transcriptions. Two further identifications are offered as leads and not asserted. (1) Which of Latin 11196 and 11197 is Libri's tome III: Adam and Tannery cite Roberval's letter to Torricelli of 1 January 1646 at « lat. 11196, f. 1 », and it is the first item of Libri's tome III (his f. 2r, after a flyleaf numbered 28 on its verso), which points to Latin 11196 = tome III; but the BnF concordance recorded in latin-11195-collective-title-no-letters gives 11196 = Supplément latin 218/2, and the leaf counts do not settle it (tome II, 41 ff., against 40 ff. for 218/3; tome III, « 68 » read with a blotted figure, against 55 + 7bis for 218/2). (2) Libri's Huygens letter, dated Leiden, [2?] October 1646, on the motion of bodies and the parabola of projectiles, answers to Christiaan Huygens's letter to Mersenne of [28 October 1646], which the Œuvres complètes say Henry printed « d'après une copie de la Bibliothèque Nationale ». The description is not attributed beyond its heading: whether it is Libri's autograph is not settled by the leaves. It bears « Vente B. Boncompagni, VI. Autogr. (1898), n° 673 ». No date is inferred for it.",
    literature: [
      "The project's transcription of Latin 11195 (transcripts/latin-11195/batch-01.fr.tex, batch-02.fr.tex) and the entries latin-11195-collective-title-no-letters and latin-11195-recognitione-aequationum, whose BnF readings (the group title, the concordance Supplément latin 218/1–3 = Latin 11195–11197, no contents described, only 11195 digitised) are relied on and not re-read: the BnF site returned 403 to this pass.",
      "Adam and Tannery, Œuvres de Descartes IV, 571, as quoted in latin-11195-collective-title-no-letters — not re-read.",
      "Œuvres complètes de Christiaan Huygens, tome I, no. 14 (DBNL, huyg003oeuv01_01_0015) — read: « La minute se trouve à Leiden, coll. Huygens … Elle a été publiée par M. Henry, d'après une copie de la Bibliothèque Nationale à Paris, qui diffère de la minute. » The shelfmark of that copy is not given there.",
      "EMLO, Solr index — searched for manuscript manifestations carrying « 11195 », « 11196 », « 11197 », « 7226 » or « 12279 »: none at the BnF (three hits, all Hartlib Papers). Its Roberval–Torricelli letters of 1643–1647 carry printed sources only.",
      "Not searched, and the first place this can fail: Charles Henry, Huygens et Roberval. Documents nouveaux (Leiden, 1880), which printed from the BnF the copy the Huygens Œuvres mention and very probably describes the Supplément latin 218 volumes; an Internet Archive search on its title found nothing, and Google Books returned 429. Also not searched: Libri's own publications, for a printed version of this description; the Boncompagni sale catalogue of 1898.",
    ],
    status: 'candidate',
    settle:
      "Read Henry 1880 for any description of Supplément latin 218 or citation of Libri's inventory; if it has one, this entry becomes matched. Independently, the reading room or the BnF notices with folios would settle which of Latin 11196 and 11197 is Libri's tome III.",
  },
  {
    id: 'naf-9544-libri-recognitione-other-redaction',
    cote: 'naf-9544',
    pages: 'view 54 (Libri on tome I); Latin 11195 views 2–23',
    kind: 'codicological',
    claim:
      "The anonymous « De Recognitione Æquationum » of Latin 11195 is not the text printed under Roberval's name with the same title in the Académie's Mémoires … avant son renouvellement en 1699 (tome VI of the Paris edition, tome III of the Hague reprint of 1731, pp. 71 ff., « auctore Ægidio Personerio de Roberval »), but it teaches the same doctrine in the same vocabulary — positiva supra, positiva infra, constitutio, recognitio. Libri made this comparison on view 54 of NAF 9544 and judged that « la rédaction et la disposition des matières ne ressemblent pas à celles du manuscrit ». This partly answers the check that latin-11195-recognitione-aequationum leaves open.",
    basis:
      "Libri, view 54: « Un ouvrage [du] même titre est imprimé dans le 6e vol. des anciens mém[oires] de l'Académie des Sciences, mais la rédaction et la dispo[sition] des matières ne ressemblent pas à celles du manuscrit. » The printed text, read here in the Hague 1731 tome III, opens « Æquationem recognoscere, est statum illius examinare … » and treats the quadratics in a single « Caput unicum » before « Caput primum » of the cubics; the manuscript opens « Ideo is tractatus d[icitu]r de æquationum recognitiōe quia in ipso investigantur modj … » and gives the quadratics four capita (v. 4–5). Both divide true sides into « positiva supra » and « positiva infra ». The printed volume's contents list also carries « De resolutione geometrica planarum et cubicarum æquationum », the Torricelli–Roberval letters, and the « Observations sur la composition des mouvemens », whose last example is the thirteenth, « de la Parabole de M. des Cartes » — which bears out Libri's statement that the printed Observations stop there.",
    ours:
      "The collation, which is slight: the opening sentences, the chaptering of the quadratics, the shared vocabulary. No attribution follows from it. That the manuscript shares the printed text's terms is consistent with its being a pupil's or a copyist's redaction of Roberval's teaching and with other explanations; its two citations of « D. Rob. » for borrowed lemmas are still what the leaves themselves say about Roberval. Libri's classing of the manuscript among « Manuscrits de Roberval » is a fact about Libri. The relation of the two texts beyond their openings and first chapters was not studied.",
    literature: [
      "Mémoires de l'Académie royale des sciences, contenant les ouvrages adoptez par cette Académie avant son renouvellement en 1699, Tome troisième, La Haye, P. Gosse et J. Neaulme, 1731 — Internet Archive bub_gb_SsbZh3yaZiIC, OCR text read 22 September 2026: contents « Ouvrages de M. de Roberval », De recognitione æquationum at p. 71, its title page and first pages, the chapter heads. The Paris edition's tome VI, which Libri cites, was not opened.",
      "Internet Archive mmoiresdelacadm16fragoog (1736) and bub_gb_Y2s4OHfXijIC, bub_gb_-0_ltNh5y_YC, bub_gb_rNhNPvZJ618C (1731) — searched for « recognitione »: no hit; they are other tomes.",
      'Not searched: any study of Roberval\'s algebra that compares the printed De recognitione with manuscripts; Jean Itard and the Roberval literature named as unsearched in latin-11195-recognitione-aequationum.',
    ],
    status: 'candidate',
    settle:
      "Collate the manuscript and the printed text proposition by proposition — whether the printed text has the manuscript's limitations, its « D. Rob. » lemmas and its ten capita on the quarto-quadratics. Then update latin-11195-recognitione-aequationum, whose settle this entry answers in part; that entry has not been edited.",
  },
  {
    id: 'naf-9544-germain-fragment-idee-fondamentale',
    cote: 'naf-9544',
    pages: 'views 21–23 (the leaves paginated 16 and 17)',
    kind: 'codicological',
    claim:
      "NAF 9544 holds a two-leaf philosophical fragment headed « [Ce qui suit s'est trouvé dans les papiers laissés par Mlle Germain] », on the fundamental idea of a science, which is printed neither in the Considérations générales sur l'état des sciences et des lettres (1833) nor in Stupuy's Œuvres philosophiques de Sophie Germain (1896), including its Pensées diverses.",
    basis:
      "The fragment runs from « L'idée fondamentale d'une science n'est pour celui qui en commence l'étude que la déterminante du sujet de cette science » to « jamais compliquées de considerations qui lui soient étrangères ». It quotes, underlined, a doctrine it attacks — « l'inconnu est dans le connu ; lorsque l'on apprend on va du même au même ; une science ne renferme qu'une seule idée » — and it answers the claim that reasoning is « une operation mécanique exécutée sur des signes » with « La certitude mathématique tient a l'identité du sujet et la langue des calculs est bien faite parceque … ». The heading, in a heavier pen, and the wrapper on view 20, « Sofia Germain (autogr.) », carry the attribution.",
    ours:
      "The negative search, which is only as good as the OCR it ran on. The identification of the doctrine attacked with Condillac's is the modernised reading's and is not part of the claim. The attribution to Germain is the heading's and the wrapper's; the transcription found the hand compatible with her autograph at Français 9115 view 222 and did not conclude.",
    literature: [
      "Considérations générales sur l'état des sciences et des lettres aux différentes époques de leur culture, 1833 — Internet Archive considrationsgn00germgoog, full OCR text searched 22 September 2026 for « idée fondamentale », « signes de signes », « même au même », « opération mécanique », « inconnu est dans », « inégalement connu », « science toute entière », with loose patterns for OCR damage: no hit. « La langue des calculs » occurs, in other contexts.",
      "Œuvres philosophiques de Sophie Germain, suivies de pensées et de lettres inédites, ed. H. Stupuy, 1896 — Internet Archive oeuvresphilosoph00germ, full OCR text searched for the same phrases and for « certitude mathématique », « la déterminante »: no hit; the Pensées diverses were scanned for « signe », « fondament », « connu », « identit », « définition »: nothing matching.",
      "Not searched: Henry 1879, Revue philosophique 8, 619–641, which printed « documents nouveaux » from her papers; the first edition of Stupuy (1879); Bucciarelli and Dworsky 1980; Del Centina and Fiocca 2018 (paywalled, per the NAF 4073 entries). Web search was unavailable (HTTP 403).",
    ],
    status: 'candidate',
    settle:
      "Read Henry 1879 and Stupuy 1879 for the phrase « l'idée fondamentale d'une science ». If neither prints it, the fragment stands as unpublished on the searched evidence; if one does, the entry becomes matched and the printed text dates the heading's « papiers laissés ».",
  },
  {
    id: 'naf-9544-germain-purchase-1884',
    cote: 'naf-9544',
    pages: 'views 20, 24–28',
    kind: 'historical',
    claim:
      "The Germain fragment of NAF 9544 was bought in Paris for Baldassarre Boncompagni on Monday 30 June 1884, from the « cabinet Dubrunfaut », and sent to him in Rome the next day; it later passed with his collection into the album the BnF bound in 1899. No source searched records this provenance.",
    basis:
      "Dated sources on the leaves: a telegram received at Rome on 28 June 1884, « ROME PARIS NO 32042 10 28/6/84 6/30 SR — RECU TELEGRAMME ACHAT AUTOGRAPHE GERMAIN », addressed « BALTHASAR BONCOMPAGNI PALAIS PIOMBINO ROMA » (views 27–28); a telegram received at Rome on 30 June 1884 at 19 h, deposited in Paris on the 30th at 4.35, « GERMAIN ACHETE 29 PART DEMAIN », same addressee (« BONCOMPAGNIE » on the strip; views 24–26); and the slip under the wrapper « 677 / Sofia Germain (autogr.) », « Sous ce pli l'autographe de Sophie Germain, acheté le lundi, 30 juin, (cabinet Dubrunfaut). La couverture imprimée Charavay sera envoyée avec une brochure quelconque. A. M. » (view 20). 30 June 1884 was a Monday.",
    ours:
      "The weekday computation, which is what ties the slip, which has no year, to the telegrams of 1884; the order of the operations (order received on the 28th, purchase and dispatch announced on the 30th). The « 29 » of the second telegram has no unit and is not interpreted. The initials « A. M. » are not resolved: Boncompagni's Paris correspondents are the place to look, and none is named here. That the wrapper's « 677 » is the piece's lot number in the Boncompagni sale of 1898 (the Libri description in the same album bears « Vente B. Boncompagni, VI. Autogr. (1898), n° 673 ») is an inference from proximity and is not claimed. The telegrams' year rests on the printed strip « 28/6/84 » and on a hand-completed « 188[4] » whose last figure is ill-formed.",
    literature: [
      "Not searched in substance: web search was unavailable (HTTP 403), and nothing on Boncompagni's autograph purchases, the Dubrunfaut sale or the 1898 Boncompagni sale catalogue could be reached. The entry is written as the leaves give it so that the check can be made.",
      "Del Centina and Fiocca 2018 — not read (paywalled); a thorough account of Germain's manuscripts may record the provenance of this piece.",
    ],
    status: 'candidate',
    settle:
      "Find the catalogue of the Dubrunfaut autograph sale of June 1884 (Charavay, by the slip) and the Boncompagni sale catalogue of 1898, part VI, lots 673 and 677: the first would give the lot and the price (and perhaps the « 29 »), the second would confirm the passage through Boncompagni's collection to the BnF.",
  },
  // NAF 5161 — find-novelty pass, 22 September 2026, on claude-opus-5-5 (Opus 5.5),
  // the model that wrote transcripts/naf-5161/naf-5161.modern.tex. Five entries, to be
  // merged into FINDINGS by the coordinator. Web search was unavailable in this session
  // (HTTP 403 on every query); the literature was read as full-text OCR from archive.org
  // (Delisle 1888: cataloguelibri00bibl; Tannery 1893: lacorrespondanc00tanngoog;
  // Adam–Tannery I, II, III, IV, V, X and Supplément: uvresdedescartesNNdesc,
  // suoeuvresdedesca00desc). The BnF Archives et manuscrits notice for NAF 5161 refused
  // the request (HTTP 403) and was not read.
  {
    id: 'naf-5161-foliation-concordance',
    cote: 'naf-5161',
    pages: 'views 3–42 (ink series 1–20); ff. 1, 5, 11, 14, 15–18 as cited',
    kind: 'codicological',
    claim:
      "The folios by which the literature cites NAF 5161 are the ink series 1–20 that the transcriptions read on the rectos and decline to write as foliation. On that series the three anonymous pamphlets against Descartes's Géométrie — « Deffauts de quelques reigles » (f. 1), « Erreurs du Sr des Cartes touchant le nombre des Racines » (f. 5) and « Qu'il est faux que les Equations qui ne montent que jusques au quarré… » (f. 11) — are at views 3–9, 11–20 and 23–26. The copy of Roberval's réplique (f. 14) is at views 29–30, and Roberval's Observation on the centre of agitation (ff. 15–18) at views 31–39, with the figure leaf f. 17 at view 36 and view 34 a second exposure of f. 16r. The sources searched give folios and never views.",
    basis:
      "The transcriptions' headers read the larger ink figure on each recto: 1 (v. 3), 2 (v. 5), 3 (v. 7), 4 (v. 9), 5 (v. 11) … 9 (v. 19), 10 (v. 21, blank), 11 (v. 23), 12 (v. 25), 13 (v. 27), 14 (v. 29), 15 (v. 31), 16 (v. 33 = v. 34), 17 (v. 36), 18 (v. 38), 20 (v. 42). The figure on v. 40, f. 19r, is under a blot. The 1888 certificate on view 2, « Volume de 20 Feuillets / Le Feuillet 10 est blanc », agrees with it. Each literature citation lands on the incipit it names. Tannery's f. 11 is the « Qu'il est faux » title at v. 23; f. 5 is « Erreurs » at v. 11; f. 1 is « Deffauts » at v. 3; f. 14 is « Copie de la lettre de Mr Roberval », « J'ay 4 choses a repliquer », at v. 29; ff. 15–18 run from « Nous conuenions de Definition » (v. 31) to « mes conclusions du Centre d'agitation » (v. 39). A second, smaller and older series (63–71, 73–74, a struck 48, 58–62, 54) breaks twice and is not what is cited.",
    ours:
      "The folio-to-view concordance, and the identification of the cited folios with the ink series. No \\folio{} has been written on the strength of it. The texts and their folios are the literature's. The transcriptions separate the hands, which the sources searched do not: one hand for ff. 1 and 5, another for f. 11. Tannery 1893, p. 37, thinks f. 11 probably « de la même main » as the other two, in a sentence where « main » may mean author. That point is recorded here, not claimed.",
    literature: [
      "P. Tannery, La correspondance de Descartes dans les inédits du fonds Libri (1893), pp. 36–37 — read (archive.org OCR). « Le MS. … fr. n. a. 5161, formé avec les papiers de Roberval du fonds Libri, contient trois pièces… l'une (f° 11)… (f° 5) Erreurs… (f° 1) Défauts… ». P. 66 — read: the réplique « conservée par une copie de la main de Mersenne… fr. n. a. 5161, folio 14 », and Roberval's draft in « fr. n. a. 1086 [OCR], f° 86 à 89 ».",
      "Adam and Tannery, Œuvres de Descartes I, p. 481 (note to p. 480, l. 15), « MS. fr. n. a. 5161, f° 1 »; II, p. 269 note a and pp. 460 and 508–509, the three pamphlets, f° 1; IV, p. 420, CDXXXVI « Roberval à Cavendish pour Descartes [mai 1646]. Copie MS., Bibl. Nat., fr. n. a. 5161, f° 15-18 »; IV, p. 502, CDXLVII, copy « de la main de Mersenne… 5161, f° 14 » — all read (archive.org OCR).",
      "Delisle, Catalogue des manuscrits des fonds Libri et Barrois (1888), p. 172, no. CXXV « Nouv. acq. franc. 5161 (Libri, 1861) » — read. It lists the pieces by title and incipit, with no folios.",
      "BnF Archives et manuscrits, notice NAF 5161 (ark:/12148/cc40798j/cd0e86) — NOT read: the request was refused (HTTP 403). It may divide the volume by folio and should be checked.",
      "Not searched: de Waard et al., Correspondance du P. Marin Mersenne (vols. VIII and XIV would cite these leaves for 1638–1639 and 1646), which is not digitised.",
    ],
    status: 'candidate',
    settle:
      "A person looks at the rectos for a pencilled foliation distinct from the ink series. If there is none, the ink series is the foliation the literature cites. The three transcriptions can then write \\folio{}, and pieces.json can record the five pieces at ff. 1–4, 5–9, 11–12, 14 and 15–18.",
  },
  {
    id: 'naf-5161-rational-triangle-note',
    cote: 'naf-5161',
    pages: 'views 27–28 (f. 13r–v)',
    kind: 'codicological',
    claim:
      "NAF 5161 f. 13 (views 27–28) carries an unsigned working note, in a hand found nowhere else in the volume. It asks for a primitive right triangle whose area is six times a square and which is not similar to 3, 4, 5, and derives the rational triangle 7/10, 120/7, 1201/70 of area 6; its verso runs the same chain from 5, 12, 13 (area 30). None of the sources searched records this leaf. Delisle's 1888 description of the volume passes from the copy of Roberval's letter to the memoir on the centre of agitation without it, and Tannery 1893 and Adam–Tannery do not mention it.",
    basis:
      "View 27: « Il faut trouver un Δ primitif dont l'aire soit un sex[tu]ple quarré et qui ne soit pas semblable au triangle de 3. 4. 5. ». The rule is to form a second triangle from the two smaller sides and a third from the two greater sides of the second, then divide. The table reads 3 4 5 / 7 24 25 / 49 1200 1201 and the quotients 7/10, 120/7, 1201/70. View 28, sideways: 5 12 13 / 119 120 169 / 14161 40560 42961, with « 2704 », « 52 » and « 13 12 5 | 30 ». All the numbers check: 49·1200/2 = 6·70², and 40560 = 15·52².",
    ours:
      "The recomputation, and the general form of the rule. From a triangle (a, b, c) of area n, the triangle generated by c² and 2ab has sides (a²−b²)², 4abc², c⁴+4a²b² and area n·(2c(a²−b²))²; the leaf's divisor is 2c|a²−b²|. The observation that this is the duplication of the point (c²/4, c(b²−a²)/8) on y² = x³ − n²x is also ours. The method is classical and is claimed as nobody's discovery. The finding is that this leaf exists here, unrecorded, not that its mathematics is new. The hand is not attributed. Two words are doubtful on the transcription (« rectangle » interlined, « nombre » in the sentence on the even side), and « 119 » is a doubtful reading confirmed by 12² − 5² = 119.",
    literature: [
      "Delisle 1888, p. 172, no. CXXV — read: lists the three pamphlets « par Roberval », the « Copie de la lettre de M. Roberval… De la main du P. Mersenne », the « Mémoire de 6 pages » on the centre of agitation and the Fabri letter; nothing on f. 13.",
      "Tannery 1893 — searched by keyword in the full OCR for « 1201 » and « sextuple »: nothing. Its description of NAF 5161, pp. 36–37, names only the three pamphlets.",
      "Adam and Tannery I–V, X and Supplément — OCR searched for « 1201 » and « sextuple »: nothing.",
      "Not searched: the Correspondance du P. Marin Mersenne (not digitised); Dickson, History of the Theory of Numbers II, ch. XVI (congruent numbers), for seventeenth-century manuscript witnesses of this construction; Œuvres de Fermat II and the Frenicle literature.",
    ],
    status: 'candidate',
    settle:
      "Check the index of manuscripts of the Correspondance du P. Marin Mersenne for NAF 5161 f. 13. If it is printed or described there, the entry becomes matched. The BnF notice, unread here, may also describe it.",
  },
  {
    id: 'naf-5161-centre-of-percussion-ratio-inverted',
    cote: 'naf-5161',
    pages: 'views 36 and 38 (ff. 17r, 18r)',
    kind: 'mathematical',
    claim:
      "In the copy of Roberval's Observation on Descartes's centre of agitation, the proportion that constructs the centre 5 of the cylindrical surface CGHF reads « comme l'arc LM est à sa corde LM, ainsy le demy-diametre IN soit à I5 ». That is inverted. It gives I5 = r·sinα/α, the centre of gravity of the arc, between I and N, whereas the same paragraph puts this centre between N and S and the figure leaf draws 5 beyond N. The correct construction is chord to arc, I5 = r·α/sinα, which is the centre of oscillation of the shell. Adam–Tannery IV, 426, ll. 9–11, prints the inverted proportion without note, and its éclaircissement, p. 428, calls Roberval's solution exact.",
    basis:
      "View 38: « … il n'y a que ceux qui sont dans la ligne G H qui agissent… par le poinct N… tous les autres le faisant en dehors entre N et S: & partant le centre d'agitation… est aussy entre N et S », then « comme l'arc L M est à sa corde L M, ainsy le demy-diametre I N soit à I 5, et le poinct 5 sera le centre demandé ». View 36, the figure: on the vertical I N, from the top, 3, O, P, Q, N, R, 5, S. View 32 orients the two other ratios correctly: IO = (2/3)r·chord/arc for the centre of gravity, IQ = (3/4)r·arc/chord for the centre of percussion. Composing the shells with the corrected ratio gives exactly IQ.",
    ours:
      "The recomputation: for a thin shell of radius r and half-angle α, I/(Md) = r²/(r sinα/α) = rα/sinα, between r and r/cosα. The inference that the text, not the figure, is at fault is ours. The error may be the copyist's or the author's; the leaf does not say, and the entry does not decide.",
    literature: [
      "Adam and Tannery, Œuvres de Descartes IV, CDXXXVI, pp. 420–428 — read (archive.org OCR). The text at p. 426, ll. 9–11, has the inverted ratio. The variant apparatus from Clerselier III, letter 87, records only « I 5] I S » at l. 11, so Clerselier, as collated there, has the same orientation. The éclaircissement, p. 428, says Roberval's « solution est exacte » and does not comment on this line.",
      "Tannery 1893 — read on the réplique (pp. 66 ff.); it does not print the Observation.",
      "Not searched: P. Costabel, « La controverse Descartes–Roberval au sujet du centre d'oscillation » (Revue des sciences humaines, 1951); the Correspondance du P. Marin Mersenne XIV (1646); Clerselier III itself, which was not opened.",
    ],
    status: 'candidate',
    settle:
      "Read Costabel 1951 and the Mersenne correspondence for 1646 on this passage. If either notes the inversion, the entry becomes matched. Opening Clerselier III, p. 502, would show whether the printed tradition has the inversion independently of this copy.",
  },
  {
    id: 'naf-5161-fabri-letter-scalene-foci',
    cote: 'naf-5161',
    pages: 'view 42 (f. 20r); address panel view 41 (f. 19v)',
    kind: 'mathematical',
    claim:
      "The unsigned letter to « Mon R. Pere » on the Geometrical Theses of « le P. Fabri » proposes, as a theorem that « le P. Grinbergerus » demonstrated, a construction of the foci of a hyperbola cut from a scalene cone. The circle centred at the hyperbola's centre g with radius gE, where E is the foot on the cone's axis of the perpendicular from the vertex f, would pass through the foci. The construction is exact for a right cone and false in general for a scalene one. None of the sources searched discusses the mathematics of this letter.",
    basis:
      "View 42: « si dans une cone scalene bae, (car il n'y a pas de difficulté en un cone droit) l'on mesne un plan qui fasse un hyperbole de laquelle l'axe soit la ligne hghfi, et le centre g, ayant mesné du sommet f, une perpendiculaire fE, sur l'axe du cone AED, et que du centre g, et de l'intervalle gE, l'on descrive un cercle, ce cercle donnera les foyers ». The same letter generalises Fabri's fifth proposition correctly (segment gmh = sector gli + segment hk when arc hk = arc hi) and objects correctly to the seventh (infinitely many planes through an inner point cut parabolas).",
    ours:
      "Everything mathematical. For a right cone gE² = a² + b² was verified in coordinates. The counterexample: vertex at the origin, base circle centre (1/2, 0, −1), radius 1, in z = −1; the section by x = 1 is (z − 2/3)²/(16/9) − y²/(4/3) = 1, with c² = 140/45, while gE² = 128/45. Taking the altitude instead of the axis gives 25/9 = 125/45, also wrong. The transcription reads the third letter of « hghfi » with doubt, and « Pour ce » and one short word are unread. These do not touch the construction. Neither Fabri's theses nor Grienberger's demonstration was consulted, so whether they state the construction differently is not known.",
    literature: [
      "Delisle 1888, p. 172 — read: records the letter by incipit as « Lettre anonyme, adressée peut-être au P. Mersenne », and its closing « ce beau problesme de M. Roberval ». Nothing on its content.",
      "Tannery 1893 — OCR searched for « Fabri », « Grinberg », « cylindre oblique »: Fabri appears only as the author behind Mousnier's Tractatus de motu locali (Lyon 1646), p. 65 note, not for this letter.",
      "Adam and Tannery I–V, X — OCR searched for « Grinberg », « Grienberg »: nothing; « Fabri » only in unrelated letters.",
      "Not searched, and the first place this can fail: the Correspondance du P. Marin Mersenne, where an undated letter to Mersenne about Fabri's theses would be printed and annotated; the theses of Honoré Fabri themselves; Grienberger's printed works.",
    ],
    status: 'unsearched',
    settle:
      "Find the letter in the Correspondance du P. Marin Mersenne (by its incipit « vous pouuez mander au P. Fabri ») and read the editors' note. Then read Fabri's theses and the Grienberger text the letter alludes to, to see whether the construction is stated there for the scalene cone.",
  },
  {
    id: 'naf-5161-f14-libri-portfolio-1848',
    cote: 'naf-5161',
    pages: 'view 29 (f. 14r); view 2',
    kind: 'codicological',
    claim:
      "F. 14 of NAF 5161, the copy of Roberval's réplique of 1646, carries a modern ink note « (Du portefeuille 1848 de Libri.) ». Delisle 1888 assigns the volume as a whole to Libri's portfolio 1861, and the volume's own title leaf says « Libri 1860 ». Portfolio 1848 is, in Delisle's catalogue, the source of NAF 5175, NAF 5176 and NAL 2339–2341, the Fermat and Mersenne papers. None of the sources searched records that this leaf of NAF 5161 came from it.",
    basis:
      "View 29, left margin, in a modern hand: « (Du portefeuille 1848 de Libri.) ». View 2, the nineteenth-century title leaf: « Libri 1860 ». The older ink series breaks at this leaf: 73, 74 on ff. 12–13, a struck « 48 » on f. 14, then 58–62 on ff. 15–19. So f. 14 came from elsewhere than its neighbours.",
    ours:
      "The juxtaposition of the note, the title leaf and Delisle's portfolio numbers. The note is not dated or attributed here. Whether « 1860 » on the title leaf is a slip for 1861, or reflects a different count, is not settled.",
    literature: [
      "Delisle 1888, pp. 167–173 — read: « CXXIV. Nouv. acq. franc. 5160. (Libri, 1860.) », « CXXV. … 5161. (Libri, 1861.) », and portfolio 1848 for NAF 5176, NAL 2339, 2340, 2341 and NAF 5175.",
      "Tannery 1893, p. 36 — read: « formé avec les papiers de Roberval du fonds Libri »; no portfolio number for NAF 5161.",
      "Adam and Tannery IV, p. 502 — read: gives f° 14 as a copy in Mersenne's hand, no provenance note.",
      "Not searched: the BnF notice (refused, HTTP 403); Tannery and Henry, Œuvres de Fermat I, Avertissement, on the contents of portfolio 1848, already read for the naf-5176 entries, not re-read for this leaf.",
    ],
    status: 'candidate',
    settle:
      "Read the BnF notice and Tannery–Henry's account of portfolio 1848 for any mention of a Roberval or Mersenne leaf later bound into NAF 5161.",
  },
];
