#!/usr/bin/env bash
#
# Transcribe every batch of a volume, one fresh Claude session per batch,
# committing and pushing each one before the next starts.
#
#   scripts/transcribe-loop.sh fr-9118          # all its batches
#   scripts/transcribe-loop.sh fr-9118 3 6      # batches 3 to 6
#
# One session per batch is the skill's own rule — past twenty views the tail
# of a pass degrades — and `claude -p` gives exactly that: a context that
# starts empty and is thrown away when the batch is written. A batch whose
# transcription already exists is skipped, so the loop can be re-run after an
# interruption and picks up where it stopped.
#
# The mirror is fetched once, for the whole range, before any session starts:
# Gallica rate-limits, and a session that fetched for itself would be racing
# the one before it.

set -euo pipefail
cd "$(dirname "$0")/.."

vol="${1:?volume, e.g. fr-9118}"
first="${2:-1}"
last="${3:-}"

# Batch count from the catalogue, without importing TypeScript: 20 views a batch.
if [ -z "$last" ]; then
  pages=$(node -e '
    const s = require("fs").readFileSync("src/content/catalogue.ts", "utf8");
    const m = s.match(new RegExp(`"id": "${process.argv[1]}"[\\s\\S]*?"pages": (\\d+)`));
    if (!m || m[1] === "0") { console.error("not a digitised volume: " + process.argv[1]); process.exit(1); }
    console.log(m[1]);
  ' "$vol")
  last=$(( (pages + 19) / 20 ))
fi

model="${MODEL:-claude-fable-5-1}"

echo "== $vol, batches $first to $last, on $model"

# The working tree must be clean: each batch becomes its own commit, and a
# stray change would be swept into the first one.
if [ -n "$(git status --porcelain)" ]; then
  echo "working tree not clean — commit or stash first" >&2
  exit 1
fi

echo "== mirroring views $first-$last (git-ignored, from Gallica, paused)"
npm run archive -- "$vol" --batches "$first-$last"

for k in $(seq "$first" "$last"); do
  nn=$(printf '%02d' "$k")
  out="transcripts/$vol/batch-$nn.fr.tex"

  if [ -f "$out" ]; then
    echo "== batch $k already transcribed ($out), skipping"
    continue
  fi

  echo "== batch $k: tiles"
  npm run tiles -- "$vol" "$k"

  echo "== batch $k: fresh session"
  claude -p "/transcribe-germain $vol $k" \
    --model "$model" \
    --permission-mode acceptEdits \
    --allowedTools "Bash(npm run *),Bash(ls *),Bash(cat *),Bash(git status *),Bash(git diff *)" \
    | tee "archives/transcribe-$vol-$nn.log"

  if [ ! -f "$out" ]; then
    echo "== batch $k: no transcription written, stopping" >&2
    exit 1
  fi

  echo "== batch $k: render, manifest, commit, push"
  npm run render
  npm run manifest
  git add "transcripts/$vol" transcripts/status.json src/content 2>/dev/null || true
  git commit -q -m "Transcribe $vol, batch $k

First pass on $model, unchecked against the views by a human.
Session log: archives/transcribe-$vol-$nn.log (not versioned).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" \
    || { echo "== batch $k: nothing to commit"; continue; }
  git push
done

echo "== done: $vol batches $first-$last"
