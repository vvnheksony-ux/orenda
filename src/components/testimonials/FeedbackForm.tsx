'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { DatePicker, CustomSelect } from '@/components/shared/FormControls'

const inputCls = 'w-full min-w-0 border border-[#dcbd72] rounded-[12px] px-[16px] py-[12px] font-dm-sans text-[16px] text-[rgba(59,45,23,0.5)] bg-white outline-none focus:border-[#b89148] transition-colors'
const labelCls = 'font-dm-sans font-medium text-[16px] text-[#3b2d17]'
const radioCls = 'shrink-0 size-[24px] rounded-[12px] border-[1.5px] border-[#b89148] appearance-none checked:bg-[#b89148] cursor-pointer'

type FeedbackFormState = {
  date_of_birth: string
  clinic_visited: string
  contact_required: boolean
  title: string
  feedback_type: string
  email: string
  phone: string
  first_name: string
  last_name: string
  nationality: string
  role: string
  comment: string
}

export default function FeedbackForm() {
  const locale = useLocale()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<FeedbackFormState>({
    date_of_birth: '',
    clinic_visited: '',
    contact_required: false,
    title: '',
    feedback_type: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    nationality: '',
    role: '',
    comment: '',
  })

  const set = <K extends keyof FeedbackFormState>(field: K, value: FeedbackFormState[K]) => setForm(f => ({ ...f, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.feedback_type) {
      setError('Please select a feedback type.')
      return
    }
    if (!form.comment.trim()) {
      setError('Please enter your feedback.')
      return
    }
    if (form.contact_required && !form.email.trim() && !form.phone.trim()) {
      setError('Please provide an email or phone number if you want us to contact you.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#fbf7ee] flex flex-col items-center justify-center p-6 sm:p-[40px] rounded-[16px] w-full min-h-[200px] gap-[16px]" style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
        <p className="font-cormorant font-bold text-[28px] sm:text-[32px] text-[#3b2d17] text-center">Thank You!</p>
        <p className="font-dm-sans text-[16px] sm:text-[18px] text-[#594522] text-center">Your feedback has been submitted successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#fbf7ee] flex flex-col items-center overflow-hidden p-5 sm:p-8 lg:p-[40px] rounded-[16px] w-full" style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
      <div className="flex flex-col gap-[80px] items-center w-full">

        <div className="flex flex-col gap-[32px] items-start w-full">
          <div className="flex flex-col gap-[8px] text-center w-full">
            <h3 className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none w-full">Submit Your Feedback</h3>
            <p className="font-dm-sans text-[16px] text-[#594522] w-full">We&apos;d love to hear about your experience with us.</p>
          </div>

          <div className="flex flex-col gap-[24px] w-full">
            <DatePicker
              label="Date of Birth"
              value={form.date_of_birth}
              onChange={v => set('date_of_birth', v)}
              placeholder="Select date of birth"
              labelCls={labelCls}
            />

            <CustomSelect
              label="Clinic/Area Visited"
              value={form.clinic_visited}
              onChange={v => set('clinic_visited', v)}
              options={['Spine', 'Obstetrics', 'Gynecology', 'General Medicine']}
              placeholder="Select clinic"
              labelCls={labelCls}
            />

            <div className="flex flex-col gap-[16px] w-full">
              <label className={labelCls}>Would you like us to contact you about your feedback?</label>
              <div className="flex flex-col gap-[16px] px-[12px]">
                {[{ label: 'Response Required', value: true }, { label: 'Response Is Not Required', value: false }].map(opt => (
                  <label key={opt.label} className="flex gap-[16px] items-center cursor-pointer">
                    <input type="radio" name="contact_required" checked={form.contact_required === opt.value} onChange={() => set('contact_required', opt.value)} className={radioCls} />
                    <span className="font-dm-sans text-[16px] text-[#3b2d17]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[8px] w-full">
              <label className={labelCls}>Title</label>
              <input type="text" placeholder="Dr. Navy Blue" value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} />
            </div>

            <div className="flex flex-col gap-[16px] w-full">
              <label className={labelCls}>Type of Feedback</label>
              <div className="flex flex-col gap-[16px] px-[12px]">
                {['Praise', 'Suggestion', 'Complaint'].map(opt => (
                  <label key={opt} className="flex gap-[16px] items-center cursor-pointer">
                    <input type="radio" name="feedbackType" value={opt} checked={form.feedback_type === opt} onChange={() => set('feedback_type', opt)} className={radioCls} />
                    <span className="font-dm-sans text-[16px] text-[#3b2d17]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[24px] items-start w-full">
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>Email</label>
                <input type="email" placeholder="Travis@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>Phone Number</label>
                <input type="tel" placeholder="098 000 999" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[24px] items-start w-full">
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>First Name</label>
                <input type="text" placeholder="Travis" value={form.first_name} onChange={e => set('first_name', e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>Last Name</label>
                <input type="text" placeholder="Scott" value={form.last_name} onChange={e => set('last_name', e.target.value)} className={inputCls} />
              </div>
            </div>

            <CustomSelect
              label="Nationality"
              value={form.nationality}
              onChange={v => set('nationality', v)}
              options={['Cambodian', 'Other']}
              placeholder="Select nationality"
              labelCls={labelCls}
            />

            <div className="flex flex-col gap-[16px] w-full">
              <label className={labelCls}>Please select your role</label>
              <div className="flex flex-col gap-[16px] px-[12px]">
                {['Patient', 'Other'].map(opt => (
                  <label key={opt} className="flex gap-[16px] items-center cursor-pointer">
                    <input type="radio" name="role" value={opt} checked={form.role === opt} onChange={() => set('role', opt)} className={radioCls} />
                    <span className="font-dm-sans text-[16px] text-[#3b2d17]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[8px] w-full">
              <label className={labelCls}>Your Feedback</label>
              <textarea
                value={form.comment}
                onChange={e => set('comment', e.target.value)}
                placeholder="Share your experience..."
                rows={5}
                className="w-full border border-[#dcbd72] rounded-[12px] px-[16px] py-[12px] font-dm-sans text-[16px] text-[rgba(59,45,23,0.5)] bg-white outline-none focus:border-[#b89148] transition-colors resize-none placeholder:text-[rgba(59,45,23,0.3)]"
              />
            </div>
          </div>
        </div>

        {error && <p className="font-dm-sans text-[14px] text-red-500 w-full text-center">{error}</p>}

        <div className="flex flex-col items-center w-full">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#b89148] flex items-center justify-center overflow-hidden px-[24px] py-[16px] rounded-[12px] w-[232px] disabled:opacity-60 hover:bg-[#c8a25a] transition-colors"
          >
            <span className="font-dm-sans font-semibold text-[20px] text-[#fbf7ee]">
              {submitting ? 'Sending...' : 'Send Feedback'}
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}
