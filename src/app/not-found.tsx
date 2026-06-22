import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 text-center">
      <p className="font-cormorant font-bold text-[120px] text-[#b89148] leading-none select-none">404</p>
      <h1 className="font-cormorant font-bold text-[36px] text-[#3b2d17] mt-4 mb-3">Page Not Found</h1>
      <p className="font-dm-sans text-[18px] text-[#594522] mb-8 max-w-[400px]">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center justify-center bg-[#b89148] hover:bg-[#9a7630] transition-colors text-white font-dm-sans text-[16px] px-[32px] py-[14px] rounded-[12px]"
      >
        Back to Home
      </Link>
    </div>
  )
}
