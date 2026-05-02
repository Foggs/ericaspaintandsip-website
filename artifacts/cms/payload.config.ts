import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Events } from './collections/Events.js'
import { Media } from './collections/Media.js'
import { PrivateInquiries } from './collections/PrivateInquiries.js'
import { Bookings } from './collections/Bookings.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [],
      timestamps: true,
    },
    Events,
    Media,
    PrivateInquiries,
    Bookings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    schemaName: 'payload',
    push: process.env.NODE_ENV !== 'production',
  }),
  routes: {
    admin: '/admin',
    api: '/api',
  },
})
