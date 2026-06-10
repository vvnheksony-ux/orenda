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
          initial={{ y: 100, x: 100, opacity: 0 }}
          animate={{ y: 0, x: 0, opacity: 1 }}
          exit={{ y: 100, x: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-[9999] w-full max-w-[500px] p-2"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] p-6 shadow-[0_16px_40px_rgba(107,90,69,0.2)] border border-gold-100 flex flex-col gap-4">
            
            {/* Compact Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                  <Cookie size={22} />
                </div>
                <h3 className="font-cormorant font-bold text-[22px] text-gold-900 leading-none">
                  {t('welcome')}
                </h3>
              </div>
              <button 
                onClick={handleDecline}
                className="text-gold-300 hover:text-gold-500 transition-colors"
                title="Refuse all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simple Description */}
            <div className="flex flex-col gap-2">
              <p className="font-dm-sans text-[13px] text-gold-800 leading-relaxed">
                {t('description1')}{' '}
                {t('description2')}{' '}
                <Link href="/privacy-policy" className="text-gold-600 font-bold hover:underline">
                  {t('privacyPolicy')}
                </Link>.
              </p>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="self-start text-gold-500 font-medium text-[12px] hover:text-gold-700 transition-colors inline-flex items-center gap-0.5"
              >
                {showDetails ? 'Hide technical details' : 'View technical details'}
                {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
                  <div className="pt-2 border-t border-gold-50 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-dm-sans font-bold text-[12px] text-gold-900">{t('table.ga')}</p>
                      <p className="font-dm-sans text-[11px] text-gold-600">{t('table.gaDesc')}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-dm-sans font-bold text-[12px] text-gold-900">{t('table.website')}</p>
                      <p className="font-dm-sans text-[11px] text-gold-600">{t('table.websiteDesc')}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleDecline}
                className="flex-1 py-4 rounded-full bg-gold-50 border border-gold-200 text-gold-800 font-dm-sans text-[12px] font-bold uppercase tracking-wider hover:bg-gold-100 transition-colors shadow-sm"
              >
                {t('decline')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-4 rounded-full text-white font-dm-sans text-[12px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(184,145,72,0.25)]"
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
