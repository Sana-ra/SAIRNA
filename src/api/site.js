// src/api/site.js

import { siteApi as api } from './client'

// مصادقة المستخدمين
export const siteAuth = {
  login: data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// المحافظات
export const getCities = () => api.get('/cities')

// شركات النقل
// GET /api/v1/website/companies
// Response: [{ id, name, logoUrl, isActive }]
export const getCompanies = () => api.get('/companies')

// تفاصيل شركة
export const getCompany = id => api.get(`/companies/${id}`)

// البحث عن الرحلات
// params: { originId, destinationId, companyId, date }
export const searchTrips = params => api.get('/trips', { params })

// تفاصيل الرحلة
export const getTrip = id => api.get(`/trips/${id}`)

// المقاعد المتاحة للرحلة
export const getTripSeats = id => api.get(`/trips/${id}/seats`)

// إنشاء حجز
// data: { tripId, seats: [{ seatNumber, passengerName, passengerPhone }] }
export const createBooking = data => api.post('/bookings', data)

// حجوزات المستخدم الحالي
export const getMyBookings = () => api.get('/bookings/me')

// تفاصيل الحجز
export const getBooking = id => api.get(`/bookings/${id}`)

// إلغاء الحجز
export const cancelBooking = id => api.post(`/bookings/${id}/cancel`)