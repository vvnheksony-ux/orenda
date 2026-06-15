'use client'

import { useListQuery } from '@payloadcms/ui'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type MediaDoc = {
  id: number | string
  alt?: string
  url?: string
}

type BranchDoc = {
  id: number | string
  address?: string
  createdAt?: string
  createdBy?: { email?: string } | string
  email?: string
  hours?: string
  name?: string
  phone?: string
  updatedAt?: string
  updatedBy?: { email?: string } | string
  user?: { email?: string } | string
  image?: MediaDoc | number | string | null
  image_id?: number | string | null
}

const adminBase = '/admin/collections/branches'

function getActorEmail(doc: BranchDoc) {
  const actor = doc.updatedBy || doc.createdBy || doc.user
  if (typeof actor === 'object' && actor?.email) {
    return actor.email
  }
  return 'admin@static.local'
}

function getRelativeTime(value?: string) {
  if (!value) return 'just now'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'just now'

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000))
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const [unit, amount] of units) {
    if (seconds >= amount) {
      return formatter.format(-Math.floor(seconds / amount), unit)
    }
  }
  return formatter.format(-seconds, 'second')
}

function getImageId(branch: BranchDoc) {
  if (branch.image_id) return String(branch.image_id)
  if (branch.image && typeof branch.image !== 'object') return String(branch.image)
  if (branch.image && typeof branch.image === 'object') return String(branch.image.id)
  return null
}

function getImageDoc(branch: BranchDoc, imageLookup: Record<string, MediaDoc>) {
  if (branch.image && typeof branch.image === 'object' && branch.image.url) {
    return branch.image
  }
  const imageId = getImageId(branch)
  return imageId ? imageLookup[imageId] : undefined
}

function BranchesGridTable() {
  const { data, query, refineListData } = useListQuery()
  const docs = (data?.docs || []) as BranchDoc[]
  const [imageLookup, setImageLookup] = useState<Record<string, MediaDoc>>({})

  useEffect(() => {
    const imageIds = Array.from(new Set(docs.map(getImageId).filter((id): id is string => Boolean(id))))
    const missingImageIds = imageIds.filter((id) => !imageLookup[id])

    if (missingImageIds.length === 0) return

    let cancelled = false

    async function loadImages() {
      const entries = await Promise.all(
        missingImageIds.map(async (id) => {
          const response = await fetch(`/payload-api/media/${id}`, { credentials: 'include' }).catch(() => null)
          if (!response?.ok) return null
          const media = (await response.json()) as MediaDoc
          return [id, media] as const
        })
      )

      const foundEntries = entries.filter((entry): entry is [string, MediaDoc] => Boolean(entry))

      if (!cancelled && foundEntries.length > 0) {
        setImageLookup((current) => ({ ...current, ...Object.fromEntries(foundEntries) }))
      }
    }

    void loadImages()

    return () => {
      cancelled = true
    }
  }, [docs, imageLookup])

  async function deleteBranch(id: BranchDoc['id']) {
    if (!window.confirm('Delete this branch?')) return

    const response = await fetch(`/payload-api/branches/${id}`, {
      credentials: 'include',
      method: 'DELETE',
    })

    if (response.ok) {
      await refineListData(query)
    }
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-[1.25rem]">
      {docs.map((branch) => {
        const editURL = `${adminBase}/${branch.id}`
        const image = getImageDoc(branch, imageLookup)
        const imageId = getImageId(branch)

        return (
          <article 
            className="rounded-[1rem] shadow-[0_10px_10px_rgba(0,0,0,0.1)] pb-[1rem] transition-[border-color,box-shadow,transform] duration-[160ms] ease-linear hover:border-[#d8c59f] hover:shadow-[0_10px_18px_rgba(53,42,22,0.12)] hover:-translate-y-[2px]" 
            key={branch.id}
          >
            <div className="flex items-center justify-center rounded-[0.75rem] text-[#9a8254] h-[9rem] text-center overflow-hidden mb-[1rem]">
              {image?.url ? (
                <img
                  alt={image.alt || branch.name || 'Branch image'}
                  src={image.url}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              )}
            </div>

            <div className="flex items-start gap-[0.75rem] mb-[0.75rem] px-[1.5rem]">
              <h3 className="flex-1 text-[1rem] font-bold text-[#2f281b] line-height-[1.5] m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {branch.name || 'Branch title'}
              </h3>
              
              <div className="flex items-center flex-shrink-0 gap-[0.5rem]">
                <Link
                  aria-label={`View ${branch.name || 'branch'}`}
                  className="inline-flex items-center justify-center bg-transparent border-0 rounded-[999px] text-[#5e5139] cursor-pointer p-[0.375rem] transition-[background-color] duration-[160ms] ease-linear hover:bg-[#efe5d3]"
                  href={editURL}
                >
                  <Eye size={16} />
                </Link>
                
                <Link
                  aria-label={`Edit ${branch.name || 'branch'}`}
                  className="inline-flex items-center justify-center bg-transparent border-0 rounded-[999px] text-[#2563eb] cursor-pointer p-[0.375rem] transition-[background-color] duration-[160ms] ease-linear hover:bg-[#eff6ff]"
                  href={editURL}
                >
                  <Pencil size={16} />
                </Link>
                
                <button
                  aria-label={`Delete ${branch.name || 'branch'}`}
                  className="inline-flex items-center justify-center bg-transparent border-0 rounded-[999px] text-[#dc2626] cursor-pointer p-[0.375rem] transition-[background-color] duration-[160ms] ease-linear hover:bg-[#fef2f2]"
                  onClick={() => void deleteBranch(branch.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <dl className="text-[#7b6f5c] text-[0.875rem] line-height-[1.5] m-0 px-[1.5rem] space-y-[0.1rem]">
              <div>
                <dt className="inline font-semibold text-[#5f543f]">Address: </dt>
                <dd className="inline m-0">{branch.address || 'Not set'}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-[#5f543f]">Open: </dt>
                <dd className="inline m-0">{branch.hours || 'Not set'}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-[#5f543f]">Telephone: </dt>
                <dd className="inline m-0">{branch.phone || 'Not set'}</dd>
              </div>
            </dl>

            <footer className="flex items-center justify-between border-t border-[#eadfc8] text-[#8b7b61] text-[0.75rem] gap-[0.75rem] mt-[1rem] pt-[0.75rem] px-[1.5rem]">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">By: {getActorEmail(branch)}</span>
              <time dateTime={branch.updatedAt || branch.createdAt}>
                {getRelativeTime(branch.updatedAt || branch.createdAt)}
              </time>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

export default BranchesGridTable