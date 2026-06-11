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
