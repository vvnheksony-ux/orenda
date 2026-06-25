import { createServiceClient } from '@/utils/supabase/server'

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function fetchHistory(sessionId: string, limit = 10): Promise<HistoryMessage[]> {
  try {
    const db = await createServiceClient()
    const { data, error } = await db
      .from('ai_chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error || !data) return []
    return data.map(row => ({
      role: (row.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: row.content ?? '',
    }))
  } catch {
    return []
  }
}

export function formatHistory(messages: HistoryMessage[]): string {
  if (messages.length === 0) return ''
  return messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')
}
