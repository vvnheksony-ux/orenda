import SiteLayout from '@/components/layout/SiteLayout'
import AboutHero from '@/components/about/AboutHero'
import VisionMission from '@/components/about/VisionMission'
import OurClinics from '@/components/about/OurClinics'

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[56px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">
          <AboutHero />
          <VisionMission />
          <OurClinics />
        </div>
      </div>
    </SiteLayout>
  )
}
