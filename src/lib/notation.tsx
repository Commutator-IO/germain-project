import { Fragment, type ReactNode } from 'react';

/**
 * Sub- and superscripts for the findings entries.
 *
 * The entries are written in a hybrid the rest of the site does not use: the
 * operators are Unicode — ⊂ ∪ ⋃ ∏ → ≤ ⋖ ∅ ∩ Ẋ — and only the indices are TeX,
 * `V^j_{i,k}` and `∏′ O_{Xᵢ}`. That is a deliberate style and not a mistake to
 * be corrected: a sentence of prose reads better with ⋃ in it than with
 * `\bigcup`, and `/find-novelty` writes them this way.
 *
 * What was missing is that nothing rendered the indices, so `V^j_{i,k}` reached
 * the page as five literal characters. The fix is this function and not KaTeX.
 * KaTeX would need every fragment delimited, which means rewriting the entries
 * and translating the Unicode operators into commands — a content migration
 * with a real chance of changing what a claim says, to render notation that is
 * already correct apart from its indices. Here the risk is bounded: the text is
 * a React string, it stays a string, and the only thing that moves is which
 * element the indices sit in.
 *
 * Handled: `_{...}` and `^{...}` with braces, `_x` and `^x` for a single
 * character. Braced bodies are formatted again, because `⋃_{i∈I_y}` has an
 * index inside its index. Everything else is left exactly as written — in
 * particular a lone `\dating{}` naming a macro in prose, which has neither
 * marker and must survive untouched.
 */

/** One `_` or `^` run, and where its body ends. */
const readScript = (s: string, at: number): { body: string; next: number } | null => {
  const open = at + 1;
  if (open >= s.length) return null;

  if (s[open] === '{') {
    // Match to the closing brace, counting depth: `_{V_{i,j}}` is one index.
    let depth = 1;
    for (let i = open + 1; i < s.length; i++) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}' && --depth === 0)
        return { body: s.slice(open + 1, i), next: i + 1 };
    }
    return null; // Unbalanced: leave the text alone rather than guess.
  }

  // Bare single character. Not a run of them: `X_ij` means `X` sub `i` then a
  // literal `j` in TeX, and silently widening that would change the notation.
  return { body: s[open], next: open + 1 };
};

export function notation(text: string): ReactNode {
  if (!text.includes('_') && !text.includes('^')) return text;

  const out: ReactNode[] = [];
  let plain = '';
  let k = 0;

  const flush = () => {
    if (plain) out.push(plain);
    plain = '';
  };

  for (let i = 0; i < text.length; ) {
    const c = text[i];
    if (c !== '_' && c !== '^') {
      plain += c;
      i++;
      continue;
    }
    const run = readScript(text, i);
    if (!run) {
      plain += c;
      i++;
      continue;
    }
    flush();
    const Tag = c === '_' ? 'sub' : 'sup';
    out.push(
      <Tag key={`s${k++}`} className="tabular">
        {notation(run.body)}
      </Tag>,
    );
    i = run.next;
  }
  flush();

  return out.length === 1 && typeof out[0] === 'string' ? out[0] : (
    <>
      {out.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}
