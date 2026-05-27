import Image from 'next/image'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'

const CATEGORIES = ['All', 'Medical News', 'Health Tips', 'Hospital Updates', 'Events']

const NEWS = [
  { title: 'Orienda Opens New Neurosurgery Wing', excerpt: 'Our state-of-the-art neurosurgery wing is now open, featuring the latest robotic-assisted surgical systems for precision treatment.', image: '/images/news-featured.jpg', category: 'Hospital Updates', date: 'May 20, 2026', featured: true },
  { title: 'Understanding Heart Health: Prevention Tips', excerpt: 'Our cardiology specialists share essential tips for maintaining a healthy heart and preventing cardiovascular disease.', image: '/images/news-thumb-1.jpg', category: 'Health Tips', date: 'May 18, 2026', featured: false },
  { title: 'Free Health Screening Campaign', excerpt: 'Join us this weekend for free blood pressure, glucose, and cholesterol screenings open to the public.', image: '/images/news-thumb-2.jpg', category: 'Events', date: 'May 15, 2026', featured: false },
  { title: 'New Partnership with International Medical Center', excerpt: 'Orienda International Hospital announces a new collaboration to bring world-class specialists to Cambodia.', image: '/images/news-thumb-3.jpg', category: 'Medical News', date: 'May 10, 2026', featured: false },
  { title: 'Children\'s Health Month Celebration', excerpt: 'Our pediatric department hosted a fun and informative health awareness day for children and families.', image: '/images/news-thumb-4.jpg', category: 'Events', date: 'May 5, 2026', featured: false },
  { title: 'Advances in Orthopedic Surgery', excerpt: 'Dr. Gonzalez shares insights on the latest minimally invasive techniques in joint replacement surgery.', image: '/images/news-thumb-1.jpg', category: 'Medical News', date: 'April 28, 2026', featured: false },
]

export default function NewsPage() {
  const featured = NEWS[0]
  const rest = NEWS.slice(1)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-32 pb-20" style={{ background: '#fbf7ee' }}>

        <div className="text-center px-5 mb-12">
          <h1 className="font-cormorant font-bold text-[64px] text-gold-900 leading-none mb-4">News & Updates</h1>
          <p className="font-dm-sans text-[18px] text-gold-800">Stay informed with the latest from Orienda International Hospital</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 justify-center px-5 mb-12">
          {CATEGORIES.map((c, i) => (
            <button key={c} className={`px-5 py-2 rounded-full font-dm-sans text-[14px] border transition-colors ${i === 0 ? 'text-white border-transparent' : 'text-gold-800 border-gold-300 hover:border-gold-500 bg-white'}`}
              style={i === 0 ? { background: '#b89148' } : {}}>
              {c}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-5">
          {/* Featured */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.10)] mb-10 grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[280px] lg:h-auto">
              <Image src={featured.image} alt={featured.title} fill className="object-cover" sizes="600px" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full font-dm-sans text-[12px] text-white" style={{ background: '#b89148' }}>{featured.category}</span>
                <span className="font-dm-sans text-[13px] text-gold-700">{featured.date}</span>
              </div>
              <h2 className="font-cormorant font-bold text-[36px] text-gold-900 leading-tight">{featured.title}</h2>
              <p className="font-dm-sans text-[15px] text-gold-800 leading-[1.7]">{featured.excerpt}</p>
              <Link href="#" className="self-start px-6 py-3 rounded-full font-dm-sans text-[14px] text-white transition-opacity hover:opacity-90 mt-2" style={{ background: '#b89148' }}>
                Read More
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <div key={article.title} className="bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.10)] flex flex-col hover:shadow-[0px_8px_24px_rgba(122,95,44,0.14)] transition-shadow">
                <div className="relative h-[180px]">
                  <Image src={article.image} alt={article.title} fill className="object-cover" sizes="400px" />
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full font-dm-sans text-[11px] text-white" style={{ background: '#b89148' }}>{article.category}</span>
                    <span className="font-dm-sans text-[12px] text-gold-600">{article.date}</span>
                  </div>
                  <h3 className="font-cormorant font-bold text-[20px] text-gold-900 leading-tight flex-1">{article.title}</h3>
                  <p className="font-dm-sans text-[13px] text-gold-800 leading-[1.6] line-clamp-2">{article.excerpt}</p>
                  <Link href="#" className="font-dm-sans text-[13px] font-medium text-gold-700 hover:text-gold-900 mt-1">Read More →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
