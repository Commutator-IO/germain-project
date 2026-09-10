import { H2, H3, P, useHashTarget } from './components/Anchors.tsx';
import { Footer, Header } from './components/Frame.tsx';
import { EDITIONS } from './content/books.ts';
import { COTES, HOLDERS } from './content/catalogue.ts';

/**
 * Sources and rights: what each holder permits, and what this site therefore
 * does and does not do.
 *
 * The parent project could put this in a footer, because one university held
 * everything and had put it all online. Here five holders in four countries
 * hold pieces of one corpus, one has digitised its share under stated
 * conditions, one asserts rights on reproductions of documents it has not
 * digitised, two have digitised nothing, and the scholarship on top of the
 * manuscripts is under its authors' copyright. A reader — or a holder — who
 * wants to know on what footing a page of this site stands should be able to
 * find the answer in one place, sentence by sentence, with a link to it.
 */
export function SourcesPage() {
  useHashTarget();
  const byHolder = (id: string) => COTES.filter((c) => c.holder === id);

  return (
    <>
      <Header path="/sources/" />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <header className="max-w-[46em]">
          <h1 className="titre text-[34px] leading-tight text-ink-900">Sources &amp; rights</h1>
          <P id="intro" className="mt-3 text-[15.5px] leading-relaxed text-ink-700">
            Sophie Germain died in 1831. Everything she wrote has been in the public domain for
            well over a century, in every jurisdiction. What is not in the public domain is what
            other people have made since: the digitisations, which carry their makers'
            conditions; the transcriptions and editions, which carry their authors' copyright;
            and the analyses. This page says, for each, what the terms are and what this site does
            about them. Every paragraph has its own address.
          </P>
        </header>

        <section className="mt-10 max-w-[52em]">
          <H2 id="principles">Four rules this site holds itself to</H2>
          <ol className="prose-fonds mt-3 list-decimal">
            <li id="rule-no-copies" className="anchored ml-5">
              <strong>No image of any manuscript is stored or re-served here.</strong> The
              facsimile pane asks Gallica for each view as you turn to it, and the bytes go from
              the BnF to your browser. The repository's <code>.gitignore</code> refuses image
              files and PDFs outright, and the deploy carries none.
            </li>
            <li id="rule-attribution" className="anchored ml-5">
              <strong>Every image shown carries its source line</strong>, « Source
              gallica.bnf.fr / Bibliothèque nationale de France », which is the one condition
              Gallica sets on non-commercial reuse. It is printed under the pane and in the head of
              every transcription.
            </li>
            <li id="rule-no-scholarly-copying" className="anchored ml-5">
              <strong>Nobody else's transcription is reproduced</strong>, not a sentence, not
              even where the manuscript is not online and theirs is the only text there is. The
              site links to it and says whose it is. The prize memoirs are the test case: the only
              reading of them is Nathalie Grun's, and this site has no reading of them at all.
            </li>
            <li id="rule-nothing-shown-offline" className="anchored ml-5">
              <strong>What is not online is not shown</strong> — not a detail, not a thumbnail
              from a publication that reproduced one. The Académie asserts rights on its
              reproductions; Florence and Göttingen have published none on terms this site has
              verified. A volume that is not online opens on a pane that says where it is.
            </li>
          </ol>
        </section>

        <section className="mt-12 max-w-[52em]">
          <H2 id="holders">Holder by holder</H2>
          {HOLDERS.map((h) => (
            <div key={h.id} className="card mt-5 px-5 py-4">
              <H3 id={`holder-${h.id}`}>
                {h.name}, {h.city}
              </H3>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                {h.access === 'iiif'
                  ? 'Digitised · open IIIF API · shown here'
                  : h.access === 'onsite'
                    ? 'Not digitised · reading room only · not shown'
                    : 'Letter database · terms unverified · linked, not embedded'}
              </p>
              <P id={`holder-${h.id}-terms`} className="mt-2 text-[13.5px] leading-relaxed text-ink-700">
                {h.terms}
              </P>
              <p className="mt-2 text-[12.5px] text-ink-500">
                Holds:{' '}
                {byHolder(h.id).map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ', '}
                    <span className="font-medium text-ink-700">{c.shelfmark}</span>
                    {c.pages > 0 && <span className="text-ink-400"> ({c.pages} views)</span>}
                  </span>
                ))}
                .
              </p>
              <p className="mt-2 flex flex-wrap gap-x-4 text-[12.5px]">
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
                >
                  The holder ↗
                </a>
                {h.termsUrl && (
                  <a
                    href={h.termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
                  >
                    Their conditions ↗
                  </a>
                )}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12 max-w-[52em]">
          <H2 id="gallica">What Gallica permits, and what was measured</H2>
          <P id="gallica-terms" className="prose-fonds mt-3">
            Gallica's conditions of use distinguish two cases. For digitisations of works in the
            public domain — which is every Germain manuscript — <strong>non-commercial reuse is
            free</strong>, on condition that the source is stated as « Source gallica.bnf.fr /
            Bibliothèque nationale de France ». <strong>Commercial reuse</strong> is subject to a
            paid licence. This site is non-commercial, carries no advertising and sells nothing;
            its own work is placed in the public domain under CC0, which is the opposite of a
            commercial exploitation. The metadata Gallica exposes is under the Etalab open
            licence, which asks only for the source to be mentioned.
          </P>
          <P id="gallica-embedding" className="prose-fonds">
            Gallica itself invites embedding: its June 2019 post « Mettez du Gallica dans votre
            site web » describes integrating a document to browse, an image or a region of an image
            through the IIIF API, and the BnF's data.gouv listing for that API says access is open
            « sans restriction, sauf en cas d'usage abusif ». This site does exactly and only
            that — one image per view, at the width of the pane, at the reader's request.
          </P>
          <P id="gallica-measured" className="prose-fonds">
            Three facts were measured on 10 September 2026 rather than assumed. The IIIF manifests
            and images answer with <code>Access-Control-Allow-Origin: *</code>, so a browser on
            this origin may read them without any intermediary — which is why, unlike the parent
            project, this site has no relay. The manifests' own <code>license</code> field points
            at Gallica's conditions page. And Gallica <strong>rate-limits</strong>: a dozen
            requests in a few seconds from one address were answered with connection resets. The
            site therefore never prefetches, debounces the pane's requests as you scroll, and the
            mirroring script pauses between images and names itself in its user agent.
          </P>
          <P id="gallica-abusive" className="prose-fonds">
            « Usage abusif » is the one term that is theirs to define. What this site understands by
            it, and avoids: bulk downloading of volumes for redistribution, scraping without a
            named user agent, and load that looks like a crawler's. A reader turning pages, and a
            transcriber mirroring a twenty-view batch once, look like a reader and a transcriber.
            If the BnF disagrees, the address to write to is in the footer, and the code that would
            change is one file.
          </P>
        </section>

        <section className="mt-12 max-w-[52em]">
          <H2 id="academie">The Académie's memoirs</H2>
          <P id="academie-status" className="prose-fonds mt-3">
            The memoirs of 1811, 1813 and 1815 are at the Archives des prix of the Bibliothèque de
            l'Institut. They are not digitised. Their text is in the public domain; the Académie's
            reproductions of them are credited « © Archives de l'Académie des sciences » where
            they appear (two extracts in Nathalie Grun's 2023 article for France Mémoire), which is
            an assertion of rights on the photographs. This site shows nothing of them and holds
            no transcription of them.
          </P>
          <P id="academie-grun" className="prose-fonds">
            The only transcription is Annexe D of Grun's thesis, 120 pages made from the originals.
            The thesis is open access on HAL and on the Université de Lorraine's server under the
            standard notice — « soumis à la propriété intellectuelle de l'auteur … toute
            contrefaçon, plagiat, reproduction illicite encourt une poursuite pénale » — and no
            Creative Commons licence. A transcription of a public-domain text is the transcriber's
            work: the choices of reading, the resolution of every doubtful word, the layout of the
            equations are hers. This site cites it, links to it, and does not reproduce it, and
            will not use it to seed a reading of pages it cannot see. If the Académie digitises the
            dossiers, a reading made here from the images would be a different object, and would
            still cite hers.
          </P>
          <P id="academie-1821" className="prose-fonds">
            What this site may work with freely is what Germain herself printed: the « Recherches
            sur la théorie des surfaces élastiques » of 1821, which reworks the third memoir, and
            the « Remarques » of 1826. Both are on Gallica and Wikisource in the public domain.
          </P>
        </section>

        <section className="mt-12 max-w-[52em]">
          <H2 id="literature">The scholarship</H2>
          <P id="literature-intro" className="prose-fonds mt-3">
            Every work this site draws on, with its rights position. « Linked and cited » means
            the site names it, links to it, and quotes at most a phrase; « never copied » means
            its transcriptions of manuscripts are not reproduced. Where a paper is behind a
            paywall the site says so rather than pretending the link is a text.
          </P>
          <ul className="mt-4 space-y-2">
            {EDITIONS.map((e) => (
              <li key={e.id} id={`lit-${e.id}`} className="anchored rounded-[var(--radius-card)] border border-ink-200 bg-white px-4 py-3 text-[13px] leading-relaxed">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink-900 underline decoration-ink-300 underline-offset-2 hover:text-brand-700"
                >
                  {e.editors}, {e.year} — {e.title} ↗
                </a>
                <span className="text-ink-500"> · {e.venue}</span>
                <p className="mt-1 text-ink-600">
                  <span className="font-semibold text-ink-700">Rights.</span> {e.rights}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 max-w-[52em]">
          <H2 id="ours">What is ours, and its licence</H2>
          <P id="ours-cc0" className="prose-fonds mt-3">
            The transcriptions, the modernised readings, the catalogue as compiled here, the
            skills and the code are released under <strong>CC0 1.0</strong> — placed in the public
            domain, which is the only licence that makes sense for readings of papers nobody owns.
            The catalogue's facts are the holders' and the literature's, credited line by line; the
            arrangement is ours and free.
          </P>
          <P id="ours-provenance" className="prose-fonds">
            Every transcription records in its header the model that made it and the date, and
            declares itself an unverified first pass in its title block and as a watermark on
            every page of its PDF. That is a statement about quality, not about rights: a reading
            made by a machine in 2026 of a page written in 1815 is as public as the page.
          </P>
          <P id="ours-takedown" className="prose-fonds">
            If you are a holder or an author and believe something here oversteps your terms, open
            an issue on the repository or write to the address in the footer. The site is one
            person's, the change is one commit, and it will be made first and argued afterwards.
          </P>
        </section>
      </main>

      <Footer />
    </>
  );
}
