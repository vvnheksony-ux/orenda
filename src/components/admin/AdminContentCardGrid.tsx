import type { ReactNode } from 'react'
import Image from 'next/image'
import { Edit, Eye, FileText, ImageIcon, Link2, Play, Trash2 } from 'lucide-react'
import { type AdminStatus } from './AdminDataTable'

export type AdminContentCardAction<T> = {
  label: string
  icon: 'view' | 'edit' | 'delete'
  tone?: 'muted' | 'blue' | 'danger'
  render?: (item: T, index: number) => ReactNode
}

type PayloadMediaSize = {
  url?: string | null
  mimeType?: string | null
  filename?: string | null
}

export type AdminContentCardMedia =
  | string
  | number
  | null
  | undefined
  | {
      url?: string | null
      thumbnailURL?: string | null
      mimeType?: string | null
      filename?: string | null
      alt?: string | null
      sizes?: Record<string, PayloadMediaSize | null | undefined> | null
    }

export type AdminContentCardItem = Record<string, unknown> & {
  title: string
  description?: string
  author?: string
  updated?: string
  status?: string
  thumbnail?: AdminContentCardMedia
  thumbnailUrl?: string
  thumbnailURL?: string
  thumbnailImage?: AdminContentCardMedia
  image?: AdminContentCardMedia
  featuredImage?: AdminContentCardMedia
  coverImage?: AdminContentCardMedia
  media?: AdminContentCardMedia
  document?: AdminContentCardMedia
  file?: AdminContentCardMedia
  fileUrl?: string
  url?: string
  youtube?: string
  youtubeUrl?: string
  videoUrl?: string
}

const statusStyles: Record<AdminStatus, string> = {
  pending: 'bg-[#fff1cf] text-[#c49124]',
  confirmed: 'bg-[#dff8ed] text-[#2ead73]',
  completed: 'bg-[#dcf7e9] text-[#31a86e]',
  published: 'bg-[#dcf7e9] text-[#31a86e]',
  draft: 'bg-[#efeeeb] text-[#6f6b64]',
  active: 'bg-[#dcf7e9] text-[#31a86e]',
  inactive: 'bg-[#efeeeb] text-[#8a8680]',
  update: 'bg-[#e3ebff] text-[#5c83d9]',
  delete: 'bg-[#ffe3e6] text-[#e56776]',
  create: 'bg-[#dcf7e9] text-[#31a86e]',
}

const actionToneStyles = {
  muted: 'text-[#7d7a74] hover:bg-[#f4f1ea]',
  blue: 'text-[#1687e5] hover:bg-[#edf7ff]',
  danger: 'text-[#f04455] hover:bg-[#fff0f2]',
}

