import { useState, type CSSProperties } from 'react';
import { BY_ID, COTES, GROUPS, HOLDER_BY_ID } from '../content/catalogue.ts';
import { BOOKS, IN_PROGRESS, editionOf, piecesIn } from '../content/books.ts';
import { batchCount } from '../lib/batches.ts';
import type { ArchiveGroup, Volume } from '../lib/types.ts';

/** What the mosaic colours: the one thing to know about a volume before starting on it. */
type VolumeState = 'here' | 'inProgress' | 'community' | 'untouched' | 'offline';

/**
 * Offline first, then our own status, then everybody else's.
 *
 * The figure answers "which volume do I start on", and a volume with no
 * images online cannot be started on here at all, whatever a cahier or an
 * editor has done with it — so `offline` outranks the rest. Among the online
 * ones the order is the sibling site's: a volume being read now matters more
 * to the reader of this page than the fact that a printing of it exists.
 */
const volumeState = (v: Volume, transcribedHere: boolean, hasEdition: boolean): VolumeState =>
  v.pages === 0
    ? 'offline'
    : transcribedHere
      ? 'here'
      : IN_PROGRESS.has(v.id)
        ? 'inProgress'
        : hasEdition
          ? 'community'
          : 'untouched';

/**
 * The corpus by size, as a wall of blocks.
 *
 * The list below answers "what is there"; it cannot answer "how much", because
 * seventy-eight rows of equal height flatten a range that runs from a single
 * letter to seven hundred and fifty views. A treemap restores the proportion,
 * and the proportion is what decides where to begin: Fourier's twenty volumes
 * are a quarter of everything, a letter of Pascal's is a morning.
 *
 * Mondrian rather than a plain treemap because the grammar fits what is
 * being said. Flat blocks of one colour each, separated by heavy black rules,
 * no gradients and no shading: a volume is online or it is not, transcribed or
 * not, and there is nothing continuous to express. Blocks within blocks carry
 * the one structure there is — the mathematician whose archive it is — rather
 * than a second quantity.
 *
 * Every volume in the catalogue is digitised, so each is sized by its Gallica
 * views, the unit the batches are cut in. The code still knows how to hatch a
 * volume drawn from a leaf count and to rail one with no count at all, should
 * a volume ever be listed before Gallica serves it; the catalogue's rule is
 * that none is.
 */

