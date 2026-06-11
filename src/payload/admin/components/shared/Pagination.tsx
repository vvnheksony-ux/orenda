'use client'

type PaginationProps = {
  currentPage: number
  totalPages: number
  totalRecords: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, totalRecords, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const startRecord = (currentPage - 1) * PAGE_SIZE + 1
  const endRecord = Math.min(currentPage * PAGE_SIZE, totalRecords)

  return (
    <div className="orienda-pagination">
      <span className="orienda-pagination__info">
        {startRecord}–{endRecord} of {totalRecords}
      </span>
      <div className="orienda-pagination__controls">
        <button
          className="orienda-pagination__btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>
        {getPageNumbers(currentPage, totalPages).map((page, i) =>
          page === 'ellipsis' ? (
            <span key={`e-${i}`} className="orienda-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              className={`orienda-pagination__page${page === currentPage ? ' orienda-pagination__page--active' : ''}`}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          )
        )}
        <button
          className="orienda-pagination__btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export const PAGE_SIZE = 20

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  const maxVisible = 7

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)

  return pages
}
