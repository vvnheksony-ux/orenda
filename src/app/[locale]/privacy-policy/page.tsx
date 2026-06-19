import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy' }

import SiteLayout from '@/components/layout/SiteLayout'

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly to us — such as your name, phone number, email address, and any details you share when booking an appointment, sending an inquiry, or creating an account. We also collect limited technical data (such as device and usage information) to operate and improve our website.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to schedule and manage appointments, respond to your inquiries, provide healthcare services and support, send you relevant updates you have requested, and improve the quality of our services. We do not sell your personal information.',
  },
  {
    title: 'Data Security',
    body: 'We apply appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, or misuse. Access to medical and personal data is restricted to authorized personnel only.',
  },
  {
    title: 'Cookies',
    body: 'Our website uses cookies and similar technologies to analyze traffic, remember your preferences, and enhance your experience. You can manage your cookie preferences at any time through your browser settings or the cookie banner.',
  },
  {
    title: 'Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal information held by Orienda International Hospital, subject to applicable laws and medical record-retention requirements. To exercise these rights, please contact us.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions about this Privacy Policy or how your information is handled, please contact Orienda International Hospital through the contact details provided on our website.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="narrow-shell flex flex-col gap-10 pb-[120px] pt-[100px] lg:pt-[212px]">
          <div className="flex flex-col gap-3">
            <h1 className="font-cormorant font-bold text-[40px] lg:text-[52px] text-[#3b2d17] leading-none">Privacy Policy</h1>
            <p className="font-dm-sans text-[15px] text-[#6b5836]">Orienda International Hospital is committed to protecting your privacy.</p>
          </div>

          <div className="flex flex-col gap-8">
            {SECTIONS.map((s) => (
              <section key={s.title} className="flex flex-col gap-2">
                <h2 className="font-cormorant font-bold text-[24px] lg:text-[28px] text-[#9a7838] leading-tight">{s.title}</h2>
                <p className="font-dm-sans text-[15px] lg:text-[16px] text-[#3b2d17] leading-[1.8]">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
