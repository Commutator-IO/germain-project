import type { Finding } from '../lib/types.ts';

/**
 * Candidate findings, written by `/find-novelty` and never by hand.
 *
 * Empty until a volume has been transcribed and read whole: a finding is a
 * claim about the literature made from the modernised reading, and there is
 * no reading yet. The type is what matters here — an entry that does not name
 * what was searched fails the build rather than reaching a reader.
 */
export const FINDINGS: Finding[] = [];
