'use client'

import { useRouter } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import { useState, type MouseEvent } from 'react'
import ConfirmModal from './ui/ConfirmModal'
import { toast } from 'sonner'
import {
  useConfig,
  useDocumentInfo,
  useForm,
  useFormFields,
  useFormProcessing,
  useRouteTransition,
} from '@payloadcms/ui'

type FormValue = {
  value?: unknown
}

type AdminPath = `/${string}`

const destructive = '#DC2626'

function getOrdinalSuffix(day: number) {
  if (day >= 11 && day <= 13) return 'th'

  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

function formatAdminDate(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return 'Not available'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'

  const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date)
  const day = date.getDate()
  const year = date.getFullYear()
  const time = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  return `${month} ${day}${getOrdinalSuffix(day)} ${year}, ${time}`
}

export default function CustomEditHeader() {
  const [workingAction, setWorkingAction] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; danger?: boolean } | null>(null)
  const { submit, setModified } = useForm()
  const processing = useFormProcessing()
  const router = useRouter()
  const { startRouteTransition } = useRouteTransition()
  const {
    collectionSlug,
    data,
    docConfig,
    docPermissions,
    hasDeletePermission,
    hasPublishPermission,
    hasSavePermission,
    hasTrashPermission,
    id,
    redirectAfterDelete,
    title,
  } = useDocumentInfo()

  // Collections without a draft system (e.g. Tour Scenes) have no "publish
  // permission" concept, which would otherwise leave the Publish button stuck
  // disabled. For those, gate on save permission instead.
  const collectionHasDrafts = Boolean(
    (docConfig as { versions?: { drafts?: unknown } } | undefined)?.versions?.drafts,
  )
  const publishBlockedByPerms = collectionHasDrafts && !hasPublishPermission
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
    },
  } = useConfig()

  const [_status, status, publishedAt] = useFormFields(([fields]) => [
    (fields._status as FormValue | undefined)?.value,
    (fields.status as FormValue | undefined)?.value,
    (fields.publishedAt as FormValue | undefined)?.value,
  ])

  const collectionPath = collectionSlug ? (`/collections/${collectionSlug}` as AdminPath) : ''
  const isPublished = _status === 'published' || status === 'published' || Boolean(publishedAt ?? data?.publishedAt)
  const statusLabel = isPublished ? 'Published' : 'Draft'
  const lastModifiedLabel = formatAdminDate(data?.updatedAt)
  const createdLabel = formatAdminDate(data?.createdAt)
  const canDelete = Boolean(id && (hasDeletePermission || hasTrashPermission || (docPermissions && 'delete' in docPermissions && docPermissions.delete)))
  const disabled = processing || Boolean(workingAction)

  const runAction = async (action: string, callback: () => Promise<void>) => {
    setWorkingAction(action)
    try {
      await callback()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setWorkingAction(null)
    }
  }

  const publishChanges = () =>
    runAction('publish', async () => {
      await submit({ overrides: { _status: 'published', status: 'published', publishedAt: new Date().toISOString() } })
      toast.success('Changes published')
      // Route back to the collection listing after a successful publish/create.
      if (collectionSlug) {
        startRouteTransition(() => {
          router.push(formatAdminURL({ adminRoute, path: collectionPath as AdminPath }))
        })
      }
    })

  const revertToDraft = () =>
    runAction('draft', async () => {
      await submit({ overrides: { _status: 'draft', status: 'draft', publishedAt: null } })
      toast.success('Item reverted to draft')
    })

  const deletePermanently = () => {
    if (!collectionSlug || !id) return
    setConfirm({
      message: `Permanently delete "${title || id}"? This cannot be undone.`,
      onConfirm: () => {
        void runAction('delete', async () => {
          const res = await fetch(formatAdminURL({ apiRoute, path: `/${collectionSlug}/${id}` }), {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            method: 'DELETE',
          })
          const json = await res.json().catch(() => null)

          if (!res.ok) {
            throw new Error(json?.errors?.[0]?.message || json?.message || 'Could not delete item')
          }

          toast.success('Item permanently deleted')
          setModified(false)

          if (redirectAfterDelete !== false) {
            startRouteTransition(() => {
              router.push(formatAdminURL({ adminRoute, path: collectionPath as AdminPath }))
            })
          }
        })
      },
    })
  }

  const stopMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <>
      {confirm ? <ConfirmModal {...confirm} confirmLabel="Delete" danger onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null) }} /> : null}
      <div className="orienda-custom-edit-header w-full" onClick={stopMenuClick}>
      <style jsx global>{`
        .doc-controls__content {
          display: none !important;
        }

        .doc-controls__wrapper > .doc-controls__content,
        .doc-controls__meta,
        .doc-controls__divider {
          display: none !important;
        }

        .doc-controls {
          min-height: 0 !important;
        }

        .doc-controls__wrapper {
          display: block !important;
          height: auto !important;
          padding-bottom: 0 !important;
          width: 100% !important;
        }

        .doc-controls__controls-wrapper {
          height: auto !important;
          padding: 0 !important;
          width: 100% !important;
        }

        .doc-controls__controls {
          width: 100% !important;
          display: block !important;
        }

        .doc-controls__controls > :not(.orienda-custom-edit-header),
        .doc-controls__controls-wrapper > .doc-controls__popup {
          display: none !important;
        }

        .doc-controls .gutter,
        .doc-controls__wrapper {
          max-width: none !important;
        }

        .doc-controls__controls::after {
          display: none !important;
        }
      `}</style>

      <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Status</span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                isPublished ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-3 text-sm text-slate-700 md:flex-row md:items-center md:gap-6">
            <div className="min-w-0">
              <span className="font-medium text-slate-500">Last Modified: </span>
              <span className="font-semibold text-slate-900">{lastModifiedLabel}</span>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-slate-500">Created: </span>
              <span className="font-semibold text-slate-900">{createdLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-stone-100 px-4 py-2.5 border-none text-sm font-semibold text-stone-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || !isPublished || publishBlockedByPerms}
            onClick={revertToDraft}
            type="button"
          >
            {workingAction === 'draft' ? 'Reverting...' : 'Revert to Draft'}
          </button>

          <button
            className="rounded-xl bg-[#c39a42] px-5 py-2.5 text-sm border-none font-semibold text-white shadow-sm transition hover:bg-[#a88f59] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || !hasSavePermission || publishBlockedByPerms}
            onClick={publishChanges}
            type="button"
          >
            {workingAction === 'publish' ? 'Publishing...' : 'Publish Changes'}
          </button>

          <button
            aria-label="Delete permanently"
            className="inline-flex h-10 w-10 items-center border-none justify-center rounded-xl bg-white transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={disabled || !canDelete}
            onClick={deletePermanently}
            style={{ color: destructive }}
            title="Delete permanently"
            type="button"
          >
            {workingAction === 'delete' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
            ) : (
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
