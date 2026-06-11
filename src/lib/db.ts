// eslint-disable-next-line @typescript-eslint/no-var-requires
const pg = require('pg')

let _pool: any = null

export function getRawPool(): any {
  if (!_pool) {
    _pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }
  return _pool
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const BUCKET = 'orienda-media'

/** Convert Payload media row to public Supabase Storage URL */
export function mediaStorageUrl(filename: string | null, prefix: string | null): string | null {
  if (!filename) return null
  const p = prefix ? `${prefix}/` : ''
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}${filename}`
}
