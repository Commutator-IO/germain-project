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
    pages: 'views 26–37 (title leaf 26 R; drawings 32 R and 37 R; treatise 33 R–37 L)',
    kind: 'codicological',
    claim:
      "The Italian treatise on views 33 R–37 L of BnF Latin 11195 is Tito Livio Burattini's treatise on flight — known by its incipit « Il volare non è impossibile come fin hora universalmente è stato creduto » and also as Ars Volandi, written in Poland about 1647–48 — and the two pen drawings on views 32 R and 37 R are the two known sketches of his Dragone Volante. No source searched here records that a copy of the treatise is in this volume, or in the BnF at all: the BnF's own manuscripts catalogue returns nothing for Burattini, and its notice for Latin 11195 gives no contents.",
    basis:
      "The leaves carry the treatise's incipit as its running title, and its closing passage matches the one the literature quotes point for point: a machine in the form of a dragon holding two men, « one of whom works while the other is resting, as is done on board a ship », able to travel by night with the help of a compass, and built so that if a wing breaks it sinks gently instead of falling — the transcription's last line of view 37 L is « patirebbero pochissima lesione ». The argument runs from the weight of air (Aristotle's 1:10 against « il computo del Sig.r Galilej » 1:400), through the Archimedes proposition on floating bodies and the specific gravities of five metals, to percussion divided ferma / incontrata / sfuggita and the law of the lever. The lettered drawing on view 32 R and its French legend on view 32 L give A, B B B B, C C, D, E — four lifting wings at B, control surfaces at A, C and D, and a parachute dome at E, which is the lettering the literature describes on the more detailed of the two sketches; view 37 R is the plainer front view. A title leaf reading « Ars Volandi » stands at view 26 R in another hand.",
    ours:
      "The identification, and only that. The text is not claimed as unpublished or unknown — the treatise is well attested by title and its closing passage is quoted in the standard account. What is claimed is that this copy, in this volume, is unrecorded in the sources searched. The volume's other flight pieces are not swept into the attribution: the hand-copied title page of Flayder's printed De arte volandi (view 27 R) and the Latin reading-notes on views 28–29 R are in further hands that this edition does not identify, and nothing here says they are Burattini's.",
    literature: [
      "Treccani, Dizionario Biografico degli Italiani, « Tito Livio Burattini » — read. It reports the model of a flying machine presented to the Polish king in 1647–48 and says the project is known through a summary description in a letter of Des Noyers to Mersenne of 29 February 1648 and a fragment communicated by Thévenot to Huygens in 1661. It names no manuscript of a treatise and no shelfmark.",
      "BnF Archives et manuscrits — searched for « Burattini »: « Aucun résultat ». The notice for Latin 11195 itself gives only the collective title of Latin 11195–11197, the old shelfmarks and 64 ff.; it describes no contents and names no Italian text.",
      "German Wikipedia, « Tito Livio Burattini » — read: names Ars Volandi and its sketches, gives no location for the manuscript.",
      "Christopher James Botham, « Tito Livio Burattini's Flying Dragon » (On Verticality, 1 May 2021) — read; it quotes the closing passage and describes the lettering of both sketches, citing Clive Hart, The Prehistory of Flight (University of California Press, 1985), 135–145, as its source. Hart is the standard account and is where a shelfmark would be given.",
      "Not read, and decisive: Clive Hart, The Prehistory of Flight, 1985, 135–145; and Ilario Tancon, Lo scienziato Tito Livio Burattini, Università di Trento, 2005. Neither was available here.",
      "Wikimedia Commons, File:Burattini Dragon.jpg — checked for provenance: the circulating reproduction cites a website, no library and no shelfmark.",
    ],
    status: 'candidate',
    settle:
      'Open Hart 1985, 135–145, and Tancon 2005, and see which manuscript they worked from. If either cites Latin 11195 — or Supplément latin 218 — the entry becomes `matched`. If they cite another copy, or none, the question becomes whether this is a second copy or the one they used under a shelfmark they did not print. One word should be re-read on the leaf while this is done: the transcription gives \\uncertain{rastello} at view 36, in « l\'altro pu\u00f2 riposar in modo come fosse in vn … », where the published translation of the passage reads « as is done on board a ship ». That points to vascello, and the leaf — not the translation — is what should settle it; the transcription has not been altered.',
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
