import { CollectionConfig } from 'payload'
import { isAdminAccess } from '@/lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only admins may create, edit, or delete other staff accounts (prevents a
    // low-privilege account from self-escalating or minting new admins).
    create: isAdminAccess,
    update: isAdminAccess,
    delete: isAdminAccess,
  },
  fields: [
    // Email and password are added by default by auth: true
    {
      // Stored as a plain varchar column (not a Postgres enum) so the migration
      // and any manual DB apply stay trivially safe and portable. Access checks
      // compare against the exact strings 'admin' / 'editor'; any other value is
      // treated as non-admin (fail-safe deny).
      name: 'role',
      type: 'text',
      required: true,
      defaultValue: 'admin',
      // Only admins can change roles (no self-promotion). Everyone can read
      // their own role via the JWT.
      access: {
        update: isAdminAccess,
      },
      saveToJWT: true,
      validate: (val: string | null | undefined) =>
        val === 'admin' || val === 'editor' || 'Role must be "admin" or "editor".',
      admin: {
        description:
          'Values: "admin" (full access incl. Orders PII + pricing) or "editor" (restricted).',
      },
    },
  ],
}