interface Cell {
  cote: Volume;
  state: VolumeState;
  /** Views, measured or estimated. */
  size: number;
  estimated: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

const FILL: Record<VolumeState, string> = {
  here: 'var(--color-brand-500)',
  inProgress: 'var(--color-encours-500)',
  community: 'var(--color-relu-500)',
  untouched: 'var(--color-ink-100)',
  offline: 'var(--color-ink-300)',
};

/** Ink that survives on each fill — the untouched blocks are nearly white. */
const INK: Record<VolumeState, string> = {
  here: '#ffffff',
  inProgress: '#3a2a02',
  community: '#ffffff',
  untouched: 'var(--color-ink-600)',
  offline: 'var(--color-ink-800)',
};

const LABEL: Record<VolumeState, string> = {
  here: 'transcribed here',
  inProgress: 'in a cahier being read now',
  community: 'edited or in print elsewhere',
  untouched: 'online, untouched',
  offline: 'not online',
};

/** The hatch over an estimated area. Same grey, so the block reads as one colour from a distance. */
const HATCH =
  'repeating-linear-gradient(135deg, var(--color-ink-300) 0 4px, var(--color-ink-200) 4px 7px)';

/** Views per leaf, from the two digitised « Papiers » volumes: 750/372 and 113/54. */
const VIEWS_PER_LEAF = 2;

/** Canvas height, in the same units as the width of 100. */
const CANVAS_H = 58;

/** The group's name before any dash — « Joseph Fourier ». */
const shortTitle = (g: ArchiveGroup) => g.title.split(' — ')[0];

/**
 * Squarified treemap (Bruls, Huizing, van Wijk).
 *
 * Chosen over a slice-and-dice layout because the blocks have to be readable,
 * not merely correct: slice-and-dice gives the 44-view volume a ribbon nobody
 * can point at, and a block nobody can point at conveys nothing.
 */
function squarify(values: number[], width: number, height: number) {
  const total = values.reduce((s, v) => s + v, 0);
  const scaled = values.map((v) => (v / total) * width * height);
  const out: { x: number; y: number; w: number; h: number }[] = Array.from({
    length: values.length,
  });

  let i = 0;
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;

  while (i < scaled.length) {
    const short = Math.min(w, h);
    const row: number[] = [];
    let rowSum = 0;

    // Grow the row while the worst aspect ratio in it keeps improving.
    const worst = (sum: number, extra: number) => {
      const side = sum / short;
      const all = [...row, extra];
      return Math.max(...all.map((v) => Math.max(v / side / side, (side * side) / v)));
    };

    let j = i;
    while (j < scaled.length) {
      const v = scaled[j];
      if (row.length > 0 && worst(rowSum + v, v) > worst(rowSum, row[row.length - 1])) break;
      row.push(v);
      rowSum += v;
      j += 1;
    }

    const side = rowSum / short;
    let offset = 0;
    for (let k = 0; k < row.length; k += 1) {
      const len = row[k] / side;
      out[i + k] =
        w >= h
          ? { x, y: y + offset, w: side, h: len }
          : { x: x + offset, y, w: len, h: side };
      offset += len;
    }

    if (w >= h) {
      x += side;
      w -= side;
    } else {
      y += side;
      h -= side;
    }
    i = j;
  }

  return out;
}

/** Measured views, or the estimate from the leaf count, or nothing. */
function sizeOf(v: Volume): { size: number; estimated: boolean } | null {
  if (v.pages > 0) return { size: v.pages, estimated: false };
  if (v.folios) return { size: v.folios * VIEWS_PER_LEAF, estimated: true };
  return null;
}

/** The cahiers a volume is cited in, by their short names. */
function cahiersOf(id: string): string[] {
  return BOOKS.filter((b) => b.sections.some((s) => s.cotes.includes(id))).map(
    (b) => b.navTitle ?? b.title,
  );
}

export function CorpusMosaic({
  transcribedHere,
  hasEdition,
  onOpen,
}: {
  transcribedHere: (id: string) => boolean;
  hasEdition: (id: string) => boolean;
  onOpen: (id: string) => void;
}) {
  const [hover, setHover] = useState<Cell | null>(null);

  const state = (v: Volume) => volumeState(v, transcribedHere(v.id), hasEdition(v.id));

  /**
   * The wall: every volume with a size, nested in its group.
   *
   * The outer boxes are the groups, sized by their total; each volume sits
   * inside the group it belongs to. A group with no sized volume at all would
   * not be on the wall, and its volumes would be in the rail below.
   */
  const groups = (() => {
    const sized = GROUPS.map((g) => {
      const cotes = g.cotes
        .map((id) => BY_ID.get(id))
        .filter((c): c is Volume => Boolean(c) && sizeOf(c!) !== null);
      return { g, cotes, total: cotes.reduce((s, c) => s + sizeOf(c)!.size, 0) };
    })
      .filter((x) => x.total > 0)
      .sort((a, b) => b.total - a.total);

    const outer = squarify(
      sized.map((x) => x.total),
      100,
      CANVAS_H,
    );

    return sized.map((x, i) => {
      const box = outer[i];
      // A strip at the top of the box carries the group's name, and the volumes
      // are inset below it. Both are in canvas units, so a small group loses
      // proportionally less of itself than a fixed pixel inset would take.
      const pad = 0.35;
      const strip = Math.min(1.9, box.h * 0.22);
      const inner = {
        x: box.x + pad,
        y: box.y + strip,
        w: Math.max(box.w - pad * 2, 0.01),
        h: Math.max(box.h - strip - pad, 0.01),
      };
      const ordered = [...x.cotes].sort((a, b) => sizeOf(b)!.size - sizeOf(a)!.size);
      const boxes = squarify(
        ordered.map((c) => sizeOf(c)!.size),
        inner.w,
        inner.h,
      );
      const cells: Cell[] = ordered.map((c, k) => ({
        cote: c,
        state: state(c),
        ...sizeOf(c)!,
        x: inner.x + boxes[k].x,
        y: inner.y + boxes[k].y,
        w: boxes[k].w,
        h: boxes[k].h,
      }));
      return { ...x, box, strip, cells };
    });
  })();

  /** The rail: volumes with no count to draw, in the groups' own order. */
  const rail = GROUPS.map((g) => ({
        g,
        cells: g.cotes
          .map((id) => BY_ID.get(id))
          .filter((c): c is Volume => Boolean(c) && sizeOf(c!) === null)
          .map(
            (c): Cell => ({ cote: c, state: state(c), size: 0, estimated: false, x: 0, y: 0, w: 0, h: 0 }),
          ),
      })).filter((x) => x.cells.length > 0);

  const cells = [...groups.flatMap((g) => g.cells), ...rail.flatMap((r) => r.cells)];
  const online = COTES.filter((c) => c.pages > 0);
  const views = online.reduce((s, c) => s + c.pages, 0);
  const railCount = rail.reduce((s, r) => s + r.cells.length, 0);

  const measure = (c: Cell) => {
    const v = c.cote;
    if (v.pages > 0) {
      const b = batchCount(v.pages);
      return `${v.pages} views · ${b} ${b === 1 ? 'batch' : 'batches'}`;
    }
    if (c.estimated) return `${v.folios} leaves · about ${c.size} views if digitised · not online`;
    return `${v.extent || 'extent not counted'} · not online`;
  };

  const block = (c: Cell, big: boolean, wide: boolean) => (
    <span
      className="relative block h-full w-full"
      style={{ background: c.estimated ? HATCH : FILL[c.state] }}
    >
      {big && (
        <span
          className="absolute bottom-[3px] left-1.5 right-1 leading-tight"
          style={{ color: INK[c.state] }}
        >
          <span className="tabular block truncate text-[10px] font-semibold">
            {c.cote.shelfmark}
          </span>
          {wide && (
            <span className="tabular block truncate text-[9px] opacity-80">
              {c.cote.pages > 0
                ? `${c.cote.pages} v. · ${batchCount(c.cote.pages)} b.`
                : c.estimated
                  ? `${c.cote.folios} ff. · not online`
                  : 'not online'}
            </span>
          )}
        </span>
      )}
    </span>
  );

  const cellButton = (c: Cell, style: CSSProperties, big: boolean, wide: boolean) => (
    <button
      key={c.cote.id}
      type="button"
      onClick={() => onOpen(c.cote.id)}
      onMouseEnter={() => setHover(c)}
      onFocus={() => setHover(c)}
      title={`${c.cote.shelfmark} — ${c.cote.title}`}
      className="overflow-hidden text-left transition-[filter] hover:brightness-110 focus:z-10 focus:outline-2 focus:outline-offset-[-3px] focus:outline-white"
      style={style}
    >
      {block(c, big, wide)}
    </button>
  );

  return (
    <section className="mt-8">
      <h2 className="titre text-[19px] text-ink-900">The corpus by size</h2>
      <p className="mt-2 max-w-[52em] text-[13px] leading-relaxed text-ink-600">
        All {COTES.length} volumes, each block sized by what there is to read and nested under the
        mathematician whose archive it is. The {online.length} volumes are drawn by their{' '}
        {views.toLocaleString()} Gallica views, the unit the batches are cut in
        {railCount > 0 ? `; ${railCount} without a count sit in the rail below` : ''}. Colour is
        what has been done to a volume, not what is in it.
      </p>

      {/* Only the states actually on this wall. A key for a colour that never
          appears sends the eye hunting for it. */}
      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-ink-500">
        {(['here', 'inProgress', 'community', 'untouched', 'offline'] as VolumeState[])
          .filter((s) => cells.some((c) => c.state === s))
          .map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-3.5 w-6 border border-ink-900"
                style={{ background: FILL[s] }}
              />
              {LABEL[s]}
            </li>
          ))}
        {cells.some((c) => c.estimated) && (
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-3.5 w-6 border border-ink-900"
              style={{ background: HATCH }}
            />
            size estimated from the leaf count
          </li>
        )}
      </ul>

