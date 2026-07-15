import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import { publicMediaUrl } from './lib/media-url'
import { buildDbSsl } from './lib/db-ssl'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { HouseCategories } from './collections/HouseCategories'
import { Houses } from './collections/Houses'
import { Orders } from './collections/Orders'
import { FieldDefinitions } from './collections/FieldDefinitions'
import { HouseOptions } from './globals/HouseOptions'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      // Required for Payload 3.x
    },
    components: {
      beforeDashboard: [
        '/components/DashboardStats#DashboardStats',
      ],
    },
  },
  collections: [
    Users,
    Media,
    HouseCategories,
    Houses,
    Orders,
    FieldDefinitions,
  ],
  globals: [
    HouseOptions,
    SiteSettings,
  ],
  editor: lexicalEditor({}),
  sharp,
  secret: process.env.PAYLOAD_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PAYLOAD_SECRET is required in production environment.')
    }
    return 'fallback-secret-for-local-dev-only'
  })(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Serverless: few connections per instance (avoids Supabase pool exhaustion).
      max: process.env.NODE_ENV === 'production' ? 2 : 10,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      // TLS: production fails closed unless DATABASE_CA_CERT is configured,
      // then verifies the Supabase certificate. See lib/db-ssl.ts.
      ssl: buildDbSsl(),
    },
    push: false,
    prodMigrations: migrations,
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
  plugins: [
    s3Storage({
      collections: {
        media: {
          // Serve media straight from Supabase's CDN (browser → CDN) instead of
          // proxying every asset through the Payload `/api/media/file` function,
          // which was uncacheable (Cache-Control: max-age=0). No quality change.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            publicMediaUrl(filename, prefix || undefined),
        },
      },
      bucket: process.env.S3_BUCKET || 'media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'eu-central-1',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
})
