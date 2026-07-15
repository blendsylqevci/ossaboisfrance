#!/usr/bin/env bash
set -Eeuo pipefail

umask 077
export LC_ALL=C

archive="${1:-}"
if [[ -z "$archive" || ! -f "$archive" ]]; then
  printf 'Usage: BACKUP_ENCRYPTION_PASSPHRASE=... bash scripts/verify-platform-backup.sh /path/to/backup.gpg\n' >&2
  exit 2
fi

if [[ -z "${BACKUP_ENCRYPTION_PASSPHRASE:-}" ]]; then
  printf 'BACKUP_ENCRYPTION_PASSPHRASE is required.\n' >&2
  exit 2
fi

for command_name in gpg tar sha256sum pg_restore; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command is missing: %s\n' "$command_name" >&2
    exit 2
  fi
done

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/ossabois-backup-verify.XXXXXX")"
trap 'rm -rf "$work_dir"' EXIT

plain_archive="$work_dir/backup.tar.gz"
extract_dir="$work_dir/extracted"
mkdir -p "$extract_dir"

printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" | gpg \
  --quiet \
  --batch \
  --yes \
  --pinentry-mode loopback \
  --passphrase-fd 0 \
  --output "$plain_archive" \
  --decrypt "$archive"

tar -xzf "$plain_archive" -C "$extract_dir"

bundle_dir="$(find "$extract_dir" -mindepth 1 -maxdepth 1 -type d -name 'ossabois-*' -print -quit)"
if [[ -z "$bundle_dir" ]]; then
  printf 'Backup does not contain the expected bundle directory.\n' >&2
  exit 1
fi

for required_file in manifest.txt checksums.sha256 database.dump; do
  if [[ ! -f "$bundle_dir/$required_file" ]]; then
    printf 'Backup is missing %s.\n' "$required_file" >&2
    exit 1
  fi
done

(
  cd "$bundle_dir"
  sha256sum --check checksums.sha256 >/dev/null
)
pg_restore --list "$bundle_dir/database.dump" >/dev/null

scope="$(sed -n 's/^scope=//p' "$bundle_dir/manifest.txt" | head -n 1)"
if [[ "$scope" != "database" ]]; then
  printf 'Backup manifest has an invalid scope.\n' >&2
  exit 1
fi

printf 'Backup verified successfully (scope=%s).\n' "$scope"
