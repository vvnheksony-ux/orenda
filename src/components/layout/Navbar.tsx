'use client'

import Image from 'next/image'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from '@/i18n/routing'
import { useState, useEffect, useRef, useTransition } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronDown, ChevronLeft, Building2, LogIn, LogOut, Phone, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAnalytics } from '@/lib/use-analytics'
import { LocaleCode } from '@/payload/constants'
import { Link } from '@/i18n/routing'
import { useScrollLock } from '@/lib/useScrollLock'
import { useBranch } from '@/lib/branch-context'
import BookAppointmentModal from '@/components/shared/BookAppointmentModal'
import SignOutModal from '@/components/shared/SignOutModal'
import { useAuth } from '@/lib/auth-context'

type NavChild = { key: string; href: string }
type NavItem  = { key: string; href: string; children?: NavChild[] }

const NAV_ITEMS: NavItem[] = [
  {
    key: 'about', href: '/about',
    children: [
      { key: 'about',   href: '/about'   },
      { key: 'faq',     href: '/#faq'    },
      { key: 'inquiry', href: '/inquiry' },
      { key: 'expect',  href: '/expect'  },
    ],
  },
  {
    key: 'doctors', href: '/doctors',
    children: [
      { key: 'doctors',     href: '/doctors'             },
      { key: 'departments', href: '/departments'          },
      { key: 'centers',     href: '/centers-of-excellence'},
    ],
  },
  {
    key: 'promotions', href: '/promotions',
    children: [
      { key: 'promotions', href: '/promotions' },
      { key: 'insurance',  href: '/insurance' },
    ],
  },
  {
    key: 'news', href: '/news',
    children: [
      { key: 'news',        href: '/news'         },
      { key: 'healthTip',   href: '/health-tips'  },
      { key: 'doctorTalks', href: '/doctor-talks' },
    ],
  },
  { key: 'career',       href: '/career'       },
  { key: 'testimonials', href: '/testimonials' },
]

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '/images/flags/en.svg' },
  { code: 'km', label: 'ខ្មែរ',   flag: '/images/flags/km.svg' },
  { code: 'zh', label: '中文',    flag: '/images/flags/zh.svg' },
]

// Desktop nav dropdown: panel fades/slides in, then child items cascade in one
// by one (staggered). Variants propagate the hidden/show/exit label down the tree.
const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -6 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.12, ease: 'easeIn' } },
}

const dropdownPanelVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.045, delayChildren: 0.03 } },
  exit:   {},
}

const dropdownItemVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, transition: { duration: 0.08 } },
}

