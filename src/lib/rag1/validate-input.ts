import type { Language } from './detect-language'

export type ValidationResult =
  | { valid: true }
  | { valid: false; reply: string }

const GREETING_RE = /^(hi|hello|hey|ហ្ចែ|ជំរាបសួរ|ស្វាគមន៍|你好|您好|嗨|嘿|salam|bonjour|hola|سلام)[\s!.,]*$/i

const SPAM_REPEAT_RE = /^(.)\1{9,}$/ // "aaaaaaaaaa", "1111111111"

export function validateInput(message: string): ValidationResult {
  const text = message.trim()

  if (text.length < 2) {
    return { valid: false, reply: 'Please type a message.' }
  }

  if (text.length > 1000) {
    return {
      valid: false,
      reply: 'Message too long. Please keep it under 1000 characters.',
    }
  }

  // All same character repeated
  if (SPAM_REPEAT_RE.test(text)) {
    return {
      valid: false,
      reply: "I couldn't understand that. Please ask a healthcare-related question.",
    }
  }

  // Keyboard mashing: low ratio of meaningful characters
  const meaningful = (text.match(/[\wក-៿一-鿿]/g) ?? []).length
  if (text.length > 10 && meaningful / text.length < 0.3) {
    return {
      valid: false,
      reply: "I couldn't understand that. Please ask a healthcare-related question.",
    }
  }

  // URL spam
  if (/https?:\/\/|www\./i.test(text)) {
    return {
      valid: false,
      reply: 'Please ask a healthcare-related question.',
    }
  }

  return { valid: true }
}

export function isGreeting(message: string): boolean {
  return GREETING_RE.test(message.trim())
}

export function greetingReply(language: Language): string {
  if (language === 'km') {
    return 'ជំរាបសួរ! ខ្ញុំជា Orienda AI Assistant។ តើខ្ញុំអាចជួយអ្នកបានដោយរបៀបណា?'
  }
  if (language === 'zh') {
    return '您好！我是 Orienda AI 助手。请问有什么可以帮助您？'
  }
  return "Hello! I'm Orienda AI Assistant. How can I help you today?"
}
