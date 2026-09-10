import { useMemo, useState } from 'react';

import { useHashTarget } from './components/Anchors.tsx';
import { Footer, Header } from './components/Frame.tsx';
import { FINDINGS } from './content/findings.ts';
import { BY_ID } from './content/catalogue.ts';
import type { Finding } from './lib/types.ts';
import { notation } from './lib/notation.tsx';

/**
 * What the readings turned up that the inventory does not record.
 *
 * The page is a list of claims with a status attached, and the status is the
 * point. A page of findings without one would be a page of assertions, and
 * assertions about what other mathematicians did not do are the one thing this
 * project is in no position to make: the literature can be searched but never
 * exhausted, and almost nothing in the fonds is dated, so precedence is not
 * available to us about anyone.
 *
 * Hence two decisions that shape the layout. The status is a badge on every
 * row, never a footnote — a reader must not be able to take a candidate for a
 * result by skimming. And `matched` rows, the ones that turned out to be in
 * the books, stay on the page under their own heading rather than being
 * deleted: they are the evidence the list is pruned rather than grown, and
 * they save the next reader the search.
 *
 * Both survive the reworking below, which is about a third problem the first
 * two created. At forty-nine entries the page had become unreadable in a way
 * that had nothing to do with what it says: every row printed its four
 * apparatus fields at once, at one size, so the claim — the sentence a reader
 * came for — carried the same weight as the paragraph naming which section of
 * Johnstone to open. Three changes, in the order they matter:
 *
 *   - the rows are **grouped by shelfmark**, and a strip of chips indexes the
 *     volumes and filters to one. Sixteen volumes is too many to hold in the
 *     head while scrolling, and a reader who arrives from a commit message
 *     wants one of them;
 *   - `settle` — the one check that would decide a row — goes **behind a
 *     disclosure**. It is an instruction to whoever picks the row up, not a
 *     caveat, and the caveats all stay in the open: status, what the edition
 *     supplied, and what was searched are printed on every row as before,
 *     including when they are empty;
 *   - the prose is **capped at a measure**. The cards ran the width of the
 *     page, which at this size is ninety characters to the line; the site's
 *     own reading measure is 44em and the claim now respects it.
 */

const STATUS: Record<
  Finding['status'],
  { label: string; help: string; className: string }
> = {
  unsearched: {
    label: 'not looked up',
    help: 'Nobody has searched the literature for this yet. It is a question, not a finding.',
    className: 'bg-ink-100 text-ink-600',
  },
  candidate: {
    label: 'candidate',
    help: 'Searched in the sources listed and not found there. Still provisional: the literature can never be exhausted.',
    className: 'bg-brand-100 text-brand-700',
  },
  matched: {
    /* An outline rather than a wash. Filled grey on filled grey made this
       indistinguishable from `not looked up` at a glance, which are the two
       statuses it matters most to tell apart: one is a question nobody has
       touched, the other is a question already answered. */
    label: 'in the literature',
    help: 'Looked up and found. Kept on the page so nobody searches for it twice.',
    className: 'border border-ink-300 text-ink-500',
  },
  confirmed: {
    /* The site's proofreading green, the one it already uses for a batch
       compared against the facsimile page by page. It meant the same thing
       here and was being spelled with a Tailwind default that belongs to no
       ramp on this site. */
    label: 'checked by a person',
    help: 'A human reader has verified this. No machine pass may set this status.',
    className: 'bg-relu-100 text-relu-700',
  },
};

const KIND: Record<Finding['kind'], string> = {
  mathematical: 'about the literature',
  historical: 'about when, from a dated source',
  codicological: 'about the object',
};

/** Shelfmarks in the order the entries first mention them. */
function cotesOf(list: Finding[]) {
  const seen: string[] = [];
  for (const n of list) if (!seen.includes(n.cote)) seen.push(n.cote);
  return seen;
}

