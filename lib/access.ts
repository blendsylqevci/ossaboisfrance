import type { PayloadRequest } from 'payload'

type MaybeUser = { role?: string | null } | null | undefined

/**
 * True for staff accounts with the `admin` role. Every existing user is
 * migrated to `admin` (see the add_user_role migration) and the Users field
 * defaults to `admin`, so this is non-breaking; the owner opts specific
 * accounts DOWN to a restricted role to limit their access to sensitive data
 * (e.g. customer Orders PII).
 */
export function isAdmin(user: MaybeUser): boolean {
  return user?.role === 'admin'
}

/** Convenience wrapper for Payload collection/field `access` callbacks. */
export function isAdminAccess({ req }: { req: PayloadRequest }): boolean {
  return isAdmin(req.user as MaybeUser)
}

/** Any authenticated staff user (used for field-level cost/price hiding). */
export function isAuthenticatedAccess({ req }: { req: PayloadRequest }): boolean {
  return Boolean(req.user)
}
