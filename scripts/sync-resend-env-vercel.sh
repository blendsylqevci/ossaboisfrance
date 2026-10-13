#!/usr/bin/env bash
# Sync Resend env vars from .env or .env.local to Vercel project ossaboisfrance.
# Prerequisite: vercel CLI logged in with access to team "Ossa Bois France's projects"
#
#   vercel teams switch ossa-bois-france-s-projects
#   cd /path/to/ossaboisfrance && ./scripts/sync-resend-env-vercel.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE=".env"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env or .env.local"
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "Linking to Vercel project ossaboisfrance..."
  vercel link --yes --project ossaboisfrance --scope ossa-bois-france-s-projects
fi

get_var() {
  node -e "
    const fs = require('fs');
    const key = process.argv[1];
    const text = fs.readFileSync(process.argv[2], 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      if (t.slice(0, i).trim() === key) {
        console.log(t.slice(i + 1).trim());
        process.exit(0);
      }
    }
    process.exit(1);
  " "$1" "$ENV_FILE"
}

add_env() {
  local name="$1"
  local value="$2"
  for env in production preview development; do
    echo "→ $name ($env)"
    vercel env add "$name" "$env" --value "$value" --yes --force 2>/dev/null || \
      printf '%s' "$value" | vercel env add "$name" "$env" --yes --force
  done
}

for key in RESEND_API_KEY RESEND_FROM_EMAIL RESEND_ADMIN_EMAIL; do
  if ! value="$(get_var "$key" 2>/dev/null)"; then
    echo "Skip $key (not in $ENV_FILE)"
    continue
  fi
  add_env "$key" "$value"
done

if value="$(get_var NEXT_PUBLIC_SITE_URL 2>/dev/null)"; then
  add_env "NEXT_PUBLIC_SITE_URL" "$value"
else
  add_env "NEXT_PUBLIC_SITE_URL" "https://ossaboisfrance.com"
fi

echo "Done. Verify: vercel env ls"
