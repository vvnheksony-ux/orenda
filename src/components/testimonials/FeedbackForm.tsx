'use client'

import { useState } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'

const inputCls = 'w-full border border-[#dcbd72] rounded-[12px] px-[16px] py-[12px] font-dm-sans text-[16px] text-[rgba(59,45,23,0.5)] bg-white outline-none focus:border-[#b89148] transition-colors'
const labelCls = 'font-dm-sans font-medium text-[16px] text-[#3b2d17]'
const radioCls = 'shrink-0 size-[24px] rounded-[12px] border-[1.5px] border-[#b89148] appearance-none checked:bg-[#b89148] cursor-pointer'

export default function FeedbackForm() {
  const [response, setResponse] = useState<string>('')
  const [feedbackType, setFeedbackType] = useState<string>('')
  const [role, setRole] = useState<string>('')

  return (
    <div className="bg-[#fbf7ee] flex flex-col items-center overflow-hidden p-[40px] rounded-[16px] w-full" style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
      <div className="flex flex-col gap-[80px] items-center w-full">

        {/* Form fields */}
        <div className="flex flex-col gap-[32px] items-start w-full">
          {/* Header */}
          <div className="flex flex-col gap-[8px] text-center w-full">
            <h3 className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none w-full">Submit Your Feedback</h3>
            <p className="font-dm-sans text-[16px] text-[#594522] w-full">Book an appointment with us today</p>
          </div>

          <div className="flex flex-col gap-[24px] w-full">
            {/* Date of Birth */}
            <div className="flex flex-col gap-[8px] w-full">
              <label className={labelCls}>Date of Birth</label>
              <div className="relative">
                <input type="date" placeholder="11/05/2016" className={inputCls} />
                <Calendar size={16} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#3b2d17] opacity-40 pointer-events-none" />
              </div>
            </div>

            {/* Clinic/Area Visited */}
            <div className="flex flex-col gap-[8px] w-full">
              <label className={labelCls}>Clinic/Area Visited</label>
              <div className="relative">
                <select className={inputCls + ' appearance-none pr-[40px]'}>
                  <option value="">Spine</option>
                  <option>Obstetrics</option>
                  <option>Gynecology</option>
                  <option>General Medicine</option>
                </select>
                <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#3b2d17] opacity-50 pointer-events-none" />
              </div>
            </div>

            {/* Response required */}
            <div className="flex flex-col gap-[16px] w-full">
              <label className={labelCls}>Would you like us to contact you about your feedback?</label>
              <div className="flex flex-col gap-[16px] px-[12px]">
                {['Response Required', 'Response Is Not Required'].map(opt => (
                  <label key={opt} className="flex gap-[16px] items-center cursor-pointer">
                    <input type="radio" name="response" value={opt} checked={response === opt} onChange={() => setResponse(opt)} className={radioCls} />
                    <span className="font-dm-sans text-[16px] text-[#3b2d17]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-[8px] w-full">
              <label className={labelCls}>Title</label>
              <input type="text" placeholder="Dr. Navy Blue" className={inputCls} />
            </div>

            {/* Feedback type */}
            <div className="flex flex-col gap-[16px] w-full">
              <label className={labelCls}>Would you like us to contact you about your feedback?</label>
              <div className="flex flex-col gap-[16px] px-[12px]">
                {['Praise', 'Suggestion', 'Complaint'].map(opt => (
                  <label key={opt} className="flex gap-[16px] items-center cursor-pointer">
                    <input type="radio" name="feedbackType" value={opt} checked={feedbackType === opt} onChange={() => setFeedbackType(opt)} className={radioCls} />
                    <span className="font-dm-sans text-[16px] text-[#3b2d17]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email + Phone */}
            <div className="flex gap-[24px] items-start w-full">
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>Email</label>
                <input type="email" placeholder="Travis@gmail.com" className={inputCls} />
              </div>
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>Phone Number</label>
                <input type="tel" placeholder="098 000 999" className={inputCls} />
              </div>
            </div>

            {/* First + Last Name */}
            <div className="flex gap-[24px] items-start w-full">
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>First Name</label>
                <input type="text" placeholder="Travis" className={inputCls} />
              </div>
              <div className="flex flex-1 flex-col gap-[8px]">
                <label className={labelCls}>Last Name</label>
                <input type="text" placeholder="Scott" className={inputCls} />
              </div>
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-[8px] w-full">
              <label className={labelCls}>Nationality</label>
              <div className="relative">
                <select className={inputCls + ' appearance-none pr-[40px]'}>
                  <option value="">Cambodian</option>
                  <option>Other</option>
                </select>
                <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#3b2d17] opacity-50 pointer-events-none" />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-[16px] w-full">
              <label className={labelCls}>Please select your role</label>
              <div className="flex flex-col gap-[16px] px-[12px]">
                {['Patient', 'Other'].map(opt => (
                  <label key={opt} className="flex gap-[16px] items-center cursor-pointer">
                    <input type="radio" name="role" value={opt} checked={role === opt} onChange={() => setRole(opt)} className={radioCls} />
                    <span className="font-dm-sans text-[16px] text-[#3b2d17]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center w-full">
          <button
            type="submit"
            className="bg-[#b89148] flex items-center justify-center overflow-hidden px-[24px] py-[16px] rounded-[12px] w-[232px]"
          >
            <span className="font-dm-sans font-semibold text-[20px] text-[#fbf7ee]">Send Feedback</span>
          </button>
        </div>
      </div>
    </div>
  )
}
