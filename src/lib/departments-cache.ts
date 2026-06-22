// Shared client cache for the departments API. ClinicSection and CentersSection
// both render on the home page and previously each fired the same
// /api/departments request — this dedupes them to a single in-flight fetch per
// (locale, branch). Each consumer still does its own filtering on the raw docs.
const cache = new Map<string, Promise<any[]>>()

export function fetchDepartments(locale: string, branchId: number | string): Promise<any[]> {
  const key = `${locale}:${branchId}`
  let entry = cache.get(key)
  if (!entry) {
    entry = fetch(`/api/departments?locale=${locale}&branch=${branchId}`)
      .then(r => r.json())
      .then(d => (d?.docs as any[]) || [])
      .catch(() => {
        cache.delete(key) // allow a retry on the next mount
        return []
      })
    cache.set(key, entry)
  }
  return entry
}
