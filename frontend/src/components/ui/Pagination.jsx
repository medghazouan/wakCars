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
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-secondary">{startItem} - {endItem}</span> of <span className="font-medium text-secondary">{totalItems}</span> items
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
        >
          <ChevronLeft size={20} />
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
              currentPage === page 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
