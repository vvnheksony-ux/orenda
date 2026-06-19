'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { RefreshCw } from 'lucide-react'

// Catches runtime errors thrown anywhere under the locale layout so a single
// failing component shows a friendly recovery screen instead of crashing.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#fbf7ee] flex items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="relative w-[64px] h-[64px] opacity-90">
          <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="64px" className="object-contain" priority />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-cormorant font-bold text-[34px] text-[#3b2d17] leading-none">Something went wrong</h1>
          <p className="font-dm-sans text-[15px] text-[#6b5836]">
            We hit an unexpected error. Please try again — if it keeps happening, refresh the page or come back shortly.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-[48px] px-7 rounded-[12px] bg-[#b89148] hover:bg-[#9a7630] text-white font-dm-sans font-semibold text-[15px] transition-colors"
          >
            <RefreshCw size={17} /> Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center h-[48px] px-7 rounded-[12px] border border-[#dcbd72] text-[#6b5836] font-dm-sans text-[15px] hover:bg-white transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  )
}
