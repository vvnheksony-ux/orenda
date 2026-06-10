export type OperationTableSlug = 'appointments' | 'inquiries' | 'purchases' | 'profiles'

export type OperationRecord = {
  id: string
  status?: string | null
  created_at?: string | null
  [key: string]: string | number | null | undefined
}

export type ReferenceResolver = {
  recordField: string
  collection: string
  titleField: string
}

export type OperationConfig = {
  slug: OperationTableSlug
  title: string
  singularTitle: string
  description: string
  columns: { key: string; label: string }[]
  editableFields: { key: string; label: string; type?: 'date' | 'datetime' | 'textarea' | 'text' }[]
  statusOptions: string[]
  referenceResolvers?: ReferenceResolver[]
}

export type ReferenceOptionMap = Record<string, Array<{ id: string; name: string }>>

export type OperationViewMode = 'create' | 'edit' | 'list' | 'view'

export const operationConfigs: Record<OperationTableSlug, OperationConfig> = {
  profiles: {
    slug: 'profiles',
    title: 'Profiles',
    singularTitle: 'Profile',
    description: 'User profiles from Supabase public.profiles.',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' },
    ],
    editableFields: [
      { key: 'name', label: 'Name' },
      { key: 'full_name', label: 'Full Name' },
      { key: 'display_name', label: 'Display Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'user_type', label: 'User Type' },
      { key: 'status', label: 'Status' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    ],
    statusOptions: ['active', 'inactive', 'suspended'],
  },
  appointments: {
    slug: 'appointments',
    title: 'Appointments',
    singularTitle: 'Appointment',
    description: 'Public appointment requests from Supabase public.appointments.',
    columns: [
      { key: 'patient_name', label: 'Patient' },
      { key: 'doctor_payload_id_resolved', label: 'Doctor' },
      { key: 'branch_payload_id_resolved', label: 'Branch' },
      { key: 'department_payload_id_resolved', label: 'Department' },
      { key: 'preferred_date', label: 'Preferred Date' },
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
      { key: 'doctor_payload_id', label: 'Doctor' },
      { key: 'branch_payload_id', label: 'Branch' },
      { key: 'department_payload_id', label: 'Department' },
    ],
    statusOptions: ['pending', 'confirmed', 'completed', 'cancelled'],
    referenceResolvers: [
      { recordField: 'doctor_payload_id', collection: 'doctors', titleField: 'name' },
      { recordField: 'branch_payload_id', collection: 'branches', titleField: 'name' },
      { recordField: 'department_payload_id', collection: 'departments', titleField: 'name' },
    ],
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
      { key: 'branch_payload_id_resolved', label: 'Branch' },
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
    referenceResolvers: [
      { recordField: 'promotion_payload_id', collection: 'promotions', titleField: 'title' },
      { recordField: 'branch_payload_id', collection: 'branches', titleField: 'name' },
    ],
  },
}

export function getOperationConfig(slug: string | undefined) {
  if (slug && slug in operationConfigs) {
    return operationConfigs[slug as OperationTableSlug]
  }

  return operationConfigs.appointments
}

export function getOperationHref(slug: OperationTableSlug, mode?: Exclude<OperationViewMode, 'list'>, id?: string) {
  const suffix = mode && id ? `/${mode}/${id}` : mode === 'create' ? '/create' : ''
  return `/admin/operations/${slug}${suffix}`
}

export function statusColor(value: string): string {
  const v = value.toLowerCase()
  if (v === 'pending' || v === 'unread' || v === 'in-progress') return 'bg-[#fef3c7] text-[#92400e]'
  if (v === 'confirmed' || v === 'completed' || v === 'resolved' || v === 'active') return 'bg-[#d1fae5] text-[#065f46]'
  return 'bg-[#ebe7e1] text-[#716b60]'
}

export function parseOperationSegments(segments: string[]) {
  const offset = segments[0] === 'operations' ? 1 : 0
  const table = segments[offset]
  const mode = segments[offset + 1]
  const id = segments[offset + 2]

  return {
    id,
    mode: mode === 'create' || mode === 'view' || mode === 'edit' ? mode : 'list',
    table,
  } satisfies { id: string | undefined; mode: OperationViewMode; table: string | undefined }
}
