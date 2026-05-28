'use client'

import { useState, useEffect } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'

export default function CookieTestPage() {
  const [consentStatus, setConsentStatus] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    const checkConsent = () => {
      const status = localStorage.getItem('cookie-consent')
      setConsentStatus(status)
      setLastUpdated(new Date().toLocaleTimeString())
    }

    checkConsent()
    // Check every second to see if the user clicked the modal
    const interval = setInterval(checkConsent, 1000)
    return () => clearInterval(interval)
  }, [])

  const resetConsent = () => {
    localStorage.removeItem('cookie-consent')
    window.location.reload()
  }

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[200px] pb-20 px-5 bg-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gold-50/50 p-10 rounded-[32px] border border-gold-100 shadow-xl text-center">
          <h1 className="font-cormorant font-bold text-[40px] text-gold-900 mb-6">Cookie Test Lab</h1>
          
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gold-100 mb-8">
            <p className="font-dm-sans text-[14px] text-gold-500 uppercase tracking-widest mb-2">Current Status</p>
            <p className={`font-dm-sans font-bold text-[24px] ${consentStatus === 'accepted' ? 'text-green-600' : consentStatus === 'declined' ? 'text-red-600' : 'text-gold-400'}`}>
              {consentStatus ? consentStatus.toUpperCase() : 'NO CHOICE MADE'}
            </p>
            <p className="font-dm-sans text-[11px] text-gold-300 mt-2">Last checked: {lastUpdated}</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-dm-sans text-[14px] text-gold-800 leading-relaxed">
              Click the button below to clear your choice and refresh the page. This will trigger the Cookie Modal again.
            </p>
            <button
              onClick={resetConsent}
              className="w-full py-4 rounded-full bg-gold-600 text-white font-dm-sans font-bold text-[16px] hover:opacity-90 transition-opacity shadow-lg"
              style={{ background: '#b89148' }}
            >
              Reset & Retest Modal
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-gold-100 text-left">
            <h3 className="font-dm-sans font-bold text-gold-900 text-[14px] mb-3">What we are testing:</h3>
            <ul className="flex flex-col gap-2 font-dm-sans text-[13px] text-gold-700">
              <li className="flex items-start gap-2">
                <span className="text-gold-500">✔</span> Modal appears if status is NULL
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500">✔</span> &quot;Accept&quot; saves &apos;accepted&apos; to LocalStorage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500">✔</span> &quot;Decline&quot; saves &apos;declined&apos; to LocalStorage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500">✔</span> Modal disappears after choice is made
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
