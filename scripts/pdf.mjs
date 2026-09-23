#!/usr/bin/env node
/**
 * Compiles the transcripts' LaTeX into the PDFs offered for download.
 *
 *   npm run pdf              every transcript that has changed, and the exercise book
 *   npm run pdf -- 19        one folder
 *   npm run pdf -- exercises the exercise book alone (exercises/exercices.fr.tex)
 *   npm run pdf -- exercises --exercises-source=archives/scratch/x.fr.tex
 *                            the book, from another file with the same preamble (a fixture)
 *
 * The PDF is the artifact for people who will not compile anything — a
 * supervisor, a reader on a train, an archive that wants a fixed page image.
 * It is compiled from the same `.tex` the reading view is rendered from, so
 * the three never disagree.
 *
 * A Unicode engine is required, not preferred: the transcriptions carry French
 * typography, Grothendieck's accented shorthand, and the occasional Greek or
 * German word, and `fontspec` in the preamble only works under XeTeX or LuaTeX.
 *
 * Tectonic is tried first, and is what CI uses. It is a single binary that
 * fetches the packages a document actually needs and caches them, so a runner
 * installs ~50 MB instead of a multi-gigabyte TeX Live — which is what makes it
 * reasonable to *build* these PDFs on every deploy rather than store them
 * anywhere. A local XeLaTeX is used if present, for people who already have one.
 *
 * With no engine at all this exits cleanly rather than failing the build: a
 * missing PDF costs a download button, not the site.
 */

import { execFile } from 'node:child_process';
import { mkdir, readdir, readFile, copyFile, rm, stat } from 'node:fs/promises';
import { promisify } from 'node:util';
import { resolve, basename, relative } from 'node:path';
import { writeManifest } from './manifest.mjs';

const exec = promisify(execFile);

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'transcripts');
const OUT = resolve(ROOT, 'public', 'transcripts');
const WORK = resolve(ROOT, 'archives', 'latex');
const BOOK_DIR = resolve(ROOT, 'exercises');
const BOOK_SOURCE = resolve(BOOK_DIR, 'exercices.fr.tex');
const BOOK_PREAMBLE = resolve(SOURCE, 'preamble', 'exercices.sty');
const PREAMBLE = resolve(SOURCE, 'preamble', 'germain.sty');
// Input by both preambles: the fallback fonts for what Latin Modern lacks.
const GLYPHS = resolve(SOURCE, 'preamble', 'glyphs.sty');
const BOOK_PDF = resolve(ROOT, 'public', 'exercises', 'exercices.pdf');

async function has(cmd) {
  try {
    await exec('which', [cmd]);
    return true;
  } catch {
    return false;
  }
}

async function mtime(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return 0;
  }
}

async function main() {
  const engine = (await has('tectonic')) ? 'tectonic' : (await has('xelatex')) ? 'xelatex' : null;
  if (!engine) {
    process.stdout.write(
      'No Unicode TeX engine found — skipping PDFs.\n' +
        'Install tectonic (`brew install tectonic`) if you want the download buttons\n' +
        'to offer PDF as well as source. pdfLaTeX will not do: the preamble uses fontspec.\n',
    );
    return;
  }

  const args = process.argv.slice(2);
  const only = args.filter((a) => !a.startsWith('--'));
  const folders = only.filter((a) => a !== 'exercises');
  await mkdir(WORK, { recursive: true });
  if (!only.length || folders.length) await compileTranscripts(engine, folders);
  if (!only.length || only.includes('exercises')) {
    const override = args.find((a) => a.startsWith('--exercises-source='));
    const source = override
      ? resolve(ROOT, override.split('=').slice(1).join('='))
      : BOOK_SOURCE;
    await compileBook(engine, source, Boolean(override) || only.includes('exercises'));
  }
  await rm(WORK, { recursive: true, force: true });
  await writeManifest();
}

