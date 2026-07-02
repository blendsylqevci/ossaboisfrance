import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create the enum for user roles (idempotent).
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_users_role" AS ENUM ('admin', 'editor');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Add the column defaulting to 'admin' so EVERY existing user keeps full
  // access (non-breaking). The owner subsequently downgrades specific staff
  // accounts to 'editor' to restrict them from Orders PII / pricing.
  await db.execute(sql`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role" "enum_users_role" NOT NULL DEFAULT 'admin';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
  `)
  await db.execute(sql`
    DROP TYPE IF EXISTS "enum_users_role";
  `)
}
