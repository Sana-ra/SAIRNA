import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { companies, getCities, trips } from '../../api/admin'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { isoToLocalInput, localInputToIso, money, formatDate } from '../../lib/format'

const blank = { companyId: '', originId: '', destinationId: '', departureAt: '', arrivalAt: '', price: '', totalSeats: '', status: 'AVAILABLE' }
const Field = ({ label, ...props }) => <label className="block space-y-1 text-sm font-bold"><span>{label}</span><input className="input" {...props} /></label>
const Select = ({ label, children, ...props }) => <label className="block space-y-1 text-sm font-bold"><span>{label}</span><select className="input" {...props}>{children}</select></label>

export default function Trips() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['admin', 'trips'], queryFn: trips.list })
  const companyQuery = useQuery({ queryKey: ['admin', 'companies'], queryFn: companies.list })
  const cityQuery = useQuery({ queryKey: ['admin', 'cities'], queryFn: getCities })
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const save = useMutation({
    mutationFn: data => editing?.id ? trips.update(editing.id, data) : trips.create(data),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin', 'trips'] }); setEditing(null); setForm(blank); toast.success('تم حفظ الرحلة') },
    onError: error => toast.error(error.message),
  })
  const remove = useMutation({
    mutationFn: trips.remove,
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin', 'trips'] }); toast.success('تم حذف الرحلة') },
    onError: error => toast.error(error.message),
  })
  const open = trip => {
    setEditing(trip)
    setForm({ companyId: trip.companyId || trip.company?.id || '', originId: trip.originId || trip.origin?.id || '', destinationId: trip.destinationId || trip.destination?.id || '', departureAt: isoToLocalInput(trip.departureAt), arrivalAt: isoToLocalInput(trip.arrivalAt), price: trip.price ?? '', totalSeats: trip.totalSeats ?? '', status: trip.status || 'AVAILABLE' })
  }
  const submit = event => {
    event.preventDefault()
    save.mutate({ companyId: Number(form.companyId), originId: Number(form.originId), destinationId: Number(form.destinationId), departureAt: localInputToIso(form.departureAt), arrivalAt: localInputToIso(form.arrivalAt), price: Number(form.price), totalSeats: Number(form.totalSeats), ...(editing?.id ? { status: form.status } : {}) })
  }
  const rows = Array.isArray(query.data) ? query.data : query.data?.trips || []
  const companyRows = Array.isArray(companyQuery.data) ? companyQuery.data : companyQuery.data?.companies || []
  const cityRows = Array.isArray(cityQuery.data) ? cityQuery.data : cityQuery.data?.cities || []
  const columns = [
    { key: 'id', label: '#' },
    { key: 'company', label: 'الشركة', render: row => row.company?.name || companyRows.find(c => String(c.id) === String(row.companyId))?.name || '—' },
    { key: 'route', label: 'المسار', render: row => `${row.origin?.name || '—'} ← ${row.destination?.name || '—'}` },
    { key: 'departureAt', label: 'الانطلاق', render: row => row.departureAt ? formatDate(row.departureAt) : '—' },
    { key: 'price', label: 'السعر', render: row => money(row.price) },
    { key: 'availableSeats', label: 'المقاعد', render: row => row.availableSeats ?? row.totalSeats ?? '—' },
    { key: 'status', label: 'الحالة' },
    { key: 'actions', label: 'إجراءات', render: row => <div className="flex gap-2"><button className="btn btn-outline px-3 py-1.5" onClick={() => open(row)}>تعديل</button><button className="btn px-3 py-1.5 text-red-600" onClick={() => window.confirm('حذف الرحلة؟') && remove.mutate(row.id)}>حذف</button></div> },
  ]
  return <div className="space-y-5">
    <div className="flex items-center justify-between"><h2 className="text-lg">الرحلات</h2><button className="btn btn-primary" onClick={() => { setEditing({}); setForm(blank) }}>رحلة جديدة</button></div>
    <DataTable columns={columns} rows={rows} loading={query.isLoading} error={query.error} onRetry={query.refetch} empty="ما في رحلات" />
    <Modal open={editing !== null} onClose={() => { setEditing(null); setForm(blank) }} title={editing?.id ? 'تعديل الرحلة' : 'إضافة رحلة'} size="max-w-2xl">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Select label="الشركة" required value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value })}><option value="">اختر الشركة</option>{companyRows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select label="مدينة الانطلاق" required value={form.originId} onChange={e => setForm({ ...form, originId: e.target.value })}><option value="">اختر المدينة</option>{cityRows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select label="مدينة الوصول" required value={form.destinationId} onChange={e => setForm({ ...form, destinationId: e.target.value })}><option value="">اختر المدينة</option>{cityRows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Field label="الانطلاق" type="datetime-local" required value={form.departureAt} onChange={e => setForm({ ...form, departureAt: e.target.value })} dir="ltr" />
        <Field label="الوصول" type="datetime-local" required value={form.arrivalAt} onChange={e => setForm({ ...form, arrivalAt: e.target.value })} dir="ltr" />
        <Field label="السعر" type="number" min="0" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} dir="ltr" />
        <Field label="إجمالي المقاعد" type="number" min="1" required value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })} dir="ltr" />
        {editing && <Select label="الحالة" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="AVAILABLE">متاحة</option><option value="CANCELLED">ملغاة</option></Select>}
        <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setForm(blank) }}>إلغاء</button><button className="btn btn-primary" disabled={save.isPending}>حفظ</button></div>
      </form>
    </Modal>
  </div>
}
