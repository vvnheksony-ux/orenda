'use client'

import type { DocumentViewServerProps } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultEditView, SetStepNav, useConfig } from '@payloadcms/ui'
import { getStaticLabel } from '../list/OriendaListView'

export default function OriendaEditView(props: DocumentViewServerProps) {
  const { config } = useConfig()
  const params = props.params as Record<string, string | string[] | undefined> | undefined
  const collectionSlug = typeof params?.collectionSlug === 'string' ? params.collectionSlug : undefined
  const collection = config.collections?.find((c) => c.slug === collectionSlug)
  const groupLabel = getStaticLabel(collection?.admin?.group)

  const nav: StepNavItem[] = []
  if (groupLabel) nav.push({ label: groupLabel })

  return (
    <>
      <DefaultEditView {...props} />
      <SetStepNav nav={nav} />
    </>
  )
}
