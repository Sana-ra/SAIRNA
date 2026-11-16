import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft, LogOut, Mail, Menu, Moon, Phone, Sparkles, Sun, X } from 'lucide-react'
import Logo from '../components/ui/Logo'
import { useSiteAuth } from '../context/auth'
import { useTheme } from '../hooks/useTheme'

const LINKS = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/trips', label: 'احجز رحلة' },
  { to: '/companies', label: 'شركات النقل' },
  { to: '/my-bookings', label: 'حجوزاتي' },
  { to: '/tracking', label: 'تتبع الرحلة' },
]

function Header() {
  const { user, logout } = useSiteAuth()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  // القائمة مربوطة بالصفحة اللي انفتحت فيها، فبتسكّر لحالها لما تتغير الصفحة
  const [openAt, setOpenAt] = useState(null)
  const open = openAt === pathname
  const setOpen = fn => setOpenAt(fn(open) ? pathname : null)

  const navClass = ({ isActive }) =>
    `relative py-8 text-xs font-extrabold whitespace-nowrap transition hover:text-ink after:absolute after:bottom-4 after:start-1/2 after:h-[3px] after:translate-x-1/2 after:rounded after:bg-primary after:transition-all ${
      isActive ? 'text-ink after:w-6' : 'text-muted after:w-0 hover:after:w-6'
    }`

  return (
    <>
      <div className="flex min-h-8 items-center justify-center gap-2 bg-dark-deep text-[10px] font-bold text-[#d4f2ec]">
        <span className="size-1.5 rounded-full bg-[#58d7bb] shadow-[0_0_0_4px_rgba(88,215,187,.12)]" />
        رحلات بين المدن السورية، بخطوات بسيطة وواضحة
        <Sparkles size={13} className="text-[#ffce87]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-lg">
        <div className="container-x flex h-20 items-center justify-between gap-5">
          <Logo />

          <nav className="mx-auto hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button type="button" onClick={toggle} className="grid size-10 place-items-center rounded-xl border border-line bg-surface hover:border-primary hover:bg-soft-teal hover:text-primary" aria-label="تبديل المظهر">
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/account" className="flex items-center gap-2 text-xs font-extrabold">
                  <span className="grid size-9 place-items-center rounded-full bg-soft-teal font-black text-primary">
                    {(user.name || 'م').trim().charAt(0)}
                  </span>
                  {user.name}
                </Link>
                <button type="button" onClick={logout} className="grid size-10 place-items-center rounded-xl text-muted hover:text-primary" aria-label="تسجيل الخروج">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link to="/login" className="text-xs font-extrabold hover:text-primary">تسجيل الدخول</Link>
                <Link to="/register" className="btn btn-primary btn-sm">إنشاء حساب</Link>
              </div>
            )}

            <button type="button" onClick={() => setOpen(o => !o)} className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label="القائمة" aria-expanded={open}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-line bg-surface px-7 py-3 lg:hidden">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `flex items-center justify-between border-b border-line px-2 py-3 font-bold ${isActive ? 'text-primary' : ''}`}>
                {l.label} <ChevronLeft size={16} />
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to="/account" className="flex items-center justify-between border-b border-line px-2 py-3 font-bold">حسابي <ChevronLeft size={16} /></Link>
                <button type="button" onClick={logout} className="w-full px-2 py-3 text-start font-bold text-red-600">تسجيل الخروج</button>
              </>
            ) : (
              <div className="flex gap-3 pt-4">
                <Link to="/login" className="btn btn-outline btn-sm flex-1">تسجيل الدخول</Link>
                <Link to="/register" className="btn btn-primary btn-sm flex-1">إنشاء حساب</Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  )
}

function Footer() {
  return (
    <footer className="bg-dark-deep pt-14 text-[#d2e4e9]">
      <div className="container-x grid gap-10 pb-12 md:grid-cols-[2fr_1fr_1fr_1.25fr]">
        <div>
          <Logo light />
          <p className="my-4 max-w-72 text-xs leading-8 text-[#9cb4c0]">
            طريقة أجمل وأسهل للسفر بين المحافظات السورية. ابحث، اختار، واحجز بكل راحة.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <h4 className="mb-2 text-[13px] text-white">روابط سريعة</h4>
          {LINKS.map(l => <Link key={l.to} to={l.to} className="text-[11px] text-[#a3c0ca] hover:text-[#40d1bb]">{l.label}</Link>)}
        </div>
        <div className="flex flex-col items-start gap-3">
          <h4 className="mb-2 text-[13px] text-white">المساعدة</h4>
          <Link to="/support" className="text-[11px] text-[#a3c0ca] hover:text-[#40d1bb]">الأسئلة الشائعة</Link>
          <Link to="/about" className="text-[11px] text-[#a3c0ca] hover:text-[#40d1bb]">من نحن</Link>
        </div>
        <div className="flex flex-col items-start gap-3">
          <h4 className="mb-2 text-[13px] text-white">تواصل معنا</h4>
          <span className="flex items-center gap-2 text-[11px] text-[#a3c0ca]" dir="ltr"><Phone size={15} /> +963 900 000 000</span>
          <span className="flex items-center gap-2 text-[11px] text-[#a3c0ca]" dir="ltr"><Mail size={15} /> hello@sairna.sy</span>
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-[#254451] py-5 text-[10px] text-[#8eabb7]">
        <span>© {new Date().getFullYear()} سيرنا. جميع الحقوق محفوظة.</span>
        <span>صُنع بحب <span className="text-[#e8938e]">♥</span> في سوريا</span>
      </div>
    </footer>
  )
}

export default function SiteLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
