import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../../components/ui/Logo'
import { useAdminAuth } from '../../context/auth'
import { PasswordInput } from '../site/AuthShell'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const from = location.state?.from?.pathname || '/admin'

  if (isAuthenticated) return <Navigate to={from} replace />

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password })
      toast.success('أهلاً بك في لوحة التحكم')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-linear-to-bl from-[#0e4653] to-[#0a2c3e] p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Logo to="/admin/login" subtitle="لوحة التحكم" />
          <span className="eyebrow"><ShieldCheck size={13} /> دخول الإدارة فقط</span>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="label">البريد الإلكتروني</span>
            <input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="username" dir="ltr" />
          </label>
          <label className="block">
            <span className="label">كلمة المرور</span>
            <PasswordInput required value={form.password} onChange={set('password')} autoComplete="current-password" />
          </label>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'جاري الدخول...' : 'دخول'} <ArrowLeft size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
