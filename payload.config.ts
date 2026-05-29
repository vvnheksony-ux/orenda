import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'
import { Pages } from './src/payload/collections/Pages'
import { Doctors } from './src/payload/collections/Doctors'
import { Departments } from './src/payload/collections/Departments'
import { Services } from './src/payload/collections/Services'
import { News } from './src/payload/collections/News'
import { Promotions } from './src/payload/collections/Promotions'
import { Faqs } from './src/payload/collections/Faqs'
import { TourScenes } from './src/payload/collections/TourScenes'
import { Inquiries } from './src/payload/collections/Inquiries'
import { AnalyticsEvents } from './src/payload/collections/AnalyticsEvents'
import { KpiSnapshots } from './src/payload/collections/KpiSnapshots'
import { GaReports } from './src/payload/collections/GaReports'
import { AuditLogs } from './src/payload/collections/AuditLogs'

import { SiteSettings } from './src/payload/globals/SiteSettings'
import { OperationalSettings } from './src/payload/globals/OperationalSettings'
import { Navigation } from './src/payload/globals/Navigation'
import { SocialLinks } from './src/payload/globals/SocialLinks'

import {
  healthEndpoint,
  inquiryEndpoint,
  eventEndpoint,
  kpiEndpoint,
  analyticsExportEndpoint,
} from './src/payload/endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      title: 'Orienda CMS',
      description: 'Orienda Hospital Content Management System',
    },
  },
  collections: [
    Users,
    Media,
    Pages,
    Doctors,
    Departments,
    Services,
    News,
    Promotions,
    Faqs,
    TourScenes,
    Inquiries,
    AnalyticsEvents,
    KpiSnapshots,
    GaReports,
    AuditLogs,
  ],
  globals: [
    SiteSettings,
    OperationalSettings,
    Navigation,
    SocialLinks,
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
    migrationDir: path.resolve(dirname, 'src/migrations'),
    push: process.env.NODE_ENV !== 'production',
    schemaName: 'payload',
  }),
  sharp,
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Khmer', code: 'km' },
      { label: 'Chinese', code: 'zh' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
  ],
  routes: {
    admin: '/admin',
    api: '/payload-api',
  },
  endpoints: [
    healthEndpoint,
    inquiryEndpoint,
    eventEndpoint,
    kpiEndpoint,
    analyticsExportEndpoint,
  ],
})
