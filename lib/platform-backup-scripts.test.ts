import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

describe("platform backup scripts", () => {
  let tempRoot = "";
  let mockBin = "";
  let outputDir = "";
  let mediaCacheDir = "";

  const writeExecutable = async (name: string, source: string) => {
    const file = path.join(mockBin, name);
    await writeFile(file, source, "utf8");
    await chmod(file, 0o755);
  };

  before(async () => {
    tempRoot = await mkdtemp(path.join(tmpdir(), "ossabois-backup-test-"));
    mockBin = path.join(tempRoot, "bin");
    outputDir = path.join(tempRoot, "output");
    mediaCacheDir = path.join(tempRoot, "media-cache");
    await mkdir(mockBin);
    await mkdir(outputDir);

    await writeExecutable(
      "openssl",
      '#!/usr/bin/env bash\n[[ "$1" == "x509" ]]\n'
    );
    await writeExecutable(
      "pg_dump",
      `#!/usr/bin/env bash
set -Eeuo pipefail
if [[ "\${1:-}" == "--version" ]]; then
  printf 'pg_dump (PostgreSQL) 17.6 (Ubuntu 17.6-1.pgdg24.04+1)\n'
  exit 0
fi
[[ "\${PGSSLMODE:-}" == "verify-full" ]]
[[ -f "\${PGSSLROOTCERT:-}" ]]
output=""
for argument in "$@"; do
  case "$argument" in
    --file=*) output="\${argument#--file=}" ;;
  esac
done
[[ -n "$output" ]]
printf 'mock-postgres-custom-dump' > "$output"
`
    );
    await writeExecutable(
      "pg_restore",
      '#!/usr/bin/env bash\n[[ "$1" == "--list" ]]\n[[ -s "$2" ]]\n'
    );
    await writeExecutable(
      "gpg",
      `#!/usr/bin/env bash
set -Eeuo pipefail
output=""
input=""
while (( $# > 0 )); do
  case "$1" in
    --output) shift; output="$1" ;;
    --passphrase-fd|--cipher-algo) shift ;;
    --quiet|--batch|--yes|--pinentry-mode|--symmetric|--decrypt|loopback) ;;
    -*) ;;
    *) input="$1" ;;
  esac
  shift
done
cat >/dev/null
[[ -n "$output" && -n "$input" ]]
cp "$input" "$output"
`
    );
    await writeExecutable(
      "aws",
      `#!/usr/bin/env bash
set -Eeuo pipefail
if [[ "$1" == "s3" && "$2" == "sync" ]]; then
  mkdir -p "$4"
  printf 'mock-media-object' > "$4/media.jpg"
else
  exit 4
fi
`
    );
    await writeExecutable(
      "stat",
      `#!/usr/bin/env bash
set -Eeuo pipefail
[[ "$1" == "-c" && "$2" == "%s" ]]
wc -c < "$3" | tr -d ' '
`
    );
  });

  after(async () => {
    if (tempRoot) await rm(tempRoot, { recursive: true, force: true });
  });

  const environment = () => ({
    ...process.env,
    PATH: `${mockBin}:${process.env.PATH ?? ""}`,
    BACKUP_OUTPUT_DIR: outputDir,
    DATABASE_BACKUP_URI: "postgresql://backup:password@db.example.test:5432/postgres",
    DATABASE_CA_CERT:
      "-----BEGIN CERTIFICATE-----\\nTEST\\n-----END CERTIFICATE-----",
    BACKUP_ENCRYPTION_PASSPHRASE: "a-strong-test-passphrase-with-32-chars",
  });

  const run = (script: string, args: string[], env = environment()) => {
    const result = spawnSync("bash", [path.join(process.cwd(), "scripts", script), ...args], {
      cwd: process.cwd(),
      env,
      encoding: "utf8",
      timeout: 30_000,
    });
    assert.equal(
      result.status,
      0,
      `${script} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  };

  it("creates an encrypted database backup and a verified incremental media cache", async () => {
    run("backup-platform.sh", ["database"]);
    run("sync-platform-media-cache.sh", [], {
      ...environment(),
      MEDIA_CACHE_DIR: mediaCacheDir,
      S3_BUCKET: "media",
      S3_ACCESS_KEY_ID: "source-key",
      S3_SECRET_ACCESS_KEY: "source-secret",
      S3_REGION: "eu-test-1",
      S3_ENDPOINT: "https://source.storage.example.test/storage/v1/s3",
    });
    run("verify-platform-media-cache.sh", [mediaCacheDir]);

    const archives = (await readdir(outputDir)).filter((name) => name.endsWith(".gpg"));
    assert.equal(archives.some((name) => name.includes("-database-")), true);
    assert.equal(archives.some((name) => name.includes("-full-")), false);
    assert.equal((await readdir(path.join(mediaCacheDir, "objects"))).includes("media.jpg"), true);
  });
});