      {/* The black ground is the rules: every block is inset, so what shows
          between them is this, not a border drawn four times over. The group
          boxes are the same idea one level up — they are the gaps their
          volumes do not fill. */}
      <div
        className="mt-3 w-full overflow-hidden rounded-[var(--radius-card)] bg-ink-900"
        onMouseLeave={() => setHover(null)}
      >
        <div className="relative w-full" style={{ aspectRatio: `100 / ${CANVAS_H}` }}>
          {groups.map(({ g, box, strip, total }) => (
            <div
              key={g.id}
              className="pointer-events-none absolute overflow-hidden"
              style={{
                left: `${box.x}%`,
                top: `${(box.y / CANVAS_H) * 100}%`,
                width: `${box.w}%`,
                height: `${(box.h / CANVAS_H) * 100}%`,
                padding: '2px',
              }}
            >
              <span className="block h-full w-full rounded-[2px] border border-ink-700 bg-ink-800/60">
                {/* The group's name, where the strip is tall enough to hold it.
                    A label clipped to three characters names nothing. */}
                {box.w > 5 && strip > 1.3 && (
                  <span
                    className="tabular block truncate px-1 pt-[2px] text-[9px] font-semibold uppercase tracking-wide text-ink-300"
                    title={g.title}
                  >
                    {shortTitle(g)}
                    <span className="ml-1 font-normal normal-case tracking-normal text-ink-400">
                      {total.toLocaleString()}v
                    </span>
                  </span>
                )}
              </span>
            </div>
          ))}