export default function AdminContentCardGrid<T extends AdminContentCardItem>({
  items,
  actions,
  getTitle,
  getDescription,
  getMeta,
  getStatus,
  getImage,
  rowKey,
}: {
  items: T[]
  actions?: AdminContentCardAction<T>[]
  getTitle: (item: T, index: number) => ReactNode
  getDescription?: (item: T, index: number) => ReactNode
  getMeta?: (item: T, index: number) => ReactNode
  getStatus?: (item: T, index: number) => AdminStatus
  getImage?: (item: T, index: number) => ReactNode
  rowKey?: keyof T | ((item: T, index: number) => string)
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <article key={getRowKey(item, index, rowKey)} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
          <div className="relative grid h-44 overflow-hidden bg-[#efede8] text-[#bd8d35]">
            {getImage ? getImage(item, index) : <AdminCardMediaPreview item={item} />}
            {getStatus && <StatusBadge status={getStatus(item, index)} />}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold text-[#2d2b28]">{getTitle(item, index)}</h3>
              <ActionButtons item={item} index={index} actions={actions} />
            </div>
            {getDescription && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#918b82]">{getDescription(item, index)}</p>}
            {getMeta && <div className="mt-4 border-t border-[#efede8] pt-3 text-xs leading-5 text-[#7f7a72]">{getMeta(item, index)}</div>}
          </div>
        </article>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: AdminStatus }) {
  return <span className={`absolute right-4 top-3 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] ?? 'bg-[#efeeeb] text-[#6f6b64]'}`}>{status}</span>
}

function AdminCardMediaPreview({ item }: { item: AdminContentCardItem }) {
  const youtubeUrl = getYoutubeUrl(item)
  const youtubeId = youtubeUrl ? getYoutubeVideoId(youtubeUrl) : null

  if (youtubeId) {
    return (
      <div className="relative h-full w-full bg-[#1f1c18]">
        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <span className="absolute left-4 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">YouTube</span>
        <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-red-600 shadow-lg">
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
      </div>
    )
  }

  const media = getCardMedia(item)
  const mediaInfo = getMediaInfo(media)

  if (!mediaInfo?.url) {
    return <EmptyMediaPreview />
  }

  if (isImageMedia(mediaInfo)) {
    return <Image src={mediaInfo.url} alt={mediaInfo.alt || item.title || 'Card thumbnail'} fill className="object-cover" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" unoptimized />
  }

  if (isPdfMedia(mediaInfo)) {
    return <DocumentMediaPreview icon={<FileText className="size-9" />} label="PDF document" filename={mediaInfo.filename} />
  }

  return <DocumentMediaPreview icon={<Link2 className="size-9" />} label="Attached file" filename={mediaInfo.filename} />
}

function EmptyMediaPreview() {
  return (
    <div className="grid h-full place-items-center">
      <ImageIcon className="size-8" />
    </div>
  )
}

function DocumentMediaPreview({ icon, label, filename }: { icon: ReactNode; label: string; filename?: string | null }) {
  return (
    <div className="grid h-full place-items-center bg-gradient-to-br from-[#f7f3eb] to-[#ebe5d9] px-6 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-[#bd8d35] shadow-sm ring-1 ring-[#eadfcd]">{icon}</div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#9d7a38]">{label}</p>
        {filename && <p className="mt-1 line-clamp-1 text-xs text-[#7f7a72]">{filename}</p>}
      </div>
    </div>
  )
}

function getCardMedia(item: AdminContentCardItem): AdminContentCardMedia {
  return item.thumbnail ?? item.thumbnailImage ?? item.featuredImage ?? item.coverImage ?? item.image ?? item.media ?? item.document ?? item.file ?? item.thumbnailURL ?? item.thumbnailUrl ?? item.fileUrl ?? item.url
}

function getMediaInfo(media: AdminContentCardMedia) {
  if (!media) return null

  if (typeof media === 'number') return null

  if (typeof media === 'string') {
    return { url: media, filename: getFilenameFromUrl(media), mimeType: getMimeTypeFromUrl(media), alt: null }
  }

  const sizedMedia = media.sizes?.card ?? media.sizes?.thumbnail
  const url = sizedMedia?.url ?? media.thumbnailURL ?? media.url

  if (!url) return null

  return {
    url,
    filename: sizedMedia?.filename ?? media.filename ?? getFilenameFromUrl(url),
    mimeType: sizedMedia?.mimeType ?? media.mimeType ?? getMimeTypeFromUrl(url),
    alt: media.alt,
  }
}

function getYoutubeUrl(item: AdminContentCardItem) {
  const candidates = [item.youtube, item.youtubeUrl, item.videoUrl, item.url]
  return candidates.find((candidate) => typeof candidate === 'string' && getYoutubeVideoId(candidate))
}

function getYoutubeVideoId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

function isImageMedia(media: { url: string; mimeType?: string | null }) {
  return media.mimeType?.startsWith('image/') || /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(media.url)
}

function isPdfMedia(media: { url: string; mimeType?: string | null }) {
  return media.mimeType === 'application/pdf' || /\.pdf(?:[?#].*)?$/i.test(media.url)
}

function getFilenameFromUrl(url: string) {
  const pathname = url.split(/[?#]/)[0]
  const filename = pathname.split('/').pop()
  return filename || null
}

function getMimeTypeFromUrl(url: string) {
  if (/\.pdf(?:[?#].*)?$/i.test(url)) return 'application/pdf'
  if (/\.svg(?:[?#].*)?$/i.test(url)) return 'image/svg+xml'
  if (/\.webp(?:[?#].*)?$/i.test(url)) return 'image/webp'
  if (/\.png(?:[?#].*)?$/i.test(url)) return 'image/png'
  if (/\.gif(?:[?#].*)?$/i.test(url)) return 'image/gif'
  if (/\.jpe?g(?:[?#].*)?$/i.test(url)) return 'image/jpeg'
  return null
}

function ActionButtons<T extends AdminContentCardItem>({ item, index, actions }: { item: T; index: number; actions?: AdminContentCardAction<T>[] }) {
  if (!actions?.length) return null

  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => {
        if (action.render) return <span key={action.label}>{action.render(item, index)}</span>

        const Icon = getActionIcon(action.icon)
        return (
          <button key={action.label} aria-label={action.label} className={`grid size-7 place-items-center rounded-lg transition ${actionToneStyles[action.tone ?? 'muted']}`}>
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

function getActionIcon(icon: AdminContentCardAction<AdminContentCardItem>['icon']) {
  if (icon === 'view') return Eye
  if (icon === 'edit') return Edit
  return Trash2
}

function getRowKey<T extends AdminContentCardItem>(item: T, index: number, rowKey?: keyof T | ((item: T, index: number) => string)) {
  if (typeof rowKey === 'function') return rowKey(item, index)
  if (rowKey) return String(item[rowKey])
  return index
}
