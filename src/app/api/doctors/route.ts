import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, specialty, department')
    .eq('is_active', true)
    .order('department')
    .order('name')
  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data)
}
