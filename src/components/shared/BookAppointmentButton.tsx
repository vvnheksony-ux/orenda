'use client'

import { useState } from 'react'
import BookAppointmentModal from './BookAppointmentModal'

interface Props {
  defaultService?: string
  defaultDoctorId?: string
  defaultDepartmentId?: string
  defaultBranchId?: string
  className?: string
  label?: string
}

export default function BookAppointmentButton({ defaultService, defaultDoctorId, defaultDepartmentId, defaultBranchId, className, label = 'Book Appointment' }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <BookAppointmentModal open={open} onClose={() => setOpen(false)} defaultService={defaultService} defaultDoctorId={defaultDoctorId} defaultDepartmentId={defaultDepartmentId} defaultBranchId={defaultBranchId} />
    </>
  )
}
