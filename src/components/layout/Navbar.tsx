'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from '@/i18n/routing'
import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Building2, Menu, X, Phone, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useAnalytics } from '@/lib/use-analytics'
import { LocaleCode } from '@/payload/constants'

const NAV_ITEMS = [
  { key: 'about',      href: '/about'       },
  { key: 'doctors',    href: '/doctors'     },
  { key: 'promotions', href: '/promotions'  },
  { key: 'news',       href: '/news'        },
  { key: 'career',     href: '/career'      },
  { key: 'testimonials', href: '/testimonials' },
]

export default function Navbar() {
  const t = useTranslations('Navbar')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { trackLanguageSwitch, trackCallClick } = useAnalytics()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [phoneOpen, setPhoneOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)

  const LANGUAGES = [
    { code: 'en', label: 'English', flag: '/images/en-flag.svg', short: 'EN' },
    { code: 'km', label: 'ខ្មែរ', flag: '/images/kh-flag.svg', short: 'KH' },
    { code: 'zh', label: '中文', flag: '/images/zh-flag.svg', short: 'ZH' },
  ]
  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
      if (phoneRef.current && !phoneRef.current.contains(event.target as Node)) {
        setPhoneOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(89,69,34,0.08)] border-b border-white/20 pointer-events-auto'
          : 'bg-transparent pointer-events-none'
      )}
    >
      {/* ── Desktop ── */}
      <div className="hidden xl:block pointer-events-auto transition-all duration-500">
        <div className="flex items-start justify-between w-full gap-[8px] xl:gap-[16px] pl-6 xl:pl-8 2xl:pl-[46px]">

          {/* 1. Logo */}
          <div className="flex items-start">
            <Link
              href="/"
              className="relative shrink-0 rounded-full overflow-hidden transition-all duration-500 w-[56px] h-[56px] xl:w-[60px] xl:h-[60px] 2xl:w-[96px] 2xl:h-[96px] mt-4 xl:mt-6 2xl:mt-10 mb-4 xl:mb-6 2xl:mb-10"
            >
              <Image
                src="/images/logo-emblem.png"
                alt="Orienda International Hospital"
                fill
                sizes="(max-width: 1535px) 80px, 96px"
                className="object-cover"
                priority
              />
            </Link>
          </div>
            
          {/* 2. Center Nav Group */}
          <div className="flex items-center justify-center gap-[4px] xl:gap-[8px] 2xl:gap-[20px] mt-4 xl:mt-6 2xl:mt-10 mb-4 xl:mb-6 2xl:mb-10">

            {/* Main Nav Pill */}
            <div
              className={cn(
                'inline-flex items-center px-[10px] xl:px-[12px] 2xl:px-[40px] py-[8px] xl:py-[10px] 2xl:py-[32px] rounded-[100px] 2xl:rounded-[32px]',
                'bg-white/30 backdrop-blur-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40',
                'transition-all duration-300'
              )}
            >
              <nav className="flex items-center gap-[24px] xl:gap-[32px] 2xl:gap-[48px]">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center leading-none whitespace-nowrap transition-all duration-200',
                        'gap-[2px] 2xl:gap-[8px]',
                        'text-[10px] xl:text-[11px] 2xl:text-[18px] font-dm-sans font-medium',
                        isActive
                          ? 'text-[#6b5a45] opacity-100 drop-shadow-sm'
                          : 'text-[#6b5a45] opacity-80 hover:opacity-100 hover:drop-shadow-sm'
                      )}
                    >
                      {t(item.key)}
                      <ChevronDown className="w-[14px] h-[14px] xl:w-[16px] xl:h-[16px] 2xl:w-[18px] 2xl:h-[18px] shrink-0 text-[#6b5a45]" strokeWidth={2} />
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* CH Dropdown */}
            <div className="relative z-50">
              <button className="flex items-center gap-[4px] 2xl:gap-[8px] px-[8px] xl:px-[10px] 2xl:px-[24px] py-[6px] xl:py-[8px] 2xl:py-[20px] rounded-[100px] 2xl:rounded-[24px] bg-white/30 backdrop-blur-lg hover:bg-white/40 transition-all duration-200 border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] shrink-0 text-[#6b5a45]">
                <Building2 className="w-[12px] h-[12px] xl:w-[14px] xl:h-[14px] 2xl:w-[22px] 2xl:h-[22px]" strokeWidth={1.5} />
                <span className="font-dm-sans text-[10px] xl:text-[11px] 2xl:text-[16px] font-medium leading-none">{t('ch')}</span>
                <ChevronDown className="w-[14px] h-[14px] xl:w-[16px] xl:h-[16px] 2xl:w-[18px] 2xl:h-[18px] shrink-0 text-[#6b5a45]" strokeWidth={2} />
              </button>
            </div>
              
            {/* Language Selector */}
            <div className="relative shrink-0 ml-[4px] xl:ml-[8px]" ref={langRef}>
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="overflow-hidden hover:opacity-90 transition-all duration-200 shrink-0 rounded-full w-[32px] h-[32px] xl:w-[36px] xl:h-[36px] 2xl:w-[48px] 2xl:h-[48px] border-[2px] xl:border-[2px] border-white shadow-sm" aria-label="Switch language">
                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <Image src={currentLang.flag} alt={currentLang.label} fill sizes="40px" className="object-cover" />
                </div>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-2xl shadow-[0_8px_32px_rgba(122,95,44,0.15)] border border-gold-100 overflow-hidden min-w-[140px] flex flex-col py-2 z-50"
                  >
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLangOpen(false)
                          trackLanguageSwitch(l.code as LocaleCode)
                          router.replace(pathname, { locale: l.code })
                        }}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 hover:bg-gold-50 transition-colors w-full text-left",
                          locale === l.code ? "bg-gold-50/50" : ""
                        )}
                      >
                        <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-black/5">
                          <Image src={l.flag} alt={l.label} fill className="object-cover" />
                        </div>
                        <span className={cn(
                          "font-dm-sans text-[14px] 2xl:text-[15px]",
                          locale === l.code ? "font-semibold text-gold-900" : "font-medium text-gold-700"
                        )}>
                          {l.label}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 3. Right Actions */}
          <div className="flex items-start shrink-0">

            {/* Right Pill: Book Appointment & Phone */}
            <div className="relative shrink-0" ref={phoneRef}>
              <div className={cn(
                "flex items-center gap-[4px] xl:gap-[6px] 2xl:gap-[12px]",
                "pt-[12px] xl:pt-[16px] 2xl:pt-[52px]",
                "pr-[12px] xl:pr-[16px] 2xl:pr-[58px]",
                "pb-[12px] xl:pb-[16px] 2xl:pb-[32px]",
                "pl-[12px] xl:pl-[16px] 2xl:pl-[40px]",
                "bg-[#f7f5f2] rounded-bl-[24px] 2xl:rounded-bl-[48px] shadow-sm border-b-[1.5px] border-l-[1.5px] border-white"
              )}>
                  <Link href="/appointments"
                    onClick={() => trackCallClick('navbar')}
                    className="hidden xl:flex items-center justify-center px-[10px] xl:px-[12px] 2xl:px-[36px] rounded-[100px] 2xl:rounded-[32px] hover:opacity-90 transition-all duration-200 h-[32px] xl:h-[36px] 2xl:h-[64px] bg-[#CEB17D]">
                    <span className="font-dm-sans text-[10px] xl:text-[11px] 2xl:text-[16px] font-medium text-white leading-none whitespace-nowrap">{t('bookAppointment')}</span>
                  </Link>
                  <button
                    onClick={() => setPhoneOpen(!phoneOpen)}
                    className="flex items-center justify-center w-[36px] h-[36px] xl:w-[40px] xl:h-[40px] 2xl:w-[64px] 2xl:h-[64px] rounded-full 2xl:rounded-[32px] bg-[#CEB17D] hover:opacity-90 transition-all duration-200">
                    <Phone className="w-[14px] h-[14px] xl:w-[16px] xl:h-[16px] 2xl:w-[24px] 2xl:h-[24px] text-white" strokeWidth={2} />
                  </button>
                </div>

                <AnimatePresence>
                  {phoneOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+12px)] xl:top-[calc(100%+16px)] left-[32px] xl:left-[44px] 2xl:left-[56px] right-[-6px] xl:right-[-8px] 2xl:right-[-46px] bg-[#e4dfd6] rounded-[24px] shadow-[0_12px_40px_rgba(122,95,44,0.2)] border-[2px] border-white overflow-hidden flex flex-col z-50"
                    >
                      <a href="tel:098888999" className="bg-[#C5A566] text-white text-center py-[16px] xl:py-[20px] font-dm-sans font-medium text-[14px] xl:text-[16px] hover:bg-[#b89a64] transition-colors">(Telegram) 098 888 999</a>
                      <a href="tel:088999666" className="border-b border-white text-[#5a4b39] text-center py-[16px] xl:py-[20px] font-dm-sans font-medium text-[14px] xl:text-[16px] hover:bg-white/50 transition-colors">(Telegram) 088 999 666</a>
                      <a href="tel:077888555" className="text-[#5a4b39] text-center py-[16px] xl:py-[20px] font-dm-sans font-medium text-[14px] xl:text-[16px] hover:bg-white/50 transition-colors">(Telegram) 077 888 555</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      {/* ── Mobile ── */}
      <div className="xl:hidden flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-lg pointer-events-auto">
        <Link href="/" className="relative w-[50px] h-[50px]">
          <Image src="/images/logo-emblem.png" alt="Logo" fill className="object-contain" />
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t p-6"
          >
            <nav className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-dm-sans text-gold-900 border-b border-gold-50 pb-2"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-4">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-xl font-bold border border-red-100"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-gold-50 text-gold-900 py-4 rounded-xl font-bold border border-gold-100"
                >
                  <User size={20} />
                  Log In
                </Link>
              )}
              <Link
                href="/appointments"
                onClick={() => { setMobileOpen(false); trackCallClick('navbar-mobile'); }}
                className="flex items-center justify-center gap-2 bg-[#d3b482] text-white py-4 rounded-xl font-bold"
              >
                <Phone size={20} />
                {t('bookAppointment')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
