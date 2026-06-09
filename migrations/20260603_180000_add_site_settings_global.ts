import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "coming_soon_enabled" boolean DEFAULT false
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_locales" (
      "coming_soon_title" varchar,
      "coming_soon_message" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'site_settings_locales'
          AND constraint_name = 'site_settings_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "site_settings_locales"
          ADD CONSTRAINT "site_settings_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id")
          ON DELETE CASCADE;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_locales_locale_parent_id_unique"
      ON "site_settings_locales" ("_locale", "_parent_id");
  `)

  await db.execute(sql`
    INSERT INTO "site_settings" ("id", "coming_soon_enabled")
    SELECT 1, false
    WHERE NOT EXISTS (SELECT 1 FROM "site_settings" WHERE "id" = 1);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_locales";
    DROP TABLE IF EXISTS "site_settings";
  `)
}
