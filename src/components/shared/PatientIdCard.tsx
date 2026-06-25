'use client'

import { useEffect, useRef } from 'react'
import Barcode from 'react-barcode'

interface PatientIdCardAppt {
  patient_id?: string | null
}

/**
 * Gold "Patient ID" card for an appointment's detail view.
 * It binds directly to the real `patient_id` (the hospital patient number).
 * While `patient_id` is still the all-zeros placeholder (not yet issued), the
 * card shows only a note. Once a real `patient_id` exists, it shows the HN and a
 * scannable Code128 barcode of it.
 */
export default function PatientIdCard({ appt }: { appt: PatientIdCardAppt }) {
  const raw = appt.patient_id != null ? String(appt.patient_id).trim() : ''
  // A real patient ID is non-empty and not the all-zeros placeholder.
  const hasId = raw.length > 0 && !/^0+$/.test(raw)

  // Stretch the generated barcode SVG to fill the white box edge-to-edge
  // (jsbarcode renders a fixed-width SVG with no viewBox, so it would otherwise
  // sit centered with empty space on the sides).
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const svg = barRef.current?.querySelector('svg') as SVGSVGElement | null
    if (!svg) return
    // Derive the barcode's intrinsic size from its drawn content, then make the
    // SVG fill the wrapper (preserveAspectRatio="none" stretches it edge-to-edge).
    try {
      const b = svg.getBBox()
      if (b.width && b.height) svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.width} ${b.height}`)
    } catch { /* getBBox unavailable */ }
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.display = 'block'
  }, [raw, hasId])

  return (
    <div
      className="relative w-full overflow-hidden rounded-[18px] px-5 py-5 sm:px-6"
      style={{
        background: 'linear-gradient(135deg, #c9a25a 0%, #b8924a 45%, #9c7a38 100%)',
        boxShadow: '0 8px 24px rgba(120,90,30,0.28)',
      }}
    >
      <p className="font-dm-sans text-[11px] tracking-[2px] uppercase text-white/70">Patient ID</p>

      {hasId ? (
        <>
          <div className="flex items-center gap-3 mt-2">
            <span className="size-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-white text-[18px] font-bold leading-none">#</span>
            <span className="font-dm-sans font-bold text-white text-[22px] sm:text-[26px] tracking-[2px] break-all">
              <span className="text-white/75 mr-2">HN</span>{raw}
            </span>
          </div>

          <div className="mt-4 rounded-[8px] bg-white px-3 py-2 overflow-hidden">
            <div ref={barRef} className="w-full h-[56px]">
              <Barcode
                value={raw}
                format="CODE128"
                displayValue={false}
                height={56}
                width={1.5}
                margin={0}
                background="#ffffff"
                lineColor="#16110a"
              />
            </div>
          </div>
        </>
      ) : (
        <p className="font-dm-sans text-[12px] text-white/75 mt-3">
          Patient ID is issued by the hospital once your appointment is confirmed.
        </p>
      )}
    </div>
  )
}
