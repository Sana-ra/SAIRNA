import { useQuery } from '@tanstack/react-query'
import { getCities } from '../../api/admin'
import DataTable from '../../components/ui/DataTable'

// مثال كامل لصفحة داشبورد: useQuery + DataTable. انسخ نفس الشكل لباقي الصفحات.
export default function Cities() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'cities'], queryFn: getCities })

  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'المدينة', render: c => <b>{c.name}</b> },
    { key: 'latitude', label: 'خط العرض', render: c => <span dir="ltr">{c.latitude}</span> },
    { key: 'longitude', label: 'خط الطول', render: c => <span dir="ltr">{c.longitude}</span> },
  ]

  return (
    <div className="space-y-5">
      <p className="text-muted">المدن قراءة فقط — بتنضاف من الباك.</p>
      <DataTable columns={columns} rows={data} loading={isLoading} error={error} onRetry={refetch} empty="ما في مدن" />
    </div>
  )
}
