import { AdminCardPage } from '@/components/admin/AdminManagementPage'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { Promotion } from '@/../payload-types'

export const dynamic = 'force-dynamic'

export default async function PromotionPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'promotions',
    depth: 2,
    limit: 50,
    sort: '-updatedAt',
    draft: true,
  })

  const promotions = docs.map(mapPromotionCard)

  return (
    <AdminCardPage
      title="Promotions"
      breadcrumb="Content > Promotions"
      searchPlaceholder="Search promotions..."
      primaryActionLabel="Add Promotion"
      cards={{
        items: promotions,
        rowKey: 'id',
        actions: [
          { label: 'Preview promotion', icon: 'view', tone: 'muted' },
          { label: 'Edit promotion', icon: 'edit', tone: 'blue' },
          { label: 'Delete promotion', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}

function mapPromotionCard(promotion: Promotion) {
  return {
    id: String(promotion.id),
    title: promotion.title,
    description: getRichTextExcerpt(promotion.description),
    image: promotion.image,
    updated: getPromotionMeta(promotion),
    status: promotion.status ?? promotion._status ?? 'draft',
  }
}

function getPromotionMeta(promotion: Promotion) {
  const validity = [formatDate(promotion.validFrom), formatDate(promotion.validTo)].filter(Boolean).join(' - ')
  if (validity) return `Valid: ${validity}`
  return `Updated: ${formatDate(promotion.updatedAt)}`
}

function getRichTextExcerpt(value: Promotion['description']) {
  const text = value?.root?.children.map(extractNodeText).filter(Boolean).join(' ').trim()
  return text || 'No description provided.'
}

function extractNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const record = node as Record<string, unknown>
  const text = typeof record.text === 'string' ? record.text : ''
  const children = Array.isArray(record.children) ? record.children.map(extractNodeText).join(' ') : ''

  return [text, children].filter(Boolean).join(' ')
}

function formatDate(value?: string | null) {
  if (!value) return null

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
