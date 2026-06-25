import { createServiceClient as serverServiceClient } from '@/utils/supabase/server'

export async function createServiceClient() {
  return await serverServiceClient()
}
