/**
 * TLS configuration for the Postgres (Supabase) connection.
 *
 * - Local development: no SSL.
 * - Production WITH a CA cert (recommended): full certificate verification.
 *   Provide the Supabase project CA certificate (PEM) via `DATABASE_CA_CERT`
 *   (inline PEM) — download it from the Supabase dashboard → Database → SSL.
 * - Production WITHOUT a CA cert: fail at startup. Continuing with
 *   `rejectUnauthorized: false` would encrypt traffic without verifying that
 *   the server is really Supabase.
 *
 * Kept in a tiny standalone module so it can be reused and unit-reasoned about.
 */
export function buildDbSsl():
  | false
  | { rejectUnauthorized: boolean; ca?: string } {
  if (process.env.NODE_ENV !== 'production') return false

  const ca = process.env.DATABASE_CA_CERT?.trim().replace(/\\n/g, '\n')
  if (!ca) {
    throw new Error(
      'DATABASE_CA_CERT is required in production so PostgreSQL TLS can be verified.'
    )
  }

  if (
    !ca.includes('-----BEGIN CERTIFICATE-----') ||
    !ca.includes('-----END CERTIFICATE-----')
  ) {
    throw new Error('DATABASE_CA_CERT must contain a PEM certificate.')
  }

  return { rejectUnauthorized: true, ca }
}
