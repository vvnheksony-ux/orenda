import SiteLayout from '@/components/layout/SiteLayout'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'
import { ClipboardCheck, Stethoscope, BedDouble, FileText } from 'lucide-react'

const STEPS = [
  { icon: ClipboardCheck, title: '1. Registration & Check-in', desc: 'Upon arrival, our reception team will guide you through the registration process. Please have your ID and insurance information ready.' },
  { icon: Stethoscope, title: '2. Consultation & Triage', desc: 'A nurse will take your vital signs before you meet with your specialist. During consultation, the doctor will review your history and recommend diagnostics if needed.' },
  { icon: BedDouble, title: '3. Treatment or Admission', desc: 'For outpatient care, you will receive your prescription or treatment plan. For inpatient care, our team will prepare your comfortable recovery room.' },
  { icon: FileText, title: '4. Billing & Pharmacy', desc: 'After your visit, proceed to the billing counter and pharmacy. Our staff will explain your medications and schedule any necessary follow-up appointments.' }
]

export default function ExpectPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-20 px-5" style={{ background: '#fbf7ee' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-cormorant font-bold text-[56px] text-gold-900 leading-none mb-3">What to Expect</h1>
            <p className="font-dm-sans text-[18px] text-gold-800">Your patient journey at Orienda International Hospital.</p>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gold-200 hidden md:block"></div>

            <div className="flex flex-col gap-10">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                    <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4 border-[#fbf7ee]" style={{ background: '#b89148' }}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="bg-white rounded-[20px] p-8 shadow-[0px_4px_16px_rgba(122,95,44,0.08)] flex-1">
                      <h3 className="font-cormorant font-bold text-[28px] text-gold-900 mb-3">{step.title}</h3>
                      <p className="font-dm-sans text-[16px] text-gold-800 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-16 text-center">
            <BookAppointmentButton
              label="Book an Appointment"
              className="inline-block px-10 py-4 rounded-full bg-[#b89148] font-dm-sans text-[18px] font-medium text-white transition-opacity hover:opacity-90"
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
