// `pg` ships an "exports" field without types, so bundler module-resolution
// can't pick up @types/pg for a normal import; and the project is ESM
// ("type":"module"), so a bare require() is undefined at runtime in the Payload
// CLI. createRequire works in both the bundled Next build and the ESM CLI.
import { createRequire } from 'node:module'
const nodeRequire = createRequire(import.meta.url)
const pg = nodeRequire('pg')

declare global {
  var __rawPool: any
}

/**
 * Return a connection string that bypasses PgBouncer (direct Postgres).
 * Falls back to DATABASE_URL if a direct URL can't be derived.
 */
function directConnectionString(): string {
  const custom = process.env.DIRECT_URL
  if (custom) return custom

  const url = new URL(process.env.DATABASE_URL || '')
  if (url.hostname.includes('pooler.supabase.com')) {
    const projectRef = url.username.split('.').slice(1).join('.')
    if (projectRef) {
      url.hostname = `db.${projectRef}.supabase.co`
    }
  }
  return url.toString()
}

function getRawPool(): any {
  if (!global.__rawPool) {
    global.__rawPool = new pg.Pool({
      connectionString: directConnectionString(),
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
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
