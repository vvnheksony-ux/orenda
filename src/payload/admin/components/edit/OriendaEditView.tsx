'use client'

import type { ClientCollectionConfig, DocumentViewServerProps } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultEditView, SetStepNav, useDocumentInfo } from '@payloadcms/ui'
import { getStaticLabel } from '../list/OriendaListView'

export default function OriendaEditView(props: DocumentViewServerProps) {
  const { id: docId, title, collectionSlug, docConfig } = useDocumentInfo()
  const collection = docConfig as ClientCollectionConfig | undefined
  const groupLabel = getStaticLabel(collection?.admin?.group)
  const collectionLabel = getStaticLabel(collection?.labels?.plural) ?? collectionSlug ?? ''
  const isCreate = !docId

  const nav: StepNavItem[] = []
  if (groupLabel) nav.push({ label: groupLabel })
  nav.push({ label: collectionLabel, url: `/admin/collections/${collectionSlug}` })
  if (isCreate) {
    nav.push({ label: 'Create New' })
  } else {
    nav.push({ label: title || String(docId) })
  }

  return (
    <>
      <DefaultEditView {...props} />
      <SetStepNav nav={nav} />
    </>
  )
}
