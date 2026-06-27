'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Send, X, Minimize2, Maximize2, Calendar, User, MapPin, FileText, Plus, ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import BookAppointmentModal from '@/components/shared/BookAppointmentModal'
import LoginModal from '@/components/shared/LoginModal'

type Message = {
  id: string
  dbId?: string  // Supabase ai_chat_messages.id — present when loaded from history
  role: 'user' | 'ai'
  content: string
  timestamp: string
  thumbs?: 'up' | 'down' | null
}

// ── Markdown renderer ──────────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

function renderContent(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, '')); i++ }
      elements.push(<ol key={`ol-${i}`} style={{ paddingLeft: 16, margin: '4px 0' }}>{items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>)
      continue
    }
    // Bullet list
    if (/^[-•]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-•]\s/.test(lines[i])) { items.push(lines[i].replace(/^[-•]\s/, '')); i++ }
      elements.push(<ul key={`ul-${i}`} style={{ paddingLeft: 16, margin: '4px 0' }}>{items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>)
      continue
    }
    // Empty line = small spacer
    if (!line.trim()) { elements.push(<div key={`sp-${i}`} style={{ height: 6 }} />); i++; continue }
    // Normal line
    elements.push(<div key={`ln-${i}`}>{renderInline(line)}</div>)
    i++
  }
  return <>{elements}</>
}

type Session = {
  id: string
  dbId?: string
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

// Shared style for the round icon-buttons in the chat header
const ICON_BTN = 'w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-[#f5ecd4] transition-colors text-[#3b2d17]'

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
    // Logged-in users keep a full history; guests keep only a single rolling session.
    const limit = userId ? MAX_SESSIONS : 1
    const updated = [session, ...loadSessions(userId).filter(s => s.id !== session.id)].slice(0, limit)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}
function removeSession(id: string, userId?: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(loadSessions(userId).filter(s => s.id !== id)))
  } catch {}
}

const ACTIVE_SID_KEY = 'orienda_active_sid'
function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}
  return `${Date.now()}-${Math.round(performance.now())}`
}
// Stable id for the current conversation, persisted so AI memory survives a reload
function getActiveSessionId(): string {
  if (typeof window === 'undefined') return newId()
  try {
    const existing = localStorage.getItem(ACTIVE_SID_KEY)
    if (existing) return existing
    const id = newId()
    localStorage.setItem(ACTIVE_SID_KEY, id)
    return id
  } catch {
    return newId()
  }
}
function setActiveSessionId(id: string) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(ACTIVE_SID_KEY, id) } catch {}
}

async function loadServerSessions(): Promise<Session[]> {
  const response = await fetch('/api/ai-chat')
  if (!response.ok) throw new Error('Failed to load chat history')
  const data = await response.json()
  // Map server messages to include dbId + thumbs
  return (data.docs || []).map((s: any) => ({
    ...s,
    messages: s.messages.map((m: any) => ({ ...m, dbId: m.id, thumbs: m.thumbs ?? null })),
  }))
}

