import { NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, specialty, department')
    .eq('is_active', true)
    .order('department')
    .order('name')
  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data)
}
