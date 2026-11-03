# The readings, proved

Lean 4 proofs, against mathlib, of statements the modernised readings make
(`transcripts/<volume>/<volume>.modern.tex`), as in grothendieck-project's
`lean/`. A proof here says that what a reading states **holds together**, not
that it is what the leaf says: a perfectly formalised statement can be a
perfectly formalised misreading. Nor does it say the statement is new.

```bash
cd lean && lake exe cache get && lake build   # fails on any warning, so on any sorry
```

The toolchain and the mathlib pin are grothendieck-project's (`lean-toolchain`,
`lakefile.toml`), so a checkout of both can share mathlib's build
(`cp -cR ../grothendieck-project/lean/.lake/packages lean/.lake/` clones it on
APFS at no cost in space). Build one file at a time, `lake build Germain.<Name>`:
a process that imports Mathlib takes about 2 GB.

Each statement, its written-out proof and what the verification found are in
[`docs/lean/article.pdf`](../docs/lean/article.pdf), compiled from
`docs/lean/article.tex` and `docs/lean/sections/` with
`cd docs/lean && tectonic -X compile article.tex`. In CI
(`.github/workflows/lean.yml`), lean-action's axiom audit fails if any
declaration depends on an axiom beyond Lean's three standard ones.

## The exercise book

`Germain/Exercises.lean` and `Germain/Exercises/<Mathematician>.lean` prove the
mathematical part of exercises in `exercises/exercices.fr.tex` (issue #12): one
file per chapter, one group of theorems per exercise, each docstring naming the
exercise and the question. All forty-two exercises are covered, some
entirely and the others in part: the last line of each solution in the book
names its theorems and says what stays outside Lean (physics, the decimal values
of sines, tangents and logarithms, elliptic integrals, a few steps of analysis).
Comparisons of logarithms are reduced to comparisons of integers
(`lt_mul_logb`, `mul_logb_lt` in `Exercises/Mersenne.lean`).
