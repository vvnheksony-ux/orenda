'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showLoginBanner, setShowLoginBanner] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: "Hello! I'm your Orienda healthcare assistant. How can I help you today?", timestamp: '03:01 AM' },
    { id: '2', role: 'user', content: "Help me find a doctor", timestamp: '03:01 AM' },
    { id: '3', role: 'ai', content: "Our hospital has highly qualified specialists in various fields including Obstetrics, Gynecology, Pediatrics, and Neurosurgery. Would you like me to help you find a doctor in a specific department?", timestamp: '03:01 AM' },
    { id: '4', role: 'user', content: "I need access to my medical records", timestamp: '03:01 AM' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = () => {
    if (!inputValue.trim()) return
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue.trim(), timestamp: time }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response delay for realism
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I've received your message. Since I'm not fully connected to the API yet, this is an automated placeholder response!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent !== 'accepted') {
      setTimeout(() => {
        setShowLoginBanner(true)
      }, 0)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="relative">
          <div 
            className={`flex flex-col animate-in slide-in-from-bottom-5 relative transition-all duration-300 ease-in-out ${isExpanded ? 'w-[calc(100vw-32px)] md:w-[600px] h-[80vh] md:h-[800px]' : 'w-[calc(100vw-32px)] sm:w-[420px] h-[75vh] sm:h-[650px] max-h-[85vh]'}`}
            style={{ 
              background: '#F5EFE6', // Match the off-white/cream background
              borderRadius: '24px',
              boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="font-cormorant font-bold text-[28px]" style={{ color: '#4A3B2C' }}>
                  Orienda AI Assistant
                </h3>
                <p className="font-dm-sans text-[13px] mt-1" style={{ color: '#A07A44' }}>
                  Always here to help
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-2 -mr-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity" style={{ color: '#4A3B2C' }}
                >
                  {isExpanded ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 14 10 14 10 20"></polyline>
                      <polyline points="20 10 14 10 14 4"></polyline>
                      <line x1="14" y1="10" x2="21" y2="3"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity" style={{ color: '#4A3B2C' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pb-6 flex gap-3 overflow-x-auto scrollbar-hide shrink-0 w-full">
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
              {/* Spacer for left padding */}
              <div className="w-4 shrink-0" />
              {[
                { 
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#82A1D1' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>, 
                  text: 'Book Appointment' 
                },
                { 
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9782D1' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>, 
                  text: 'Find a Doctor' 
                },
                { 
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#D18296' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, 
                  text: 'Locations' 
                },
                { 
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#82D19D' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, 
                  text: 'Medical Records' 
                }
              ].map((action, i) => (
                <button 
                  key={i}
                  className="whitespace-nowrap px-4 py-2.5 rounded-full font-dm-sans text-[13px] bg-white shadow-sm flex items-center gap-2 hover:bg-gold-50 transition-colors border border-black/5 shrink-0"
                  style={{ color: '#4A3B2C' }}
                >
                  {action.icon}
                  <span className="font-medium">{action.text}</span>
                </button>
              ))}
              {/* Spacer for right edge */}
              <div className="w-6 shrink-0" />
            </div>

            {/* Chat Thread */}
            <div className="flex-1 px-6 overflow-y-auto flex flex-col gap-6 pb-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'items-end self-end' : 'items-start'}`}>
                  <div 
                    className={`px-5 py-4 font-dm-sans text-[14px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'shadow-md' : ''}`}
                    style={{ 
                      background: msg.role === 'user' ? '#C7A779' : '#EAE2D3', 
                      color: msg.role === 'user' ? '#FFFFFF' : '#4A3B2C',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.content}
                  </div>
                  <span className="font-dm-sans text-[10px]" style={{ color: '#8B7E74' }}>{msg.timestamp}</span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start gap-1.5 max-w-[85%]">
                  <div className="px-5 py-4 font-dm-sans text-[14px] leading-relaxed shadow-sm flex gap-1" style={{ background: '#EAE2D3', borderRadius: '20px 20px 20px 4px' }}>
                    <div className="w-2 h-2 rounded-full bg-black/20 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-black/20 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-black/20 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Login / Save Data Banner */}
            {showLoginBanner && (
              <div className="mx-6 mb-2 p-3 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 bg-white/80 backdrop-blur">
                <div className="flex flex-col">
                  <span className="font-dm-sans text-[12px] font-bold" style={{ color: '#4A3B2C' }}>Save your chat history?</span>
                  <span className="font-dm-sans text-[11px]" style={{ color: '#8B7E74' }}>Please log in.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1.5 rounded-full font-dm-sans text-[11px] font-bold text-white transition-opacity hover:opacity-90 shadow-sm" style={{ background: '#C7A779' }}>
                    Log In
                  </Link>
                  <button onClick={() => setShowLoginBanner(false)} className="p-1 rounded-full hover:bg-black/5" style={{ color: '#8B7E74' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="px-6 pb-6 pt-2">
              <div 
                className="w-full flex items-center rounded-[32px] p-2 pl-6 bg-white shadow-lg"
              >
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question here..." 
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none font-dm-sans text-[15px] resize-none py-3 max-h-[100px] scrollbar-hide"
                  style={{ color: '#4A3B2C' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center hover:opacity-90 transition-opacity ml-2 disabled:opacity-50"
                  style={{ background: '#C7A779' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="h-[56px] px-8 rounded-full shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-transform"
          style={{ background: '#C7A779' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="white" />
            <circle cx="15" cy="10" r="1" fill="white" />
          </svg>
          <span className="font-cormorant font-bold text-white text-[20px] tracking-wide">AI Chat</span>
        </button>
      )}
    </div>
  )
}
