'use client'

import { useBranch } from '@/lib/branch-context'

const FALLBACK_EMAIL = 'hr@orienda.com'

export default function ApplyButton({ label = 'Apply for this Position' }: { label?: string }) {
  const { selectedBranch } = useBranch()
  const email = selectedBranch?.email?.trim() || FALLBACK_EMAIL

  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-[12px] font-dm-sans font-medium text-[16px] text-white transition-opacity hover:opacity-90"
      style={{ background: '#b89148' }}
    >
      {label}
    </a>
  )
}
