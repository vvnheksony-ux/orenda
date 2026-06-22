import Image from 'next/image'

// Shown automatically during route navigation while the next page loads.
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-[64px] h-[64px] animate-pulse">
          <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="64px" className="object-contain" priority />
        </div>
        <div className="w-9 h-9 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
