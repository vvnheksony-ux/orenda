import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'About Us' }

import SiteLayout from '@/components/layout/SiteLayout'
import AboutHero from '@/components/about/AboutHero'
import VisionMission from '@/components/about/VisionMission'
import OurClinics from '@/components/about/OurClinics'

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[56px] items-center pb-[120px] pt-[100px] lg:pt-[212px]">
          <AboutHero />
          <VisionMission />
          <OurClinics />
        </div>
      </div>
    </SiteLayout>
  )
}
