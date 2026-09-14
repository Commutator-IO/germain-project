import { Footer, Header } from './components/Frame.tsx';
import { ONLINE } from './content/books.ts';
import { batchCount, evidence, useManifest } from './lib/batches.ts';
import { RAW, REPO, issueUrl } from './lib/report.ts';

/**
 * How to join in.
 *
 * The project's whole claim is that a machine reading is checkable, and a
 * claim nobody can act on is decoration. So this page is ordered by what it
 * costs the reader, not by what interests us: a button, then a pull request,
 * then a batch nobody has touched. Someone who only ever does the first is
 * doing the thing that matters most — they are the only person in the world
 * who knows that word is wrong.
 *
 * The skills are given as files to download rather than as a package to
 * install, because that is what they are: three Markdown files (one with a
 * companion specimen) that Claude Code reads out of a directory. Dressing
 * that up as an installer would hide the one fact worth knowing — you can
 * read the whole instruction set before you run it, and it is shorter than
 * this page.
 */

const SKILLS: {
  name: string;
  produces: string;
  lines: number;
  extra?: string;
}[] = [
  {
    name: 'transcribe',
    produces:
      'the transcription — twenty Gallica views at a time, the mathematics and the prose in LaTeX with the critical apparatus that says which words were read and which were guessed, and the folio where the pencil can be read',
    lines: 247,
    extra: 'references/specimen.tex',
  },
  {
    name: 'modernize',
    produces:
      'the modernised reading — a volume at a time: a résumé for someone new to the subject, then the mathematics in current notation and current names, held to being correct as it stands',
    lines: 147,
  },
  {
    name: 'tag',
    produces:
      "the volume's tags — three to six English keywords closing the résumé, which the manifest extracts and the archive search matches on",
    lines: 52,
  },
];

export function ContributePage() {
  const manifest = useManifest();

  /* "What is left" is the honest headline number, and it has to be counted
     rather than typed: the day someone transcribes a volume, this sentence
     should be smaller without anyone remembering to edit it. */
  const untouched = ONLINE.filter((c) => {
    const ks = Array.from({ length: batchCount(c.pages) }, (_, i) => i + 1);
    return ks.every((k) => !evidence(manifest, c.id, k).transcribed);
  }).length;

  return (
    <>
      <Header path="/contribute/" />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <header className="max-w-[48em]">
          <h1 className="titre text-[34px] leading-tight text-ink-900">Contribute</h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-700">
            Everything here is first-pass machine work, and it says so on every page. That
            admission is worth nothing without a way to act on it. There are three ways in, and
            they are listed cheapest first — the cheapest is also the most useful, because a
            reader who spots a misread word is, at that moment, the only person who knows.
          </p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-700">
            {untouched} of the {ONLINE.length} digitised volumes have not been touched at all.
          </p>
        </header>

        <Routes />
        <Skills />
        <RunABatch />
        <PullRequest />
        <Rules />
      </main>

      <Footer />
    </>
  );
}

/** The three routes, priced. */
function Routes() {
  const routes = [
    {
      n: '1',
      title: 'Report a reading',
      cost: 'one click',
      body: 'Every batch carries a Report a reading button, and every transcribed volume a Report link. Both open a GitHub issue with the shelfmark, the batch and the view you are looking at already filled in. You need a GitHub account and nothing else — not the repository, not LaTeX, not an opinion about what the word should be.',
      href: issueUrl({ cote: 'fr-9115', ark: 'btv1b90724875', batch: 1, page: 5 }),
      hrefLabel: 'See what the form looks like ↗',
    },
    {
      n: '2',
      title: 'Correct a reading',
      cost: 'a pull request',
      body: 'The .tex under transcripts/ is the source of record; the HTML and the PDFs are rebuilt from it on every deploy. So a correction is one edit to one file, and the diff shows exactly what changed about the reading — which is the whole reason the source is LaTeX and not a database.',
      href: `${REPO}/tree/main/transcripts`,
      hrefLabel: 'Browse the transcripts ↗',
    },
    {
      n: '3',
      title: 'Transcribe a batch',
      cost: 'an afternoon',
      body: 'Install the three skills, mirror a batch of a digitised volume nobody has taken, and run the two passes. Roughly an hour of machine time per twenty-view batch, most of it spent reading images. The result is a draft nobody has checked — which is exactly what the rest of the site is, and it is labelled that way.',
      href: '#skills',
      hrefLabel: 'Install the skills ↓',
    },
  ];

  return (
    <section className="mt-10 grid gap-4 md:grid-cols-3">
      {routes.map((r) => (
        <div key={r.n} className="card flex flex-col px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="tabular text-[12px] font-bold text-brand-600">{r.n}</span>
            <h2 className="titre text-[17px] text-ink-900">{r.title}</h2>
          </div>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
            {r.cost}
          </p>
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-600">{r.body}</p>
          <a
            href={r.href}
            {...(r.href.startsWith('#')
              ? {}
              : { target: '_blank', rel: 'noopener noreferrer' })}
            className="mt-3 text-[12.5px] font-medium text-brand-600 hover:text-brand-700"
          >
            {r.hrefLabel}
          </a>
        </div>
      ))}
    </section>
  );
}

