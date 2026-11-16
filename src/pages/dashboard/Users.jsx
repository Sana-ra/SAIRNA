import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { users } from '../../api/admin'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../lib/format'

export default function Users() {
  const query = useQuery({ queryKey: ['admin', 'users'], queryFn: users.list })
  const [selected, setSelected] = useState(null)
  const details = useQuery({ queryKey: ['admin', 'user', selected?.id], queryFn: () => users.get(selected.id), enabled: Boolean(selected?.id) })
  const rows = Array.isArray(query.data) ? query.data : query.data?.users || []
  const columns = [
    { key: 'name', label: 'الاسم', render: row => <b>{row.name || '—'}</b> },
    { key: 'email', label: 'الإيميل', render: row => <span dir="ltr">{row.email || '—'}</span> },
    { key: 'role', label: 'الدور', render: row => row.role || 'USER' },
    { key: 'createdAt', label: 'تاريخ التسجيل', render: row => row.createdAt ? formatDate(row.createdAt) : '—' },
    { key: 'actions', label: 'إجراءات', render: row => <button className="btn btn-outline px-3 py-1.5" onClick={() => setSelected(row)}>عرض</button> },
  ]
  const user = details.data || selected
  return <div className="space-y-5"><h2 className="text-lg">المستخدمين</h2><DataTable columns={columns} rows={rows} loading={query.isLoading} error={query.error} onRetry={query.refetch} empty="ما في مستخدمين" />
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="تفاصيل المستخدم">
      {details.isLoading ? <p className="text-muted">جار التحميل...</p> : details.error ? <p className="text-red-600">{details.error.message}</p> : <div className="space-y-3 text-sm"><p><b>الاسم:</b> {user?.name || '—'}</p><p><b>الإيميل:</b> {user?.email || '—'}</p><p><b>الدور:</b> {user?.role || 'USER'}</p><p><b>تاريخ التسجيل:</b> {user?.createdAt ? formatDate(user.createdAt) : '—'}</p></div>}
    </Modal>
  </div>
}
