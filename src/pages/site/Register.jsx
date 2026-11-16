import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSiteAuth } from '../../context/auth'
import AuthShell, { PasswordInput } from './AuthShell'

export default function Register() {
  const { register, isAuthenticated } = useSiteAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search || '')
    : '/'

  if (isAuthenticated) return <Navigate to={from} replace />

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.name.trim().length < 3) return toast.error('أدخل اسمك الكامل (3 أحرف على الأقل).')
    if (form.password.length < 6) return toast.error('كلمة المرور لازم تكون 6 أحرف على الأقل.')
    setLoading(true)
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password })
      toast.success('تم إنشاء حسابك 🎉')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="انضم لعيلة سيرنا" title="خلّينا نبدأ" accent="المشوار سوا." text="حساب بسيط، ورحلاتك كلها بين إيديك.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="label">الاسم الكامل</span>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="اسمك الكامل" autoComplete="name" />
        </label>
        <label className="block">
          <span className="label">البريد الإلكتروني</span>
          <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="name@example.com" autoComplete="email" dir="ltr" />
        </label>
        <label className="block">
          <span className="label">كلمة المرور</span>
          <PasswordInput required minLength={6} value={form.password} onChange={set('password')} placeholder="6 أحرف على الأقل" autoComplete="new-password" />
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'} <ArrowLeft size={18} />
        </button>
      </form>
      <p className="mt-6 text-center text-muted">
        عندك حساب من قبل؟ <Link to="/login" state={location.state} className="font-extrabold text-primary">سجّل دخولك</Link>
      </p>
    </AuthShell>
  )
}
