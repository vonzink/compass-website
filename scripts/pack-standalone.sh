#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_URL="${SITE_URL:-https://compasshl.us}"
SITE_ENV="${SITE_ENV:-production}"
STANDALONE="$ROOT/.next/standalone"

cd "$ROOT"

NEXT_PUBLIC_SITE_URL="$SITE_URL" \
NEXT_PUBLIC_SITE_ENV="$SITE_ENV" \
NODE_ENV=production \
npm run build

test -f "$STANDALONE/server.js"
mkdir -p "$STANDALONE/.next"
rsync -a --delete "$ROOT/.next/static/" "$STANDALONE/.next/static/"
rsync -a --delete "$ROOT/public/" "$STANDALONE/public/"

# Next copies local env files into standalone output. Runtime configuration is
# supplied by the server's shared .env symlink, never by a developer env file.
find "$STANDALONE" -maxdepth 1 -type f -name '.env*' -delete

printf 'Standalone bundle: %s\n' "$(du -sh "$STANDALONE" | cut -f1)"
