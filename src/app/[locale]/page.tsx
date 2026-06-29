import { Suspense } from 'react'
import { headers } from 'next/headers'
import SiteLayout from '@/components/layout/SiteLayout'
import HeroSection from '@/components/home/HeroSection'
import ClinicSection from '@/components/home/ClinicSection'
import CentersSection from '@/components/home/CentersSection'
import WhySection from '@/components/home/WhySection'
import FacilitiesSection from '@/components/home/FacilitiesSection'
import TourSection from '@/components/home/TourSection'
import SpecialistSection from '@/components/home/SpecialistSection'
import FaqSection from '@/components/home/FaqSection'
import NewsSection from '@/components/home/NewsSection'
import PartnersSection from '@/components/home/PartnersSection'
import MapSection from '@/components/home/MapSection'

// Fetch the (non-branch-dependent) home section data on the server so these
// sections render with data already in place — no client "empty then pop-in"
// waterfall. Each route is cached, so this is cheap after the first request.
async function getHomeData(locale: string) {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const base = host
    ? `${proto}://${host}`
    : process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const json = async (path: string) => {
    try {
      const res = await fetch(`${base}${path}`, { next: { revalidate: 300 } })
      return res.ok ? await res.json() : null
    } catch {
      return null
    }
  }

  const [whyStats, news, tourScenes] = await Promise.all([
    json(`/api/why-stats?locale=${locale}`),
    json(`/api/news?locale=${locale}&limit=5`),
    json(`/api/tour-scenes?locale=${locale}`),
  ])

  return {
    initialStats: whyStats?.docs?.length ? whyStats.docs : null,
    initialNews: Array.isArray(news?.docs) ? news.docs : [],
    initialRooms: Array.isArray(tourScenes)
      ? tourScenes.map((s: any) => ({ id: s.id, name: s.title, image: s.thumbnailUrl ?? '/images/figma-room-1.jpg' }))
      : [],
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { initialStats, initialNews, initialRooms } = await getHomeData(locale)
  return (
    <SiteLayout>
      <HeroSection />
      <div className="flex flex-col gap-[40px] sm:gap-[60px] lg:gap-[80px] xl:gap-[120px]">
        <ClinicSection />
        <CentersSection />
        <WhySection initialStats={initialStats} />
        <FacilitiesSection />
        <div className="hidden sm:block"><TourSection initialRooms={initialRooms} /></div>
        <SpecialistSection />
        <Suspense fallback={null}><FaqSection locale={locale} /></Suspense>
        <NewsSection initialNews={initialNews} />
        <PartnersSection />
        <MapSection />
      </div>
    </SiteLayout>
  )
}
