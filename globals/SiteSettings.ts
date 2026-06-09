import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

const LOCALES = ['fr', 'en', 'de', 'nl'] as const

function revalidatePublicSite(): void {
  try {
    revalidatePath('/', 'layout')
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}`, 'layout')
    }
  } catch (err) {
    console.warn('[site-settings] revalidate skipped:', err)
  }
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Paramètres du site',
  lockDocuments: false,
  access: {
    read: () => true,
  },
  admin: {
    group: 'Admin',
    description:
      'Activez pour afficher la page « site en cours de mise à jour » aux visiteurs. L’admin reste accessible.',
  },
  hooks: {
    afterChange: [
      async () => {
        revalidatePublicSite()
      },
    ],
  },
  fields: [
    {
      name: 'comingSoonEnabled',
      type: 'checkbox',
      label: 'Site en maintenance (ON / OFF)',
      defaultValue: false,
      admin: {
        description:
          'ON = les visiteurs voient un message de mise à jour. OFF = site normal.',
      },
    },
  ],
}
