'use client'

// Last-resort boundary: catches errors in the root layout itself. It replaces
// the whole document, so it must render its own <html>/<body> with inline
// styles (the app's global CSS is not loaded here).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
        <div style={{ textAlign: 'center', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ color: '#3b2d17', fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: '#6b5836', fontSize: 15, margin: 0 }}>
            An unexpected error occurred. Please try again.
          </p>
          <div>
            <button
              onClick={reset}
              style={{ height: 46, padding: '0 26px', borderRadius: 12, background: '#b89148', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
