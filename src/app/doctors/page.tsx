'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'

const DOCTORS = [
  { name: 'Dr. Kuon Linka', specialty: 'Gynecologist Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-02.webp' },
  { name: 'Dr. Kim Lumpiny', specialty: 'Gynecologist Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-03.webp' },
  { name: 'Dr. Chhit Maryan', specialty: 'Gynecologist Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-04.webp' },
  { name: 'Dr. Chhor Vichet', specialty: 'Gynecologist, Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-05.webp' },
  { name: 'Dr. Sin Rachana', specialty: 'Gynecologist, Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-06.webp' },
  { name: 'Dr. Siv Kimleng', specialty: 'Obstetrician and Gynecologist', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-07.webp' },
  { name: 'Dr. Eang Muyteang', specialty: 'Gynecologist, Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-08.webp' },
  { name: 'Dr. Heng Fa', specialty: 'Gynecologist and Sonography', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-09.webp' },
  { name: 'Dr. Sreng Kimsrean', specialty: 'Obstetrician and Gynecologist', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-10.webp' },
  { name: 'Dr. Nuth Sodara', specialty: 'Gynecologist Obstetrician', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-13.webp' },
  { name: 'Dr. Sor Sreipich', specialty: 'Obstetrician, Gynecologist', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/12.-Dr.-Sor-Sreipich.webp' },
  { name: 'Dr. Chak Chanlida', specialty: 'Obstetrician, Gynecologist', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/23.-Dr.-Chak-Chanlida-1.webp' },
  { name: 'Dr. Soeu Chanvisal', specialty: 'Obstetrician, Gynecologist', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/27.-Dr.-Soeu-Chanvisal-1.webp' },
  { name: 'Dr. Pel Monyratha', specialty: 'Obstetrician, Gynecologist', dept: 'Obstetrics & Gynecology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/33.-Dr.-Pel-Monyratha.webp' },
  { name: 'Dr. Um Hemsophirum', specialty: 'Pediatrician, Neonatal & NICU', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-12.webp' },
  { name: 'Dr. Saveang Lichea', specialty: 'Pediatrician', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2025/02/%E1%9E%9F%E1%9E%B6%E1%9E%9A%E1%9F%80%E1%9E%84-%E1%9E%9B%E1%9E%B8%E1%9E%8A%E1%9E%B6-01.webp' },
  { name: 'Dr. Mey Puthi', specialty: 'Pediatrician', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-18.webp' },
  { name: 'Than Soklang', specialty: 'Pediatrician', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-15.webp' },
  { name: 'Dr. Lim Bolyly', specialty: 'Pediatrician', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-16.webp' },
  { name: 'Dr. Hab Sokchamnap', specialty: 'Pediatrician', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-19.webp' },
  { name: 'Dr. Hen Seang', specialty: 'Pediatrician, Neonatal', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/9.-Dr.-Hen-Seang.webp' },
  { name: 'Dr. Norng Sedaseny', specialty: 'Pediatrician, Neonatal', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/29.-Dr.-Norng-Sedaseny.webp' },
  { name: 'Dr. Keo Santepheap', specialty: 'Pediatrician, Neonatal', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/30.-Dr.-Keo-Santepheap-1.webp' },
  { name: 'Dr. Mao Sineath', specialty: 'Pediatrician, Neonatal', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/32.-Dr.-Mao-Sineath.webp' },
  { name: 'Dr. An Eangnay', specialty: 'Pediatrician, Neonatal', dept: 'Pediatrics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/35.-Dr.-An-Eangnay.webp' },
  { name: 'Dr. Phoeun Sarath', specialty: 'Emergency, ICU', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-28.webp' },
  { name: 'Dr. NGETH Pathy', specialty: 'Anesthesia, Emergency, ICU', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-21.webp' },
  { name: 'Dr. Phok Sovann', specialty: 'ICU', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-23.webp' },
  { name: 'Dr. MAK Heangsovann', specialty: 'Anesthesia, Emergency, ICU', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-24.webp' },
  { name: 'Dr. Em Ekvitou', specialty: 'Anesthesia, Emergency, ICU', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-25.webp' },
  { name: 'Dr. Eng Borey', specialty: 'Emergency, Anesthesia, ICU', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/5.-Dr.-Eng-Borey.webp' },
  { name: 'Dr. Born Sophea', specialty: 'Emergency, ICU, Anesthesiologist', dept: 'Emergency & ICU', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/13.-Dr.-Born-Sophea.webp' },
  { name: 'Dr. El Sokry', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-34.webp' },
  { name: 'Dr. Sorn Bophaphal', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-32.webp' },
  { name: 'Dr. Nou Chantrea', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-35.webp' },
  { name: 'Dr. Eang Kimchhuong', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-36.webp' },
  { name: 'Dr. THA Sokchan', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-37.webp' },
  { name: 'Dr. Sok Khanpisey', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-31.webp' },
  { name: 'Dr. Heang Enghorng', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-27.webp' },
  { name: 'Dr. Sros Piseth', specialty: 'General Medicines', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/16.-Dr.-Sros-Piseth.webp' },
  { name: 'Dr. Than Vutha', specialty: 'Diabetologist', dept: 'General Medicine', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-30.webp' },
  { name: 'Dr. LIM Lihaung', specialty: 'Radiologist', dept: 'Imaging Center', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-39.webp' },
  { name: 'Dr. Chea Piseth', specialty: 'Sonographer', dept: 'Imaging Center', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/4.-Dr.-Chea-Piseth.webp' },
  { name: 'Dr. Eng Hongseng', specialty: 'Neurosurgery', dept: 'Neuro Surgery', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2025/12/Dr.Hongseng-for-web.jpg' },
  { name: 'Dr. Eudaldo Gonzalez Martinez', specialty: 'Orthopedic & Trauma Specialist', dept: 'Orthopedics', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2025/12/Dr.Martinez-for-web.jpg' },
  { name: 'Dr. Anthony Alvarez Morales', specialty: 'General Surgery Specialist', dept: 'General Surgery', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2025/12/antony.jpg' },
  { name: 'Dr. Veng Sothea', specialty: 'Dermatology', dept: 'Dermatology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-41.webp' },
  { name: 'Dr. Sreng Por', specialty: 'Dermatology', dept: 'Dermatology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-42.webp' },
  { name: 'Dr. Nguon Darath', specialty: 'Dermatologist', dept: 'Dermatology', image: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/28.-Dr.-Nguon-Darath.webp' },
]

const DEPTS = ['All', ...Array.from(new Set(DOCTORS.map(d => d.dept)))]

export default function DoctorsPage() {
  const [activeDept, setActiveDept] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = DOCTORS.filter(d => {
    const matchDept = activeDept === 'All' || d.dept === activeDept
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  return (
    <SiteLayout>
      <div className="min-h-screen pt-32 pb-20" style={{ background: '#fbf7ee' }}>

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
          {DEPTS.map(d => (
            <button key={d} onClick={() => setActiveDept(d)}
              className="px-4 py-2 rounded-full font-dm-sans text-[13px] border transition-colors"
              style={activeDept === d ? { background: '#b89148', color: '#fff', borderColor: 'transparent' } : { background: '#fff', color: '#594522', borderColor: '#d4b896' }}>
              {d}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map(doc => (
            <div key={doc.name} className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.08)] hover:shadow-[0px_8px_24px_rgba(122,95,44,0.14)] transition-shadow flex flex-col">
              <div className="relative w-full aspect-square bg-gold-50">
                <Image
                  src={doc.image}
                  alt={doc.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  unoptimized
                />
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1">
                <p className="font-cormorant font-bold text-[16px] text-gold-900 leading-tight">{doc.name}</p>
                <p className="font-dm-sans text-[12px] text-gold-700 leading-snug">{doc.specialty}</p>
                <span className="mt-auto pt-2 inline-block font-dm-sans text-[11px] text-gold-600 border-t border-gold-100">{doc.dept}</span>
              </div>
              <Link href="/appointments"
                className="mx-4 mb-4 py-2 rounded-full text-center font-dm-sans text-[12px] text-white transition-opacity hover:opacity-90"
                style={{ background: '#b89148' }}>
                Book
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center font-dm-sans text-[16px] text-gold-700 mt-10">No doctors found.</p>
        )}
      </div>
    </SiteLayout>
  )
}