          {groups
            .flatMap((g) => g.cells)
            .map((c) =>
              cellButton(
                c,
                {
                  position: 'absolute',
                  left: `${c.x}%`,
                  top: `${(c.y / CANVAS_H) * 100}%`,
                  width: `${c.w}%`,
                  height: `${(c.h / CANVAS_H) * 100}%`,
                  padding: '1px',
                },
                c.w > 7 && c.h > 5,
                c.w > 11 && c.h > 8,
              ),
            )}
        </div>

        {/* The rail. Equal blocks, because equal is the only honest size for
            a volume whose extent is « more than two hundred sheets ». It is
            inside the same black ground so the eye reads one figure, and its
            groups are boxed the same way. */}
        {rail.length > 0 && (
          <div className="flex h-14 w-full gap-0 border-t-2 border-ink-900">
            {rail.map(({ g, cells: rc }) => (
              <div
                key={g.id}
                className="relative p-[2px]"
                style={{ flex: `${rc.length} 1 0%` }}
              >
                <span className="pointer-events-none absolute inset-[2px] rounded-[2px] border border-ink-700 bg-ink-800/60" />
                <span
                  className="tabular pointer-events-none relative block truncate px-1 pt-[2px] text-[9px] font-semibold uppercase tracking-wide text-ink-300"
                  title={g.title}
                >
                  {shortTitle(g)}
                </span>
                <div className="relative flex h-[calc(100%-14px)] w-full px-[3px] pb-[1px]">
                  {rc.map((c) =>
                    cellButton(c, { flex: '1 1 0%', minWidth: 0, height: '100%', padding: '1px' }, true, false),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* One line under the wall rather than a floating tooltip: a tooltip that
          covers its neighbours defeats a figure whose whole subject is
          comparison. Reserved height, so nothing reflows on hover. */}
      <div className="mt-2 min-h-[3.2em] text-[12.5px] leading-relaxed text-ink-600">
        {hover ? (
          <p>
            <span className="tabular font-semibold text-ink-900">{hover.cote.shelfmark}</span> ·{' '}
            {HOLDER_BY_ID.get(hover.cote.holder)?.short} · {hover.cote.title}
            <br />
            <span className="tabular">{measure(hover)}</span>
            {cahiersOf(hover.cote.id).length > 0 && (
              <span> · in {cahiersOf(hover.cote.id).join(', ')}</span>
            )}
            {editionOf(hover.cote.id) && (
              <span>
                {' '}
                · {editionOf(hover.cote.id)!.kind === 'published' ? 'in print' : 'transcribed'}:{' '}
                {editionOf(hover.cote.id)!.editors}, {editionOf(hover.cote.id)!.year}
              </span>
            )}
            {piecesIn(hover.cote.id).length > 0 && (
              <span>
                {' '}
                · {piecesIn(hover.cote.id).length}{' '}
                {piecesIn(hover.cote.id).length === 1 ? 'piece' : 'pieces'} located by the literature
              </span>
            )}
          </p>
        ) : (
          <p className="text-ink-400">
            Hover a block for its volume, or a name for the mathematician. Nothing is left out:
            all {COTES.length} volumes are here, under {GROUPS.length} names.
          </p>
        )}
      </div>
    </section>
  );
}
