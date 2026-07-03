/**
 * TLS configuration for the Postgres (Supabase) connection.
 *
 * - Local development: no SSL.
 * - Production WITH a CA cert (recommended): full certificate verification.
 *   Provide the Supabase project CA certificate (PEM) via `DATABASE_CA_CERT`
 *   (inline PEM) — download it from the Supabase dashboard → Database → SSL.
 * - Production WITHOUT a CA cert (fallback): the connection is still encrypted
 *   (TLS), but the server certificate is not verified. This is the documented
 *   Supabase pooler default; set `DATABASE_CA_CERT` to remove it.
 *
 * Kept in a tiny standalone module so it can be reused and unit-reasoned about.
 */
export function buildDbSsl():
  | false
  | { rejectUnauthorized: boolean; ca?: string } {
  if (process.env.NODE_ENV !== 'production') return false

  const ca = process.env.DATABASE_CA_CERT?.trim()
  if (ca) {
    return { rejectUnauthorized: true, ca }
  }
  return { rejectUnauthorized: false }
}
