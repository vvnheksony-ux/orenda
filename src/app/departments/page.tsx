import Image from 'next/image'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'

const DEPARTMENTS = [
  { name: 'Neuro Surgery', desc: 'Advanced brain and spinal surgery with 99% success rate and 20,000+ procedures completed.', image: '/images/specialty-neuro.png', stats: ['99% Success', '20k+ Surgeries'] },
  { name: 'Cardiology', desc: 'Comprehensive cardiac care from diagnostics to interventional procedures and rehabilitation.', image: '/images/specialty-neuro.png', stats: ['97% Success', '15k+ Procedures'] },
  { name: 'Orthopedics', desc: 'Full orthopedic care including joint replacement, sports medicine, and trauma surgery.', image: '/images/specialty-neuro.png', stats: ['98% Success', '12k+ Surgeries'] },
  { name: 'Obstetric', desc: 'Comprehensive maternity care with modern facilities for a safe and comfortable birth experience.', image: '/images/specialty-obstetric.png', stats: ['Safe delivery', '24/7 care'] },
  { name: 'Gynecology', desc: 'Complete womens health services including preventive care, diagnostics, and treatment.', image: '/images/specialty-gynecology.png', stats: ['Expert team', 'Full care'] },
  { name: 'Pediatric', desc: 'Dedicated child healthcare from newborns to teenagers with compassionate specialists.', image: '/images/specialty-pediatric.png', stats: ['Child focused', 'All ages'] },
  { name: 'Imaging Center', desc: 'State-of-the-art diagnostic imaging including MRI, CT scan, ultrasound, and X-ray.', image: '/images/specialty-imaging.png', stats: ['Latest tech', 'Fast results'] },
  { name: 'General Medicine', desc: 'Primary care and internal medicine for adults covering a wide range of medical conditions.', image: '/images/specialty-neuro.png', stats: ['24/7 available', 'All conditions'] },
]

export default function DepartmentsPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen pt-32 pb-20" style={{ background: '#fbf7ee' }}>

        <div className="text-center px-5 mb-14">
          <h1 className="font-cormorant font-bold text-[64px] text-gold-900 leading-none mb-4">Centers of Excellence</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-lg mx-auto">World-class medical departments equipped with the latest technology</p>
        </div>

        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPARTMENTS.map((dept) => (
            <div key={dept.name} className="bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.10)] flex flex-col hover:shadow-[0px_8px_32px_rgba(122,95,44,0.16)] transition-shadow">
              <div className="relative h-[160px] flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg,rgba(234,214,164,0.3),rgba(184,145,72,0.2))' }}>
                <div className="relative w-[100px] h-[100px]">
                  <Image src={dept.image} alt={dept.name} fill className="object-contain" sizes="100px" />
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <h3 className="font-cormorant font-bold text-[22px] text-gold-900 leading-tight">{dept.name}</h3>
                <p className="font-dm-sans text-[13px] text-gold-800 leading-[1.6] flex-1">{dept.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  {dept.stats.map(s => (
                    <span key={s} className="px-2 py-1 rounded-full font-dm-sans text-[11px] text-gold-700 border border-gold-200 bg-gold-50/30">{s}</span>
                  ))}
                </div>
                <Link href="/appointments" className="mt-1 w-full text-center py-2.5 rounded-full font-dm-sans text-[13px] text-white transition-opacity hover:opacity-90" style={{ background: '#b89148' }}>
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  )
}
