import { useCallback, useEffect, useRef, useState } from 'react';

import { Footer, Header } from './components/Frame.tsx';

/**
 * The exercise book: exercises drawn from the manuscripts, from the lycée to
 * the third year of a licence, each one linked to the leaves it comes from.
 *
 * The book is one LaTeX file, `exercises/exercices.fr.tex`, and this page
 * never reads it. `npm run render` turns it into a reading view with the
 * transcripts' own machinery — the same prose subset, KaTeX in the browser —
 * and this page frames that document, exactly as the reader frames a
 * transcript (see TranscriptPane): the frame is same-origin, grown to its
 * content's height, and never scrolls itself. Beside it, the renderer writes a
 * small index (`exercices.json`) — the chapters, one per mathematician, and the
 * count per level and per difficulty — that the filters are built from before
 * the frame has loaded.
 *
 * The filters act inside the frame, through `exercicesFilter(level, stars,
 * group)`, which the reading view defines: the cards carry `data-level`,
 * `data-stars` and `data-group` (the catalogue's id for the mathematician). They
 * are mirrored in the query string (`?niveau=L1&etoiles=2&auteur=germain`), so
 * a filtered view is a link.
 */

const BASE = '/exercises/';
const VIEW = `${BASE}exercices.html`;
const INDEX = `${BASE}exercices.json`;
const PDF = `${BASE}exercices.pdf`;
const TEX = `${BASE}exercices.fr.tex`;

const LEVELS = ['Lycée', 'L1', 'L2', 'L3'] as const;
type Level = (typeof LEVELS)[number];

/* The badge colours of the reading view, in the site's ramps. */
const LEVEL_STYLE: Record<Level, { on: string; off: string; help: string }> = {
  Lycée: {
    on: 'bg-relu-600 text-white',
    off: 'bg-relu-100 text-relu-700 hover:bg-relu-200',
    help: 'Terminale : suites, probabilités, arithmétique élémentaire.',
  },
  L1: {
    on: 'bg-brand-600 text-white',
    off: 'bg-brand-100 text-brand-700 hover:bg-brand-200',
    help: 'Première année de licence.',
  },
  L2: {
    on: 'bg-encours-600 text-white',
    off: 'bg-encours-100 text-encours-700 hover:bg-encours-200',
    help: 'Deuxième année de licence.',
  },
  L3: {
    on: 'bg-alerte-600 text-white',
    off: 'bg-alerte-100 text-alerte-700 hover:bg-alerte-200',
    help: 'Troisième année de licence.',
  },
};

const STARS = [1, 2, 3] as const;
type Stars = (typeof STARS)[number];

const STARS_HELP: Record<Stars, string> = {
  1: 'Une application directe.',
  2: 'Une idée à trouver, ou plusieurs étapes à enchaîner.',
  3: 'Un exercice long ou délicat.',
};

interface BookIndex {
  exercises: number;
  levels: Record<Level, number>;
  stars: Record<`${Stars}`, number>;
  chapters: { id: string; group: string; name: string; date: string; exercises: number }[];
}

type BookWindow = Window & {
  exercicesFilter?: (level: string | null, stars: number | null, group: string | null) => number;
  exercicesSolutions?: (open: boolean) => void;
};

/** The index, or `null` once it is known there is none (no book rendered yet). */
function useBookIndex(): BookIndex | null | undefined {
  const [index, setIndex] = useState<BookIndex | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    fetch(INDEX)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: BookIndex | null) => alive && setIndex(j && typeof j.exercises === 'number' ? j : null))
      // A dev server answers a missing file with the page's own HTML, which
      // does not parse: that is "no book", not an error.
      .catch(() => alive && setIndex(null));
    return () => {
      alive = false;
    };
  }, []);
  return index;
}

/** Whether the PDF was compiled. A missing one costs a button, not the page. */
function usePdf(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(PDF, { method: 'HEAD' })
      .then((r) => alive && setOk(r.ok && (r.headers.get('content-type') ?? '').includes('pdf')))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return ok;
}

interface Filter {
  level: Level | null;
  stars: Stars | null;
  group: string | null;
}

const NO_FILTER: Filter = { level: null, stars: null, group: null };

function readQuery(): Filter {
  const q = new URLSearchParams(location.search);
  const l = q.get('niveau');
  const e = Number(q.get('etoiles'));
  return {
    level: (LEVELS as readonly string[]).includes(l ?? '') ? (l as Level) : null,
    stars: (STARS as readonly number[]).includes(e) ? (e as Stars) : null,
    group: q.get('auteur'),
  };
}

