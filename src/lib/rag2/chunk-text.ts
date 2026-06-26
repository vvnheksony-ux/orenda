const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

function splitRecursive(text: string, separators: string[]): string[] {
  if (!text.trim()) return []
  if (text.length <= CHUNK_SIZE || separators.length === 0) {
    return text.trim() ? [text.trim()] : []
  }
  const [sep, ...rest] = separators
  const parts = text.split(sep)
  const result: string[] = []
  let current = ''
  for (let i = 0; i < parts.length; i++) {
    const piece = (i > 0 ? sep : '') + parts[i]
    if (current.length + piece.length <= CHUNK_SIZE) {
      current += piece
    } else {
      if (current.trim()) result.push(current.trim())
      if (piece.length > CHUNK_SIZE) {
        result.push(...splitRecursive(piece, rest))
        current = ''
      } else {
        const tail = current.length > CHUNK_OVERLAP ? current.slice(-CHUNK_OVERLAP) : current
        current = tail + piece
      }
    }
  }
  if (current.trim()) result.push(current.trim())
  return result
}

export function chunkText(text: string): string[] {
  const separators = ['\n## ', '\n### ', '\n---\n', '\n\n', '\n', ' ']
  return splitRecursive(text, separators)
}
