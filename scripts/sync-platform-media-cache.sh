#!/usr/bin/env bash
set -Eeuo pipefail

umask 077
export LC_ALL=C

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    printf 'Required environment variable is missing: %s\n' "$name" >&2
    exit 2
  fi
}

for name in MEDIA_CACHE_DIR S3_BUCKET S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_REGION S3_ENDPOINT; do
  require_env "$name"
done

for command_name in aws sha256sum stat; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command is missing: %s\n' "$command_name" >&2
    exit 2
  fi
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$MEDIA_CACHE_DIR"
MEDIA_CACHE_DIR="$(cd "$MEDIA_CACHE_DIR" && pwd)"
objects_dir="$MEDIA_CACHE_DIR/objects"

# A restored cache is useful only if its contents still match its catalogue. If
# verification fails, preserve it for runner diagnostics and rebuild from S3.
if [[ -d "$objects_dir" ]]; then
  if [[ -f "$MEDIA_CACHE_DIR/manifest.txt" && -f "$MEDIA_CACHE_DIR/checksums.sha256" ]]; then
    if ! bash "$script_dir/verify-platform-media-cache.sh" "$MEDIA_CACHE_DIR"; then
      mv "$MEDIA_CACHE_DIR" "${MEDIA_CACHE_DIR}.corrupt.$(date -u +%s)"
    fi
  elif find "$objects_dir" -type f -print -quit | grep -q .; then
    mv "$MEDIA_CACHE_DIR" "${MEDIA_CACHE_DIR}.incomplete.$(date -u +%s)"
  fi
fi

mkdir -p "$objects_dir"
AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY" \
AWS_DEFAULT_REGION="$S3_REGION" \
AWS_REGION="$S3_REGION" \
AWS_EC2_METADATA_DISABLED=true \
  aws s3 sync \
    "s3://$S3_BUCKET" \
    "$objects_dir" \
    --endpoint-url "$S3_ENDPOINT" \
    --region "$S3_REGION" \
    --delete \
    --no-progress \
    --only-show-errors

(
  cd "$objects_dir"
  find . -type f -exec sha256sum '{}' \; | sort > "$MEDIA_CACHE_DIR/checksums.sha256"
)

storage_files="$(find "$objects_dir" -type f | wc -l | tr -d ' ')"
storage_bytes="$(find "$objects_dir" -type f -exec stat -c '%s' '{}' \; | awk '{total += $1} END {print total + 0}')"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
{
  printf 'format_version=1\n'
  printf 'project=ossaboisfrance\n'
  printf 'scope=media\n'
  printf 'created_at_utc=%s\n' "$timestamp"
  printf 'storage_files=%s\n' "$storage_files"
  printf 'storage_bytes=%s\n' "$storage_bytes"
} > "$MEDIA_CACHE_DIR/manifest.txt"

bash "$script_dir/verify-platform-media-cache.sh" "$MEDIA_CACHE_DIR"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'storage_files=%s\n' "$storage_files" >> "$GITHUB_OUTPUT"
  printf 'storage_bytes=%s\n' "$storage_bytes" >> "$GITHUB_OUTPUT"
fi

printf 'Media snapshot synchronized and verified (%s files, %s bytes).\n' "$storage_files" "$storage_bytes"
