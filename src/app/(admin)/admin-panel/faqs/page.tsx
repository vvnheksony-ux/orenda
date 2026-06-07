import { AdminTablePage } from '@/components/admin/AdminManagementPage'

const faqs = [
  { question: 'What is the return policy?', answer: 'You can return any item within 30 days of purchase.', status: 'published' },
  { question: 'How to track my order?', answer: 'You can track your order using the tracking link sent to your email.', status: 'published' },
  { question: 'What payment methods are accepted?', answer: 'We accept all major credit cards and PayPal.', status: 'draft' },
  { question: 'How to contact customer support?', answer: 'You can contact us via the contact form on our website.', status: 'published' },
  { question: 'Do you offer international shipping?', answer: 'Yes, we ship to most countries worldwide.', status: 'draft' },
]

export default function FAQsPage() {
  return (
    <AdminTablePage
      title="FAQs"
      breadcrumb="Operations & Sales > FAQs"
      searchPlaceholder="Search FAQs..."
      primaryActionLabel="New FAQ"
      table={{
        rows: faqs,
        rowKey: (_row, index) => `faq-${index}`,
        columns: [
          { key: 'question', label: 'Question' },
          { key: 'answer', label: 'Answer' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [{ label: 'View Details', tone: 'gold' }],
      }}
    />
  )
}
