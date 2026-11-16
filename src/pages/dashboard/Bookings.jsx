import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookings } from '../../api/admin'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
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

export default function Bookings() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['admin', 'bookings'], queryFn: bookings.list })
  const [selected, setSelected] = useState(null)
  const details = useQuery({ queryKey: ['admin', 'booking', selected?.id], queryFn: () => bookings.get(selected.id), enabled: Boolean(selected?.id) })
  const cancel = useMutation({
    mutationFn: bookings.cancel,
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin', 'bookings'] }); setSelected(null); toast.success('تم إلغاء الحجز') },
    onError: error => toast.error(error.message),
  })
  const rows = Array.isArray(query.data) ? query.data : query.data?.bookings || []
  const columns = [
    { key: 'id', label: 'رقم الحجز' },
    { key: 'user', label: 'المسافر', render: passengerText },
    { key: 'trip', label: 'الرحلة', render: row => row.trip?.code || row.trip?.id || row.tripId || '—' },
    { key: 'seats', label: 'المقاعد', render: row => formatSeats(row.seats ?? row.seatCount) },
    { key: 'amount', label: 'المبلغ', render: row => money(row.totalAmount ?? row.amount ?? row.total) },
    { key: 'status', label: 'الحالة' },
    { key: 'createdAt', label: 'التاريخ', render: row => row.createdAt ? formatDate(row.createdAt) : '—' },
    { key: 'actions', label: 'إجراءات', render: row => <button className="btn btn-outline px-3 py-1.5" onClick={() => setSelected(row)}>عرض</button> },
  ]
  const booking = details.data || selected
  return <div className="space-y-5"><h2 className="text-lg">الحجوزات</h2><DataTable columns={columns} rows={rows} loading={query.isLoading} error={query.error} onRetry={query.refetch} empty="ما في حجوزات" />
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="تفاصيل الحجز">
      {details.isLoading ? <p className="text-muted">جار التحميل...</p> : details.error ? <p className="text-red-600">{details.error.message}</p> : <div className="space-y-3 text-sm">
        <p><b>رقم الحجز:</b> {booking?.id}</p><p><b>المسافر:</b> {passengerText(booking || {})}</p><p><b>الرحلة:</b> {booking?.trip?.code || booking?.trip?.id || booking?.tripId || '—'}</p><p><b>المقاعد:</b> {formatSeats(booking?.seats ?? booking?.seatCount)}</p><p><b>المبلغ:</b> {money(booking?.totalAmount ?? booking?.amount ?? booking?.total)}</p><p><b>الحالة:</b> {booking?.status || '—'}</p>
        {booking?.status !== 'CANCELLED' && booking?.status !== 'CANCELED' && <button className="btn text-red-600" onClick={() => window.confirm('إلغاء الحجز؟') && cancel.mutate(booking.id)} disabled={cancel.isPending}>إلغاء الحجز</button>}
      </div>}
    </Modal>
  </div>
}
