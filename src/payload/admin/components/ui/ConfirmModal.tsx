'use client'

import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

type Props = {
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: Props) {
  // Render in document.body so z-index is in root stacking context (not trapped by Payload layout ancestors)
  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      className="orienda-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <button
          className="absolute right-4 top-4 rounded-lg border-none bg-transparent p-1 text-[#8c8982] hover:text-[#393733]"
          onClick={onCancel}
          type="button"
        >
          <X size={16} />
        </button>
        <p className="mb-6 mt-0 text-sm text-[#393733] leading-relaxed pr-4">{message}</p>
        <div className="flex gap-3">
          <button
            className={`rounded-xl border-none px-5 py-2.5 text-sm font-bold text-white ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#b89148] hover:bg-[#a37d3e]'
            }`}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
          <button
            className="rounded-xl border border-[#e7dfd5] bg-white px-5 py-2.5 text-sm font-bold text-[#716b60] hover:bg-[#f4f0eb]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
