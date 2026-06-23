'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { LogOut, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth-context'
import { setProfileComplete } from '@/lib/profile-status'
import { useRouter } from '@/i18n/routing'
import { useScrollLock } from '@/lib/useScrollLock'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SignOutModal({ open, onClose }: Props) {
  const t = useTranslations('SignOutModal')
  const { signOut } = useAuth()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  useScrollLock(open)

  const handleConfirm = () => {
    setSigningOut(true)
    setTimeout(async () => {
      await signOut()
      setProfileComplete(null)
      router.replace('/')
    }, 2000)
  }

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-[90vw] max-w-[400px] rounded-[22px] bg-white p-6 shadow-[0_8px_32px_rgba(122,95,44,0.2)]"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {signingOut ? (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="relative w-[64px] h-[64px] animate-pulse">
                  <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="64px" className="object-contain" priority />
                </div>
                <div className="w-9 h-9 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
                <p className="font-dm-sans text-[14px] text-[#6b5836]">{t('signingOut')}</p>
              </div>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 rounded-full text-[#6b5836] hover:text-[#3b2d17] transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex flex-col items-center gap-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ecd4] flex items-center justify-center">
                    <LogOut size={22} className="text-[#b89148]" />
                  </div>
                  <h3 className="font-cormorant text-[24px] font-bold text-[#3b2d17] leading-tight">{t('heading')}</h3>
                  <p className="font-dm-sans text-[15px] text-[#6b5836] leading-relaxed">{t('message')}</p>
                  <div className="flex gap-3 w-full mt-2">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-[12px] border border-[#dcbd72] font-dm-sans text-[14px] font-bold text-[#6b5836] hover:bg-[#f5ecd4]/50 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3 rounded-[12px] bg-[#6b5836] font-dm-sans text-[14px] font-bold text-white hover:opacity-90 transition-opacity"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
