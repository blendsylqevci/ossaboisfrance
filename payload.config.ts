import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { HouseCategories } from './collections/HouseCategories'
import { Houses } from './collections/Houses'
import { Orders } from './collections/Orders'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      // Required for Payload 3.x
    },
  },
  collections: [
    Users,
    Media,
    HouseCategories,
    Houses,
    Orders,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-local-dev-only',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  localization: {
    locales: [
      { label: 'French', code: 'fr' },
      { label: 'English', code: 'en' },
      { label: 'German', code: 'de' },
      { label: 'Dutch', code: 'nl' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
