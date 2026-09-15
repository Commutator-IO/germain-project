import { useEffect, useRef, useState } from 'react';
import { Footer, Header } from './components/Frame.tsx';
import { BOOKS } from './content/books.ts';
import { CREDITS, SPAN, TIMELINE, holdingsOf, type Life } from './content/timeline.ts';

/**
 * The timeline: nineteen lives in the order they were lived.
 *
 * Built on the pattern of the foundations tab of duty.commutator.io: a ruler
 * stuck under the header, a tick per person, the tick of the entry being read
 * lit as the column scrolls, and one card per person with a portrait plate.
 * One thing is added because it is what this corpus needs and that one did
 * not: a chart of the lifespans, so that Mersenne's correspondents can be seen
 * overlapping and the century between Varignon and Fourier seen almost empty.
 */

const cahierOf = (id: string) => {
  const century = holdingsOf(id).group?.century;
  return BOOKS.find((b) => b.key === century);
};

/**
 * The portrait plate.
 *
 * Hotlinked from Wikimedia Commons, never re-hosted, and only from files in the
 * public domain or under a licence that permits reuse. Where there is no such
 * file the plate shows initials rather than a likeness nobody made.
 */
function Plate({ life }: { life: Life }) {
  const initials = life.name
    .split(/[\s-]+/)
    .filter((w) => /^[A-ZÉ]/.test(w) && !['Le', 'De'].includes(w))
    .map((w) => w[0])
    .slice(-2)
    .join('');
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-ink-200 bg-ink-100">
      {life.portrait ? (
        <img
          src={life.portrait.src}
          alt={`Portrait of ${life.name}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 25%' }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="titre flex h-full w-full items-center justify-center text-[28px] text-ink-400"
        >
          {initials}
        </div>
      )}
    </div>
  );
}

/** Ticks every quarter century, from the one before the first birth to the one after the last death. */
function useScale() {
  const first = Math.floor(SPAN.from / 25) * 25;
  const last = Math.ceil(SPAN.to / 25) * 25;
  const ticks: number[] = [];
  for (let y = first; y <= last; y += 25) ticks.push(y);
  const at = (year: number) => ((year - first) / (last - first)) * 100;
  return { ticks, at };
}

/**
 * The ruler.
 *
 * Sticky under the site header. The span of the life being read is drawn as a
 * bar, its birth year printed above: scrolling the column walks the bar across
 * three centuries and a half.
 */
function Ruler({ active }: { active: Life }) {
  const { ticks, at } = useScale();
  return (
    <div className="sticky top-[45px] z-30 border-b border-ink-200 bg-white/95 py-3 backdrop-blur-md">
      <div className="relative h-12">
        <div className="absolute top-6 right-0 left-0 h-px bg-ink-300" />
        {ticks.map((y) => (
          <span
            key={y}
            className={`tabular absolute top-8 -translate-x-1/2 text-[10px] tracking-[0.04em] ${
              y % 100 === 0 ? 'font-semibold text-ink-600' : 'text-ink-400'
            }`}
            style={{ left: `${at(y)}%` }}
          >
            {y}
          </span>
        ))}
        <span
          aria-hidden="true"
          className="absolute top-[21px] h-[7px] rounded-full bg-brand-200 transition-all duration-300"
          style={{ left: `${at(active.born)}%`, width: `${at(active.died) - at(active.born)}%` }}
        />
        {TIMELINE.map((l) => {
          const lit = l.id === active.id;
          return (
            <span
              key={l.id}
              title={`${l.name}, ${l.born}`}
              className="absolute -translate-x-1/2 rounded-full transition-all duration-300"
              style={{
                left: `${at(l.born)}%`,
                top: lit ? 20 : 22,
                width: lit ? 9 : 5,
                height: lit ? 9 : 5,
                background: lit ? 'var(--color-brand-600)' : 'var(--color-ink-400)',
              }}
            />
          );
        })}
        <span
          aria-hidden="true"
          className="tabular absolute top-0 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap text-brand-700 transition-all duration-300"
          style={{ left: `${at(active.born)}%` }}
        >
          {active.born}
        </span>
      </div>
    </div>
  );
}

/**
 * The lifespans, all at once.
 *
 * One bar per life on the same scale as the ruler, the one being read in ink
 * blue, the others in paper grey. Clicking a bar scrolls to its card. The bars
 * are what the page is for: who could have written to whom.
 */
function Lifespans({ active, onPick }: { active: Life; onPick: (l: Life) => void }) {
  const { ticks, at } = useScale();
  return (
    <figure className="card mt-8 px-5 py-4">
      <figcaption className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
        Nineteen lives, {SPAN.from}–{SPAN.to}
      </figcaption>
      <div className="relative mt-3">
        {ticks.map((y) => (
          <span
            key={y}
            aria-hidden="true"
            className={`absolute top-0 bottom-5 w-px ${y % 100 === 0 ? 'bg-ink-200' : 'bg-ink-100'}`}
            style={{ left: `${at(y)}%` }}
          />
        ))}
        <ul className="relative space-y-[3px] pb-5">
          {TIMELINE.map((l) => {
            const lit = l.id === active.id;
            return (
              <li key={l.id} className="relative h-[17px]">
                <button
                  type="button"
                  onClick={() => onPick(l)}
                  title={`${l.name} (${l.bornApprox ? 'c. ' : ''}${l.born}–${l.died})`}
                  className={`absolute inset-y-0 flex items-center overflow-visible rounded-sm transition-colors ${
                    lit ? 'bg-brand-600' : 'bg-ink-200 hover:bg-brand-200'
                  }`}
                  style={{ left: `${at(l.born)}%`, width: `${at(l.died) - at(l.born)}%` }}
                >
                  <span
                    className={`pl-1.5 text-[10.5px] leading-none font-medium whitespace-nowrap ${
                      lit ? 'text-white' : 'text-ink-700'
                    }`}
                  >
                    {l.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {ticks
          .filter((y) => y % 50 === 0)
          .map((y) => (
            <span
              key={y}
              className="tabular absolute bottom-0 -translate-x-1/2 text-[10px] text-ink-400"
              style={{ left: `${at(y)}%` }}
            >
              {y}
            </span>
          ))}
      </div>
    </figure>
  );
}

export function TimelinePage() {
  const [active, setActive] = useState<Life>(TIMELINE[0]);
  const items = useRef<(HTMLElement | null)[]>([]);

  /**
   * The card nearest the top third of the viewport is the one being read.
   * `rootMargin` narrows the observed band to that stripe, so the ruler moves
   * when a new card arrives rather than when the last line of the previous one
   * leaves.
   */
  useEffect(() => {
    const nodes = items.current.filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.find((e) => e.isIntersecting);
        const id = seen?.target.getAttribute('data-life');
        const life = TIMELINE.find((l) => l.id === id);
        if (life) setActive(life);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const pick = (l: Life) => {
    document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Header path="/timeline/" />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <header className="max-w-[46em]">
          <h1 className="titre text-[34px] leading-tight text-ink-900">Timeline</h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-700">
            The nineteen mathematicians whose manuscripts Gallica serves, in the order of their
            births, from Maurolico in 1494 to Libri, who died in 1869. A paragraph each — enough to
            place a volume — and, under it, what of theirs can be opened here.
          </p>
        </header>

        <Lifespans active={active} onPick={pick} />
      </main>

      <div className="mx-auto max-w-6xl px-5">
        <Ruler active={active} />

        <div className="mt-2">
          {TIMELINE.map((l, i) => {
            const h = holdingsOf(l.id);
            const cahier = cahierOf(l.id);
            return (
              <article
                key={l.id}
                id={l.id}
                data-life={l.id}
                ref={(el) => {
                  items.current[i] = el;
                }}
                className="grid scroll-mt-28 grid-cols-[112px_1fr] gap-x-7 border-t border-ink-200 py-8 max-sm:grid-cols-1 max-sm:gap-y-4"
              >
                <div className="max-sm:flex max-sm:items-start max-sm:gap-4">
                  <div className="max-sm:w-[92px] max-sm:shrink-0">
                    <Plate life={l} />
                  </div>
                  <div className="mt-2">
                    <p className="titre tabular text-[24px] leading-none text-ink-900">
                      {l.bornApprox ? 'c. ' : ''}
                      {l.born}
                    </p>
                    <p className="tabular mt-1 text-[12px] text-ink-500">– {l.died}</p>
                  </div>
                </div>

                <div className="max-w-[62ch]">
                  <h2 className="titre text-[23px] leading-snug text-ink-900">{l.name}</h2>
                  <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-ink-400">
                    {l.role}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{l.bio}</p>
                  <p className="mt-4 border-l-2 border-brand-200 pl-4 text-[14px] leading-relaxed text-ink-600">
                    <span className="mr-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-700">
                      In Gallica
                    </span>
                    {h.volumes} {h.volumes === 1 ? 'volume' : 'volumes'},{' '}
                    {h.views.toLocaleString('en-GB')} views
                    {cahier && (
                      <>
                        {' '}
                        —{' '}
                        <a
                          href={`${cahier.path}`}
                          className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
                        >
                          {cahier.title}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-14 max-w-[68ch] border-t border-ink-200 pt-5 text-[12.5px] leading-relaxed text-ink-500">
          Biographies are ours, kept to a paragraph; dates are those usually given, and Fermat's
          year of birth is uncertain. Portraits are hotlinked from Wikimedia Commons and never
          stored here; Claude Mydorge has no freely licensed portrait there, and his plate shows
          initials. Credits:{' '}
          {CREDITS.map(({ life, portrait }, i) => (
            <span key={life.id}>
              {i > 0 && '; '}
              <a
                href={portrait.page}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink-800"
              >
                {life.name}
              </a>{' '}
              — {portrait.by}, {portrait.licence}
            </span>
          ))}
          .
        </p>
      </div>

      <Footer />
    </>
  );
}
