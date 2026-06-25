// eslint-disable-next-line @typescript-eslint/no-var-requires
const pg = require('pg')

declare global {
  var __rawPool: any
}

function getRawPool(): any {
  if (!global.__rawPool) {
    const connStr = (() => {
      const url = new URL(process.env.DATABASE_URL || '')
      url.searchParams.set('pgbouncer', 'true')
      url.searchParams.set('prepare_threshold', '0')
      return url.toString()
    })()

    global.__rawPool = new pg.Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }
  return global.__rawPool
}

export { getRawPool }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const BUCKET = 'orienda-media'

/** Convert Payload media row to public Supabase Storage URL */
export function mediaStorageUrl(filename: string | null, prefix: string | null): string | null {
  if (!filename) return null
  const p = prefix ? `${prefix}/` : ''
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}${filename}`
}
