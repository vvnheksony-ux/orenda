// Maps raw Supabase auth error messages to friendly, user-facing copy.
// Shared by LoginModal, forgot-password, and reset-password so every auth
// surface speaks the same language.
export function friendlyError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login') || normalized.includes('invalid credentials')) return 'Incorrect email or password.'
  if (normalized.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (normalized.includes('rate limit') || normalized.includes('too many')) return 'Too many attempts. Please wait a few minutes.'
  if (normalized.includes('user already registered')) return 'This account already exists. Please sign in instead.'
  if (normalized.includes('password should be at least')) return 'Password must be at least 8 characters.'
  if (normalized.includes('same password')) return 'New password must be different from your current password.'
  if (normalized.includes('token has expired') || normalized.includes('expired') || normalized.includes('invalid otp') || (normalized.includes('token') && normalized.includes('invalid'))) return 'That code is invalid or has expired. Please request a new one.'
  if (normalized.includes('failed to fetch') || normalized.includes('network')) return 'Network error. Please check your connection and try again.'
  return message
}
