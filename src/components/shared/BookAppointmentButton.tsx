'use client'

import { useState } from 'react'
import BookAppointmentModal from './BookAppointmentModal'

interface Props {
  defaultService?: string
  className?: string
  label?: string
}

export default function BookAppointmentButton({ defaultService, className, label = 'Book Appointment' }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <BookAppointmentModal open={open} onClose={() => setOpen(false)} defaultService={defaultService} />
    </>
  )
}
