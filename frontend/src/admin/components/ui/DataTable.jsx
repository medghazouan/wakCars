import { Card } from './Card'
import { Pagination } from './Pagination'
import { cn } from '@admin/utils/cn'

export function DataTable({ 
  columns, 
  data, 
  isLoading, 
  pagination, 
  onPageChange,
  emptyMessage = "No records found"
}) {
  return (
    <Card className="flex min-w-0 flex-col">
      <div className="-mx-px overflow-x-auto sm:mx-0">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key || i}
                  className={cn(
                    'px-6 py-4',
                    i === 0 && 'rounded-tl-xl',
                    i === columns.length - 1 && 'rounded-tr-xl',
                    col.headerClassName
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-6 py-4', col.cellClassName)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  )
}
