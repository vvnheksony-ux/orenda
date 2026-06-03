import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import FeedbackForm from '@/components/testimonials/FeedbackForm'
import TestimonialsCarousel from '@/components/testimonials/TestimonialsCarousel'

export default function TestimonialsPage() {
  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[80px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">

          {/* Hero */}
          <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronLeft size={40} />
            </button>
            <div className="bg-white flex h-[472px] items-center justify-end overflow-hidden relative rounded-[16px] flex-1 max-w-[1352px]">
              <div className="relative h-[448px] rounded-[16px] shrink-0 w-[650px] overflow-hidden mr-[12px]">
                <Image src="/images/testimonials/hero-3.jpg" alt="Orienda International Hospital" fill className="object-cover rounded-[16px]" sizes="650px" priority />
              </div>
              <div className="absolute left-[58px] top-[79px] flex flex-col gap-[40px] items-start w-[618px]">
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Orienda International Hospital</h1>
                <div className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
                  <p className="mb-[12px]">We dedicated to providing safe and reliable medical services.</p>
                  <p>Schedule and appointment to experience world-class healthcare.</p>
                </div>
                <Link href="/about" className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]">
                  <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
                  <ArrowRight size={20} className="text-[#5c4924]" />
                </Link>
              </div>
            </div>
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Customer Feedback */}
          <div className="flex flex-col gap-[40px] items-start w-full">
            <div className="flex flex-col gap-[40px] items-start w-full">
              <div className="flex flex-col gap-[12px] text-center w-full">
                <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">Customer Feedback</h2>
                <p className="font-dm-sans text-[20px] text-[#594522] capitalize w-full">Let Us know about your experience</p>
              </div>
              <div className="flex flex-col gap-[24px] items-start px-[40px] w-full">
                <p className="font-cormorant font-semibold text-[20px] text-black leading-none capitalize w-full">
                  Dear Everyone, We very much appreciate hearing from our patients, visitors, and other customers. Please use this form to provide us feedback on the following:
                </p>
                <ul className="list-disc pl-[24px] flex flex-col gap-[8px] w-full">
                  <li className="font-dm-sans text-[18px] text-[#594522] leading-normal">
                    <span className="font-semibold">Our Services:</span>{' '}please let us know if our services need improvement along with any suggestions you might have.
                  </li>
                  <li className="font-dm-sans text-[18px] text-[#594522] leading-normal">
                    <span className="font-semibold">Safety Concerns:</span>{' '}please let us know if you notice anything you feel we should address to make our hospital and clinic a safer environment.
                  </li>
                  <li className="font-dm-sans text-[18px] text-[#594522] leading-normal">
                    <span className="font-semibold">Ethical Concerns:</span>{' '}please let us know if you notice anything you feel is an ethical issue that should be addressed by the Hospital&apos;s Ethics Committee.
                  </li>
                  <li className="font-dm-sans text-[18px] text-[#594522] leading-normal">
                    These forms are collected by our Total Quality Management team every day and routed to staff members best able to respond to feedback received. If you&apos;d like to suggest via email, please feel free to write us at www.orienda.com. We thank you very much for your feedback. Warm regards, The Hospital Management Team
                  </li>
                </ul>
              </div>
            </div>
            <FeedbackForm />
          </div>

          {/* Customer Testimonials */}
          <div className="flex flex-col gap-[40px] items-center w-full max-w-[1352px]">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">Customer Testimonials</h2>
              <p className="font-dm-sans text-[20px] text-[#594522] capitalize w-full">Let Us know about your experience</p>
            </div>
            <TestimonialsCarousel />
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
