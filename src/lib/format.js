// تنسيق الأرقام والتواريخ — التواريخ من الباك بصيغة ISO (UTC) وبتنعرض بتوقيت جهاز المستخدم

export const money = n => `${Number(n || 0).toLocaleString('en-US')} ل.س`

const pad = n => String(n).padStart(2, '0')

// 'YYYY-MM-DD' بالتوقيت المحلي
export const toDateInput = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const today = () => toDateInput()
export const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateInput(d)
}

// '07:30'
export const formatTime = iso =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

// 'الخميس، 5 تشرين الثاني 2026'
export const formatDate = value => {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
  return new Intl.DateTimeFormat('ar-SY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

// '5 س 30 د'
export const durationText = (fromIso, toIso) => {
  const mins = Math.max(0, Math.round((new Date(toIso) - new Date(fromIso)) / 60000))
  return `${Math.floor(mins / 60)} س ${mins % 60} د`
}

// لحقول datetime-local بالداشبورد
export const isoToLocalInput = iso => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${toDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const localInputToIso = value => (value ? new Date(value).toISOString() : '')
