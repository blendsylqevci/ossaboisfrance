import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Fail closed before removing the broad Supabase Data API grants.
  await db.execute(sql`
    ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "public"."site_settings_locales" ENABLE ROW LEVEL SECURITY;
  `)

  // These globals are read and updated through Payload's private Postgres
  // connection. Browser-facing Supabase roles must never reach them directly.
  await db.execute(sql`
    REVOKE ALL PRIVILEGES
      ON TABLE "public"."site_settings", "public"."site_settings_locales"
      FROM PUBLIC, anon, authenticated;

    REVOKE ALL PRIVILEGES
      ON SEQUENCE "public"."site_settings_id_seq", "public"."site_settings_locales_id_seq"
      FROM PUBLIC, anon, authenticated;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore the exact role access that existed before this security migration.
  await db.execute(sql`
    GRANT ALL PRIVILEGES
      ON TABLE "public"."site_settings", "public"."site_settings_locales"
      TO anon, authenticated;

    GRANT ALL PRIVILEGES
      ON SEQUENCE "public"."site_settings_id_seq", "public"."site_settings_locales_id_seq"
      TO anon, authenticated;
  `)

  await db.execute(sql`
    ALTER TABLE "public"."site_settings" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "public"."site_settings_locales" DISABLE ROW LEVEL SECURITY;
  `)
}
