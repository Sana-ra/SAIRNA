import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { companies } from '../../api/admin'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'

const empty = { name: '', logoUrl: '', isActive: true }
const Field = ({ label, ...props }) => <label className="block space-y-1 text-sm font-bold"><span>{label}</span><input className="input" {...props} /></label>

export default function Companies() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin', 'companies'], queryFn: companies.list })
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const save = useMutation({
    mutationFn: data => editing?.id ? companies.update(editing.id, data) : companies.create(data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] }); setEditing(null); setModalOpen(false); setForm(empty); toast.success('تم حفظ الشركة') },
    onError: error => toast.error(error.message),
  })
  const remove = useMutation({
    mutationFn: companies.remove,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] }); toast.success('تم حذف الشركة') },
    onError: error => toast.error(error.message),
  })
  const open = company => { setEditing(company); setModalOpen(true); setForm({ name: company?.name || '', logoUrl: company?.logoUrl || '', isActive: company?.isActive ?? true }) }
  const submit = event => { event.preventDefault(); save.mutate({ name: form.name.trim(), logoUrl: form.logoUrl.trim(), ...(editing ? { isActive: form.isActive } : {}) }) }
  const rows = Array.isArray(query.data) ? query.data : query.data?.companies || []
  const columns = [
    { key: 'logoUrl', label: 'الشعار', render: row => row.logoUrl ? <img src={row.logoUrl} alt="" className="size-9 rounded-lg object-cover" /> : '—' },
    { key: 'name', label: 'الاسم', render: row => <b>{row.name}</b> },
    { key: 'isActive', label: 'الحالة', render: row => row.isActive === false ? 'غير فعالة' : 'فعالة' },
    { key: 'actions', label: 'إجراءات', render: row => <div className="flex gap-2"><button className="btn btn-outline px-3 py-1.5" onClick={() => open(row)}>تعديل</button><button className="btn px-3 py-1.5 text-red-600" onClick={() => window.confirm('حذف الشركة؟') && remove.mutate(row.id)}>حذف</button></div> },
  ]
  return <div className="space-y-5">
    <div className="flex items-center justify-between"><h2 className="text-lg">الشركات</h2><button className="btn btn-primary" onClick={() => open(null)}>شركة جديدة</button></div>
    <DataTable columns={columns} rows={rows} loading={query.isLoading} error={query.error} onRetry={query.refetch} empty="ما في شركات" />
    <Modal open={modalOpen} onClose={() => { setEditing(null); setModalOpen(false); setForm(empty) }} title={editing ? 'تعديل الشركة' : 'إضافة شركة'}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="اسم الشركة" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Field label="رابط الشعار" type="url" dir="ltr" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} />
        {editing && <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> الشركة فعالة</label>}
        <div className="flex justify-end gap-3"><button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setModalOpen(false); setForm(empty) }}>إلغاء</button><button className="btn btn-primary" disabled={save.isPending}>حفظ</button></div>
      </form>
    </Modal>
  </div>
}
