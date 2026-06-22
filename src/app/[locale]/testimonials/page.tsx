import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Patient Testimonials' }

import SiteLayout from '@/components/layout/SiteLayout'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import FeedbackForm from '@/components/testimonials/FeedbackForm'
import TestimonialsCarousel from '@/components/testimonials/TestimonialsCarousel'

export default function TestimonialsPage() {
  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="flex flex-col items-center pb-[120px] pt-[100px] lg:pt-[212px] w-full">

          <div className="page-shell flex flex-col gap-[80px] items-center">
            {/* Hero */}
            <PromotionStyleHero
              slides={[
                { src: '/images/testimonials/hero-3.jpg', alt: 'Orienda International Hospital' },
                { src: '/images/hero-doctor.jpg', alt: 'Orienda patient care experience' },
              ]}
              title="Orienda International Hospital"
              lines={[
                'We dedicated to providing safe and reliable medical services.',
                'Schedule and appointment to experience world-class healthcare.',
              ]}
            />

            {/* Customer Feedback */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              <div className="flex flex-col gap-[40px] items-start w-full">
                <div className="flex flex-col gap-[12px] text-center w-full">
                  <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">Customer Feedback</h2>
                  <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] capitalize w-full">Let Us know about your experience</p>
                </div>
                <div className="flex flex-col gap-[24px] items-start w-full max-w-[960px] mx-auto">
                  <p className="font-cormorant font-semibold text-[18px] lg:text-[20px] text-[#3b2d17] leading-tight capitalize w-full">
                    Dear Everyone, We very much appreciate hearing from our patients, visitors, and other customers. Please use this form to provide us feedback on the following:
                  </p>
                  <ul className="list-disc pl-[24px] flex flex-col gap-[8px] w-full">
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      <span className="font-semibold">Our Services:</span>{' '}please let us know if our services need improvement along with any suggestions you might have.
                    </li>
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      <span className="font-semibold">Safety Concerns:</span>{' '}please let us know if you notice anything you feel we should address to make our hospital and clinic a safer environment.
                    </li>
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      <span className="font-semibold">Ethical Concerns:</span>{' '}please let us know if you notice anything you feel is an ethical issue that should be addressed by the Hospital&apos;s Ethics Committee.
                    </li>
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      These forms are collected by our Total Quality Management team every day and routed to staff members best able to respond to feedback received. If you&apos;d like to suggest via email, please feel free to write us at www.orienda.com. We thank you very much for your feedback. Warm regards, The Hospital Management Team
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full max-w-[960px] mx-auto">
                <FeedbackForm />
              </div>
            </div>
          </div>

          {/* Customer Testimonials - Full Bleed */}
          <div className="flex flex-col gap-[40px] items-center w-full mt-[80px]">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">Customer Testimonials</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] capitalize w-full">Let Us know about your experience</p>
            </div>
            <TestimonialsCarousel />
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