async function compileTranscripts(engine, only) {
  let folders = [];
  try {
    folders = (await readdir(SOURCE, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    process.stdout.write('No transcripts/ directory yet — nothing to compile.\n');
    return;
  }
  if (only.length) folders = folders.filter((f) => only.includes(f));

  let built = 0;

  for (const folder of folders) {
    const files = (await readdir(resolve(SOURCE, folder))).filter((f) => f.endsWith('.tex'));
    if (!files.length) continue;
    await mkdir(resolve(OUT, folder), { recursive: true });

    for (const file of files) {
      const src = resolve(SOURCE, folder, file);
      const pdf = resolve(OUT, folder, basename(file, '.tex') + '.pdf');
      // Recompiling an unchanged transcript costs seconds each and produces a
      // byte-identical file; skipping is what makes `npm run pdf` safe to run
      // after every batch. The preamble counts too: a change of font there
      // changes every PDF, and none of their sources.
      const newest = Math.max(await mtime(src), await mtime(PREAMBLE), await mtime(GLYPHS));
      if ((await mtime(pdf)) > newest) continue;

      /**
       * Twice, and the first failure is not reported.
       *
       * Tectonic populates its font cache *during* a compile, and the very
       * first document it is ever asked for on a cold cache dies before it can
       * use what it has just fetched:
       *
       *     ! Font TU/lmr/m/n/12=[lmroman12-regular] ... not loadable:
       *       Metric (TFM) file or installed font not found.
       *
       * The identical command then succeeds, because the fonts are there. On a
       * developer's machine the cache is warm and this is never seen; in CI it
       * cost exactly one PDF per run — whichever document sorts first, which is
       * why `115.modern.pdf` was the one missing from the site while the
       * fourteen compiled after it were fine. Retrying is the whole fix: a
       * document that is genuinely broken fails both times and is reported
       * then, with the engine's own words.
       */
      const compile = async () => {
        if (engine === 'tectonic') {
          // Tectonic reruns to convergence on its own, so the two-pass dance
          // below is unnecessary — and it halts on error by default.
          await exec(engine, ['-X', 'compile', src, '--outdir', WORK, '--keep-logs']);
        } else {
          // Twice: the second pass resolves the cross-references a long
          // transcription accumulates. `-halt-on-error` turns a broken macro
          // into a failure here rather than a silently truncated PDF.
          for (let pass = 0; pass < 2; pass++) {
            await exec(engine, [
              '-interaction=nonstopmode', '-halt-on-error',
              `-output-directory=${WORK}`, src,
            ]);
          }
        }
      };

      try {
        try {
          await compile();
        } catch {
          await compile();
        }
        await copyFile(resolve(WORK, basename(file, '.tex') + '.pdf'), pdf);
        built += 1;
        process.stdout.write(`  ${folder}/${basename(pdf)}\n`);
      } catch (e) {
        // Both engines put the `!` line on stdout and the summary on stderr,
        // and `execFile` puts neither in `e.message` — which is why this line
        // used to report nothing but the command it had just run, truncated
        // mid-path. Read both streams, and keep enough of them to act on.
        const out = `${e.stdout ?? ''}\n${e.stderr ?? ''}`;
        const log = /(?:^|\n)(!.*(?:\n.*){0,2})/.exec(out)?.[1] ?? e.stderr ?? e.message;
        process.stderr.write(`  ⚠ ${folder}/${file}: ${log.trim().slice(0, 400)}\n`);
      }
    }
  }

  process.stdout.write(`${built} PDFs compiled with ${engine}.\n`);
}

/**
 * The exercise book, to public/exercises/exercices.pdf.
 *
 * Compiled like a transcript, with two differences. Its preamble is reached
 * as `../transcripts/preamble/exercices` from `exercises/`, so the engine is
 * told to look there whatever file it is handed — which is what lets a
 * fixture kept elsewhere compile with the book's own preamble. And it is
 * stricter: the book is set in Latin Modern, which has no glyph for many a
 * symbol typed as raw Unicode (☉, ♮), and XeTeX drops a missing glyph with a
 * line in the log and nothing on the page. The contract says to write those
 * in maths; a « Missing character » in the log is therefore an error here.
 */
async function compileBook(engine, source, required) {
  if (!(await mtime(source))) {
    if (required) {
      process.stderr.write(`  ⚠ ${relative(ROOT, source)} not found\n`);
      process.exitCode = 1;
    }
    return;
  }
  await mkdir(resolve(BOOK_PDF, '..'), { recursive: true });
  const newest = Math.max(await mtime(source), await mtime(BOOK_PREAMBLE), await mtime(GLYPHS));
  if ((await mtime(BOOK_PDF)) > newest) return;

  const name = basename(source, '.tex');
  const compile = async () => {
    if (engine === 'tectonic') {
      await exec(engine, [
        '-X', 'compile', source, '--outdir', WORK, '--keep-logs',
        '-Z', `search-path=${BOOK_DIR}`,
      ]);
    } else {
      for (let pass = 0; pass < 2; pass++) {
        await exec(
          engine,
          ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${WORK}`, source],
          { cwd: BOOK_DIR },
        );
      }
    }
  };

  try {
    try {
      await compile();
    } catch {
      await compile();
    }
    const log = await readFile(resolve(WORK, `${name}.log`), 'utf8').catch(() => '');
    const missing = [...new Set(log.match(/Missing character: There is no .*/g) ?? [])];
    if (missing.length) {
      throw Object.assign(new Error('glyphs missing from the font'), {
        stdout: `! ${missing.slice(0, 4).join('\n')}`,
      });
    }
    await copyFile(resolve(WORK, `${name}.pdf`), BOOK_PDF);
    process.stdout.write(`  exercises/${basename(BOOK_PDF)}\n`);
  } catch (e) {
    const out = `${e.stdout ?? ''}\n${e.stderr ?? ''}`;
    const log = /(?:^|\n)(!.*(?:\n.*){0,3})/.exec(out)?.[1] ?? e.stderr ?? e.message;
    process.stderr.write(`  ⚠ exercise book (${relative(ROOT, source)}): ${log.trim().slice(0, 500)}\n`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
