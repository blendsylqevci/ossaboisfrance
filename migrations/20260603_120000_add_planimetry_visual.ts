import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "houses"
      ADD COLUMN IF NOT EXISTS "planimetry_visual_id" integer;
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'houses'
          AND constraint_name = 'houses_planimetry_visual_id_media_id_fk'
      ) THEN
        ALTER TABLE "houses"
          ADD CONSTRAINT "houses_planimetry_visual_id_media_id_fk"
          FOREIGN KEY ("planimetry_visual_id") REFERENCES "media"("id")
          ON DELETE SET NULL;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "houses_planimetry_visual_idx" ON "houses" ("planimetry_visual_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "houses_planimetry_visual_idx";

    ALTER TABLE "houses"
      DROP CONSTRAINT IF EXISTS "houses_planimetry_visual_id_media_id_fk",
      DROP COLUMN IF EXISTS "planimetry_visual_id";
  `)
}
