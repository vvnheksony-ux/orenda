import type { Language } from './detect-language'

export type ValidationResult =
  | { valid: true }
  | { valid: false; reply: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Greeting words ────────────────────────────────────────────────────────────
const GREETINGS: Record<Language, string[]> = {
  en: ['hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening'],
  km: ['សួស្តី', 'ជំរាបសួរ', 'អរុណសួស្តី', 'ហ្ចែ', 'ហ្ចែ'],
  zh: ['你好', '您好', '嗨', '哈喽', '早上好', '下午好', '晚上好'],
}

// ── Bad words ─────────────────────────────────────────────────────────────────
const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole',
  'porn', 'nude', 'naked',
  'សិច', 'អាសអាភាស',
  '色情', '性爱', '裸',
]

// ── Nonsense words ────────────────────────────────────────────────────────────
const NONSENSE_WORDS = ['asd', 'asdf', 'asdfg', 'qwerty', 'lol', 'lmao', 'wtf']

// ── Replies ───────────────────────────────────────────────────────────────────
const GREETING_REPLIES: Record<Language, string[]> = {
  en: [
    'Hello! Welcome to Orienda. How may I assist you today?',
    "Good day! I'm here to help with Orienda information. How can I assist you?",
    'Hello! Thank you for reaching out to Orienda. How may I help you?',
  ],
  km: [
    'សួស្តី! សូមស្វាគមន៍មកកាន់ Orienda។ តើខ្ញុំអាចជួយលោកអ្នកបានយ៉ាងដូចម្តេច?',
    'ជំរាបសួរ! ខ្ញុំរីករាយក្នុងការជួយផ្តល់ព័ត៌មានអំពី Orienda។',
    'សួស្តី! សូមអរគុណដែលបានទាក់ទងមក Orienda។ តើលោកអ្នកត្រូវការជំនួយអ្វីខ្លះ?',
  ],
  zh: [
    '您好！欢迎咨询 Orienda，请问我可以怎样协助您？',
    '您好！感谢您联系 Orienda，请问有什么可以帮您？',
    '您好！我可以为您提供 Orienda 相关信息，请问您需要了解什么？',
  ],
}

const VIOLATION_REPLIES: Record<Language, string[]> = {
  en: [
    'Kindly send a clear question about Orienda services, doctors, appointments, prices, location, or contact information.',
    "I'd be happy to help. Please share a clear question related to Orienda hospital services, booking, doctors, prices, or contact details.",
    'For better assistance, please ask about Orienda doctors, services, appointments, pricing, location, or contact information.',
  ],
  km: [
    'សូមមេត្តាផ្ញើសំណួរឱ្យច្បាស់អំពីសេវាកម្ម វេជ្ជបណ្ឌិត ការណាត់ជួប តម្លៃ ទីតាំង ឬព័ត៌មានទំនាក់ទំនងរបស់ Orienda។',
    'ខ្ញុំរីករាយក្នុងការជួយ។ សូមសួរអំពីសេវាកម្ម វេជ្ជបណ្ឌិត ការកក់ តម្លៃ ឬលេខទំនាក់ទំនងរបស់ Orienda។',
    'ដើម្បីឱ្យខ្ញុំអាចជួយបានល្អ សូមផ្ញើសំណួរទាក់ទងនឹង Orienda ឱ្យបានច្បាស់បន្តិច។',
  ],
  zh: [
    '请您发送清楚的问题，例如 Orienda 的服务、医生、预约、价格、地址或联系方式。',
    '我很乐意协助您。请询问与 Orienda 医生、服务、预约、价格或联系方式相关的问题。',
    '为了更好地协助您，请发送关于 Orienda 的清楚问题。',
  ],
}

// ── Main validator ────────────────────────────────────────────────────────────
export function validateInput(message: string, language: Language): ValidationResult {
  const text = message.trim()
  const lower = text.toLowerCase()

  // Empty
  if (!text) {
    return { valid: false, reply: VIOLATION_REPLIES[language][0] }
  }

  // Too long
  if (text.length > 1000) {
    return {
      valid: false,
      reply: 'Message too long. Please keep it under 1000 characters.',
    }
  }

  // Repeated spam (aaaaaaaaaa)
  if (/(.)(?:\1){8,}/.test(text)) {
    return { valid: false, reply: pickRandom(VIOLATION_REPLIES[language]) }
  }

  // Only symbols
  if (/^[?!.,\-_=+*/\\|@#$%^&(){}[\]:;"'<>~`]+$/.test(text)) {
    return { valid: false, reply: pickRandom(VIOLATION_REPLIES[language]) }
  }

  // Bad words
  if (BAD_WORDS.some(w => lower.includes(w))) {
    return { valid: false, reply: pickRandom(VIOLATION_REPLIES[language]) }
  }

  // Nonsense words
  if (NONSENSE_WORDS.includes(lower)) {
    return { valid: false, reply: pickRandom(VIOLATION_REPLIES[language]) }
  }

  // URL spam
  if (/https?:\/\/|www\./i.test(text)) {
    return { valid: false, reply: pickRandom(VIOLATION_REPLIES[language]) }
  }

  return { valid: true }
}

// ── Greeting ──────────────────────────────────────────────────────────────────
export function isGreeting(message: string, language: Language): boolean {
  const lower = message.trim().toLowerCase()
  return GREETINGS[language].some(w => lower === w.toLowerCase())
}

export function greetingReply(language: Language): string {
  return pickRandom(GREETING_REPLIES[language])
}
