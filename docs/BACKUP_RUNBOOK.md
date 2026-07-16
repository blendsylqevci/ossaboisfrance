# Platform backup and restore runbook

This is the independent seven-day recovery layer for Ossa Bois France. It
complements Supabase-managed database backups/PITR; it does not replace them.

## Backup policy

| Data | Schedule | Destination | Retention / objective |
|------|----------|-------------|-----------------------|
| PostgreSQL `public` schema | Daily at 02:17 UTC | GPG-encrypted GitHub Actions artifact | 7 days; RPO up to 24 hours |
| Supabase Storage `media` bucket | Daily in the same job | Versioned GitHub Actions cache snapshot | 7 days; RPO up to 24 hours |
| Supabase physical backup / PITR | Supabase-managed | Supabase backup system | Confirm in the Supabase dashboard |
| Application code and migrations | Every Git push | GitHub repository | Git history |

The database archive is encrypted client-side with GPG AES-256. Every run
validates SHA-256 checksums and the PostgreSQL archive catalogue before upload.
Only the encrypted `.gpg` file becomes an Actions artifact.

The media collection is public website content, so its daily snapshot is kept
in GitHub Actions Cache rather than the much smaller artifact quota. The first
run downloads the bucket; later runs restore the latest cache and `aws s3 sync`
downloads only new or changed source objects. Each daily snapshot receives a
new immutable cache key and is verified with SHA-256 before it is saved.

At the 2026-07-16 baseline the bucket is 2,535 files / 851.82 MiB. Seven daily
snapshots are approximately 5.8 GiB, below GitHub's separate 10 GiB repository
cache allowance. The cleanup step deletes `ossabois-media-*` caches older than
seven days. This design does not run inside Vercel and creates no request load
on the website.

Supabase database backups contain Storage metadata but not the actual Storage
objects. That is why both the database artifact and the matching media cache
key are required for a complete daily recovery point.

## Required secrets

`DATABASE_CA_CERT` must exist in Vercel Production before code using fail-closed
TLS is deployed. Use the complete Supabase Root CA PEM; `\n`-escaped PEM is
accepted as well as multiline PEM.

Add these repository secrets under **GitHub → Settings → Secrets and variables
→ Actions**:

| Secret | Purpose |
|--------|---------|
| `SUPABASE_DATABASE_BACKUP_URI` | PostgreSQL **Session Pooler** URI on port `5432`; omit `sslmode` or use only `verify-full` |
| `DATABASE_CA_CERT` | Supabase Root CA certificate in PEM form |
| `BACKUP_ENCRYPTION_PASSPHRASE` | Unique random passphrase of at least 24 characters; keep a second copy in the company password manager |
| `SUPABASE_S3_BUCKET` | Source bucket, currently `media` |
| `SUPABASE_S3_ACCESS_KEY_ID` | Server-side Supabase S3 access key |
| `SUPABASE_S3_SECRET_ACCESS_KEY` | Server-side Supabase S3 secret key |
| `SUPABASE_S3_REGION` | Region shown in Supabase Storage S3 settings |
| `SUPABASE_S3_ENDPOINT` | Supabase S3 endpoint ending in `/storage/v1/s3` |

Do not use the Transaction Pooler port `6543` for `pg_dump`. PostgreSQL client
17 or newer is required because the current Supabase database is PostgreSQL
17. The source S3 credentials bypass Storage RLS and belong only in GitHub
repository secrets and Vercel server-side secrets.

## Automatic workflow

Workflow: `.github/workflows/platform-backup.yml`

- One job creates a matched database + media recovery point every day.
- Database artifacts use `retention-days: 7` and `compression-level: 0` because
  the inner dump and GPG archive are already compressed/encrypted.
- Media uses the separate Actions cache allowance; the previous snapshot is
  restored before `aws s3 sync`, minimizing Supabase reads and egress.
- The job verifies the restored cache before reuse, rebuilds from Supabase if a
  cache is incomplete/corrupt, and verifies the new snapshot before saving it.
- A scoped cleanup with `actions: write` removes only cache keys beginning with
  `ossabois-media-` that are older than seven days.
- Any missing secret, invalid CA, TLS downgrade, unsupported PostgreSQL client,
  checksum mismatch, dump error, or media sync error fails the job.

Monitor failed runs. A scheduled workflow that repeatedly fails is not a backup
system. The first manual run must complete before this control is considered
operational.

## Verify a database archive

Keep plaintext only in system temp. Never decrypt a production backup into the
repository.

```bash
read -s BACKUP_ENCRYPTION_PASSPHRASE
export BACKUP_ENCRYPTION_PASSPHRASE
bash scripts/verify-platform-backup.sh /path/to/ossabois-database-*.tar.gz.gpg
unset BACKUP_ENCRYPTION_PASSPHRASE
```

Verification decrypts into a temporary directory, validates all checksums,
checks that `pg_restore` can read the database catalogue, and removes temporary
plaintext automatically.

## Verify or recover a media snapshot

In GitHub Actions, list the retained cache keys:

```bash
gh cache list --repo blendsylqevci/ossaboisfrance --key ossabois-media-
```

Restore the exact selected key with `actions/cache/restore@v4` into a throwaway
runner directory, then run:

```bash
bash scripts/verify-platform-media-cache.sh "$MEDIA_CACHE_DIR"
```

The matching `manifest.txt` records creation time, object count and total bytes.
Do not restore directly over production. First sync `objects/` to a new
throwaway Supabase bucket and validate the application there.

## Quarterly restore drill

1. Pick one date and record its database artifact name and media cache key from
   the workflow summary.
2. Download, decrypt and verify the database artifact in system temp.
3. Restore the selected media cache and verify its checksum catalogue.
4. Create a throwaway Supabase project and obtain its CA.
5. Restore `database.dump` with `PGSSLMODE=verify-full`, then upload the cached
   `objects/` tree to the throwaway media bucket.
6. Start the application against the throwaway project and verify login,
   catalogue pages, media rendering, and one non-delivering checkout test.
7. Record date, recovery-point names, restore duration (RTO), row/object counts,
   reviewer, and repairs; then delete the throwaway project.

## Scope limitations

The logical backup covers the application-owned PostgreSQL `public` schema and
all objects in the configured public media bucket. Supabase-managed roles and
service configuration are recreated with a new Supabase project. Vercel and
GitHub secret values are intentionally not copied; their required names are
documented here and in `.env.example`.