/**
 * The skills, and where they have to land.
 *
 * A skill is a directory, not a file — the transcribe skill carries a specimen
 * alongside its instructions — and the directory name is what you type after
 * the slash. Saying that once, plainly, saves the two mistakes everybody makes:
 * renaming the file, and dropping SKILL.md loose into ~/.claude/skills/.
 */
function Skills() {
  return (
    <section id="skills" className="mt-14 max-w-[52em] scroll-mt-16">
      <h2 className="titre text-[22px] text-ink-900">The skills</h2>
      <p className="prose-corpus mt-3">
        Three skills drive the whole pipeline. Each is a Markdown file of instructions —
        readable start to finish in a few minutes, and worth reading before running, since
        what they mostly contain is a list of things not to do. They are written for{' '}
        <a
          href="https://claude.com/claude-code"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
        >
          Claude Code
        </a>
        . None pins a model; each says which it accepts — Fable 5.1 and Opus 5 — and refuses to
        run on any other. Every file records in its header the model that produced it. Provenance
        is a fact about the file, not about whichever model happened to be selected that day.
      </p>

      {/* Said here rather than left to the skills' own text: a contributor
          who does not read French will otherwise produce an English edition
          in good faith, and discover the problem only in review. */}
      <div className="card mt-5 border-l-4 border-l-encours-500 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-ink-900">
          Both editions are written in French — including yours
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">
          The leaves are in French, the notions were thought in French, and the modernised
          reading has no reason to change language. This holds whoever is running the pass: a
          contributor working in English still produces a French edition, and the skills
          enforce it. There are exactly two exceptions — the{' '}
          <code>\keywords{'{}'}</code> line, which is English because it is a set of search
          keys pointing into an English literature, and everything outside the editions
          themselves: this site, the code, the commit messages and this page.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">
          If that makes a volume impractical for you to take on, the first two routes above
          need no French at all — a misread symbol is a misread symbol in any language, and
          reporting one is worth more than a translation nobody asked for.
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {SKILLS.map((s) => (
          <li key={s.name} className="card px-5 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <code className="text-[14px] font-semibold text-ink-900">/{s.name}</code>
              <span className="tabular text-[11.5px] text-ink-400">{s.lines} lines</span>
              <span className="ml-auto flex items-center gap-3 text-[12.5px]">
                <a
                  href={`${REPO}/blob/main/.claude/skills/${s.name}/SKILL.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Read ↗
                </a>
                <a
                  href={`${RAW}/.claude/skills/${s.name}/SKILL.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Download ↓
                </a>
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{s.produces}</p>
            {s.extra && (
              <p className="mt-1.5 text-[12px] text-ink-500">
                Ships with{' '}
                <a
                  href={`${REPO}/blob/main/.claude/skills/${s.name}/${s.extra}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-ink-300 underline-offset-2 hover:text-brand-700"
                >
                  <code>{s.extra}</code>
                </a>{' '}
                — copy the whole directory, not just <code>SKILL.md</code>.
              </p>
            )}
          </li>
        ))}
      </ul>

      <h3 className="titre mt-8 text-[17px] text-ink-900">Installing them</h3>
      <p className="prose-corpus mt-2">
        A skill is a directory under <code>.claude/skills/</code>, and the directory name is
        what you type after the slash. There are two places to put it, and the choice is only
        about scope.
      </p>

      {/* `min-w-0` on the cards, not decoration: a grid item defaults to
          min-width:auto, so without it the long curl URLs below stretch the
          card and the whole page scrolls sideways instead of the code block. */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card min-w-0 px-5 py-4">
          <h4 className="text-[14px] font-semibold text-ink-900">
            With the repository <span className="font-normal text-ink-400">— nothing to install</span>
          </h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            The skills are versioned here, so a clone already has them. Start Claude Code in
            the repository root and they are available. This is the route to take if you are
            going to transcribe: you need the scripts anyway.
          </p>
          <Code>{`git clone ${REPO}.git
cd germain-project && npm install
claude   # then type /transcribe`}</Code>
        </div>

        <div className="card min-w-0 px-5 py-4">
          <h4 className="text-[14px] font-semibold text-ink-900">
            Everywhere <span className="font-normal text-ink-400">— your own machine</span>
          </h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            Copy them under your home directory and they work in any project. Useful for the
            transcription skill in particular, which is about reading an old hand and is not
            really specific to this corpus.
          </p>
          <Code>{`mkdir -p ~/.claude/skills/transcribe/references
curl -o ~/.claude/skills/transcribe/SKILL.md \\
  ${RAW}/.claude/skills/transcribe/SKILL.md
curl -o ~/.claude/skills/transcribe/references/specimen.tex \\
  ${RAW}/.claude/skills/transcribe/references/specimen.tex`}</Code>
        </div>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-500">
        The other two skills are single files, so{' '}
        <code className="rounded border border-ink-200 bg-ink-50 px-1 py-0.5 font-mono text-[11.5px]">
          mkdir -p ~/.claude/skills/&lt;name&gt; &amp;&amp; curl -o
          ~/.claude/skills/&lt;name&gt;/SKILL.md {'<'}raw link{'>'}
        </code>{' '}
        is the whole procedure. Keep the filename <code>SKILL.md</code> and the directory name
        as it is: the directory name is the command.
      </p>
    </section>
  );
}

/** The actual run, end to end, on a batch nobody has taken. */
function RunABatch() {
  return (
    <section className="mt-14 max-w-[52em]">
      <h2 className="titre text-[22px] text-ink-900">Running a batch</h2>
      <p className="prose-corpus mt-3">
        Pick a digitised volume with no blue rule on{' '}
        <a
          href="/archive/"
          className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
        >
          the archive page
        </a>{' '}
        — and check the green ones first: where a scholarly transcription already exists it is
        better than anything produced here, and it is somebody's; re-transcribing what is in print
        is fine, and you can read the print beside the leaf as a check.
      </p>

      <Code>{`npm run archive -- fr-9115 --batches 1   # mirror twenty views from Gallica, once
claude                                    # then, in order:
  /transcribe fr-9115 1           # one batch per conversation
  /transcribe fr-9115 2           # …until the volume is done (38 batches)
  /modernize fr-9115              # then the volume, taken whole
npm run render && npm run pdf && npm run manifest
npm run dev                               # read it beside the facsimile`}</Code>

      <p className="prose-corpus mt-4">
        One batch per conversation for the transcription, which is a real constraint and not a
        style preference: past twenty handwritten views the quality of reading degrades towards
        the end of the pass with nothing to signal it, and a transcription whose weakening point
        is unknown cannot be used.
      </p>

      <p className="prose-corpus mt-3">
        The modernised reading goes the other way and takes the volume whole. It reads the
        transcriptions, not the handwriting, so the twenty-view ceiling does not apply — and its
        job is to make an argument run continuously, which a proof does not stop at view 20 to
        let it do. It writes one file for the shelfmark, which the site offers against every
        batch of it.
      </p>

      <h3 className="titre mt-6 text-[17px] text-ink-900">What you need installed</h3>
      <ul className="prose-corpus mt-2">
        <li>
          <strong>Node 22</strong> and <strong>Claude Code</strong>. That is the whole
          requirement for reading and for correcting.
        </li>
        <li>
          Nothing else to mirror: <code>npm run archive</code> fetches JPEGs from Gallica's
          IIIF service with Node alone, and <code>npm run tiles</code> asks the same service for
          the regions of a view at full resolution — which is what settles a hard word, and what
          most of the transcription pass is actually doing.
        </li>
        <li>
          <strong>A Unicode TeX engine</strong>, only to compile the download PDFs:{' '}
          <code>tectonic</code> if you have it, otherwise XeLaTeX. Without one,{' '}
          <code>npm run pdf</code> exits cleanly and you lose a download button, not the site.
        </li>
      </ul>
    </section>
  );
}

/** The pull request, and what CI will say about it. */
function PullRequest() {
  return (
    <section className="mt-14 max-w-[52em]">
      <h2 className="titre text-[22px] text-ink-900">Opening a pull request</h2>
      <p className="prose-corpus mt-3">
        The repository is public and the licence is CC0 — the work is placed in the public
        domain, which is the only licence that makes sense for readings of papers that have
        been public for two centuries.
        A pull request is the same shape whether you are fixing one accent or adding a batch.
      </p>

      <Code>{`gh repo fork ${REPO.replace('https://github.com/', '')} --clone
cd germain-project && npm install
git checkout -b fr-9115-batch-1

# edit transcripts/fr-9115/batch-01.fr.tex — and nothing under public/
npm run lint && npm run render && npm run pdf

git commit -am "Transcribe Français 9115, batch 1"
gh pr create --fill`}</Code>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="card px-5 py-4">
          <h3 className="text-[14px] font-semibold text-ink-900">Change only the source</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            The <code>.tex</code> under <code>transcripts/</code> is the only versioned artifact
            of a reading. The HTML, the PDFs and <code>manifest.json</code> are all git-ignored
            and rebuilt on every deploy — a committed reading view would drift from its source
            the first time someone corrected a word in a hurry.
          </p>
        </div>
        <div className="card px-5 py-4">
          <h3 className="text-[14px] font-semibold text-ink-900">Both editions move together</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            A correction to a reading is usually also a correction to the modernised reading.
            Take the two files up in the same pull request, or they drift apart — and the
            modernised reading is the one nobody can check against a page.
          </p>
        </div>
      </div>

      <p className="prose-corpus mt-4">
        CI runs on the pull request: <code>oxlint</code> with warnings denied, then a full
        render of every transcript. The renderer accepts a restricted subset of LaTeX
        deliberately, and <strong>fails loudly</strong> on anything outside it — a formula
        silently flattened would assert an equation nobody wrote. If
        the build goes red on your batch, that is usually why. Nothing deploys from a pull
        request; only <code>main</code> does.
      </p>
    </section>
  );
}

/** The refusals, which are the method. */
function Rules() {
  const rules = [
    {
      no: 'Fill a gap with a plausible word.',
      why: 'An invented word that reads like the others is the worst possible outcome: nothing on the page distinguishes it from a sure reading. Illegible stays \\ill{}, doubtful stays \\uncertain{}.',
    },
    {
      no: 'Correct the author.',
      why: 'If a calculation is wrong on the page, it is wrong in the transcription, with a note. The modernised reading is the one place where the true statement is given instead — and it footnotes what the page has.',
    },
    {
      no: 'Tick a batch as Checked without having done it.',
      why: 'Checked means a person compared it with the facsimile page by page. It is a declaration in transcripts/status.json, reviewable in a diff, and it is the one claim on this site that no file can prove.',
    },
    {
      no: 'Copy anybody else\'s transcription.',
      why: 'Not a printed edition of the Pensées, not the Adam–Tannery Descartes, not a scholar\'s transcription of a letter, not a line — neither to seed a reading nor to check a word. They are theirs, or they are a different object. The source is the leaf.',
    },
    {
      no: 'Commit an image, a PDF, or any facsimile.',
      why: 'Not one view, anywhere in the tree. The mirror is rebuilt from Gallica on demand, and .gitignore refuses *.jpg and *.pdf outright.',
    },
  ];

  return (
    <section className="mt-14 max-w-[52em]">
      <h2 className="titre text-[22px] text-ink-900">What will be sent back</h2>
      <p className="prose-corpus mt-3">
        The refusals matter more than the method, and they are the same for a person as for a
        machine pass.
      </p>
      <ul className="mt-4 space-y-2.5">
        {rules.map((r) => (
          <li key={r.no} className="flex gap-3">
            <span aria-hidden="true" className="mt-[3px] shrink-0 text-[13px] text-alerte-600">
              ✕
            </span>
            <p className="text-[13.5px] leading-relaxed text-ink-700">
              <strong className="font-semibold text-ink-900">{r.no}</strong>{' '}
              <span className="text-ink-600">{r.why}</span>
            </p>
          </li>
        ))}
      </ul>

      <div className="card mt-8 px-5 py-4">
        <h3 className="titre text-[17px] text-ink-900">If you would rather just tell us</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">
          A GitHub issue in prose is a perfectly good contribution — "view 212 of Français
          9115, the exponent reads 2p and not 2n" is worth more than a silent doubt.
          Somebody else can make the edit.
        </p>
        <a
          href={`${REPO}/issues/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-brand-400 hover:text-brand-700"
        >
          Open an issue ↗
        </a>
      </div>
    </section>
  );
}

/** A shell block, in the site's own frame rather than a library's. */
function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink-800">
      {children}
    </pre>
  );
}
