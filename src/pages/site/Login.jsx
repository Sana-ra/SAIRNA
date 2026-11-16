import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSiteAuth } from '../../context/auth'
import AuthShell, { PasswordInput } from './AuthShell'

export default function Login() {
  const { login, isAuthenticated } = useSiteAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // بعد الدخول بيرجع للصفحة اللي كان فيها (مثلاً الحجز)
  const from = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search || '')
    : '/'

  if (isAuthenticated) return <Navigate to={from} replace />

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password })
      toast.success('أهلاً وسهلاً! 👋')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="أهلاً برجعتك" title="منوّر،" accent="اشتقنالك!" text="ادخل على حسابك، وكمّل حجز رحلتك براحة.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="label">البريد الإلكتروني</span>
          <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="name@example.com" autoComplete="email" dir="ltr" />
        </label>
        <label className="block">
          <span className="label">كلمة المرور</span>
          <PasswordInput required value={form.password} onChange={set('password')} autoComplete="current-password" />
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'جاري الدخول...' : 'تسجيل الدخول'} <ArrowLeft size={18} />
        </button>
      </form>
      <p className="mt-6 text-center text-muted">
        لسا ما عندك حساب؟ <Link to="/register" state={location.state} className="font-extrabold text-primary">أنشئ حساب جديد</Link>
      </p>
    </AuthShell>
  )
}
