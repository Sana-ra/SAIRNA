import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { logoutEvent, tokenStore, userStore } from '../api/client'

// الرد تبع login ممكن يكون { accessToken, user } أو { token } أو { data: {...} }
// تأكد من الشكل بالـ Swagger وعدّل هون إذا لزم
const pickToken = res =>
  res?.accessToken ?? res?.access_token ?? res?.token ?? res?.data?.accessToken ?? res?.data?.token ?? null
const pickRefreshToken = res =>
  res?.refreshToken ?? res?.refresh_token ?? res?.data?.refreshToken ?? res?.data?.refresh_token ?? null
const pickUser = res => res?.user ?? res?.data?.user ?? (res?.email ? res : null)

// مصنع بيعطي Provider و hook — منستعمله مرة للموقع ومرة للداشبورد
export function createAuth(authApi, tokenKey, userKey, refreshTokenKey) {
  const AuthContext = createContext(null)

  function AuthProvider({ children }) {
    const [user, setUser] = useState(() => (tokenStore.get(tokenKey) ? userStore.get(userKey) : null))
    const [loading, setLoading] = useState(() => Boolean(tokenStore.get(tokenKey)))

    // عند فتح الموقع: إذا في توكن، جيب بيانات المستخدم
    useEffect(() => {
      if (!tokenStore.get(tokenKey)) return
      authApi
        .me()
        .then(res => {
          const nextUser = pickUser(res) ?? res
          setUser(nextUser)
          userStore.set(userKey, nextUser)
        })
        .catch(error => {
          // أخطاء الشبكة أو السيرفر المؤقتة لا تبطل الجلسة المحلية.
          if (error?.status === 401) {
            tokenStore.remove(tokenKey)
            tokenStore.remove(refreshTokenKey)
            userStore.remove(userKey)
            setUser(null)
          }
        })
        .finally(() => setLoading(false))
    }, [])

    // لما السيرفر يرجّع 401
    useEffect(() => {
      const onExpired = () => {
        tokenStore.remove(tokenKey)
        tokenStore.remove(refreshTokenKey)
        userStore.remove(userKey)
        setUser(null)
      }
      window.addEventListener(logoutEvent(tokenKey), onExpired)
      return () => window.removeEventListener(logoutEvent(tokenKey), onExpired)
    }, [])

    const startSession = useCallback(async res => {
      const token = pickToken(res)
      if (!token) throw new Error('ما وصل توكن من السيرفر — راجع شكل رد login بالـ Swagger')
      tokenStore.set(tokenKey, token)
      const refreshToken = pickRefreshToken(res)
      if (refreshToken) tokenStore.set(refreshTokenKey, refreshToken)
      const u = pickUser(res) ?? (await authApi.me())
      const nextUser = pickUser(u) ?? u
      setUser(nextUser)
      userStore.set(userKey, nextUser)
      return nextUser
    }, [])

    const login = useCallback(async data => startSession(await authApi.login(data)), [startSession])

    const register = useCallback(
      async data => {
        const res = await authApi.register(data)
        // بعض الباك بيرجع توكن مع التسجيل، وبعضهم لا — بهالحالة منعمل login
        return pickToken(res) ? startSession(res) : login({ email: data.email, password: data.password })
      },
      [login, startSession],
    )

    const logout = useCallback(() => {
      tokenStore.remove(tokenKey)
      tokenStore.remove(refreshTokenKey)
      userStore.remove(userKey)
      setUser(null)
    }, [])

    const value = useMemo(
      () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
      [user, loading, login, register, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }

  function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth لازم يكون جوّا AuthProvider')
    return ctx
  }

  return { AuthProvider, useAuth }
}
