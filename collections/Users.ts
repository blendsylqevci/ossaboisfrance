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
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      // Only admins can change roles (no self-promotion). Everyone can read
      // their own role via the JWT.
      access: {
        update: isAdminAccess,
      },
      saveToJWT: true,
      options: [
        { label: 'Admin (full access)', value: 'admin' },
        { label: 'Editor (no customer PII / no pricing)', value: 'editor' },
      ],
      admin: {
        description:
          'Admin = full access including Orders (customer PII) and pricing. Editor = restricted.',
      },
    },
  ],
}
