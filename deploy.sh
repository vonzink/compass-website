#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EC2_HOST="${EC2_HOST:-ubuntu@52.203.186.217}"
EC2_KEY="${EC2_KEY:-/Users/zacharyzink/MSFG/Security/msfg-mortgage-key.pem}"
REMOTE_ROOT="${REMOTE_ROOT:-/home/ubuntu/apps/compass-website}"
PM2_NAME="${PM2_NAME:-compass-web}"
APP_PORT="${APP_PORT:-3009}"
SITE_URL="${SITE_URL:-https://compasshl.us}"
SITE_ENV="${SITE_ENV:-production}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"
SSH=(ssh -i "$EC2_KEY" -o BatchMode=yes -o ConnectTimeout=25 -o StrictHostKeyChecking=accept-new)

DO_MIGRATE=false
DO_ROLLBACK=false

usage() {
  cat <<'EOF'
Usage: ./deploy.sh [--migrate | --rollback]

  no flags    Verify, build, and deploy the pushed origin/main commit.
  --migrate   Apply pending Prisma migrations before deploying.
  --rollback  Reactivate the retained previous release.
EOF
}

die() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

step() {
  printf '\n==> %s\n' "$1"
}

while (($#)); do
  case "$1" in
    --migrate) DO_MIGRATE=true ;;
    --rollback) DO_ROLLBACK=true ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
  shift
done

$DO_MIGRATE && $DO_ROLLBACK && die "--migrate and --rollback cannot be combined"
[[ -f "$EC2_KEY" ]] || die "SSH key not found: $EC2_KEY"
command -v rsync >/dev/null || die "rsync is required"

rollback_remote() {
  step "Rolling back $PM2_NAME"
  "${SSH[@]}" "$EC2_HOST" bash -s -- "$REMOTE_ROOT" "$PM2_NAME" "$APP_PORT" <<'REMOTE'
set -Eeuo pipefail
root="$1"
process="$2"
port="$3"
current_target="$(readlink "$root/current" || true)"
previous_target="$(readlink "$root/previous" || true)"

[[ -n "$previous_target" && -f "$root/$previous_target/server.js" ]] || {
  echo "No valid previous release is available." >&2
  exit 1
}

ln -sfn "$previous_target" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if [[ -n "$current_target" ]]; then
  ln -sfn "$current_target" "$root/previous"
fi

pm2 startOrReload "$root/ecosystem.config.cjs" --only "$process" --update-env

for _ in $(seq 1 15); do
  if curl -fsS "http://127.0.0.1:$port/api/v1/health" | grep -q '"db":"up"'; then
    pm2 save >/dev/null
    echo "Rollback active: $previous_target"
    exit 0
  fi
  sleep 1
done

echo "Rollback release failed its health check." >&2
exit 1
REMOTE
}

if $DO_ROLLBACK; then
  rollback_remote
  exit 0
fi

cd "$ROOT"

step "Verifying repository state"
[[ "$(git branch --show-current)" == "main" ]] || die "Deployments must run from main"
[[ -z "$(git status --porcelain)" ]] || die "Working tree is not clean"
git fetch --quiet origin main
HEAD_SHA="$(git rev-parse HEAD)"
ORIGIN_SHA="$(git rev-parse origin/main)"
[[ "$HEAD_SHA" == "$ORIGIN_SHA" ]] || die "HEAD does not match origin/main; push or pull before deploying"
SHORT_SHA="$(git rev-parse --short=12 HEAD)"
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-$SHORT_SHA"
printf 'Release: %s\n' "$RELEASE_ID"

step "Installing locked dependencies"
npm ci

step "Running tests"
npm test

step "Running lint"
npm run lint

step "Building standalone production bundle"
SITE_URL="$SITE_URL" SITE_ENV="$SITE_ENV" bash scripts/pack-standalone.sh
STANDALONE="$ROOT/.next/standalone"
[[ -f "$STANDALONE/server.js" ]] || die "Standalone server.js was not produced"
printf '%s\n' "$HEAD_SHA" > "$STANDALONE/REVISION"

if $DO_MIGRATE; then
  step "Applying pending production migrations"
  CA_FILE="${TMPDIR:-/tmp}/aws-rds-global-bundle.pem"
  curl -fsSL https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o "$CA_FILE"
  PROD_DATABASE_URL="$("${SSH[@]}" "$EC2_HOST" bash -s -- "$REMOTE_ROOT/shared/.env" <<'REMOTE'
