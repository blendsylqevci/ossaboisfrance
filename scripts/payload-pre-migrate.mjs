/**
 * Removes Payload "dev push" records (batch = -1) before production migrations.
 * Prevents Vercel builds from hanging on the interactive dev-mode prompt.
 */
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());

const uri = process.env.DATABASE_URI;

if (!uri) {
  console.log("[pre-migrate] DATABASE_URI not set — skipping dev migration cleanup");
  process.exit(0);
}

const client = new pg.Client({
  connectionString: uri,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
  const result = await client.query(
    "DELETE FROM payload_migrations WHERE batch = -1 RETURNING id, name",
  );

  if (result.rowCount > 0) {
    console.log(
      `[pre-migrate] Removed ${result.rowCount} dev migration record(s):`,
      result.rows.map((row) => row.name).join(", "),
    );
  } else {
    console.log("[pre-migrate] No dev migration records (batch = -1) found");
  }
} finally {
  await client.end();
}
