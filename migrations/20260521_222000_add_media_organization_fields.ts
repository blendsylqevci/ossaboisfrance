import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "house_id" integer,
      ADD COLUMN IF NOT EXISTS "media_type" varchar,
      ADD COLUMN IF NOT EXISTS "layer_key" varchar;
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'media'
          AND constraint_name = 'media_house_id_houses_id_fk'
      ) THEN
        ALTER TABLE "media"
          ADD CONSTRAINT "media_house_id_houses_id_fk"
          FOREIGN KEY ("house_id") REFERENCES "houses"("id")
          ON DELETE SET NULL;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "media_house_idx" ON "media" ("house_id");
    CREATE INDEX IF NOT EXISTS "media_media_type_idx" ON "media" ("media_type");
    CREATE INDEX IF NOT EXISTS "media_layer_key_idx" ON "media" ("layer_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_layer_key_idx";
    DROP INDEX IF EXISTS "media_media_type_idx";
    DROP INDEX IF EXISTS "media_house_idx";

    ALTER TABLE "media"
      DROP CONSTRAINT IF EXISTS "media_house_id_houses_id_fk",
      DROP COLUMN IF EXISTS "layer_key",
      DROP COLUMN IF EXISTS "media_type",
      DROP COLUMN IF EXISTS "house_id";
  `)
}
