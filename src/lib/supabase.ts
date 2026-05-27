import { createClient } from '@/utils/supabase/client'
import { createServiceClient as serverServiceClient } from '@/utils/supabase/server'

export const supabase = createClient()

export async function createServiceClient() {
  return await serverServiceClient()
}
