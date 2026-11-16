import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Hand, LogOut, Sparkles, Ticket, UserRound } from 'lucide-react'

import { useSiteAuth } from '../../context/auth'
import { getMyBookings } from '../../api/site'

const unwrapBookings = response => {
  let value = response?.data ?? response

  while (value && !Array.isArray(value) && typeof value === 'object' && value.data !== undefined) {
    value = value.data
  }

  if (Array.isArray(value)) return value

  const bookings = value?.bookings ?? value?.items ?? value?.results ?? value?.content
  return Array.isArray(bookings) ? bookings : []
}

export default function Account() {
  const navigate = useNavigate()
  const { user, logout } = useSiteAuth()

  const bookingsQuery = useQuery({
    queryKey: ['myBookings'],
    queryFn: getMyBookings,
    enabled: Boolean(user),
    staleTime: 60 * 1000,
    retry: 1,
  })

  const bookingsCount = useMemo(() => unwrapBookings(bookingsQuery.data).length, [bookingsQuery.data])
  const name = user?.name ?? user?.fullName ?? user?.username ?? 'المستخدم'
  const initial = name.trim().charAt(0).toUpperCase() || 'م'

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-[#f8fafb] px-4 pb-20 pt-28 sm:px-8" dir="rtl">
        <div className="mx-auto max-w-lg rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#d9f3ee] text-[#0b9b8a]">
            <UserRound size={30} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-900">أهلاً فيك في سيرنا!</h1>
          <p className="mt-3 text-sm leading-8 text-slate-400">سجّل دخولك حتى تتمكن من مشاهدة معلومات حسابك.</p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0b9b8a] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#098274]">
            تسجيل الدخول <ArrowLeft size={17} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-[#f8fafb] px-4 pb-20 sm:px-8" dir="rtl">
      <div className="container-x">
        <section className="pt-28 pb-10 text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#d9f3ee] px-4 py-1.5 text-xs font-black text-[#0b9b8a]">
            <Sparkles size={14} />
            ملفك الشخصي
          </span>
          <h1 className="mt-5 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            أهلاً {name}
            <Hand size={30} className="text-[#0b9b8a]" />
          </h1>
          <p className="mt-3 text-sm text-slate-400">هون كل التفاصيل المتعلقة بحسابك.</p>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#d9f3ee] text-3xl font-black text-[#0b9b8a]">
              {initial}
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">{name}</h2>
            <p className="mt-1 text-sm text-slate-400" dir="ltr">{user.email ?? 'غير متوفر'}</p>

            <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f1f6f7] py-3.5 text-sm font-bold text-slate-700">
              <Ticket size={19} className="text-[#0b9b8a]" />
              {bookingsQuery.isLoading ? '...' : bookingsCount} حجوزات محفوظة
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </aside>

          <section className="flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
            <div>
              <h2 className="mb-4 text-xl font-black text-slate-900">معلومات الحساب</h2>
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between gap-6 py-4 text-sm">
                  <span className="text-slate-400">الاسم الكامل</span>
                  <strong className="text-left font-bold text-slate-900">{name}</strong>
                </div>
                <div className="flex items-center justify-between gap-6 py-4 text-sm">
                  <span className="text-slate-400">البريد الإلكتروني</span>
                  <strong className="text-left font-bold text-slate-900" dir="ltr">{user.email ?? 'غير متوفر'}</strong>
                </div>
                {(user.phone ?? user.phoneNumber ?? user.mobile) && (
                  <div className="flex items-center justify-between gap-6 py-4 text-sm">
                    <span className="text-slate-400">رقم الهاتف</span>
                    <strong className="text-left font-bold text-slate-900" dir="ltr">{user.phone ?? user.phoneNumber ?? user.mobile}</strong>
                  </div>
                )}
                <div className="flex items-center justify-between gap-6 py-4 text-sm">
                  <span className="text-slate-400">نوع الحساب</span>
                  <strong className="text-left font-bold text-slate-900">حساب مسافر</strong>
                </div>
              </div>
            </div>

            <Link to="/my-bookings" className="mt-8 inline-flex self-end items-center gap-2 rounded-2xl bg-[#0b9b8a] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#098274]">
              انتقل لحجوزاتي
              <ArrowLeft size={17} />
            </Link>
          </section>
        </section>
      </div>
    </main>
  )
}
