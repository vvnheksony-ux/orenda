export type OperationTableSlug = 'appointments' | 'inquiries' | 'purchases'

export type OperationRecord = {
  id: string
  status?: string | null
  created_at?: string | null
  [key: string]: string | number | null | undefined
}

export type OperationConfig = {
  slug: OperationTableSlug
  title: string
  singularTitle: string
  description: string
  columns: { key: string; label: string }[]
  editableFields: { key: string; label: string; type?: 'date' | 'datetime' | 'textarea' | 'text' }[]
  statusOptions: string[]
}

export const operationConfigs: Record<OperationTableSlug, OperationConfig> = {
  appointments: {
    slug: 'appointments',
    title: 'Appointments',
    singularTitle: 'Appointment',
    description: 'Public appointment requests from Supabase public.appointments.',
    columns: [
      { key: 'patient_name', label: 'Patient' },
      { key: 'patient_phone', label: 'Phone' },
      { key: 'patient_email', label: 'Email' },
      { key: 'preferred_date', label: 'Preferred Date' },
      { key: 'preferred_time', label: 'Preferred Time' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' },
    ],
    editableFields: [
      { key: 'patient_name', label: 'Patient Name' },
      { key: 'patient_phone', label: 'Patient Phone' },
      { key: 'patient_email', label: 'Patient Email' },
      { key: 'preferred_date', label: 'Preferred Date', type: 'date' },
      { key: 'preferred_time', label: 'Preferred Time' },
      { key: 'slot_start', label: 'Slot Start', type: 'datetime' },
      { key: 'slot_end', label: 'Slot End', type: 'datetime' },
      { key: 'message', label: 'Reason / Message', type: 'textarea' },
      { key: 'language', label: 'Language' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
      { key: 'doctor_payload_id', label: 'Doctor Payload ID' },
      { key: 'branch_payload_id', label: 'Branch Payload ID' },
      { key: 'department_payload_id', label: 'Department Payload ID' },
    ],
    statusOptions: ['pending', 'confirmed', 'completed', 'cancelled'],
  },
  inquiries: {
    slug: 'inquiries',
    title: 'Inquiries',
    singularTitle: 'Inquiry',
    description: 'Public contact inquiries from Supabase public.inquiries.',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' },
    ],
    editableFields: [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'language', label: 'Language' },
      { key: 'status', label: 'Status' },
    ],
    statusOptions: ['unread', 'in-progress', 'resolved', 'closed'],
  },
  purchases: {
    slug: 'purchases',
    title: 'Promotion Purchases',
    singularTitle: 'Purchase',
    description: 'Promotion purchase requests from Supabase public.purchases.',
    columns: [
      { key: 'patient_name', label: 'Patient' },
      { key: 'patient_phone', label: 'Phone' },
      { key: 'patient_email', label: 'Email' },
      { key: 'promotion_title', label: 'Promotion' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
      { key: 'created_at', label: 'Created' },
    ],
    editableFields: [
      { key: 'patient_name', label: 'Patient Name' },
      { key: 'patient_phone', label: 'Patient Phone' },
      { key: 'patient_email', label: 'Patient Email' },
      { key: 'promotion_id', label: 'Promotion ID' },
      { key: 'promotion_payload_id', label: 'Promotion Payload ID' },
      { key: 'promotion_title', label: 'Promotion Title' },
      { key: 'branch_id', label: 'Branch ID' },
      { key: 'branch_payload_id', label: 'Branch Payload ID' },
      { key: 'message', label: 'Note', type: 'textarea' },
      { key: 'language', label: 'Language' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
    ],
    statusOptions: ['pending', 'contacted', 'completed', 'cancelled'],
  },
}

export function getOperationConfig(slug: string | undefined) {
  if (slug === 'appointments' || slug === 'inquiries' || slug === 'purchases') {
    return operationConfigs[slug]
  }

  return operationConfigs.appointments
}