async function removeServerSession(sessionId: string) {
  const response = await fetch('/api/ai-chat', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  if (!response.ok) throw new Error('Failed to delete chat history')
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('chat') === 'open') setIsOpen(true)
  }, [])
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([INIT_MSG()])
  const [isTyping, setIsTyping] = useState(false)
  const [lastSentAt, setLastSentAt] = useState(0)
  const [faqExpanded, setFaqExpanded] = useState(false)
  const [activeActions, setActiveActions] = useState(() => QUICK_ACTIONS.map((_, i) => i))
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState(() => getActiveSessionId())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sendMessageRef = useRef<((text: string) => Promise<void>) | null>(null)

  const refreshSessions = useCallback(async () => {
    if (!user?.id) {
      setSessions(loadSessions())
      return
    }

    try {
      setSessions(await loadServerSessions())
    } catch {
      setSessions([])
    }
  }, [user?.id])

  const userCount = messages.filter(m => m.role === 'user').length
  const canSend = !isTyping && !!inputValue.trim() && Date.now() - lastSentAt >= COOLDOWN_MS && userCount < MAX_MESSAGES

  useEffect(() => {
    void refreshSessions()
  }, [refreshSessions])

  useEffect(() => {
    if (isOpen && view === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, view])

  const saveCurrentSession = useCallback(() => {
    if (userCount === 0) return
    if (user?.id) {
      void refreshSessions()
      return
    }
    persistSession({
      id: sessionId,
      date: new Date().toISOString(),
      preview: messages.find(m => m.role === 'user')?.content ?? '',
      messages,
    })
    setSessions(loadSessions())
  }, [messages, refreshSessions, sessionId, user?.id, userCount])

  const handleThumb = useCallback(async (msgId: string, dbId: string | undefined, thumb: 'up' | 'down') => {
    // Toggle off if same thumb clicked again
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m
      const next = m.thumbs === thumb ? null : thumb
      return { ...m, thumbs: next }
    }))
    if (!dbId || !user?.id) return
    setMessages(prev => {
      const msg = prev.find(m => m.id === msgId)
      const next = msg?.thumbs === thumb ? null : thumb
      fetch('/api/ai-chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: dbId, thumbs: next }),
      }).catch(() => {})
      return prev
    })
  }, [user?.id])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || Date.now() - lastSentAt < COOLDOWN_MS || userCount >= MAX_MESSAGES) return
    setLastSentAt(Date.now())
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: timeNow() }])
    setIsTyping(true)

    const aiId = (Date.now() + 1).toString()

    try {
      const res = await fetch('/api/ai-chat?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ message: text.trim(), session_key: sessionId, locale, user_id: user?.id ?? null }),
      })

      if (!res.body) throw new Error('no body')

      // Add empty AI bubble — will fill as stream arrives
      setMessages(prev => [...prev, { id: aiId, role: 'ai', content: '', timestamp: timeNow() }])
      setIsTyping(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break
          try {
            const { text: chunk } = JSON.parse(payload)
            if (chunk) {
              fullText += chunk
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m))
            }
          } catch {}
        }
      }

      if (!fullText) {
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: "Sorry, I couldn't get a response right now. Please try again." } : m))
      }
    } catch {
      setIsTyping(false)
      setMessages(prev => {
        const hasAi = prev.some(m => m.id === aiId)
        const errMsg = { id: aiId, role: 'ai' as const, content: 'Sorry, I could not reach the server. Please try again.', timestamp: timeNow() }
        return hasAi ? prev.map(m => m.id === aiId ? errMsg : m) : [...prev, errMsg]
      })
    }
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

  const openHistory = () => {
    // History is a signed-in feature — guests are prompted to sign in first.
    if (!user) { setLoginOpen(true); return }
    void refreshSessions()
    setView('history')
  }

  const handleNewChat = useCallback(() => {
    saveCurrentSession()
    setMessages([INIT_MSG()])
    setInputValue('')
    const id = newId()
    setActiveSessionId(id)
    setSessionId(id)
    setActiveActions(QUICK_ACTIONS.map((_, i) => i))
    setView('chat')
  }, [saveCurrentSession])

  // ── render helpers ──────────────────────────────────────
  const msgBubble = (msg: Message) => (
    <div key={msg.id} className={`flex flex-col gap-[4px] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className="font-dm-sans text-[13px] leading-relaxed px-[14px] py-[10px]"
        style={{
          background: msg.role === 'user' ? 'rgba(184,145,72,0.85)' : 'rgba(245,236,212,0.70)',
          color: msg.role === 'user' ? '#fff' : '#3b2d17',
          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          maxWidth: '85%', wordBreak: 'break-word', overflowWrap: 'break-word',
        }}
      >
        {msg.role === 'ai' ? renderContent(msg.content) : msg.content}
      </div>
      <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="font-dm-sans text-[#7a5f2c]/70" style={{ fontSize: 10 }}>{msg.timestamp}</span>
        {msg.role === 'ai' && msg.content && (
          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => handleThumb(msg.id, msg.dbId, 'up')}
              title="Helpful"
              style={{ opacity: msg.thumbs === 'up' ? 1 : 0.35, transition: 'opacity 0.15s' }}
              className="hover:opacity-80"
            >
              <ThumbsUp size={11} color={msg.thumbs === 'up' ? '#178348' : '#7a5f2c'} strokeWidth={2} />
            </button>
            <button
              onClick={() => handleThumb(msg.id, msg.dbId, 'down')}
              title="Not helpful"
              style={{ opacity: msg.thumbs === 'down' ? 1 : 0.35, transition: 'opacity 0.15s' }}
              className="hover:opacity-80"
            >
              <ThumbsDown size={11} color={msg.thumbs === 'down' ? '#c0392b' : '#7a5f2c'} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed bottom-20 right-8 sm:bottom-6 sm:right-4 md:right-6 z-50 flex flex-col items-end">

      {isOpen && (
        <div
          className="mb-3 flex flex-col overflow-hidden"
          style={{
            width: isExpanded ? 'min(520px, calc(100vw - 32px))' : 'min(360px, calc(100vw - 32px))',
            height: isExpanded ? 680 : 500,
            background: 'rgba(251,247,238,0.98)', borderRadius: 16,
            boxShadow: '0 8px 40px rgba(59,45,23,0.18)',
            transition: 'width 0.2s ease, height 0.2s ease',
          }}
        >
          {/* ── Header ── */}
          <div
            className="shrink-0 flex items-center justify-between"
            style={{ background: '#fbf7ee', minHeight: 62, padding: '11px 17px', borderBottom: '1px solid rgba(184,145,72,0.12)' }}
          >
            <div className="flex items-center gap-[6px]">
              {view === 'chat' && (
                <button
                  onClick={openHistory}
                  title="View history"
                  className={ICON_BTN}
                ><ArrowLeft size={13} /></button>
              )}
              {view === 'history' && (
                <button
                  onClick={() => setView('chat')}
                  title="Back to chat"
                  className={ICON_BTN}
                ><ArrowLeft size={13} /></button>
              )}
              <div className="flex flex-col gap-[3px]">
                <span className="font-cormorant font-bold text-[#3b2d17] leading-none" style={{ fontSize: 20 }}>
                  {view === 'history' ? 'Chat History' : 'Orienda AI Assistant'}
                </span>
                <span className="font-dm-sans text-[#7a5f2c] leading-none" style={{ fontSize: 10 }}>
                  {view === 'history'
                    ? `${sessions.length} conversation${sessions.length !== 1 ? 's' : ''}`
                    : (user ? `Signed in · ${user.email?.split('@')[0]}` : 'Always here to help')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button onClick={handleNewChat} title="New chat"
                className={ICON_BTN}
              ><Plus size={13} /></button>
              <button onClick={() => setIsExpanded(v => !v)} title={isExpanded ? 'Shrink' : 'Expand'}
                className={ICON_BTN}
              >{isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
              <button onClick={handleClose}
                className={ICON_BTN}
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
                          onClick={() => { setMessages(s.messages); setActiveSessionId(s.id); setSessionId(s.id); setView('chat') }}
                          className="flex-1 text-left rounded-[10px] px-3 py-[10px] hover:bg-[#f5ecd4] transition-colors"
                          style={{ border: '1px solid rgba(184,145,72,0.15)' }}
                        >
                          <p className="font-dm-sans text-[12px] text-[#3b2d17] font-medium truncate">{s.preview || 'Conversation'}</p>
                          <p className="font-dm-sans text-[10px] text-[#7a5f2c]/60 mt-[2px]">
                            {formatDate(s.date)} · {msgCount} message{msgCount !== 1 ? 's' : ''}
                          </p>
                        </button>
                        <button
                          onClick={() => {
                            if (user?.id && s.dbId) {
                              void removeServerSession(s.dbId).then(() => refreshSessions()).catch(() => {})
                              return
                            }
                            removeSession(s.id)
                            setSessions(loadSessions())
                          }}
                          className="w-[26px] h-[26px] rounded-full flex items-center justify-center hover:bg-red-50 transition-colors text-[#7a5f2c]/40 hover:text-red-400 shrink-0"
                        ><X size={11} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Active chat ── */}
          {view === 'chat' && (
            <>
              {/* Quick actions — sticky strip */}
              {activeActions.length > 0 && (
                <div className="shrink-0 flex gap-[8px] overflow-x-auto px-[14px] py-[10px]"
                  style={{ scrollbarWidth: 'none', borderBottom: '1px solid rgba(184,145,72,0.08)' }}>
                  {activeActions.map(i => {
                    const a = QUICK_ACTIONS[i]
                    return (
                      <button key={i} onClick={() => {
                        if (a.action === 'booking') { setBookingOpen(true) }
                        else if (a.action === 'navigate' && a.path) { router.push(`/${locale}${a.path}`) }
                        else { sendMessage(a.text) }
                        setActiveActions([])
                      }}
                        className="flex items-center gap-[6px] shrink-0 font-dm-sans text-[#3b2d17] hover:opacity-80 transition-opacity whitespace-nowrap"
                        style={{ background: 'rgba(245,236,212,0.30)', borderRadius: 14, padding: '7px 10px', fontSize: 11, boxShadow: '0 1px 4px rgba(59,45,23,0.10)' }}
                      >{a.icon}{a.text}</button>
                    )
                  })}
                </div>
              )}

              <div className="flex-1 overflow-y-auto flex flex-col px-[23px] pt-[14px]" style={{ scrollbarWidth: 'none' }}>

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
              <div className="shrink-0 px-[18px] pb-[16px] pt-[10px]" style={{ background: 'rgba(249,249,249,0.30)' }}>
                {userCount >= MAX_MESSAGES && (
                  <p className="font-dm-sans text-[10px] text-center text-[#7a5f2c] mb-1.5">
                    Message limit reached. Start a new chat with +
                  </p>
                )}
                {!user && (
                  <div
                    className="mb-2 flex items-center justify-between gap-3 rounded-[12px] px-3 py-2"
                    style={{ background: 'rgba(245,236,212,0.55)', border: '1px solid rgba(184,145,72,0.16)' }}
                  >
                    <p className="font-dm-sans text-[11px] leading-[1.45] text-[#7a5f2c]">
                      Sign in to save this chat to your account and keep your history across visits.
                    </p>
                    <button
                      onClick={() => setLoginOpen(true)}
                      className="shrink-0 rounded-full px-3 py-1.5 font-dm-sans text-[11px] font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ background: 'rgba(184,145,72,0.95)' }}
                    >
                      Sign In
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2"
                  style={{ background: 'rgba(249,249,249,0.50)', borderRadius: 71, padding: '10px 6px 10px 18px', boxShadow: '0 1px 8px rgba(59,45,23,0.10)' }}
                >
                  <input
                    type="text" value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
                    placeholder={isTyping ? 'Waiting...' : 'Ask AI'}
                    disabled={isTyping || userCount >= MAX_MESSAGES}
                    className="flex-1 bg-transparent border-none outline-none font-dm-sans text-[#3b2d17] placeholder:text-[#7a5f2c]/60 min-w-0 disabled:opacity-50"
                    style={{ fontSize: 12 }}
                  />
                  <button onClick={handleSend} disabled={!canSend}
                    className="shrink-0 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
                    style={{ width: 32, height: 32, background: 'rgba(184,145,72,0.70)', boxShadow: '0 2px 8px rgba(59,45,23,0.15)' }}
                  ><Send size={12} color="white" strokeWidth={2.5} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <BookAppointmentModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => { setLoginOpen(false); setView('history') }}
        message="Sign in to save this chat to your account and keep your history across visits."
      />

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
