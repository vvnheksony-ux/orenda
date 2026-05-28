import { NextResponse } from 'next/server'

export async function GET() {
  const payloadUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3000'
  
  try {
    const res = await fetch(`${payloadUrl}/api/doctors?limit=100`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!res.ok) {
      console.error('Payload CMS API returned an error:', res.status)
      return NextResponse.json([], { status: 200 })
    }

    const data = await res.json()
    // Payload returns items in a 'docs' array
    const doctors = data.docs || []
    
    return NextResponse.json(doctors)
  } catch (err) {
    console.error('Failed to fetch doctors from CMS:', err)
    return NextResponse.json([], { status: 200 })
  }
}
