import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

// كل جزء إله توكن منفصل: المسافر بالموقع، والأدمن بالداشبورد
export const TOKEN_KEYS = { site: 'sairna_token', admin: 'sairna_admin_token' }
export const USER_KEYS = { site: 'sairna_user', admin: 'sairna_admin_user' }
export const REFRESH_TOKEN_KEYS = { site: 'sairna_refresh_token', admin: 'sairna_admin_refresh_token' }

export const tokenStore = {
  get: key => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: key => localStorage.removeItem(key),
}

export const userStore = {
  get: key => {
    const value = localStorage.getItem(key)
    if (!value) return null

    try {
      return JSON.parse(value)
    } catch {
      localStorage.removeItem(key)
      return null
    }
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: key => localStorage.removeItem(key),
}


// حدث بينطلق لما السيرفر يرجّع 401، والـ AuthProvider بيسمعه ويعمل logout
export const logoutEvent = key => `auth:expired:${key}`

function createClient(prefix, tokenKey) {
  const api = axios.create({
    baseURL: `${BASE_URL}/${prefix}`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  })

  api.interceptors.request.use(config => {
    const token = tokenStore.get(tokenKey)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  api.interceptors.response.use(
    // نرجّع البيانات مباشرة: await getCities() => [...]
    response => response.data,
    error => {
      const status = error.response?.status
      if (status === 401 && tokenStore.get(tokenKey)) {
        tokenStore.remove(tokenKey)
        userStore.remove(USER_KEYS.site === tokenKey ? USER_KEYS.site : USER_KEYS.admin)
        tokenStore.remove(REFRESH_TOKEN_KEYS.site === tokenKey ? REFRESH_TOKEN_KEYS.site : REFRESH_TOKEN_KEYS.admin)
        window.dispatchEvent(new Event(logoutEvent(tokenKey)))
      }
      // أخطاء NestJS: message بتكون نص أو مصفوفة نصوص
      const msg = error.response?.data?.message
      const text = Array.isArray(msg) ? msg[0] : msg
      const err = new Error(
        text || (error.code === 'ECONNABORTED' ? 'السيرفر ما رد، جرّب مرة تانية' : 'صار خطأ، جرّب مرة تانية'),
      )
      err.status = status
      err.details = msg
      return Promise.reject(err)
    },
  )

  return api
}

export const siteApi = createClient('website', TOKEN_KEYS.site)
export const adminApi = createClient('dashboard', TOKEN_KEYS.admin)
