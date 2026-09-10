import { useEffect, useState } from 'react';
import { BOOKS } from '../content/books.ts';

/**
 * Header and footer, shared by every page.
 *
 * Hosting is static, so each tab is a real document rather than a client-side
 * route. A URL opened on one batch still works months later, which matters when
 * transcription stretches over months.
 */

const OTHER_PAGES: { path: string; label: string }[] = [
  { path: '/archive/', label: 'All the manuscripts' },
  { path: '/sources/', label: 'Sources & rights' },
  { path: '/method/', label: 'Method & progress' },
  { path: '/findings/', label: 'Findings' },
  { path: '/contribute/', label: 'Contribute' },
];

function isCurrent(path: string, here: string): boolean {
  const h = here.endsWith('/') ? here : `${here}/`;
  return path === h;
}

export function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const links = [...BOOKS.map((b) => ({ path: b.path, label: b.title })), ...OTHER_PAGES];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/93 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-2.5">
        <a href="/" className="flex min-w-0 items-center gap-2.5">
          <Mark />
          <span className="min-w-0 truncate text-[13px] font-semibold tracking-tight text-ink-900">
            Sophie Germain Archives
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-0.5 text-[13px] text-ink-500 lg:flex">
          {BOOKS.map((b) => (
            <a
              key={b.path}
              href={b.path}
              aria-current={isCurrent(b.path, path) ? 'page' : undefined}
              className={`rounded-lg px-2.5 py-1.5 transition ${
                isCurrent(b.path, path)
                  ? 'font-semibold text-ink-900'
                  : 'hover:bg-ink-50 hover:text-brand-700'
              }`}
            >
              {b.navTitle ?? b.title}
            </a>
          ))}
          <span aria-hidden="true" className="mx-1.5 h-4 w-px bg-ink-200" />
          {OTHER_PAGES.map((p) => (
            <a
              key={p.path}
              href={p.path}
              aria-current={isCurrent(p.path, path) ? 'page' : undefined}
              className={`rounded-lg px-2.5 py-1.5 transition ${
                isCurrent(p.path, path)
                  ? 'font-semibold text-ink-900'
                  : 'hover:bg-ink-50 hover:text-brand-700'
              }`}
            >
              {p.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="ml-auto rounded-lg border border-ink-200 px-2.5 py-1 text-[12px] font-medium text-ink-600 lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink-200 bg-white px-5 py-2 lg:hidden">
          {links.map((p) => (
            <a
              key={p.path}
              href={p.path}
              className="block rounded-lg px-2 py-2 text-[14px] text-ink-700 hover:bg-ink-50"
            >
              {p.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/**
 * The mark: a square plate and its nodal lines.
 *
 * Chladni's figures — sand gathering on the lines a vibrating plate leaves
 * still — are the problem the Académie set in 1809 and the one she answered
 * three times. A square plate with the simplest of them, the two diagonals
 * with a ring, is the whole corpus in one glyph: physics on the face of it,
 * and the number theory underneath, which nobody saw for two centuries.
 */
function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="1.5" className="fill-brand-100 stroke-current" strokeWidth="1.3" />
      <path d="M5 5l14 14M19 5L5 19" className="stroke-current" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <circle cx="12" cy="12" r="4.2" className="stroke-current" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 text-[12.5px] leading-relaxed text-ink-500">
        <p className="max-w-[52em]">
          The facsimiles shown on this site are the{' '}
          <strong className="font-semibold text-ink-700">Bibliothèque nationale de France's</strong>{' '}
          digitisations of Sophie Germain's papers, read from Gallica's IIIF service as you turn
          the pages — <span className="text-ink-700">Source gallica.bnf.fr / Bibliothèque nationale de France</span>.
          The three prize memoirs at the Archives de l'Académie des sciences, the Florence
          papers and her letters to Gauss at Göttingen are not online and are not shown; the
          site says where they are and who has edited them.
        </p>
        <p className="mt-3 max-w-[52em]">
          This site neither hosts nor redistributes any image of a manuscript. It gives the
          catalogue, and reads the holders' own files at the moment you open them. What is ours —
          the transcriptions, the readings, the code — is released under CC0.
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href="https://gallica.bnf.fr/accueil/fr/html/sophie-germain-une-mathematicienne-a-la-bnf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
          >
            Sophie Germain at the BnF ↗
          </a>
          <span aria-hidden="true" className="text-ink-300">
            ·
          </span>
          <a
            href="/sources/"
            className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
          >
            Sources &amp; rights
          </a>
          <span aria-hidden="true" className="text-ink-300">
            ·
          </span>
          <span>
            A{' '}
            <a
              href="https://www.commutator.io"
              className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
            >
              Commutator
            </a>{' '}
            project, sibling of{' '}
            <a
              href="https://grothendieck.commutator.io"
              className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
            >
              grothendieck.commutator.io
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
