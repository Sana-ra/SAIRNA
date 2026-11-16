import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth, useSiteAuth } from '../context/auth'
import Spinner from '../components/ui/Spinner'

function Guard({ auth, loginPath }) {
  const location = useLocation()
  if (auth.loading) return <Spinner full />
  if (!auth.isAuthenticated) return <Navigate to={loginPath} replace state={{ from: location }} />
  return <Outlet />
}

// صفحات بتحتاج مسافر مسجّل دخول
export function RequireUser() {
  return <Guard auth={useSiteAuth()} loginPath="/login" />
}

// صفحات الداشبورد
export function RequireAdmin() {
  return <Guard auth={useAdminAuth()} loginPath="/admin/login" />
}
