'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Branch { id: string; name: string; slug: string }

interface BranchContextValue {
  branches: Branch[]
  selectedBranch: Branch | null
  switchBranch: (branch: Branch) => void
}

const BranchContext = createContext<BranchContextValue>({
  branches: [],
  selectedBranch: null,
  switchBranch: () => {},
})

export function BranchProvider({ children, locale }: { children: ReactNode; locale: string }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  useEffect(() => {
    fetch(`/api/branches?locale=${locale}`)
      .then(r => r.json())
      .then(d => {
        const list: Branch[] = (d.docs || []).map((b: any) => ({
          id: String(b.id),
          name: b.name?.trim() ?? '',
          slug: b.slug ?? '',
        }))
        setBranches(list)
        const saved = localStorage.getItem('selectedBranchId')
        const found = list.find(b => b.id === saved) ?? list[0] ?? null
        setSelectedBranch(found)
      })
      .catch(() => {})
  }, [locale])

  const switchBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    localStorage.setItem('selectedBranchId', branch.id)
  }

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, switchBranch }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  return useContext(BranchContext)
}
