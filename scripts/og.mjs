#!/usr/bin/env node
/**
 * The preview image a link to the site shows on LinkedIn, Mastodon and the
 * rest (og:image): 1200 × 627, typeset by TeX from a transcription, as on
 * grothendieck.commutator.io.
 *
 *   npm run og
 *
 * public/og/home.png — the solution for the vibrating rod on view 154 of
 * Français 9115 (batch 8), taken from the .tex as it stands. No view of
 * Gallica is reproduced: the site stores and re-serves no image of the BnF's,
 * and what is drawn here is the transcription's TeX, set by TeX. Committed,
 * because the deploy runner is not where it needs to change; rerun if the
 * formula is corrected.
 *
 * Needs tectonic and pdftoppm.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'public/og');
const TMP = resolve(ROOT, 'node_modules/.cache/og');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// The formula, read from the transcription rather than copied here, so the
// picture cannot drift from the text it shows.
const SOURCE = 'transcripts/fr-9115/batch-08.fr.tex';
const src = readFileSync(resolve(ROOT, SOURCE), 'utf8');
const view = src.slice(src.indexOf('\\page{154}'), src.indexOf('\\page{155}'));
const formula = [...view.matchAll(/(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/g)]
  .map((m) => m[1].trim())
  .find((f) => f.startsWith('y = C'));
if (!formula) throw new Error(`${SOURCE}: the formula « y = C … » of view 154 is gone — choose another and update scripts/og.mjs`);

const tex = String.raw`\documentclass{article}
\usepackage[paperwidth=16in,paperheight=8.36in,margin=0.6in]{geometry}
\usepackage{XCharter}\usepackage{amsmath,amssymb}\usepackage{xcolor}\usepackage{adjustbox}
\pagestyle{empty}\setlength{\parindent}{0pt}
\definecolor{ink}{RGB}{19,18,16}\definecolor{muted}{RGB}{114,109,95}\definecolor{brand}{RGB}{56,83,157}
\begin{document}\color{ink}
{\fontsize{34}{40}\selectfont\textbf{Mathematicians' Manuscripts in Gallica}}\\[8pt]
{\fontsize{20}{26}\selectfont\textcolor{muted}{Nineteen mathematicians, from Viète to Libri, read leaf by leaf beside a LaTeX transcription}}
\vfill
\begin{center}\adjustbox{width=13.6in,max totalheight=2.6in}{$\displaystyle ${formula.replace(/;\s*$/, '')}$}\end{center}
\vfill
{\fontsize{17}{20}\selectfont\textcolor{brand}{germain.commutator.io}\hfill\textcolor{muted}{BnF, Français 9115, view 154 --- the vibrating rod, as transcribed}}
\end{document}
`;

writeFileSync(resolve(TMP, 'home.tex'), tex);
execFileSync('tectonic', ['-X', 'compile', 'home.tex', '--outdir', '.'], { cwd: TMP, stdio: ['ignore', 'pipe', 'pipe'] });
// 16in × 8.36in at 75 dpi is 1200 × 627, LinkedIn's size.
execFileSync('pdftoppm', ['-png', '-r', '75', '-singlefile', 'home.pdf', resolve(OUT, 'home')], { cwd: TMP });
rmSync(resolve(TMP, 'home.pdf'), { force: true });
process.stdout.write('og: home.png (Français 9115, view 154) → public/og/\n');
