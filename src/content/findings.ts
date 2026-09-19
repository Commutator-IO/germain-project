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
    pages: 'views 1–38, whole',
    kind: 'codicological',
    claim:
      "BnF Latin 11195 contains no letters, by Roberval, Huygens, Torricelli, Fermat or anyone else, and no opusculum of Flayder — only a hand-copied page of his printed title. The title that promises them is the collective title of the three-volume group Latin 11195–11197, and the BnF describes the contents of none of the three.",
    basis:
      'All thirty-eight views were transcribed. They hold two dossiers and nothing else: the Latin treatise on equations (views 2 R–23 R) and the flight dossier (views 26 R–37 R), separated by blank leaves and sharing no hand, no ink and no cross-reference. Nine views are wholly blank. Of Flayder there is the title page of his De arte volandi (Tübingen, Werlin, 1627) copied by hand on view 27 R, and no text of his. The BnF record gives the title at the level of Latin 11195–11197 — « 3 volumes. Reliure basane. Manuscrit en latin » — and for each volume only old shelfmarks and a leaf count: Supplément latin 218/1 (64 ff.), 218/2 (55 ff.), 218/3 (40 ff.). The group was acquired by 10 March 1756, entered in the register as « Trois volumes en veau consernant les mathématiques Torricelli, Robertval, Carcavi, de Fermat etc. »',
    ours:
      "Nothing but the reading of the leaves. This entry makes no claim about Latin 11196 and 11197, which have not been seen and may well hold the letters; the point is only that the collective title has been read as describing this volume, and does not. The group's language field, « Manuscrit en latin », is also incomplete for this volume, which carries a whole treatise in Italian and a legend in French.",
    literature: [
      'BnF Archives et manuscrits, records for Latin 11195, Latin 11196, Latin 11197 and the group Latin 11195–11197 — all four read, 19 September 2026. None describes contents.',
      "This site's own catalogue, holdings.json, which attached the group title to the single shelfmark and left the date empty, where the BnF dates the group « XVIIe siècle ».",
      'Not searched: the Mersenne, Huygens, Torricelli and Fermat correspondence editions, which would say where the letters of the group title actually are, and whether they are in the two sibling volumes.',
    ],
    status: 'candidate',
    settle:
      'Look at Latin 11196 and 11197. If the letters are there, the group title is simply distributed across three volumes and this entry becomes a note about how the title should be read rather than a gap in the catalogue.',
  },
];
