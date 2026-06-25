// Resilient JSON fetch.
//
// The Supabase DB sits in Singapore behind a small connection pool, so /api
// calls occasionally fail or time out. A plain `fetch().then()` would then drop
// the caller's skeleton and show an empty result. This wrapper keeps retrying
// with a capped exponential backoff (so it never spams the server) until the
// request succeeds — the caller simply keeps `loading = true` until this
// resolves. It gives up after `retries` attempts so a truly-down API can't spin
// forever.
//
// Backoff (default): 0.6s, 1.2s, 2.4s, 4.8s, 5s, 5s ... → ~30s of retrying.
export async function fetchJsonRetry<T = unknown>(
  url: string,
  opts: { retries?: number; baseDelay?: number; signal?: AbortSignal; init?: RequestInit } = {},
): Promise<T> {
  const { retries = 8, baseDelay = 600, signal, init } = opts
  let lastErr: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    try {
      const res = await fetch(url, { ...init, signal, cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as T
    } catch (err) {
      // A caller that unmounted/aborted should stop immediately, not retry.
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      if ((err as { name?: string })?.name === 'AbortError') throw err
      lastErr = err
      if (attempt < retries) {
        const delay = Math.min(baseDelay * 2 ** attempt, 5000)
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}
