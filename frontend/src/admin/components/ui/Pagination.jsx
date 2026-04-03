import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  if (totalItems === 0) return null

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-center text-xs text-text-secondary sm:text-start sm:text-sm">
        Showing <span className="font-medium text-text-primary">{startItem} - {endItem}</span> of{' '}
        <span className="font-medium text-text-primary">{totalItems}</span> items
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded p-1 text-text-secondary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex max-w-[min(100%,16rem)] flex-wrap justify-center gap-0.5 sm:max-w-none">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-8 min-w-[2rem] items-center justify-center rounded-sm px-1.5 text-xs font-medium transition-colors sm:text-sm ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded p-1 text-text-secondary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
