import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add the role column as a plain varchar defaulting to 'admin' so EVERY
  // existing user keeps full access (non-breaking). The owner subsequently
  // downgrades specific staff accounts to 'editor' to restrict them from
  // Orders PII / pricing. Idempotent — safe to run more than once.
  await db.execute(sql`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role" varchar NOT NULL DEFAULT 'admin';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
  `)
}
