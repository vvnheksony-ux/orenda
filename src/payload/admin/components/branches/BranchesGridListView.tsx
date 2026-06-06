'use client'

import type { ListViewClientProps } from 'payload'

import { DefaultListView } from '@payloadcms/ui'

import BranchesGridTable from './BranchesGridTable'

function BranchesGridListView(props: ListViewClientProps) {
  return <DefaultListView {...props} Table={<BranchesGridTable />} />
}

export default BranchesGridListView