export default function Navbar() {
  const t          = useTranslations('Navbar')
  const locale     = useLocale()
  const pathname   = usePathname()
  const router     = useRouter()
  const { trackLanguageSwitch, trackCallClick } = useAnalytics()
  const [isLocaleSwitching, startLocaleSwitch] = useTransition()
  const { branches, selectedBranch, switchBranch, ready: branchReady } = useBranch()
  const { user } = useAuth()

  const [mobileOpen,        setMobileOpen]        = useState(false)
  const [langOpen,          setLangOpen]          = useState(false)
  const [mobileLangOpen,    setMobileLangOpen]    = useState(false)
  const [phoneOpen,         setPhoneOpen]         = useState(false)
  const [accountOpen,       setAccountOpen]       = useState(false)
  const [branchOpen,        setBranchOpen]        = useState(false)
  const [bookOpen,          setBookOpen]          = useState(false)
  const [signOutOpen,       setSignOutOpen]       = useState(false)
  const [switchingBranch,   setSwitchingBranch]   = useState(false)
  const [hoveredKey,        setHoveredKey]        = useState<string | null>(null)
  const [mobileExpandedKey, setMobileExpandedKey] = useState<string | null>(null)
  // The drawer is portaled to <body>, so guard against SSR where document is absent.
  const [mounted,           setMounted]           = useState(false)
  // The portal only exists after hydration, so this one-time flip is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  // Lock background scroll while the mobile menu is open.
  useScrollLock(mobileOpen)

  const langRef   = useRef<HTMLDivElement>(null)
  const phoneRef  = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const branchRef = useRef<HTMLDivElement>(null)
  const mobileBranchRef = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

  // Show "Branch 1" / "Branch 2" so users can see which branch is active.
  // Branch names end in a Roman numeral ("...Hospital I" / "...II").
  const branchNumeral = ({ I: 'I', II: 'II', III: 'III' } as Record<string, string>)[
    selectedBranch?.name.trim().split(/\s+/).pop()?.toUpperCase() ?? ''
  ]
  const branchLabel = branchNumeral ? `Branch ${branchNumeral}` : branchReady ? 'Branch' : 'Branch I'

  // Switching branch changes branch-specific content site-wide, so show a brief
  // loading screen and send the user home where the new branch data loads.
  const handleSwitchBranch = (b: { id: string; name: string; slug: string }) => {
    if (selectedBranch?.id === b.id) { setBranchOpen(false); setMobileOpen(false); return }
    switchBranch(b)
    setBranchOpen(false)
    setMobileOpen(false)
    setSwitchingBranch(true)
    router.push('/')
    setTimeout(() => setSwitchingBranch(false), 2200)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current   && !langRef.current.contains(e.target as Node))   setLangOpen(false)
      if (phoneRef.current  && !phoneRef.current.contains(e.target as Node))  setPhoneOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
      // Branch dropdown is shared between the desktop bar and the mobile drawer;
      // only close it when the click is outside BOTH triggers, otherwise the
      // mobile dropdown unmounts on mousedown before a selection can register.
      const insideDesktopBranch = branchRef.current?.contains(e.target as Node)
      const insideMobileBranch = mobileBranchRef.current?.contains(e.target as Node)
      if (!insideDesktopBranch && !insideMobileBranch) setBranchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = () => {
    setAccountOpen(false)
    setMobileOpen(false)
    setSignOutOpen(true)
  }

  return (
    <>
    {switchingBranch && (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#fbf7ee] pointer-events-auto">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-[64px] h-[64px] animate-pulse">
            <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="64px" className="object-contain" priority />
          </div>
          <div className="w-9 h-9 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
          <p className="font-dm-sans text-[14px] text-[#6b5836]">{t('switchingBranch')}</p>
        </div>
      </div>
    )}
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent pointer-events-none">

      {/* ── Desktop (≥ 1536px) ── */}
      <div className="hidden min-[1500px]:block pointer-events-auto transition-all duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-8 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 w-full">

          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="relative shrink-0 w-[72px] h-[92px] transition-all duration-300">
              <Image src="/images/logo-emblem.png" alt="Orienda International Hospital" fill sizes="72px" className="object-contain" priority />
            </Link>
          </div>

          {/* Center: Nav pill + Branch + Lang */}
          <div className="flex items-center gap-[6px]">

            {/* Nav pill */}
            <div className="flex items-center p-[2px] rounded-[24px] border border-white/50 shadow-[0_8px_32px_rgba(122,95,44,0.08)] bg-[#FBF7EE]/40 backdrop-blur-md">
              <nav className="flex items-center px-[10px] overflow-visible">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const hasChildren = !!item.children?.length
                  const isHovered = hoveredKey === item.key
                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={() => hasChildren && setHoveredKey(item.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center justify-center py-[26px] px-[10px] rounded-[22px] gap-[6px] hover:bg-white/50 transition-colors shrink-0 min-w-[92px]"
                      >
                        <span className={cn(
                          'text-[14px] font-inter leading-none whitespace-nowrap',
                          isActive ? 'text-[#3B2D17] font-semibold' : 'text-[#2A2620] font-normal'
                        )}>
                          {t(item.key)}
                        </span>
                        <ChevronDown
                          className={cn('w-[14px] h-[14px] shrink-0 text-[#7a5f2c] transition-transform duration-200', hasChildren ? 'block' : 'hidden', isHovered && 'rotate-180')}
                          strokeWidth={2}
                        />
                      </Link>
                      {hasChildren && (
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              variants={dropdownVariants}
                              initial="hidden"
                              animate="show"
                              exit="exit"
                              className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50"
                              style={{ filter: 'drop-shadow(0 12px 28px rgba(122,95,44,0.20))' }}
                            >
                              {/* Arrow pointer */}
                              <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FBF7EE]/90 border-l border-t border-white/70 rotate-45 rounded-tl-[2px]" />
                              <motion.div
                                variants={dropdownPanelVariants}
                                className="relative bg-[#FBF7EE]/90 backdrop-blur-xl rounded-[18px] border border-white/70 min-w-[212px] flex flex-col p-[6px]"
                              >
                                {item.children!.map((child) => (
                                  <motion.div key={child.key} variants={dropdownItemVariants}>
                                    <Link
                                      href={child.href}
                                      onClick={() => setHoveredKey(null)}
                                      className="group flex items-center gap-[11px] px-4 py-[10px] rounded-[12px] hover:bg-white/70 transition-colors"
                                    >
                                      <span className="w-[3px] h-[15px] rounded-full bg-[#b89148]/35 transition-all duration-200 group-hover:h-[18px] group-hover:bg-[#b89148] shrink-0" />
                                      <span className="font-dm-sans text-[13px] text-[#3b2d17] whitespace-nowrap leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                                        {t(child.key)}
                                      </span>
                                    </Link>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>

            {/* Branch selector */}
            <div className="relative z-50" ref={branchRef}>
              <button
                onClick={() => setBranchOpen(!branchOpen)}
                className={cn(
                  'flex min-w-[138px] items-center justify-center py-[14px] px-[12px] gap-[6px] rounded-[16px] border border-white/50 shadow-[0_8px_32px_rgba(122,95,44,0.08)] hover:bg-[#F5ECD4]/60 transition-all duration-200 bg-[#F5ECD4]/40 backdrop-blur-md shrink-0'
                )}
              >
                <Building2 className="w-[22px] h-[22px] text-[#3B2D17] shrink-0" strokeWidth={1.5} />
                <span className="min-w-[68px] font-dm-sans text-[14px] text-[#3B2D17] font-normal leading-none whitespace-nowrap text-left">
                  {branchLabel}
                </span>
                <ChevronDown className="w-[14px] h-[14px] text-[#3B2D17] shrink-0" strokeWidth={2} />
              </button>
              <AnimatePresence>
                {branchOpen && branches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(122,95,44,0.15)] border border-gold-100 overflow-hidden min-w-[200px] flex flex-col py-2 z-50"
                  >
                    {branches.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSwitchBranch(b)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 hover:bg-gold-50 transition-colors w-full text-left',
                          selectedBranch?.id === b.id ? 'bg-gold-50/50' : ''
                        )}
                      >
                        <Building2 size={15} className="text-[#b89148] shrink-0" />
                        <span className={cn('font-dm-sans text-[13px]', selectedBranch?.id === b.id ? 'font-semibold text-gold-900' : 'text-gold-700')}>
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language flag */}
            <div className="relative shrink-0" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center justify-center w-[54px] h-[54px] p-[3px] rounded-full bg-[#F5ECD4]/40 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(122,95,44,0.08)] hover:opacity-90 transition-all duration-200"
                aria-label="Switch language"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image src={currentLang.flag} alt={currentLang.label} fill sizes="48px" className="object-cover" />
                </div>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(122,95,44,0.15)] border border-gold-100 overflow-hidden min-w-[140px] flex flex-col py-2 z-50"
                  >
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLangOpen(false); trackLanguageSwitch(l.code as LocaleCode); startLocaleSwitch(() => router.replace(pathname, { locale: l.code })) }}
                        className={cn('flex items-center gap-3 px-4 py-2 hover:bg-gold-50 transition-colors w-full text-left', locale === l.code ? 'bg-gold-50/50' : '')}
                      >
                        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 shadow-sm border border-black/5">
                          <Image src={l.flag} alt={l.label} fill className="object-cover" />
                        </div>
                        <span className={cn('font-dm-sans text-[13px]', locale === l.code ? 'font-semibold text-gold-900' : 'font-medium text-gold-700')}>
                          {l.label}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account */}
            <div className="relative shrink-0 min-w-[126px] flex justify-end" ref={accountRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center justify-center w-[54px] h-[54px] rounded-full overflow-hidden bg-[#B89148]/85 border border-white/50 shadow-[0_8px_32px_rgba(122,95,44,0.08)] hover:bg-[#B89148] transition-all duration-200"
                    aria-label={t('profile')}
                  >
                    {user.user_metadata?.photo_url ? (
                      <Image src={user.user_metadata.photo_url} alt={t('profile')} width={54} height={54} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <UserRound className="w-[24px] h-[24px] text-white" strokeWidth={1.8} />
                    )}
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(122,95,44,0.15)] border border-gold-100 overflow-hidden min-w-[160px] flex flex-col py-2 z-50"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold-50 transition-colors font-dm-sans text-[13px] text-gold-900"
                        >
                          <UserRound size={15} className="text-[#b89148]" />
                          {t('profile')}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold-50 transition-colors font-dm-sans text-[13px] text-gold-900 text-left"
                        >
                          <LogOut size={15} className="text-[#b89148]" />
                          {t('signOut')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center h-[54px] px-[14px] rounded-[16px] bg-[#F5ECD4]/40 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(122,95,44,0.08)] hover:bg-[#F5ECD4]/60 transition-all duration-200 gap-2"
                >
                  <LogIn size={18} className="text-[#3b2d17]" />
                  <span className="font-dm-sans text-[14px] text-[#3b2d17] whitespace-nowrap">{t('signIn')}</span>
                </Link>
              )}
            </div>

          </div>

          {/* Right: Book Appointment + Phone */}
          <div className="relative flex items-center justify-end min-w-0 gap-[6px]" ref={phoneRef}>
            <button
              onClick={() => { trackCallClick('navbar'); setBookOpen(true) }}
              className="flex items-center justify-center h-[56px] px-[16px] rounded-[14px] bg-[#B89148]/80 shadow-[0_0_12px_rgba(184,145,72,0.20)] hover:bg-[#B89148] transition-all duration-200 shrink-0"
            >
              <span className="font-dm-sans text-[14px] font-normal text-[#F9F9F9] whitespace-nowrap">{t('bookAppointment')}</span>
            </button>
            <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} />
            <SignOutModal open={signOutOpen} onClose={() => setSignOutOpen(false)} />

            <button
              onClick={() => setPhoneOpen(!phoneOpen)}
              className="flex items-center justify-center h-[56px] w-[56px] rounded-[14px] bg-[#B89148]/80 shadow-[0_0_12px_rgba(184,145,72,0.20)] hover:bg-[#B89148] transition-all duration-200 shrink-0"
            >
              <Phone className="w-[22px] h-[22px] text-[#F9F9F9]" strokeWidth={2} />
            </button>

            <AnimatePresence>
              {phoneOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+12px)] right-0 min-w-[240px] bg-[#e4dfd6] rounded-[20px] shadow-[0_12px_40px_rgba(122,95,44,0.2)] border-2 border-white overflow-hidden flex flex-col z-50"
                >
                  <a href="tel:098888999" className="bg-[#C5A566] text-white text-center py-[14px] font-dm-sans font-medium text-[15px] hover:bg-[#b89a64] transition-colors">(Telegram) 098 888 999</a>
                  <a href="tel:088999666" className="border-b border-white text-[#5a4b39] text-center py-[14px] font-dm-sans font-medium text-[15px] hover:bg-white/50 transition-colors">(Telegram) 088 999 666</a>
                  <a href="tel:077888555" className="text-[#5a4b39] text-center py-[14px] font-dm-sans font-medium text-[15px] hover:bg-white/50 transition-colors">(Telegram) 077 888 555</a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        </div>
      </div>

      {/* ── Mobile / tablet trigger (< 1536px) ── */}
      <div className="min-[1500px]:hidden w-full max-w-[1512px] mx-auto px-5 py-4 pointer-events-auto">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-[12px] bg-[#fbf7ee]/50 backdrop-blur-md rounded-[28px] px-[20px] py-[6px]"
        >
          <div className="relative shrink-0" style={{ width: 42, height: 55 }}>
            <Image src="/images/logo-emblem.png" alt="Logo" fill sizes="42px" className="object-contain" />
          </div>
          <span className="font-cormorant font-bold text-[#3b2d17] leading-none" style={{ fontSize: 28 }}>Orienda</span>
        </button>
      </div>

      {/* ── Mobile drawer (portaled to <body> to escape the header's z-50 stacking
           context, so it sits above the cookie banner and floating chat) ── */}
      {/* Locale-switch loading overlay — covers the page until the new language is ready */}
      {mounted && isLocaleSwitching && createPortal(
        <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-[#faf9f6]/80" aria-live="polite" aria-busy="true">
          <div className="w-12 h-12 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
        </div>,
        document.body
      )}

      {mounted && createPortal(
        <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="min-[1500px]:hidden fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[10000] pointer-events-auto"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
              className="min-[1500px]:hidden fixed top-0 left-0 h-full bg-[#fbf7ee] z-[10001] flex flex-col pointer-events-auto shadow-[4px_0_40px_rgba(59,45,23,0.12)]"
              style={{ width: 280 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#ead6a4]/40">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-[8px]">
                  <div className="relative shrink-0" style={{ width: 32, height: 42 }}>
                    <Image src="/images/logo-emblem.png" alt="Logo" fill sizes="32px" className="object-contain" />
                  </div>
                  <span className="font-cormorant font-bold text-[#3b2d17] leading-none text-[22px]">Orienda</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-[8px] hover:bg-[#f5ecd4] transition-colors text-[#3b2d17]">
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Branch selector */}
              <div ref={mobileBranchRef} className="flex flex-col gap-2 px-4 py-4 border-b border-[#ead6a4]/40">
                <button
                  onClick={() => setBranchOpen(!branchOpen)}
                  className="flex min-h-[42px] items-center gap-2 bg-[#f5ecd4]/60 rounded-[12px] px-3 py-2.5"
                >
                  <Building2 size={16} className="text-[#3b2d17] shrink-0" />
                  <span className="font-dm-sans text-[14px] text-[#3b2d17] leading-none flex-1 text-left truncate">
                    {selectedBranch?.name ?? (branchReady ? 'Select Branch' : 'Loading branch...')}
                  </span>
                  <ChevronDown size={12} className="text-[#7a5f2c] shrink-0" />
                </button>
                {branchOpen && branches.length > 0 && (
                  <div className="flex flex-col bg-white rounded-[12px] shadow border border-gold-100 overflow-hidden">
                    {branches.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSwitchBranch(b)}
                        className={cn('flex items-center gap-2 px-4 py-3 text-left hover:bg-gold-50 transition-colors', selectedBranch?.id === b.id ? 'bg-gold-50/50' : '')}
                      >
                        <Building2 size={13} className="text-[#b89148] shrink-0" />
                        <span className={cn('font-dm-sans text-[13px]', selectedBranch?.id === b.id ? 'font-semibold text-gold-900' : 'text-gold-800')}>
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav items */}
              <nav className="flex flex-col px-4 py-3 gap-[2px] flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const hasChildren = !!item.children?.length
                  const isExpanded = mobileExpandedKey === item.key
                  return (
                    <div key={item.key}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={() => { if (!hasChildren) setMobileOpen(false) }}
                          className={cn(
                            'flex-1 flex items-center px-4 py-3.5 rounded-[12px] font-dm-sans text-[15px] transition-colors',
                            isActive ? 'bg-[#f5ecd4]/60 font-semibold text-[#3b2d17]' : 'text-[#3b2d17] hover:bg-[#f5ecd4]/40'
                          )}
                        >
                          {t(item.key)}
                        </Link>
                        {hasChildren && (
                          <button
                            onClick={() => setMobileExpandedKey(isExpanded ? null : item.key)}
                            className="p-2 rounded-[10px] hover:bg-[#f5ecd4]/40 transition-colors"
                          >
                            <ChevronDown size={15} className={cn('text-[#7a5f2c] transition-transform duration-200', isExpanded && 'rotate-180')} />
                          </button>
                        )}
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="flex flex-col pl-4 gap-[2px] pb-1">
                          {item.children!.map(child => (
                            <Link
                              key={child.key}
                              href={child.href}
                              onClick={() => { setMobileOpen(false); setMobileExpandedKey(null) }}
                              className="flex items-center px-4 py-2.5 rounded-[10px] font-dm-sans text-[14px] text-[#7a5f2c] hover:bg-[#f5ecd4]/40 transition-colors"
                            >
                              {t(child.key)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>

              {/* Bottom: Book Appt + Account + Language */}
              <div className="px-4 pb-8 pt-3 flex flex-col gap-3 border-t border-[#ead6a4]/40">
                <button
                  onClick={() => { setMobileOpen(false); setBookOpen(true) }}
                  className="flex items-center justify-center h-[48px] rounded-[12px] bg-[#B89148]/80 font-dm-sans text-[14px] text-white hover:bg-[#B89148] transition-colors"
                >
                  {t('bookAppointment')}
                </button>
                {user ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 h-[44px] rounded-[12px] border border-[#dcbd72] font-dm-sans text-[14px] text-[#3b2d17] hover:bg-[#f5ecd4]/50 transition-colors"
                    >
                      <UserRound size={16} />
                      {t('profile')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 h-[44px] rounded-[12px] border border-[#dcbd72] font-dm-sans text-[14px] text-[#3b2d17] hover:bg-[#f5ecd4]/50 transition-colors"
                    >
                      <LogOut size={16} />
                      {t('signOut')}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 h-[44px] rounded-[12px] border border-[#dcbd72] font-dm-sans text-[14px] text-[#3b2d17] hover:bg-[#f5ecd4]/50 transition-colors"
                  >
                    <LogIn size={16} />
                    {t('signIn')}
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMobileLangOpen(!mobileLangOpen)}
                    className="relative w-[34px] h-[34px] rounded-full overflow-hidden ring-2 ring-[#b89148]/60 hover:ring-[#b89148] transition-all"
                    aria-label="Switch language"
                  >
                    <Image src={currentLang.flag} alt={currentLang.label} fill className="object-cover" />
                  </button>
                  <AnimatePresence>
                    {mobileLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-[calc(100%+8px)] left-0 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(122,95,44,0.15)] border border-gold-100 overflow-hidden min-w-[140px] flex flex-col py-2 z-50"
                      >
                        {LANGUAGES.map(l => (
                          <button
                            key={l.code}
                            onClick={() => { setMobileLangOpen(false); setMobileOpen(false); trackLanguageSwitch(l.code as LocaleCode); startLocaleSwitch(() => router.replace(pathname, { locale: l.code })) }}
                            className={cn('flex items-center gap-3 px-4 py-2 hover:bg-gold-50 transition-colors w-full text-left', locale === l.code ? 'bg-gold-50/50' : '')}
                          >
                            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 shadow-sm border border-black/5">
                              <Image src={l.flag} alt={l.label} fill className="object-cover" />
                            </div>
                            <span className={cn('font-dm-sans text-[13px]', locale === l.code ? 'font-semibold text-gold-900' : 'font-medium text-gold-700')}>
                              {l.label}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}

    </header>
    </>
  )
}
