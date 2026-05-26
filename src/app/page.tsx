import SiteLayout from '@/components/layout/SiteLayout'
import HeroSection from '@/components/home/HeroSection'
import ClinicSection from '@/components/home/ClinicSection'
import CentersSection from '@/components/home/CentersSection'
import WhySection from '@/components/home/WhySection'
import TourSection from '@/components/home/TourSection'
import SpecialistSection from '@/components/home/SpecialistSection'
import FaqSection from '@/components/home/FaqSection'
import NewsSection from '@/components/home/NewsSection'
import PartnersSection from '@/components/home/PartnersSection'
import MapSection from '@/components/home/MapSection'

export default function Home() {
  return (
    <SiteLayout>
      <HeroSection />
      <ClinicSection />
      <CentersSection />
      <WhySection />
      <TourSection />
      <SpecialistSection />
      <FaqSection />
      <NewsSection />
      <PartnersSection />
      <MapSection />
    </SiteLayout>
  )
}
