import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
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
export default function Home() {
  return (
    <SiteLayout>
      <HeroSection />
      <div className="flex flex-col gap-[40px] sm:gap-[60px] lg:gap-[80px] xl:gap-[120px]">
        <Reveal><ClinicSection /></Reveal>
        <Reveal><CentersSection /></Reveal>
        <Reveal><WhySection /></Reveal>
        <Reveal><FacilitiesSection /></Reveal>
        <Reveal className="hidden sm:block"><TourSection /></Reveal>
        <Reveal><SpecialistSection /></Reveal>
        <Reveal><FaqSection /></Reveal>
        <Reveal><NewsSection /></Reveal>
        <Reveal><PartnersSection /></Reveal>
        <Reveal><MapSection /></Reveal>
      </div>
    </SiteLayout>
  )
}
