import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "order_ref" varchar,
      ADD COLUMN IF NOT EXISTS "transport_cost" numeric,
      ADD COLUMN IF NOT EXISTS "street_address" varchar,
      ADD COLUMN IF NOT EXISTS "city" varchar,
      ADD COLUMN IF NOT EXISTS "zip_code" varchar,
      ADD COLUMN IF NOT EXISTS "state_region" varchar,
      ADD COLUMN IF NOT EXISTS "country" varchar DEFAULT 'France',
      ADD COLUMN IF NOT EXISTS "client_notes" text;
  `)

  // Assign a reference for any existing legacy orders before creating unique index
  await db.execute(sql`
    UPDATE "orders" 
    SET "order_ref" = 'OB-LEGACY-' || id 
    WHERE "order_ref" IS NULL;
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "orders_order_ref_idx" ON "orders" ("order_ref");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "orders_order_ref_idx";

    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "client_notes",
      DROP COLUMN IF EXISTS "country",
      DROP COLUMN IF EXISTS "state_region",
      DROP COLUMN IF EXISTS "zip_code",
      DROP COLUMN IF EXISTS "city",
      DROP COLUMN IF EXISTS "street_address",
      DROP COLUMN IF EXISTS "transport_cost",
      DROP COLUMN IF EXISTS "order_ref";
  `)
}
