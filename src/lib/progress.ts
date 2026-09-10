/**
 * The state of a batch: what exists, and what somebody has claimed.
 *
 * Every state is now settled in the repository, and none of it in the reader's
 * browser. That was the point of the change: a mark kept in local storage told
 * the person who made it something nobody else could see, and told them
 * nothing at all from a second machine. What a batch's state *is* belongs with
 * the batch.
 *
 * Two sources, and the difference is the whole design:
 *
 * — **Observed.** Whether a transcription exists, and whether a modernised
 *   reading exists, are facts about files. `npm run manifest` reads them, so
 *   `drafted` and `reviewed` are never written down anywhere and cannot go
 *   stale.
 * — **Declared.** Whether a pass is in flight, whether a person has sat with
 *   the facsimile and gone page by page, whether a batch was judged to hold
 *   nothing worth transcribing — no file can show any of that. Those three
 *   live in `transcripts/status.json`, where a change is a diff somebody can
 *   review.
 *
 * A progress table one believes to be automatic and which is not misleads more
 * than it informs; so does one that ignores what it can plainly see; and so
 * does one that lets a machine pass wear a human pass's name.
 */

export type State = 'todo' | 'running' | 'drafted' | 'reviewed' | 'checked' | 'skipped';

/** What can be written in `transcripts/status.json` — the rest is observed. */
export type DeclaredState = 'running' | 'checked' | 'skipped';

export const STATES: { key: State; label: string; help: string }[] = [
  { key: 'todo', label: 'To do', help: 'Nothing exists for this batch yet.' },
  {
    key: 'running',
    label: 'Running',
    help: 'A pass is in flight. Declared in transcripts/status.json.',
  },
  {
    key: 'drafted',
    label: 'Drafted',
    help: 'The transcription exists — read from the files, not declared.',
  },
  {
    key: 'reviewed',
    label: 'AI-reviewed',
    help: 'A modernised reading exists, so the transcription has been read again — by machine.',
  },
  {
    key: 'checked',
    label: 'Checked',
    help: 'A person compared it with the facsimile, page by page. Declared, not observed.',
  },
  {
    key: 'skipped',
    label: 'Skipped',
    help: 'Unrelated versos, separators, illegible pages — nothing to transcribe. Declared.',
  },
];

export const progressKey = (cote: string, batch: number) => `${cote}#${batch}`;

/** How far along a state is, so evidence and claim can be compared. */
const RANK: Record<State, number> = {
  todo: 0,
  running: 1,
  drafted: 2,
  reviewed: 3,
  checked: 4,
  // Skipped is a decision, not a stage: nothing overrides it, and it does not
  // override anything.
  skipped: 4,
};

export interface Evidence {
  transcribed: boolean;
  modernised: boolean;
}

/**
 * The state to show: whichever of the declaration and the evidence is further on.
 *
 * Evidence only ever moves a batch forward. A batch marked `checked` has been
 * through a comparison the manifest cannot contradict, and one marked
 * `skipped` records a decision the presence of a file does not undo.
 */
export function shownState(
  declared: DeclaredState | undefined,
  evidence: Evidence,
): State {
  const observed: State = evidence.modernised
    ? 'reviewed'
    : evidence.transcribed
      ? 'drafted'
      : 'todo';
  if (!declared) return observed;
  return RANK[declared] >= RANK[observed] ? declared : observed;
}

export interface Tally {
  total: number;
  byState: Record<State, number>;
  pagesChecked: number;
  pagesTotal: number;
}

export function tally(batches: { state: State; pages: number }[]): Tally {
  const byState: Record<State, number> = {
    todo: 0,
    running: 0,
    drafted: 0,
    reviewed: 0,
    checked: 0,
    skipped: 0,
  };
  let pagesChecked = 0;
  let pagesTotal = 0;
  for (const b of batches) {
    byState[b.state] += 1;
    pagesTotal += b.pages;
    if (b.state === 'checked') pagesChecked += b.pages;
  }
  return { total: batches.length, byState, pagesChecked, pagesTotal };
}
