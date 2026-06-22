// Shared client cache for the departments API. ClinicSection and CentersSection
// both render on the home page and previously each fired the same
// /api/departments request — this dedupes them to a single in-flight fetch per
// (locale, branch). Each consumer still does its own filtering on the raw docs.
export interface DepartmentListItem {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string
  order: number
  branch_id: string | null
}

const cache = new Map<string, Promise<DepartmentListItem[]>>()

export function fetchDepartments(locale: string, branchId: number | string): Promise<DepartmentListItem[]> {
  const key = `${locale}:${branchId}`
  let entry = cache.get(key)
  if (!entry) {
    entry = fetch(`/api/departments?locale=${locale}&branch=${branchId}`)
      .then(r => r.json())
      .then(d => (Array.isArray(d?.docs) ? d.docs : []) as DepartmentListItem[])
      .catch(() => {
        cache.delete(key) // allow a retry on the next mount
        return []
      })
    cache.set(key, entry)
  }
  return entry
}
