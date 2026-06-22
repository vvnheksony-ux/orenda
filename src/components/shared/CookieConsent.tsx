'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function CookieConsent() {
  const t = useTranslations('CookieConsent')
  const { user, loading } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (loading) return
    if (user) {
      setIsVisible(false)
      return
    }

    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, user])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    window.dispatchEvent(new Event('cookie-consent-updated'))
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    window.dispatchEvent(new Event('cookie-consent-updated'))
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed z-[9999] inset-x-0 bottom-0 p-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:p-0 w-full sm:max-w-[360px]"
        >
          <div className="bg-white rounded-[16px] p-4 shadow-[0_12px_32px_rgba(107,90,69,0.18)] border border-gold-100 flex flex-col gap-2.5 max-h-[80vh] overflow-y-auto">

            {/* Compact Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 shrink-0">
                  <Cookie size={15} />
                </div>
                <h3 className="font-cormorant font-bold text-[17px] text-gold-900 leading-none">
                  {t('welcome')}
                </h3>
              </div>
              <button
                onClick={handleDecline}
                className="text-gold-300 hover:text-gold-500 transition-colors"
                title="Refuse all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simple Description */}
            <div className="flex flex-col gap-1.5">
              <p className="font-dm-sans text-[11.5px] text-gold-800 leading-snug">
                {t('description1')}{' '}
                <Link href="/privacy-policy" className="text-gold-600 font-bold hover:underline">
                  {t('privacyPolicy')}
                </Link>.
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="self-start text-gold-500 font-medium text-[11px] hover:text-gold-700 transition-colors inline-flex items-center gap-0.5"
              >
                {showDetails ? 'Hide details' : 'View details'}
                {showDetails ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Expandable Details Table */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 border-t border-gold-50 flex flex-col gap-2.5">
                    <p className="font-dm-sans text-[11px] text-gold-700 leading-snug">{t('description2')}</p>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-dm-sans font-bold text-[11px] text-gold-900">{t('table.ga')}</p>
                      <p className="font-dm-sans text-[10.5px] text-gold-600 leading-snug">{t('table.gaDesc')}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-dm-sans font-bold text-[11px] text-gold-900">{t('table.website')}</p>
                      <p className="font-dm-sans text-[10.5px] text-gold-600 leading-snug">{t('table.websiteDesc')}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <button
                onClick={handleDecline}
                className="flex-1 py-2.5 rounded-full bg-gold-50 border border-gold-200 text-gold-800 font-dm-sans text-[11px] font-bold uppercase tracking-wide hover:bg-gold-100 transition-colors shadow-sm"
              >
                {t('decline')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 rounded-full text-white font-dm-sans text-[11px] font-bold uppercase tracking-wide hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(184,145,72,0.25)]"
                style={{ background: '#b89148' }}
              >
                {t('accept')}
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