set -Eeuo pipefail
set -a
. "$1"
set +a
printf '%s' "${DIRECT_URL:-$DATABASE_URL}"
REMOTE
)"
  [[ -n "$PROD_DATABASE_URL" ]] || die "Production database URL was not available"
  DATABASE_URL="$PROD_DATABASE_URL" \
  DIRECT_URL="$PROD_DATABASE_URL" \
  NODE_EXTRA_CA_CERTS="$CA_FILE" \
  npx prisma migrate deploy
  unset PROD_DATABASE_URL
fi

step "Uploading immutable release"
"${SSH[@]}" "$EC2_HOST" bash -s -- "$REMOTE_ROOT" "$RELEASE_ID" <<'REMOTE'
set -Eeuo pipefail
root="$1"
release="$2"
mkdir -p "$root/releases" "$root/shared"
[[ -f "$root/shared/.env" ]] || {
  echo "Missing $root/shared/.env" >&2
  exit 1
}
rm -rf "$root/releases/.incoming-$release"
mkdir -p "$root/releases/.incoming-$release"
REMOTE

rsync -az --delete --exclude='.env*' \
  -e "ssh -i $EC2_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new" \
  "$STANDALONE/" \
  "$EC2_HOST:$REMOTE_ROOT/releases/.incoming-$RELEASE_ID/"

rsync -az \
  -e "ssh -i $EC2_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new" \
  "$ROOT/deploy/ecosystem.config.cjs" \
  "$EC2_HOST:$REMOTE_ROOT/ecosystem.config.cjs"

step "Activating release and checking health"
"${SSH[@]}" "$EC2_HOST" bash -s -- \
  "$REMOTE_ROOT" "$RELEASE_ID" "$PM2_NAME" "$APP_PORT" "$KEEP_RELEASES" <<'REMOTE'
set -Eeuo pipefail
root="$1"
release="$2"
process="$3"
port="$4"
keep="$5"
incoming="$root/releases/.incoming-$release"
final="$root/releases/$release"

[[ -f "$incoming/server.js" ]] || {
  echo "Uploaded release is missing server.js" >&2
  exit 1
}

mv "$incoming" "$final"
ln -sfn ../../shared/.env "$final/.env"
previous_target="$(readlink "$root/current" || true)"
if [[ -n "$previous_target" ]]; then
  ln -sfn "$previous_target" "$root/previous"
fi
ln -sfn "releases/$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"

restore_previous() {
  if [[ -n "$previous_target" && -f "$root/$previous_target/server.js" ]]; then
    ln -sfn "$previous_target" "$root/current.next"
    mv -Tf "$root/current.next" "$root/current"
    pm2 startOrReload "$root/ecosystem.config.cjs" --only "$process" --update-env >/dev/null || true
  fi
}

if ! pm2 startOrReload "$root/ecosystem.config.cjs" --only "$process" --update-env; then
  restore_previous
  exit 1
fi

healthy=false
for _ in $(seq 1 15); do
  health="$(curl -fsS "http://127.0.0.1:$port/api/v1/health" 2>/dev/null || true)"
  if printf '%s' "$health" | grep -q '"db":"up"'; then
    healthy=true
    break
  fi
  sleep 1
done

if [[ "$healthy" != true ]]; then
  echo "New release failed its database health check; restoring previous release." >&2
  restore_previous
  exit 1
fi

curl -fsS -H 'Host: compasshl.us' http://127.0.0.1/ >/dev/null
curl -fsS -H 'Host: compasshl.us' http://127.0.0.1/api/v1/health | grep -q '"db":"up"'
pm2 save >/dev/null

mapfile -t release_names < <(
  find "$root/releases" -mindepth 1 -maxdepth 1 -type d ! -name '.incoming-*' \
    -printf '%T@ %f\n' | sort -nr | awk '{print $2}'
)
for ((i=keep; i<${#release_names[@]}; i++)); do
  candidate="releases/${release_names[$i]}"
  current="$(readlink "$root/current" || true)"
  previous="$(readlink "$root/previous" || true)"
  if [[ "$candidate" != "$current" && "$candidate" != "$previous" ]]; then
    rm -rf "$root/$candidate"
  fi
done

echo "Active release: $release"
REMOTE

step "Deployment complete"
printf 'Commit: %s\n' "$HEAD_SHA"
printf 'Server: %s\n' "$EC2_HOST"
printf 'Process: %s on 127.0.0.1:%s\n' "$PM2_NAME" "$APP_PORT"
