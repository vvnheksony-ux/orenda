declare module 'pg' {
  export type QueryResult<T> = {
    rows: T[]
  }

  export class Client {
    constructor(config: { connectionString: string })
    connect(): Promise<void>
    query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<T>>
    end(): Promise<void>
  }
}
