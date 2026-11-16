import { isValidElement } from 'react'
import Spinner from './Spinner'
import ErrorState from './ErrorState'

function formatCellValue(value) {
  if (isValidElement(value) || typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value)) {
    return value.map(item => item?.seatNumber ?? item?.number ?? item?.passengerName ?? item?.name ?? item).filter(Boolean).join(', ') || '—'
  }
  if (value && typeof value === 'object') return value.passengerName || value.name || value.seatNumber || value.number || value.email || '—'
  return value ?? '—'
}

/**
 * جدول واحد لكل صفحات الداشبورد
 * columns: [{ key: 'name', label: 'الاسم', render: row => ... }]
 */
export default function DataTable({ columns, rows, loading, error, onRetry, empty = 'ما في بيانات', rowKey = 'id' }) {
  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={onRetry} />

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-start text-[13px]">
        <thead className="bg-surface-alt text-xs text-muted">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-4 py-3 text-start font-extrabold whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map(row => (
              <tr key={row[rowKey]} className="border-t border-line hover:bg-surface-alt/60">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3 align-middle">{formatCellValue(c.render ? c.render(row) : row[c.key])}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