function Badge({ n }: { n: Finding }) {
  const s = STATUS[n.status];
  return (
    <span
      title={s.help}
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.className}`}
    >
      {s.label}
    </span>
  );
}

/**
 * One apparatus line.
 *
 * The label sits in a fixed column on wide screens and above the text on
 * narrow ones. `muted` is for the two cases that print a sentence saying
 * nothing was recorded — those must stay on the page, because an absent line
 * reads as an oversight where the point is that somebody looked and found
 * nothing to say.
 */
function Field({
  label,
  muted,
  children,
}: {
  label: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:flex sm:gap-4">
      <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-400 sm:w-[9rem] sm:pt-px sm:text-[12.5px] sm:font-normal sm:normal-case sm:tracking-normal">
        {label}
      </dt>
      <dd className={`max-w-[44em] ${muted ? 'text-ink-400' : 'text-ink-700'}`}>{children}</dd>
    </div>
  );
}

/**
 * The shelfmark and the volume's title are on the group heading above, not
 * here. Repeating them on every card cost two lines of forty-nine cards to
 * say what the reader had just read. `scroll-mt-16` is what keeps that
 * heading on screen when someone arrives on a card by its identifier — the
 * one case where the card would otherwise be alone at the top of the window
 * with nothing naming its volume.
 */
function Row({ n }: { n: Finding }) {
  return (
    <li id={n.id} className="card group scroll-mt-16 p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span className="tabular text-[12.5px] font-semibold text-ink-700">
          pages {n.pages}
        </span>
        <Badge n={n} />
        <span className="text-[10px] uppercase tracking-wide text-ink-400">{KIND[n.kind]}</span>
        {/* The identifier is what a commit message or an issue cites, so it
            has to be reachable from the page it names. Hidden until hover so
            that forty-nine of them do not sit in the margin shouting. */}
        <a
          href={`#${n.id}`}
          className="ml-auto select-none text-[11px] text-ink-300 opacity-0 transition-opacity hover:text-brand-600 focus:opacity-100 group-hover:opacity-100"
          aria-label={`Link to ${n.id}`}
        >
          #{n.id}
        </a>
      </div>

      <p className="mt-3 max-w-[42em] text-[15.5px] leading-relaxed text-ink-900">
        {notation(n.claim)}
      </p>

      <dl className="mt-3.5 space-y-2 border-t border-ink-100 pt-3.5 text-[13px] leading-relaxed">
        <Field label="What it rests on">{notation(n.basis)}</Field>

        {/* Printed even when null. A reader has to be able to tell "the page
            carries this alone" from "nobody said", and an absent row says the
            second while meaning the first. */}
        <Field label="Ours, not his" muted={!n.ours}>
          {n.ours ? notation(n.ours) : 'Nothing — the page carries the statement alone.'}
        </Field>

        <Field label="Searched" muted={n.literature.length === 0}>
          {n.literature.length ? (
            <ul className="space-y-0.5">
              {n.literature.map((l) => (
                <li key={l}>{notation(l)}</li>
              ))}
            </ul>
          ) : (
            'Nothing yet.'
          )}
        </Field>
      </dl>

      {/* Folded, and only this one. It is an instruction to whoever picks the
          row up rather than a qualification of the claim — every qualification
          is above, in the open. Unfolded it is routinely the longest text on
          the card, and forty-nine of them turned the page into a wall. */}
      <details className="mt-3 border-t border-ink-100 pt-3">
        <summary className="cursor-pointer list-none text-[12.5px] text-ink-500 transition-colors marker:content-none hover:text-brand-700">
          <span aria-hidden="true" className="mr-1.5 inline-block text-ink-400">
            ▸
          </span>
          What would settle it
        </summary>
        <p className="mt-2 max-w-[44em] text-[13px] leading-relaxed text-ink-700">
          {notation(n.settle)}
        </p>
      </details>
    </li>
  );
}

/** The rows of one shelfmark, under a heading that names the volume once. */
function CoteGroup({ cote, rows }: { cote: string; rows: Finding[] }) {
  const c = BY_ID.get(cote);
  return (
    <section className="mt-6 first:mt-3">
      <h3 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="tabular text-[13.5px] font-semibold text-ink-800">Cote n° {cote}</span>
        {c && <span className="text-[12.5px] text-ink-500">{c.title}</span>}
        {c && <span className="tabular text-[12px] text-ink-400">{c.date}</span>}
        <span className="tabular text-[12px] text-ink-400">
          · {rows.length} {rows.length === 1 ? 'finding' : 'findings'}
        </span>
      </h3>
      <ul className="mt-2.5 space-y-3">
        {rows.map((n) => (
          <Row key={n.id} n={n} />
        ))}
      </ul>
    </section>
  );
}

function Section({
  title,
  note,
  rows,
}: {
  title: string;
  note?: string;
  rows: Finding[];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">
        {title} — {rows.length}
      </h2>
      {note && (
        <p className="mt-2 max-w-[44em] text-[13.5px] leading-relaxed text-ink-500">{note}</p>
      )}
      {cotesOf(rows).map((cote) => (
        <CoteGroup key={cote} cote={cote} rows={rows.filter((n) => n.cote === cote)} />
      ))}
    </section>
  );
}

