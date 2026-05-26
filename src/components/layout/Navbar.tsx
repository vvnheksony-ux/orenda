'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Building2, Menu, X, Phone, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const NAV_ITEMS = [
  { label: 'About Orienda', href: '/about' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Departments', href: '/departments' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
  { label: 'Emergency', href: '/emergency' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [flagError, setFlagError] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(89,69,34,0.08)] border-b border-white/20'
          : 'bg-transparent'
      )}
    >
      {/* ── Desktop ── */}
      <div className="hidden xl:block">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-6 xl:px-8 2xl:px-[46px] py-5 xl:py-8 2xl:py-10">

          {/* Logo */}
          <Link
            href="/"
            className="relative shrink-0 rounded-full overflow-hidden w-[78px] h-[78px] xl:w-[100px] xl:h-[100px] 2xl:w-[112px] 2xl:h-[112px]"
          >
            <Image
              src="/images/logo-emblem.png"
              alt="Orienda International Hospital"
              fill
              sizes="(max-width: 1535px) 86px, 100px"
              className="object-cover"
              priority
            />
          </Link>

          {/* Nav — centered */}
          <div className="flex justify-center min-w-0 px-2 xl:px-4 2xl:px-10">
            <nav
              className={cn(
                'inline-flex items-center p-[3px] rounded-[14px] xl:rounded-[16px] 2xl:rounded-[18px]',
                'bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(89,69,34,0.12)] border border-white/40',
                'transition-all duration-300',
                scrolled ? 'bg-white/70' : 'bg-white/50'
              )}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center rounded-[100px] leading-none whitespace-nowrap transition-all duration-200',
                      'gap-[6px] px-[11px] py-[14px]',
                      'xl:gap-[10px] xl:px-[20px] xl:py-[20px]',
                      '2xl:gap-[12px] 2xl:px-[22px] 2xl:py-[26px]',
                      'text-[12px] xl:text-[15px] 2xl:text-[16px] font-inter tracking-[0.01em]',
                      isActive
                        ? 'bg-white/70 text-gold-900 font-medium shadow-sm'
                        : 'text-neutral-700 hover:text-gold-900 hover:bg-white/40'
                    )}
                  >
                    {item.label}
                    <ChevronDown className="w-[11px] h-[11px] xl:w-[12px] xl:h-[12px] 2xl:w-[15px] 2xl:h-[15px] shrink-0 text-gold-400" strokeWidth={2} />
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right group */}
          <div className="flex items-center gap-[8px] xl:gap-[10px] 2xl:gap-[16px] shrink-0">

            <button className="flex items-center gap-[6px] xl:gap-[8px] 2xl:gap-[12px] px-[10px] xl:px-[12px] 2xl:px-[18px] py-[6px] xl:py-[8px] 2xl:py-[12px] rounded-[10px] xl:rounded-[12px] 2xl:rounded-[16px] hover:opacity-100 transition-all duration-200 bg-white/50 backdrop-blur-sm border border-white/30 shadow-sm">
              <Building2 className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] 2xl:w-[24px] 2xl:h-[24px] text-gold-700" strokeWidth={1.5} />
              <span className="font-dm-sans text-[12px] xl:text-[14px] 2xl:text-[17px] text-gold-800 leading-none">CH</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] 2xl:w-[24px] 2xl:h-[24px] text-[#9EA2AE]"><path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <button className="overflow-hidden hover:opacity-100 transition-all duration-200 shrink-0 shadow-[0_0_24px_rgba(122,95,44,0.15)] rounded-full ring-2 ring-white/50 w-[32px] h-[32px] xl:w-[36px] xl:h-[36px] 2xl:w-[44px] 2xl:h-[44px]" aria-label="Switch language">
              <div className="relative w-full h-full bg-gold-500 rounded-full overflow-hidden flex items-center justify-center">
                {flagError ? <span className="text-[9px] xl:text-[10px] 2xl:text-[13px] font-bold text-white">KH</span> : (
                  <Image src="/images/kh-flag.svg" alt="ភាសាខ្មែរ" fill sizes="(max-width: 1535px) 36px, 44px" className="object-cover" onError={() => setFlagError(true)} />
                )}
              </div>
            </button>

            {/* Auth: show user menu if logged in, else login + book */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-white/50 backdrop-blur-sm border border-white/30">
                  <User className="w-4 h-4 text-gold-700" strokeWidth={1.5} />
                  <span className="font-dm-sans text-[13px] text-gold-800 leading-none max-w-[1200px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-2 rounded-[12px] bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-colors">
                  <LogOut className="w-4 h-4 text-gold-700" strokeWidth={1.5} />
                  <span className="font-dm-sans text-[13px] text-gold-800">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-colors">
                <User className="w-4 h-4 text-gold-700" strokeWidth={1.5} />
                <span className="font-dm-sans text-[13px] text-gold-800 leading-none">Sign In</span>
              </Link>
            )}

            {/* Book Appointment */}
            <Link href="/appointments"
              className="flex items-center gap-[8px] xl:gap-[10px] 2xl:gap-[14px] px-[16px] xl:px-[28px] 2xl:px-[30px] rounded-[10px] xl:rounded-[12px] 2xl:rounded-[16px] hover:opacity-90 transition-all duration-200 shrink-0 h-[40px] xl:h-[56px] 2xl:h-[66px]"
              style={{ background: 'linear-gradient(135deg, rgba(184,145,72,0.85), rgba(160,126,60,0.90))', boxShadow: '0 4px 24px rgba(184,145,72,0.30), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <span className="font-dm-sans text-[12px] xl:text-[13px] 2xl:text-[17px] font-medium text-white leading-none whitespace-nowrap">Book Appointment</span>
              <Phone className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] 2xl:w-[24px] 2xl:h-[24px] text-white" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="xl:hidden flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-lg">
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
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-dm-sans text-gold-900 border-b border-gold-50 pb-2"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-4">
              <Link
                href="/appointments"
                className="flex items-center justify-center gap-2 bg-gold-500 text-white py-4 rounded-xl font-bold"
              >
                <Phone size={20} />
                Book Appointment
              </Link>
              {user ? (
                 <button onClick={handleSignOut} className="flex items-center justify-center gap-2 border border-gold-500 text-gold-500 py-4 rounded-xl font-bold">
                   <LogOut className="w-4 h-4 text-gold-700" strokeWidth={1.5} />
                   Sign Out
                 </button>
              ) : (
                <Link href="/login" className="flex items-center justify-center gap-2 border border-gold-500 text-gold-500 py-4 rounded-xl font-bold">
                   <User className="w-4 h-4 text-gold-700" strokeWidth={1.5} />
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
