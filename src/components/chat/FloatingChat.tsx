'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Send, X, Minimize2, Calendar, User, MapPin, FileText, Clock, ArrowLeft, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import BookAppointmentModal from '@/components/shared/BookAppointmentModal'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

type Session = {
  id: string
  date: string
  preview: string
  messages: Message[]
}

const QUICK_ACTIONS: { icon: React.ReactNode; text: string; action: 'booking' | 'navigate' | 'message'; path?: string }[] = [
  { icon: <Calendar size={11} strokeWidth={2} />, text: 'Book Appointment', action: 'booking' },
  { icon: <User size={11} strokeWidth={2} />, text: 'Find a Doctor', action: 'navigate', path: '/doctors' },
  { icon: <MapPin size={11} strokeWidth={2} />, text: 'Locations', action: 'navigate', path: '/contact' },
  { icon: <FileText size={11} strokeWidth={2} />, text: 'Medical Records', action: 'message' },
]

const FAQ_GUEST = [
  'What are your hospital opening hours?',
  'Which insurance plans do you accept?',
  'How much does a consultation cost?',
  'Do you have emergency services 24/7?',
  'What specialists are available?',
  'Where are your hospital locations?',
  'How do I book an appointment?',
  'What documents do I need for my first visit?',
  'Do you offer international patient services?',
  'What languages do your doctors speak?',
]

const FAQ_USER = [
  'How do I book an appointment?',
  'Can I reschedule my appointment?',
  'How do I view my upcoming appointments?',
  'Where can I find my medical records?',
  'How do I find a specialist for my condition?',
  'What is the cost for a follow-up visit?',
  'Do you have pharmacy services on site?',
  'How do I request a referral to a specialist?',
  'What should I bring to my appointment?',
  'How do I contact my doctor directly?',
]

const MAX_SESSIONS = 30
const MAX_MESSAGES = 20
const COOLDOWN_MS = 3000

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const INIT_MSG = (): Message => ({
  id: '1', role: 'ai',
  content: "Hello! I'm your Orienda healthcare assistant. How can I help you today?",
  timestamp: timeNow(),
})

