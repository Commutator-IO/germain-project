---
name: tag-germain
description: Writes or refreshes a volume's modern English keywords — the \keywords{} line closing the résumé of its modernised reading, which npm run manifest extracts as the volume's tags on the archive and cahier pages. Use when someone asks to tag a volume ("tag fr-9115", "add keywords", "refresh the tags"), when a modernised reading has no \keywords line, or when a revision of the reading has made the tags stale. Tags only — it edits the \keywords line and nothing else.
---

# Tagging a volume with its modern vocabulary

**Runs on the model that wrote the volume's modernised reading** — Fable 5.1
or Opus 5, whichever the reading's own `% Pass:` header names, and on nothing
else. A tag is the same judgement the résumé's fourth question made (*quels
noms modernes chercher ensuite*), in its sharpest form; a different model
tagging is a second reader silently overruling the first, in the one place a
search will find it.

## What a tag is

Three to six terms for a small volume, more for Français 9115, **in English**,
naming the vocabulary under which what the volume's leaves construct is known
today — *Sophie Germain's theorem*, *auxiliary primes*, *power residues*,
*Kirchhoff–Love plate*, *Chladni figures*, *biharmonic equation*. Search keys,
not prose; the literature they point into is English.

They live in exactly one place:

```latex
\keywords{Sophie Germain's theorem, auxiliary primes, power residues}
```

closing the résumé of `<volume>.modern.tex`, before `\end{resume}`. There is
no tags file, deliberately.

## The sequence

1. **Read the volume's modernised reading**, whole. If none exists, stop and
   say so: tags come from the reading. Do not skim the transcriptions instead.
2. **Choose the terms.** What would a survey written this year call each
   construction the leaves actually carry out? Established names over
   fashionable ones; the specific over the generic — *Fermat's Last Theorem*
   earns its place on a Fermat volume, *number theory* never does. A person's
   name in a term keeps its capital.
3. **Write the line**, on one physical line.
4. **Propagate and check**: `npm run render && npm run manifest`, then confirm
   `public/manifest.json` carries the tags exactly as written and the archive
   page's search finds the volume under each.

## What not to do

- **Tag an unread volume.**
- **Create a tags file**, or write tags anywhere but the `\keywords{}` line.
- **Translate the tags into French.**
- **Let a tag outrun the leaves.** *Kummer's criterion* on a leaf that mentions
  no such thing earns nothing.
