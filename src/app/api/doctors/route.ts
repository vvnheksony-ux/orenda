import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .schema('payload')
    .from('doctors')
    .select('id, name, specialty, department')
    .order('department')
    .order('name')
  
  if (error) {
    console.error('Error fetching doctors from payload schema:', error)
    return NextResponse.json([], { status: 200 })
  }
  return NextResponse.json(data)
}