function storageKey(userId?: string) {
  return userId ? `orienda_chat_${userId}` : 'orienda_chat_guest'
}
function loadSessions(userId?: string): Session[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]') } catch { return [] }
}
function persistSession(session: Session, userId?: string) {
  if (typeof window === 'undefined') return
  try {
    const key = storageKey(userId)
    const updated = [session, ...loadSessions(userId).filter(s => s.id !== session.id)].slice(0, MAX_SESSIONS)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}
function removeSession(id: string, userId?: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(loadSessions(userId).filter(s => s.id !== id)))
  } catch {}
}
function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function FloatingChat() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const [isOpen, setIsOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('chat') === 'open') setIsOpen(true)
  }, [])
  const [view, setView] = useState<'chat' | 'history' | 'session'>('chat')
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([INIT_MSG()])
  const [isTyping, setIsTyping] = useState(false)
  const [lastSentAt, setLastSentAt] = useState(0)
  const [faqExpanded, setFaqExpanded] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [viewingSession, setViewingSession] = useState<Session | null>(null)
  const [sessionId] = useState(() => Date.now().toString())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sendMessageRef = useRef<((text: string) => Promise<void>) | null>(null)

  const userCount = messages.filter(m => m.role === 'user').length
  const canSend = !isTyping && !!inputValue.trim() && Date.now() - lastSentAt >= COOLDOWN_MS && userCount < MAX_MESSAGES

  useEffect(() => { setSessions(loadSessions(user?.id)) }, [user?.id])

  useEffect(() => {
    if (isOpen && view === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, view])

  const saveCurrentSession = useCallback(() => {
    if (userCount === 0) return
    persistSession({
      id: sessionId,
      date: new Date().toISOString(),
      preview: messages.find(m => m.role === 'user')?.content ?? '',
      messages,
    }, user?.id)
    setSessions(loadSessions(user?.id))
  }, [messages, userCount, sessionId, user?.id])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || Date.now() - lastSentAt < COOLDOWN_MS || userCount >= MAX_MESSAGES) return
    setLastSentAt(Date.now())
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: timeNow() }])
    setIsTyping(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      const raw = await res.json()
      const data = Array.isArray(raw) ? raw[0] : raw
      const reply = data?.output ?? data?.message ?? data?.response ?? data?.text ?? JSON.stringify(data)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: reply, timestamp: timeNow() }])
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: 'Sorry, I could not reach the server. Please try again.', timestamp: timeNow() }])
    } finally {
      setIsTyping(false) }
  }

  sendMessageRef.current = sendMessage

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message: string }>).detail.message
      if (!msg) return
      setIsOpen(true); setView('chat')
      void sendMessageRef.current?.(msg)
    }
    window.addEventListener('orienda:ask-ai', handler)
    return () => window.removeEventListener('orienda:ask-ai', handler)
  }, [])

  const handleSend = () => { if (!canSend) return; sendMessage(inputValue.trim()); setInputValue('') }

  // X = save + close + reset
  const handleClose = () => {
    saveCurrentSession()
    setIsOpen(false); setView('chat')
    setMessages([INIT_MSG()]); setInputValue('')
  }

  const openHistory = () => { setSessions(loadSessions(user?.id)); setView('history') }

  // ── render helpers ──────────────────────────────────────
  const msgBubble = (msg: Message) => (
    <div key={msg.id} className={`flex flex-col gap-[4px] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className="font-dm-sans text-[13px] leading-relaxed px-[14px] py-[10px]"
        style={{
          background: msg.role === 'user' ? 'rgba(184,145,72,0.85)' : 'rgba(245,236,212,0.70)',
          color: msg.role === 'user' ? '#fff' : '#3b2d17',
          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          maxWidth: '85%', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word',
        }}
      >{msg.content}</div>
      <span className="font-dm-sans text-[#7a5f2c]/70" style={{ fontSize: 10 }}>{msg.timestamp}</span>
    </div>
  )

  return (
    <div className="fixed bottom-20 right-8 sm:bottom-6 sm:right-4 md:right-6 z-50 flex flex-col items-end">

      {isOpen && (
        <div
          className="mb-3 flex flex-col overflow-hidden"
          style={{
            width: 'min(360px, calc(100vw - 32px))', height: 500,
            background: 'rgba(251,247,238,0.98)', borderRadius: 16,
            boxShadow: '0 8px 40px rgba(59,45,23,0.18)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="shrink-0 flex items-center justify-between"
            style={{ background: '#fbf7ee', minHeight: 62, padding: '11px 17px', borderBottom: '1px solid rgba(184,145,72,0.12)' }}
          >
            <div className="flex items-center gap-[6px]">
              {(view === 'history' || view === 'session') && (
                <button
                  onClick={() => view === 'session' ? setView('history') : setView('chat')}
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-[#f5ecd4] transition-colors text-[#3b2d17]"
                ><ArrowLeft size={13} /></button>
              )}
              <div className="flex flex-col gap-[3px]">
                <span className="font-cormorant font-bold text-[#3b2d17] leading-none" style={{ fontSize: 20 }}>
                  {view === 'history' ? 'Chat History'
                    : view === 'session' ? (viewingSession?.preview.slice(0, 22) + '…')
                    : 'Orienda AI Assistant'}
                </span>
                <span className="font-dm-sans text-[#7a5f2c] leading-none" style={{ fontSize: 10 }}>
                  {view === 'chat'
                    ? (user ? `Signed in · ${user.email?.split('@')[0]}` : 'Always here to help')
                    : view === 'history'
                    ? `${sessions.length} conversation${sessions.length !== 1 ? 's' : ''}`
                    : viewingSession ? formatDate(viewingSession.date) : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              {view === 'chat' && (
                <button onClick={openHistory} title="History"
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-[#f5ecd4] transition-colors text-[#3b2d17]"
                ><Clock size={13} /></button>
              )}
              <button onClick={() => setIsOpen(false)}
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-[#f5ecd4] transition-colors text-[#3b2d17]"
              ><Minimize2 size={13} /></button>
              <button onClick={handleClose}
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-[#f5ecd4] transition-colors text-[#3b2d17]"
              ><X size={13} /></button>
            </div>
          </div>

          {/* ── History list ── */}
          {view === 'history' && (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <MessageSquare size={32} className="text-[#b89148]/30" />
                  <p className="font-dm-sans text-[13px] text-[#7a5f2c]">No past conversations yet.</p>
                  <button onClick={() => setView('chat')} className="font-dm-sans text-[12px] text-[#b89148] underline">
                    Start a new chat
                  </button>
                </div>
              ) : (
                <div className="flex flex-col p-3 gap-[6px]">
                  {sessions.map(s => {
                    const msgCount = s.messages.filter(m => m.role === 'user').length
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <button
                          onClick={() => { setViewingSession(s); setView('session') }}
                          className="flex-1 text-left rounded-[10px] px-3 py-[10px] hover:bg-[#f5ecd4] transition-colors"
                          style={{ border: '1px solid rgba(184,145,72,0.15)' }}
                        >
                          <p className="font-dm-sans text-[12px] text-[#3b2d17] font-medium truncate">{s.preview || 'Conversation'}</p>
                          <p className="font-dm-sans text-[10px] text-[#7a5f2c]/60 mt-[2px]">
                            {formatDate(s.date)} · {msgCount} message{msgCount !== 1 ? 's' : ''}
                          </p>
                        </button>
                        <button
                          onClick={() => { removeSession(s.id, user?.id); setSessions(loadSessions(user?.id)) }}
                          className="w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-red-50 transition-colors text-[#7a5f2c]/40 hover:text-red-400 shrink-0"
                        ><X size={11} /></button>
                      </div>
                    )
                  })}
                  {!user && (
                    <p className="font-dm-sans text-[10px] text-[#7a5f2c]/50 text-center mt-2 px-2">
                      Sign in to keep history across devices
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Past session viewer (read-only) ── */}
          {view === 'session' && viewingSession && (
            <div className="flex-1 overflow-y-auto flex flex-col px-[23px] pt-[20px] pb-4 gap-[11px]" style={{ scrollbarWidth: 'none' }}>
              {viewingSession.messages.map(msgBubble)}
              <button
                onClick={() => setView('chat')}
                className="self-center font-dm-sans text-[11px] text-[#b89148] mt-1 hover:opacity-80"
              >← Back to current chat</button>
            </div>
          )}

          {/* ── Active chat ── */}
          {view === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto flex flex-col px-[23px] pt-[23px]" style={{ scrollbarWidth: 'none' }}>

                {/* Quick actions */}
                <div className="flex gap-[8px] overflow-x-auto shrink-0 pb-[14px]" style={{ scrollbarWidth: 'none' }}>
                  {QUICK_ACTIONS.map((a, i) => (
                    <button key={i} onClick={() => {
                      if (a.action === 'booking') { setBookingOpen(true) }
                      else if (a.action === 'navigate' && a.path) { router.push(`/${locale}${a.path}`) }
                      else { sendMessage(a.text) }
                    }}
                      className="flex items-center gap-[6px] shrink-0 font-dm-sans text-[#3b2d17] hover:opacity-80 transition-opacity whitespace-nowrap"
                      style={{ background: 'rgba(245,236,212,0.30)', borderRadius: 14, padding: '8px 11px', fontSize: 11, boxShadow: '0 1px 4px rgba(59,45,23,0.10)' }}
                    >{a.icon}{a.text}</button>
                  ))}
                </div>

                {/* FAQ — only on fresh chat */}
                {userCount === 0 && (() => {
                  const all = user ? FAQ_USER : FAQ_GUEST
                  const visible = faqExpanded ? all : all.slice(0, 5)
                  return (
                    <div className="flex flex-col gap-[5px] pb-[14px]">
                      <span className="font-dm-sans text-[#7a5f2c]/60 text-[10px] mb-[2px]">
                        {user ? 'How can I help you today?' : 'Frequently asked'}
                      </span>
                      {visible.map((q, i) => (
                        <button key={i} onClick={() => sendMessage(q)}
                          className="text-left font-dm-sans text-[#3b2d17] hover:opacity-80 transition-opacity"
                          style={{ background: 'rgba(245,236,212,0.50)', borderRadius: 10, padding: '7px 11px', fontSize: 11, boxShadow: '0 1px 3px rgba(59,45,23,0.08)', border: '1px solid rgba(184,145,72,0.15)' }}
                        >{q}</button>
                      ))}
                      {all.length > 5 && (
                        <button onClick={() => setFaqExpanded(v => !v)}
                          className="font-dm-sans text-[#b89148] hover:opacity-80 transition-opacity text-left"
                          style={{ fontSize: 11, padding: '3px 2px' }}
                        >{faqExpanded ? '▲ Show less' : `▼ Show ${all.length - 5} more`}</button>
                      )}
                    </div>
                  )
                })()}

                {/* Messages */}
                <div className="flex flex-col gap-[11px] pb-3">
                  {messages.map(msgBubble)}
                  {isTyping && (
                    <div className="flex items-center gap-[4px] px-[14px] py-[10px] self-start" style={{ background: 'rgba(245,236,212,0.70)', borderRadius: '16px 16px 16px 4px' }}>
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[#7a5f2c]/40 animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="shrink-0 px-[23px] pb-[23px] pt-[17px]" style={{ background: 'rgba(249,249,249,0.30)' }}>
                {userCount >= MAX_MESSAGES && (
                  <p className="font-dm-sans text-[11px] text-center text-[#7a5f2c] mb-2">
                    Message limit reached. Close and reopen to start a new session.
                  </p>
                )}
                <div className="flex items-center gap-2"
                  style={{ background: 'rgba(249,249,249,0.50)', borderRadius: 71, padding: '14px 8px 14px 23px', boxShadow: '0 1px 8px rgba(59,45,23,0.10)' }}
                >
                  <input
                    type="text" value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
                    placeholder={isTyping ? 'Waiting...' : 'Ask AI'}
                    disabled={isTyping || userCount >= MAX_MESSAGES}
                    className="flex-1 bg-transparent border-none outline-none font-dm-sans text-[#3b2d17] placeholder:text-[#7a5f2c]/60 min-w-0 disabled:opacity-50"
                    style={{ fontSize: 13 }}
                  />
                  <button onClick={handleSend} disabled={!canSend}
                    className="shrink-0 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
                    style={{ width: 37, height: 37, background: 'rgba(184,145,72,0.70)', boxShadow: '0 2px 8px rgba(59,45,23,0.15)' }}
                  ><Send size={14} color="white" strokeWidth={2.5} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <BookAppointmentModal open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Trigger pill */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center justify-center gap-[8px] hover:opacity-90 transition-opacity"
        style={{ width: 108, height: 66, background: '#b89148', borderRadius: '50px 50px 0 50px', boxShadow: '0 4px 16px rgba(59,45,23,0.25)' }}
      >
        <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
          <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5Z" fill="#fbf7ee" />
        </svg>
        <span className="font-cormorant font-bold text-[#fbf7ee] leading-none" style={{ fontSize: 24 }}>AI</span>
      </button>

    </div>
  )
}
