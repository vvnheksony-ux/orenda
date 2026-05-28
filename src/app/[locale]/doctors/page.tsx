'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'

interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  image_url?: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeDept, setActiveDept] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch('/api/doctors')
        if (res.ok) {
          const data = await res.json()
          setDoctors(data)
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const depts = ['All', ...Array.from(new Set(doctors.map(d => d.department)))]

  const filtered = doctors.filter(d => {
    const matchDept = activeDept === 'All' || d.department === activeDept
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty?.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[160px] xl:pt-[200px] pb-20" style={{ background: '#fbf7ee' }}>

        <div className="text-center px-5 mb-14">
          <h1 className="font-cormorant font-bold text-[64px] text-gold-900 leading-none mb-4">Meet Our Specialists</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-lg mx-auto">A dedicated team of experts committed to your health and well-being</p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto px-5 mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors"
            style={{ background: '#fff' }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center px-5 mb-10">
          {depts.map(d => (
            <button key={d} onClick={() => setActiveDept(d)}
              className="px-4 py-2 rounded-full font-dm-sans text-[13px] border transition-colors"
              style={activeDept === d ? { background: '#b89148', color: '#fff', borderColor: 'transparent' } : { background: '#fff', color: '#594522', borderColor: '#d4b896' }}>
              {d}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-[16px] aspect-[4/5] shadow-sm"></div>
            ))
          ) : filtered.map(doc => (
            <div key={doc.id || doc.name} className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.08)] hover:shadow-[0px_8px_24px_rgba(122,95,44,0.14)] transition-shadow flex flex-col">
              <div className="relative w-full aspect-square bg-gold-50">
                {doc.image_url ? (
                  <Image
                    src={doc.image_url}
                    alt={doc.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold-200">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1">
                <p className="font-cormorant font-bold text-[16px] text-gold-900 leading-tight">{doc.name}</p>
                <p className="font-dm-sans text-[12px] text-gold-700 leading-snug">{doc.specialty}</p>
                <span className="mt-auto pt-2 inline-block font-dm-sans text-[11px] text-gold-600 border-t border-gold-100">{doc.department}</span>
              </div>
              <Link href="/appointments"
                className="mx-4 mb-4 py-2 rounded-full text-center font-dm-sans text-[12px] text-white transition-opacity hover:opacity-90"
                style={{ background: '#b89148' }}>
                Book
              </Link>
            </div>
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <p className="text-center font-dm-sans text-[16px] text-gold-700 mt-10">No doctors found.</p>
        )}
      </div>
    </SiteLayout>
  )
}
