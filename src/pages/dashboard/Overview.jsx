import { useQuery } from '@tanstack/react-query'
import { getOverview, bookings } from '../../api/admin'
import DataTable from '../../components/ui/DataTable'
import { formatDate, money } from '../../lib/format'

const formatSeats = seats => {
  if (!Array.isArray(seats)) return seats?.seatNumber ?? seats?.number ?? seats ?? '—'
  const numbers = seats.map(seat => seat?.seatNumber ?? seat?.number ?? seat).filter(Boolean)
  return numbers.length ? numbers.join(', ') : '—'
}

const passengerText = row => {
  const passenger = row.passenger ?? row.user
  if (typeof passenger === 'string') return passenger
  return passenger?.name || passenger?.passengerName || passenger?.email || passenger?.passengerPhone || '—'
}

const value = (data, ...keys) => {
  for (const key of keys) {
    if (data?.[key] !== undefined) return data[key]
  }
  return 0
}

export default function Overview() {
  const overview = useQuery({ queryKey: ['admin', 'overview'], queryFn: getOverview })
  const recent = useQuery({ queryKey: ['admin', 'bookings'], queryFn: bookings.list })
  const stats = overview.data?.stats || overview.data || {}
  const rows = Array.isArray(recent.data) ? recent.data : recent.data?.bookings || []

  const cards = [
    ['المستخدمين', value(stats, 'totalUsers', 'usersCount', 'users')],
    ['الشركات', value(stats, 'totalCompanies', 'companiesCount', 'companies')],
    ['الرحلات', value(stats, 'totalTrips', 'tripsCount', 'trips')],
    ['الحجوزات', value(stats, 'totalBookings', 'bookingsCount', 'bookings')],
  ]

  const columns = [
    { key: 'id', label: '#' },
    { key: 'user', label: 'المسافر', render: passengerText },
    { key: 'trip', label: 'الرحلة', render: row => row.trip?.code || row.trip?.id || row.tripId || '—' },
    { key: 'seats', label: 'المقاعد', render: row => formatSeats(row.seats ?? row.seatCount) },
    { key: 'amount', label: 'المبلغ', render: row => money(row.totalAmount ?? row.amount ?? row.total) },
    { key: 'status', label: 'الحالة', render: row => row.status || '—' },
    { key: 'createdAt', label: 'التاريخ', render: row => row.createdAt ? formatDate(row.createdAt) : '—' },
  ]

  return (
    <div className="space-y-6">
     <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, count]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-primary">{count}</p>
            </div>
           
          </div>
        ))}
      </div>  
      <section>
        <h2 className="mb-4 text-lg">آخر الحجوزات</h2>
        <DataTable columns={columns} rows={rows.slice(0, 10)} loading={recent.isLoading} error={recent.error} onRetry={recent.refetch} empty="ما في حجوزات" />
      </section>
    </div>
  )
}
