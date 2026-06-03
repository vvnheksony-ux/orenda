'use client'

import { useState } from 'react'
import { X, ChevronDown, Calendar } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  defaultService?: string
}

const inputCls = 'w-full border border-[#7a5f2c] rounded-[12px] px-[16px] py-[12px] font-dm-sans text-[16px] text-[rgba(59,45,23,0.4)] bg-white outline-none focus:border-[#b89148] transition-colors'
const labelCls = 'font-dm-sans font-medium text-[16px] text-[#7a5f2c]'

export default function BookAppointmentModal({ open, onClose, defaultService = '' }: Props) {
  const [dateChoice, setDateChoice] = useState<'earliest' | 'choose'>('choose')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-[#fbf7ee] rounded-[12px] overflow-y-auto max-h-[90vh] w-[1100px] max-w-[95vw] px-[120px] py-[60px] flex flex-col gap-[40px] items-center"
            style={{ boxShadow: '0px 4px 12px 3px rgba(89,69,34,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-[40px] right-[40px] bg-white/10 p-[12px] rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={16} className="text-[#3b2d17]" />
            </button>

            {/* Header */}
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">
                Book Appointment
              </h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">
                Learn more about our healthcare services and patient support.
              </p>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-[24px] items-start w-full">

              {/* Patient's Name */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className={labelCls}>Patient&apos;s Name</label>
                <input type="text" placeholder="Travis Scott" className={inputCls} />
              </div>

              {/* Phone + Email */}
              <div className="flex gap-[24px] w-full">
                <div className="flex flex-1 flex-col gap-[8px]">
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" placeholder="098 000 999" className={inputCls} />
                </div>
                <div className="flex flex-1 flex-col gap-[8px]">
                  <label className={labelCls}>
                    Email <span className="text-[#9a7838] font-normal">(Optional)</span>
                  </label>
                  <input type="email" placeholder="Travis@gmail.com" className={inputCls} />
                </div>
              </div>

              {/* Service/Purpose */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className={labelCls}>Service/Purpose</label>
                <div className="relative">
                  <select defaultValue={defaultService} className={inputCls + ' appearance-none pr-[40px]'}>
                    <option value="">Select a service</option>
                    <option>Obstetrics</option>
                    <option>Gynecology</option>
                    <option>Spine Center</option>
                    <option>General Medicine</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#7a5f2c] pointer-events-none" />
                </div>
              </div>

              {/* Clinic + Doctor */}
              <div className="flex gap-[24px] w-full">
                <div className="flex flex-1 flex-col gap-[8px]">
                  <label className={labelCls}>
                    Clinic <span className="text-[#9a7838] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <select className={inputCls + ' appearance-none pr-[40px]'}>
                      <option value="">Select clinic</option>
                      <option>Obstetrics</option>
                      <option>Spine Center</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#7a5f2c] pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-[8px]">
                  <label className={labelCls}>
                    Doctor&apos;s Name <span className="text-[#9a7838] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <select className={inputCls + ' appearance-none pr-[40px]'}>
                      <option value="">Select doctor</option>
                      <option>Dr. Navy Blue</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#7a5f2c] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Date preference radio */}
              <div className="flex flex-col gap-[24px] w-full">
                <label
                  className="flex gap-[16px] items-center cursor-pointer"
                  onClick={() => setDateChoice('earliest')}
                >
                  <div className={`size-[24px] rounded-[12px] border-[1.5px] border-[#b89148] flex items-center justify-center shrink-0 ${dateChoice === 'earliest' ? 'bg-[#b89148]' : ''}`}>
                    {dateChoice === 'earliest' && <div className="size-[12px] rounded-full bg-white" />}
                  </div>
                  <span className="font-dm-sans text-[16px] text-[#7a5f2c]">Earliest date available</span>
                </label>
                <label
                  className="flex gap-[16px] items-center cursor-pointer"
                  onClick={() => setDateChoice('choose')}
                >
                  <div className={`size-[24px] rounded-[12px] border-[1.5px] border-[#b89148] flex items-center justify-center shrink-0 ${dateChoice === 'choose' ? 'bg-[#b89148]' : ''}`}>
                    {dateChoice === 'choose' && <div className="size-[12px] rounded-full bg-white" />}
                  </div>
                  <span className="font-dm-sans text-[16px] text-[#7a5f2c]">Choose Prefer Date</span>
                </label>
              </div>

              {/* Date + Time (shown when "Choose Prefer Date") */}
              {dateChoice === 'choose' && (
                <div className="flex gap-[24px] w-full">
                  <div className="flex flex-1 flex-col gap-[8px]">
                    <label className="font-dm-sans text-[16px] text-[#131927]">Preferred date</label>
                    <div className="relative">
                      <input type="date" placeholder="12/05/2026" className={inputCls + ' pr-[40px]'} />
                      <Calendar size={16} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#7a5f2c] pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-[8px]">
                    <label className="font-dm-sans text-[16px] text-[#131927]">Preferred time</label>
                    <div className="relative">
                      <select className={inputCls + ' appearance-none pr-[40px]'}>
                        <option>12:00 AM</option>
                        <option>08:00 AM</option>
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>02:00 PM</option>
                        <option>03:00 PM</option>
                        <option>04:00 PM</option>
                      </select>
                      <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#7a5f2c] pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Describe Symptom */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className={labelCls}>Describe Your Symptom</label>
                <textarea
                  rows={6}
                  placeholder="Enter your message here"
                  className={inputCls + ' resize-none'}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              className="flex items-center justify-center h-[64px] px-[24px] rounded-[12px] bg-[#b89148] w-full"
              style={{ boxShadow: '0px 0px 12px 4px rgba(184,145,72,0.15)' }}
            >
              <span className="font-dm-sans text-[20px] text-[#f9f9f9] leading-none">Book Appointment</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
