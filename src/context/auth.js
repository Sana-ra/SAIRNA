import { REFRESH_TOKEN_KEYS, TOKEN_KEYS, USER_KEYS } from '../api/client'
import { siteAuth } from '../api/site'
import { adminAuth } from '../api/admin'
import { createAuth } from './createAuth'

// المسافر (الموقع)
export const { AuthProvider: SiteAuthProvider, useAuth: useSiteAuth } = createAuth(siteAuth, TOKEN_KEYS.site, USER_KEYS.site, REFRESH_TOKEN_KEYS.site)

// الأدمن (الداشبورد)
export const { AuthProvider: AdminAuthProvider, useAuth: useAdminAuth } = createAuth(adminAuth, TOKEN_KEYS.admin, USER_KEYS.admin, REFRESH_TOKEN_KEYS.admin)
