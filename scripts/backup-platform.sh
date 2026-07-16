#!/usr/bin/env bash
set -Eeuo pipefail

umask 077
export LC_ALL=C

scope="${1:-database}"
if [[ "$scope" != "database" ]]; then
  printf 'Usage: bash scripts/backup-platform.sh [database]\n' >&2
  exit 2
fi

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    printf 'Required environment variable is missing: %s\n' "$name" >&2
    exit 2
  fi
}

for name in DATABASE_BACKUP_URI DATABASE_CA_CERT BACKUP_ENCRYPTION_PASSPHRASE; do
  require_env "$name"
done

if (( ${#BACKUP_ENCRYPTION_PASSPHRASE} < 24 )); then
  printf 'BACKUP_ENCRYPTION_PASSPHRASE must contain at least 24 characters.\n' >&2
  exit 2
fi

for command_name in pg_dump pg_restore openssl gpg tar sha256sum git; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command is missing: %s\n' "$command_name" >&2
    exit 2
  fi
done

if [[ "$DATABASE_BACKUP_URI" =~ [\?\&]sslmode=([^\&]+) ]]; then
  if [[ "${BASH_REMATCH[1]}" != "verify-full" ]]; then
    printf 'DATABASE_BACKUP_URI must not override TLS with sslmode=%s. Use verify-full or omit sslmode.\n' "${BASH_REMATCH[1]}" >&2
    exit 2
  fi
fi
if [[ "$DATABASE_BACKUP_URI" =~ [\?\&]sslrootcert= ]]; then
  printf 'Remove sslrootcert from DATABASE_BACKUP_URI; the workflow manages the CA file securely.\n' >&2
  exit 2
fi
if [[ "$DATABASE_BACKUP_URI" =~ :6543(/|\?|$) ]]; then
  printf 'DATABASE_BACKUP_URI must use the Session Pooler on port 5432, not Transaction Pooler port 6543.\n' >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/ossabois-backup-build.XXXXXX")"
trap 'rm -rf "$work_dir"' EXIT

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
git_sha="$(git -C "$repo_root" rev-parse HEAD 2>/dev/null || printf 'unknown')"
short_sha="${git_sha:0:12}"
bundle_name="ossabois-${scope}-${timestamp}-${short_sha}"
bundle_dir="$work_dir/$bundle_name"
mkdir -p "$bundle_dir"

ca_file="$work_dir/supabase-ca.crt"
ca_value="${DATABASE_CA_CERT//\\n/$'\n'}"
if [[ "$ca_value" != *'-----BEGIN CERTIFICATE-----'* || "$ca_value" != *'-----END CERTIFICATE-----'* ]]; then
  printf 'DATABASE_CA_CERT must contain a PEM certificate.\n' >&2
  exit 2
fi
printf '%s\n' "$ca_value" > "$ca_file"
openssl x509 -in "$ca_file" -noout >/dev/null

export PGSSLMODE=verify-full
export PGSSLROOTCERT="$ca_file"

database_dump="$bundle_dir/database.dump"
pg_dump_major="$(pg_dump --version | sed -E 's/^[^0-9]*([0-9]+).*/\1/')"
if [[ ! "$pg_dump_major" =~ ^[0-9]+$ || "$pg_dump_major" -lt 17 ]]; then
  printf 'PostgreSQL client 17 or newer is required (found: %s).\n' "$(pg_dump --version)" >&2
  exit 2
fi

pg_dump \
  --dbname="$DATABASE_BACKUP_URI" \
  --schema="${BACKUP_DB_SCHEMA:-public}" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="$database_dump"
pg_restore --list "$database_dump" >/dev/null

{
  printf 'format_version=2\n'
  printf 'project=ossaboisfrance\n'
  printf 'scope=%s\n' "$scope"
  printf 'created_at_utc=%s\n' "$timestamp"
  printf 'git_sha=%s\n' "$git_sha"
  printf 'database_schema=%s\n' "${BACKUP_DB_SCHEMA:-public}"
  printf 'database_tls=verify-full\n'
} > "$bundle_dir/manifest.txt"

(
  cd "$bundle_dir"
  find . -type f ! -name checksums.sha256 -exec sha256sum '{}' \; > checksums.sha256
)

plain_archive="$work_dir/$bundle_name.tar.gz"
tar -czf "$plain_archive" -C "$work_dir" "$bundle_name"

output_dir="${BACKUP_OUTPUT_DIR:-${RUNNER_TEMP:-${TMPDIR:-/tmp}}/ossabois-platform-backups}"
mkdir -p "$output_dir"
encrypted_archive="$output_dir/$bundle_name.tar.gz.gpg"

printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" | gpg \
  --quiet \
  --batch \
  --yes \
  --pinentry-mode loopback \
  --passphrase-fd 0 \
  --symmetric \
  --cipher-algo AES256 \
  --output "$encrypted_archive" \
  "$plain_archive"

BACKUP_ENCRYPTION_PASSPHRASE="$BACKUP_ENCRYPTION_PASSPHRASE" \
  bash "$script_dir/verify-platform-backup.sh" "$encrypted_archive"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'archive=%s\n' "$encrypted_archive" >> "$GITHUB_OUTPUT"
  printf 'filename=%s\n' "$(basename "$encrypted_archive")" >> "$GITHUB_OUTPUT"
fi

printf 'Encrypted platform backup created: %s\n' "$encrypted_archive"