export function FindingsPage() {
  useHashTarget();

  const [query, setQuery] = useState('');
  const [only, setOnly] = useState<string | null>(null);

  const cotes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of FINDINGS) counts.set(n.cote, (counts.get(n.cote) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = FINDINGS.filter((n) => {
    if (only && n.cote !== only) return false;
    if (!needle) return true;
    // The whole row, not just the claim: a reader who remembers « Abhyankar »
    // or « Johnstone » has a handle on the basis or on the sources searched,
    // and neither is in the sentence at the top of the card.
    return `${n.cote} ${n.id} ${n.claim} ${n.basis} ${n.ours ?? ''} ${n.literature.join(' ')} ${n.settle}`
      .toLowerCase()
      .includes(needle);
  });

  const open = visible.filter((n) => n.status !== 'matched');
  const closed = visible.filter((n) => n.status === 'matched');

  return (
    <>
      <Header path="/findings/" />

      <main className="mx-auto max-w-4xl px-5 py-12">
        <header className="max-w-[44em]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
            Findings from the readings
          </p>
          <h1 className="titre mt-2 text-[30px] leading-tight text-ink-900">
            What these volumes hold that the inventory does not say
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-600">
            Reading a volume end to end turns things up: a leaf bound backwards, two
            manuscripts interleaved, a theorem proved under a hypothesis weaker than the
            one in the books. This page lists them, and lists what each one still needs
            before anyone should believe it.
          </p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-600">
            Nothing here claims priority. A claim that something is <em>new</em> is a
            claim about the literature, and the literature can be searched but never
            exhausted; a claim that something came <em>first</em> needs a date, and these
            volumes are undated — the inventory's «&nbsp;vers 1963-1973&nbsp;» is an
            archivist's guess from a verso. So each row says what was searched, what the
            edition supplied rather than the page, and what would settle it.
          </p>
        </header>

        {/* The three badges are not guessable from their wording alone, and a
            tooltip is not read. Named once, here — the same decision the
            archive page makes about its two row washes, for the same reason. */}
        <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-500">
          {(['unsearched', 'candidate', 'matched'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS[k].className}`}
              >
                {STATUS[k].label}
              </span>
              <span className="max-w-[26em]">{STATUS[k].help}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a claim, a shelfmark, a source…"
            className="w-full max-w-md rounded-lg border border-ink-200 bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
          />
          <p className="tabular text-[12.5px] text-ink-500">
            {visible.length} of {FINDINGS.length} findings
            {closed.length > 0 && (
              <span className="text-ink-400"> · {closed.length} already looked up</span>
            )}
          </p>
        </div>

        {/* Both an index and a filter. Sixteen volumes is more than a
            reader can hold while scrolling forty-nine cards, and the counts
            say at a glance which volumes the readings actually turned
            something up in. */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOnly(null)}
            className={`rounded-full px-2.5 py-1 text-[12px] transition-colors ${
              only === null
                ? 'bg-ink-800 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            All volumes
          </button>
          {cotes.map(([id, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setOnly(only === id ? null : id)}
              title={BY_ID.get(id)?.title}
              className={`tabular rounded-full px-2.5 py-1 text-[12px] transition-colors ${
                only === id
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {id} <span className={only === id ? 'text-brand-100' : 'text-ink-400'}>{count}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-10 text-[14px] text-ink-500">
            Nothing matches. <button
              type="button"
              className="text-brand-700 underline underline-offset-2"
              onClick={() => {
                setQuery('');
                setOnly(null);
              }}
            >
              Clear the filters
            </button>
            .
          </p>
        )}

        <Section title="Open" rows={open} />

        <Section
          title="Looked up and found"
          note="Candidates that turned out to be in the literature. They stay here on purpose: a killed candidate saves the next reader the search, and a list that only ever grows is not being checked."
          rows={closed}
        />

        <section className="mt-12 max-w-[44em] text-[13.5px] leading-relaxed text-ink-500">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">
            How this list is made
          </h2>
          <p className="mt-2">
            By <code className="rounded bg-ink-100 px-1 py-0.5 text-[12px]">/find-novelty</code>,
            a skill that reads a volume's transcriptions and its modernised reading and
            proposes candidates — never the facsimile, which is the transcription's job.
            It is written around refusing to overclaim: it may not assert priority, it
            must name the sources it searched, and it must separate what the page carries
            from what the edition supplied. It may not mark anything{' '}
            <em>checked by a person</em>; only a person may.
          </p>
          <p className="mt-2">
            None of these has been reviewed by a mathematician. If one of them is wrong —
            and the mathematical ones are the likeliest things on this site to be wrong —
            the fastest way to say so is an issue against the volume.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
