import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig, type CollectionConfig } from 'payload'
import { payloadApiDocs } from './src/payload/plugins/payloadApiDocs'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'
import { Pages } from './src/payload/collections/Pages'
import { Doctors } from './src/payload/collections/Doctors'
import { Departments } from './src/payload/collections/Departments'
import { Branches } from './src/payload/collections/Branches'
import { DoctorSchedules } from './src/payload/collections/DoctorSchedules'
import { Services } from './src/payload/collections/Services'
import { ServicePackages } from './src/payload/collections/ServicePackages'
import { News } from './src/payload/collections/News'
import { Announcements } from './src/payload/collections/Announcements'
import { HealthTips } from './src/payload/collections/HealthTips'
import { Careers } from './src/payload/collections/Careers'
import { DoctorTalks } from './src/payload/collections/DoctorTalks'
import { InsuranceUpdates } from './src/payload/collections/InsuranceUpdates'
import { ContentSearchIndex } from './src/payload/collections/ContentSearchIndex'
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
  contentSearchEndpoint,
} from './src/payload/endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const enableApiDocs =
  process.env.ENABLE_API_DOCS

const oriendaListView = '@/payload/admin/components/list/OriendaListView'

function withOriendaListView(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        views: {
          ...collection.admin?.components?.views,
          list: {
            ...collection.admin?.components?.views?.list,
            Component: oriendaListView,
          },
        },
      },
    },
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '@/payload/admin/components/NavIcon',
        Logo: '@/payload/admin/components/NavIcon',
      },
      Nav: '@/payload/admin/components/navigation/OriendaPayloadNav',
      // header: ['@/payload/admin/components/header/OriendaAdminHeader'],
      views: {
        dashboard: {
          Component: '@/payload/admin/components/dashboard/OriendaDashboardView',
        },
        publicAppointments: {
          Component: '@/payload/admin/components/operations/OperationsAdminView',
          path: '/operations/appointments/:mode?/:id?',
        },
        publicInquiries: {
          Component: '@/payload/admin/components/operations/OperationsAdminView',
          path: '/operations/inquiries/:mode?/:id?',
        },
        publicPurchases: {
          Component: '@/payload/admin/components/operations/OperationsAdminView',
          path: '/operations/purchases/:mode?/:id?',
        },
      },
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
    Branches,
    DoctorSchedules,
    Services,
    ServicePackages,
    News,
    Announcements,
    HealthTips,
    Careers,
    DoctorTalks,
    InsuranceUpdates,
    ContentSearchIndex,
    Promotions,
    Faqs,
    TourScenes,
    Inquiries,
    AnalyticsEvents,
    KpiSnapshots,
    GaReports,
    AuditLogs,
    // ],
  ].map(withOriendaListView),
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
      // Prevent connection pool exhaustion in development
      max: process.env.NODE_ENV === 'production' ? 20 : 5,
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 5000, // 5 seconds
    },
    migrationDir: path.resolve(dirname, 'src/migrations'),
    push: false,
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
    ...(enableApiDocs
      ? [
          payloadApiDocs({
            openapiVersion: '3.0',
            metadata: {
              title: 'Orienda Payload API',
              version: '0.1.0',
            },
          }),
        ]
      : []),
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
    contentSearchEndpoint,
    kpiEndpoint,
    analyticsExportEndpoint,
  ],
})
