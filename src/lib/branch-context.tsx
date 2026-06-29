'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Branch { id: string; name: string; slug: string; address?: string; phone?: string; email?: string; hours?: string; mapUrl?: string }

interface BranchContextValue {
  branches: Branch[]
  selectedBranch: Branch | null
  switchBranch: (branch: Branch) => void
  ready: boolean
}

const BranchContext = createContext<BranchContextValue>({
  branches: [],
  selectedBranch: null,
  switchBranch: () => {},
  ready: false,
})

export function BranchProvider({ children, locale, initialBranches = [] }: { children: ReactNode; locale: string; initialBranches?: Branch[] }) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  // `ready` flips true once the saved/default branch is resolved, so consumers can
  // wait and avoid firing a no-branch fetch that races the real branch fetch.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Fast path: the server already provided the branch list, so resolve the
    // selected branch straight from localStorage — no client round-trip. This
    // removes the first of the two waterfalls (branches → departments).
    if (initialBranches.length) {
      setBranches(initialBranches)
      const saved = localStorage.getItem('selectedBranchId')
      const found = initialBranches.find(b => b.id === saved) ?? initialBranches[0] ?? null
      setSelectedBranch(found)
      setReady(true)
      return
    }

    // Fallback (no server data): fetch the branch list on the client as before.
    fetch(`/api/branches?locale=${locale}`)
      .then(r => r.json())
      .then(d => {
        const list: Branch[] = (d.docs || []).map((b: any) => ({
          id: String(b.id),
          name: b.name?.trim() ?? '',
          slug: b.slug ?? '',
          address: b.address?.trim() ?? '',
          phone: b.phone?.trim() ?? '',
          email: b.email?.trim() ?? '',
          hours: b.hours?.trim() ?? '',
          mapUrl: b.mapUrl ?? '',
        }))
        setBranches(list)
        const saved = localStorage.getItem('selectedBranchId')
        const found = list.find(b => b.id === saved) ?? list[0] ?? null
        setSelectedBranch(found)
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [locale])

  const switchBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    localStorage.setItem('selectedBranchId', branch.id)
  }

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, switchBranch, ready }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  return useContext(BranchContext)
}
