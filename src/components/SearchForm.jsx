import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, CalendarDays, MapPin, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCities } from '../api/site'
import { today, tomorrow } from '../lib/format'

function Field({ label, icon: Icon, children }) {
  return (
    <label className="relative flex h-[60px] min-w-0 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 pt-3 transition focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
      <span className="absolute top-1.5 start-3.5 text-[10px] font-bold text-muted">{label}</span>
      <Icon size={19} className="mt-2 shrink-0 text-primary" />
      {children}
    </label>
  )
}

const controlClass = 'mt-2 h-7 w-full min-w-0 cursor-pointer appearance-none bg-transparent text-xs font-black text-ink outline-none'

// نموذج البحث — بالرئيسية وبصفحة النتائج. القيم بتنحفظ بالـ URL
export default function SearchForm({ compact = false }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: cities = [] } = useQuery({ queryKey: ['cities'], queryFn: getCities, staleTime: Infinity })

  const [form, setForm] = useState({
    originId: params.get('originId') || '2', // حلب
    destinationId: params.get('destinationId') || '1', // دمشق
    date: params.get('date') || tomorrow(),
    people: params.get('people') || '1',
  })
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const swap = () => setForm(f => ({ ...f, originId: f.destinationId, destinationId: f.originId }))

  const submit = e => {
    e.preventDefault()
    if (form.originId === form.destinationId) return toast.error('اختار محافظتين مختلفتين حتى نعرض الرحلات.')
    navigate(`/trips?${new URLSearchParams(form)}`)
  }

  return (
    <form
      onSubmit={submit}
      className={`grid items-end gap-2.5 md:grid-cols-[1.1fr_34px_1.1fr] lg:grid-cols-[1.1fr_34px_1.1fr_1fr_.75fr_1.1fr] ${compact ? '' : ''}`}
    >
      <Field label="من وين؟" icon={MapPin}>
        <select className={controlClass} value={form.originId} onChange={set('originId')} aria-label="محافظة الانطلاق">
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <button type="button" onClick={swap} className="mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-[10px] bg-soft-teal text-primary-deep transition hover:rotate-180" aria-label="تبديل المحافظات">
        <ArrowLeftRight size={18} />
      </button>

      <Field label="لوين؟" icon={MapPin}>
        <select className={controlClass} value={form.destinationId} onChange={set('destinationId')} aria-label="محافظة الوصول">
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="تاريخ الرحلة" icon={CalendarDays}>
        <input type="date" className={controlClass} value={form.date} min={today()} onChange={set('date')} required />
      </Field>

      <Field label="المسافرين" icon={Users}>
        <select className={controlClass} value={form.people} onChange={set('people')} aria-label="عدد المسافرين">
          {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'مسافر' : 'مسافرين'}</option>)}
        </select>
      </Field>

      <button type="submit" className="btn btn-primary h-[60px] w-full md:col-span-3 lg:col-span-1">
        <Search size={19} /> ابحث عن رحلات
      </button>
    </form>
  )
}
