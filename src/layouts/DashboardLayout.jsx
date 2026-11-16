import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Building2, Bus, LayoutDashboard, LogOut, MapPin, Menu, Moon, Sun, Ticket, Users, X } from 'lucide-react'
import Logo from '../components/ui/Logo'
import { useAdminAuth } from '../context/auth'
import { useTheme } from '../hooks/useTheme'

const LINKS = [
  { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/admin/trips', label: 'الرحلات', icon: Bus },
  { to: '/admin/bookings', label: 'الحجوزات', icon: Ticket },
  { to: '/admin/companies', label: 'الشركات', icon: Building2 },
  { to: '/admin/users', label: 'المستخدمين', icon: Users },
  { to: '/admin/cities', label: 'المدن', icon: MapPin },
]

export default function DashboardLayout() {
  const { user, logout } = useAdminAuth()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  // السايدبار بالجوال بيسكّر لحاله لما تتغير الصفحة
  const [openAt, setOpenAt] = useState(null)
  const open = openAt === pathname
  const setOpen = value => setOpenAt(value ? pathname : null)

  const current = LINKS.find(l => (l.end ? pathname === l.to : pathname.startsWith(l.to)))

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-[260px] flex-col bg-dark-deep text-[#d2e4e9] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Logo to="/admin" light subtitle="لوحة التحكم" />
          <button type="button" onClick={() => setOpen(false)} className="lg:hidden" aria-label="إغلاق القائمة"><X size={20} /></button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition ${
                  isActive ? 'bg-primary text-white' : 'text-[#a3c0ca] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={logout} className="m-3 flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-[#e8938e] hover:bg-white/5">
          <LogOut size={19} /> تسجيل الخروج
        </button>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Content */}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-line bg-surface/95 px-5 backdrop-blur-lg sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label="القائمة">
              <Menu size={20} />
            </button>
            <h1 className="text-lg">{current?.label ?? 'لوحة التحكم'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggle} className="grid size-10 place-items-center rounded-xl border border-line hover:border-primary hover:text-primary" aria-label="تبديل المظهر">
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <span className="grid size-10 place-items-center rounded-full bg-soft-teal font-black text-primary">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <b className="text-xs">{user?.name || 'المدير'}</b>
              <small className="text-[10px] text-muted">{user?.email}</small>
            </div>
          </div>
        </header>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
