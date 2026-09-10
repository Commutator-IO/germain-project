import { useEffect, useState, type ReactNode } from 'react';

/**
 * Anchors, down to the paragraph.
 *
 * The method page is the one page here that gets argued with. Its claims are
 * deliberately narrow — what is observed, what is merely declared, what the
 * site refuses to say — and an argument about a narrow claim is unusable if
 * the only address one can give is the page. "Somewhere under Method" is how
 * a disagreement dies; a link that opens on the sentence is how it gets
 * settled, which is the same reason the transcriptions mark every source page.
 *
 * So every paragraph carries an identifier, and hovering it reveals a mark in
 * the margin that both links to it and copies the full URL. The mark sits out
 * of the text flow and is unselectable, so a paragraph copied from the page is
 * the paragraph and nothing else.
 *
 * The identifiers are written by hand rather than generated from position or
 * from the text. Both of those would be easier and both would break silently:
 * inserting a paragraph would renumber everything after it, and editing a
 * sentence would move its anchor. A link that quietly comes to point at a
 * different paragraph is worse than one that 404s. Hand-written slugs survive
 * both, and only ever break by being deleted — which is visible in the diff.
 */

type Props = {
  /** Stable, hand-written. Never derived from position or wording. */
  id: string;
  className?: string;
  children: ReactNode;
};

/**
 * Land on the passage when the page is opened *at* a link.
 *
 * The browser looks for the fragment as soon as the document loads, and at
 * that moment the page is an empty div: the markup is React's, written on
 * mount, a tick later. So the reader arrives at the top and the link appears
 * to do nothing — precisely in the case the anchors exist for, someone opening
 * a link somebody sent them. Following a link from within the page works
 * natively, because by then the target is there.
 *
 * Jumping rather than gliding: the smooth scrolling that suits a click within
 * the page would here race three thousand pixels past a reader who has not yet
 * seen the page at all.
 */
export function useHashTarget() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, []);
}

export function P({ id, className, children }: Props) {
  return (
    <p id={id} className={`anchored ${className ?? ''}`}>
      {children}
      <Mark id={id} kind="paragraph" />
    </p>
  );
}

/**
 * A list item, where the list is doing the work of paragraphs — as in the four
 * things this site does not claim. The mark clears the bullet rather than
 * sitting on it.
 */
export function LI({ id, className, children }: Props) {
  return (
    <li id={id} className={`anchored ${className ?? ''}`}>
      {children}
      <Mark id={id} kind="paragraph" gutter="-left-9" />
    </li>
  );
}

export function H2({ id, className, children }: Props) {
  return (
    <h2 id={id} className={`anchored titre text-[22px] text-ink-900 ${className ?? ''}`}>
      {children}
      <Mark id={id} kind="section" />
    </h2>
  );
}

/** Styled by `.prose-fonds h3`, so it takes no classes of its own. */
export function H3({ id, className, children }: Props) {
  return (
    <h3 id={id} className={`anchored ${className ?? ''}`}>
      {children}
      <Mark id={id} kind="section" />
    </h3>
  );
}

/**
 * The mark itself.
 *
 * A plain link first: it works with scripting off, it can be middle-clicked,
 * and it puts the address in the bar where a reader expects to find it. The
 * clipboard write is on top of that, not instead of it — the browser gives no
 * clipboard at all on an insecure origin, and the link still does its job
 * there.
 *
 * It lives in the margin, inside the container's own padding, so it never
 * widens the page and never reflows the text it belongs to. The glyph is small
 * but the box around it is not: a 20px square is a tap target, and on a phone
 * — where the margin is the 20px of page padding and nothing more — the box
 * fills it exactly rather than spilling off the left edge.
 */
function Mark({
  id,
  kind,
  gutter = '-left-5',
}: {
  id: string;
  kind: 'paragraph' | 'section';
  gutter?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <a
      href={`#${id}`}
      aria-label={`Link to this ${kind}`}
      title="Copy a link to this passage"
      onClick={() => {
        navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${id}`).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          },
          () => {
            // No clipboard permission: the address bar now holds the link.
          },
        );
      }}
      className={`anchor-mark absolute top-[0.1em] ${gutter} flex h-5 w-5 select-none items-center justify-center text-[13px] leading-none text-ink-300 transition hover:text-brand-600 ${
        copied ? 'text-relu-600 opacity-100' : ''
      }`}
    >
      {copied ? '✓' : kind === 'section' ? '§' : '¶'}
    </a>
  );
}
