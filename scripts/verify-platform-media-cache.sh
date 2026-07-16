#!/usr/bin/env bash
set -Eeuo pipefail

export LC_ALL=C

cache_dir="${1:-${MEDIA_CACHE_DIR:-}}"
if [[ -z "$cache_dir" || ! -d "$cache_dir/objects" ]]; then
  printf 'Usage: bash scripts/verify-platform-media-cache.sh /path/to/media-cache\n' >&2
  exit 2
fi

manifest="$cache_dir/manifest.txt"
checksums="$cache_dir/checksums.sha256"
if [[ ! -f "$manifest" || ! -f "$checksums" ]]; then
  printf 'Media cache is missing its manifest or checksum catalogue.\n' >&2
  exit 1
fi

format_version="$(sed -n 's/^format_version=//p' "$manifest" | head -n 1)"
expected_files="$(sed -n 's/^storage_files=//p' "$manifest" | head -n 1)"
expected_bytes="$(sed -n 's/^storage_bytes=//p' "$manifest" | head -n 1)"
if [[ "$format_version" != "1" || ! "$expected_files" =~ ^[0-9]+$ || ! "$expected_bytes" =~ ^[0-9]+$ ]]; then
  printf 'Media cache manifest is invalid.\n' >&2
  exit 1
fi

(
  cd "$cache_dir/objects"
  sha256sum --check "$checksums" >/dev/null
)

actual_files="$(find "$cache_dir/objects" -type f | wc -l | tr -d ' ')"
actual_bytes="$(find "$cache_dir/objects" -type f -exec stat -c '%s' '{}' \; | awk '{total += $1} END {print total + 0}')"
if [[ "$actual_files" != "$expected_files" || "$actual_bytes" != "$expected_bytes" ]]; then
  printf 'Media cache count or byte total does not match its manifest.\n' >&2
  exit 1
fi

printf 'Media cache verified successfully (%s files, %s bytes).\n' "$actual_files" "$actual_bytes"
