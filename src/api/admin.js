import { adminApi as api } from './client'

// Swagger: https://sairna.abdulrahman-hares.com/api/docs/dashboard

export const adminAuth = {
  login: data => api.post('/auth/login', data), // { email, password } — حسابات ADMIN فقط
  me: () => api.get('/auth/me'),
}

export const getOverview = () => api.get('/overview')

// المدن: قراءة فقط
export const getCities = () => api.get('/cities')

// الشركات: CompanyDto { name*, logoUrl } / UpdateCompanyDto { name, logoUrl, isActive }
export const companies = {
  list: () => api.get('/companies'),
  create: data => api.post('/companies', data),
  update: (id, data) => api.patch(`/companies/${id}`, data),
  remove: id => api.delete(`/companies/${id}`),
}

// الرحلات: CreateTripDto { companyId*, originId*, destinationId*, departureAt*, arrivalAt*, price*, totalSeats* }
// UpdateTripDto: نفس الحقول + status: 'AVAILABLE' | 'CANCELLED'
export const trips = {
  list: () => api.get('/trips'),
  get: id => api.get(`/trips/${id}`),
  create: data => api.post('/trips', data),
  update: (id, data) => api.patch(`/trips/${id}`, data),
  remove: id => api.delete(`/trips/${id}`),
}

export const bookings = {
  list: () => api.get('/bookings'),
  get: id => api.get(`/bookings/${id}`),
  cancel: id => api.post(`/bookings/${id}/cancel`),
}

// المستخدمين: قراءة فقط
export const users = {
  list: () => api.get('/users'),
  get: id => api.get(`/users/${id}`),
}