function Chip({
  active,
  onClick,
  className,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`tabular rounded-full px-2.5 py-1 text-[12px] transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

const OpenButton = ({ href, title, children }: { href: string; title: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-ink-700 transition hover:border-brand-500 hover:text-brand-700"
  >
    {children}
  </a>
);

export function ExercisesPage() {
  const index = useBookIndex();
  const pdf = usePdf();

  const [{ level, stars, group }, setFilter] = useState(readQuery);
  const [shown, setShown] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);
  const [loaded, setLoaded] = useState(false);

  // The query string follows the filters, so a filtered view can be passed on.
  useEffect(() => {
    const q = new URLSearchParams();
    if (level) q.set('niveau', level);
    if (stars) q.set('etoiles', String(stars));
    if (group) q.set('auteur', group);
    const s = q.toString();
    history.replaceState(null, '', `${location.pathname}${s ? `?${s}` : ''}${location.hash}`);
  }, [level, stars, group]);

  /* Grown to its content, as the transcript pane is — but measured off the
     root element's box rather than its scrollHeight: the filters shrink the
     book, and scrollHeight never reports less than the frame's own height,
     so a frame measured that way could grow and never shrink back. */
  const measure = useCallback(() => {
    // No root element while the frame is between documents (a reload, HMR).
    const root = frame.current?.contentDocument?.documentElement;
    if (root) setHeight(Math.ceil(root.getBoundingClientRect().height));
  }, []);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let observer: ResizeObserver | undefined;
    let doc: Document | null = null;
    const attach = () => {
      doc = el.contentDocument;
      // A frame not yet navigated holds about:blank, already "complete": the
      // book's filters are not there yet, and its own load will call again.
      if (!doc || doc.URL === 'about:blank') return;
      measure();
      observer?.disconnect();
      observer = new ResizeObserver(measure);
      observer.observe(doc.documentElement);
      // A solution unfolded by hand, and the typesetting that lands after
      // load, are measured on the spot as well: a ResizeObserver is paced by
      // rendering frames, which a background tab does not get.
      doc.addEventListener('toggle', measure, true);
      setLoaded(true);
    };
    el.addEventListener('load', attach);
    if (el.contentDocument?.readyState === 'complete') attach();
    return () => {
      el.removeEventListener('load', attach);
      observer?.disconnect();
      doc?.removeEventListener('toggle', measure, true);
    };
  }, [index, measure]);

  const book = useCallback(() => frame.current?.contentWindow as BookWindow | null | undefined, []);

  useEffect(() => {
    if (!loaded) return;
    const n = book()?.exercicesFilter?.(level, stars, group);
    setShown(typeof n === 'number' ? n : null);
    measure();
  }, [loaded, level, stars, group, book, measure]);

  useEffect(() => {
    if (!loaded) return;
    book()?.exercicesSolutions?.(allOpen);
    measure();
  }, [loaded, allOpen, book, measure]);

  return (
    <>
      <Header path={BASE} />

      <main className="mx-auto max-w-4xl px-5 py-12" lang="fr">
        <header className="max-w-[44em]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
            Livre d'exercices
          </p>
          <h1 className="titre mt-2 text-[30px] leading-tight text-ink-900">
            Exercices tirés des manuscrits
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-600">
            Des problèmes que ces volumes posent ou résolvent, reformulés en exercices corrigés, du
            lycée à la troisième année de licence. Chaque énoncé renvoie aux vues de Gallica d'où il
            vient : le lien ouvre le lecteur du site sur le feuillet, à côté de sa lecture
            modernisée quand le volume en a une.
          </p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-600">
            Les solutions sont repliées ; on les déplie après avoir cherché. Énoncés et solutions
            sont une première rédaction par une machine, que personne n'a encore relue — une
            erreur signalée est la façon la plus utile d'aider.
          </p>
        </header>

        {index === null ? (
          <div className="card mt-8 px-6 py-8">
            <p className="text-[14px] font-semibold text-ink-800">Le livre n'est pas encore rendu.</p>
            <p className="mt-2 max-w-[40em] text-[13.5px] leading-relaxed text-ink-600">
              Sa source est <code className="font-mono text-[12.5px]">exercises/exercices.fr.tex</code>;{' '}
              <code className="font-mono text-[12.5px]">npm run render</code> en tire la page que
              cet onglet affiche, et <code className="font-mono text-[12.5px]">npm run pdf</code> le
              PDF.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {pdf && (
                <OpenButton href={PDF} title="Ouvrir le livre en PDF dans un nouvel onglet">
                  <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-ink-600">
                    pdf
                  </span>
                  Le livre à imprimer
                </OpenButton>
              )}
              {/* The source opens through its wrapper page, as a transcript's
                  does: a static host serves .tex as a download. */}
              <OpenButton
                href={`${TEX}.html`}
                title="Ouvrir la source LaTeX dans un nouvel onglet — le fichier y est lié pour le télécharger"
              >
                <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-ink-600">
                  tex
                </span>
                La source LaTeX
              </OpenButton>
              {index && (
                <p className="tabular ml-auto text-[12.5px] text-ink-500">
                  {shown ?? index.exercises} exercice{(shown ?? index.exercises) > 1 ? 's' : ''} sur{' '}
                  {index.exercises}
                </p>
              )}
            </div>

            {index && (
              <div className="mt-5 space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-[7.5rem] shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Niveau
                  </span>
                  <Chip
                    active={level === null}
                    onClick={() => setFilter((f) => ({ ...f, level: null }))}
                    className={level === null ? 'bg-ink-800 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}
                  >
                    Tous
                  </Chip>
                  {LEVELS.map((l) => (
                    <Chip
                      key={l}
                      active={level === l}
                      title={LEVEL_STYLE[l].help}
                      onClick={() => setFilter((f) => ({ ...f, level: f.level === l ? null : l }))}
                      className={level === l ? LEVEL_STYLE[l].on : LEVEL_STYLE[l].off}
                    >
                      {l} <span className="opacity-60">{index.levels[l] ?? 0}</span>
                    </Chip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-[7.5rem] shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Difficulté
                  </span>
                  <Chip
                    active={stars === null}
                    onClick={() => setFilter((f) => ({ ...f, stars: null }))}
                    className={stars === null ? 'bg-ink-800 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}
                  >
                    Toutes
                  </Chip>
                  {STARS.map((n) => (
                    <Chip
                      key={n}
                      active={stars === n}
                      title={STARS_HELP[n]}
                      onClick={() => setFilter((f) => ({ ...f, stars: f.stars === n ? null : n }))}
                      className={
                        stars === n ? 'bg-ink-700 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                      }
                    >
                      <span aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>{'★'.repeat(n)}</span>{' '}
                      <span className="opacity-60">{index.stars?.[`${n}`] ?? 0}</span>
                    </Chip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-[7.5rem] shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Mathématicien
                  </span>
                  <Chip
                    active={group === null}
                    onClick={() => setFilter((f) => ({ ...f, group: null }))}
                    className={group === null ? 'bg-ink-800 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}
                  >
                    Tous
                  </Chip>
                  {index.chapters.map((c) => (
                    <Chip
                      key={c.id}
                      active={group === c.group}
                      title={`${c.name} (${c.date.replace('-', '–')})`}
                      onClick={() =>
                        setFilter((f) => ({ ...f, group: f.group === c.group ? null : c.group }))
                      }
                      className={
                        group === c.group
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                      }
                    >
                      {c.name}{' '}
                      <span className={group === c.group ? 'text-brand-100' : 'text-ink-400'}>
                        {c.exercises}
                      </span>
                    </Chip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setAllOpen((o) => !o)}
                    className="ml-auto rounded-lg border border-ink-200 px-2.5 py-1 text-[12px] font-medium text-ink-600 transition hover:border-brand-500 hover:text-brand-700"
                  >
                    {allOpen ? 'Replier toutes les solutions' : 'Déplier toutes les solutions'}
                  </button>
                </div>
              </div>
            )}

            {shown === 0 && (
              <p className="mt-6 text-[14px] text-ink-500">
                Aucun exercice pour ces filtres.{' '}
                <button
                  type="button"
                  className="text-brand-700 underline underline-offset-2"
                  onClick={() => setFilter(NO_FILTER)}
                >
                  Tout afficher
                </button>
                .
              </p>
            )}

            {index && (
              <section className="card mt-5 overflow-hidden">
                <iframe
                  ref={frame}
                  src={VIEW}
                  title="Exercices tirés des manuscrits"
                  scrolling="no"
                  style={{ height }}
                  className="w-full border-0 bg-white"
                />
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
