import PageStub from '../../components/PageStub'

// صفحات الداشبورد اللي لسا ما انبنت — انسخ شكل Cities.jsx (useQuery + DataTable) و Modal للفورم.
// بعد أي create/update/delete: queryClient.invalidateQueries({ queryKey: ['admin', '...'] })

const wrap = props => <div className="-mx-5 -my-14 sm:-mx-8"><PageStub {...props} /></div>

export const Overview = () =>
  wrap({
    title: 'نظرة عامة',
    todo: ['getOverview() → بطاقات إحصائيات (افتح الرد بالـ Swagger لتعرف الحقول)', 'جدول آخر الحجوزات من bookings.list()'],
    endpoints: ['GET /dashboard/overview', 'GET /dashboard/bookings'],
  })

export const Trips = () =>
  wrap({
    title: 'الرحلات',
    todo: [
      'DataTable: الكود، الشركة، من ← إلى، الانطلاق، السعر، المقاعد المتاحة، الحالة',
      'زر "رحلة جديدة" → Modal فيه: companyId, originId, destinationId (selects), departureAt, arrivalAt (datetime-local), price, totalSeats',
      'حوّل التاريخ بـ localInputToIso() قبل الإرسال، وisoToLocalInput() عند التعديل',
      'تعديل: الحالة AVAILABLE / CANCELLED — حذف مع تأكيد',
    ],
    endpoints: ['GET /dashboard/trips', 'POST /dashboard/trips', 'PATCH /dashboard/trips/:id', 'DELETE /dashboard/trips/:id'],
  })

export const Bookings = () =>
  wrap({
    title: 'الحجوزات',
    todo: ['DataTable: رقم الحجز، المسافر، الرحلة، المقاعد، المبلغ، الحالة، التاريخ', 'Modal تفاصيل + زر إلغاء'],
    endpoints: ['GET /dashboard/bookings', 'GET /dashboard/bookings/:id', 'POST /dashboard/bookings/:id/cancel'],
  })

export const Companies = () =>
  wrap({
    title: 'الشركات',
    todo: ['DataTable: الشعار، الاسم، الحالة (isActive)', 'Modal إضافة/تعديل: name, logoUrl, isActive', 'حذف مع تأكيد'],
    endpoints: ['GET /dashboard/companies', 'POST /dashboard/companies', 'PATCH /dashboard/companies/:id', 'DELETE /dashboard/companies/:id'],
  })

export const Users = () =>
  wrap({
    title: 'المستخدمين',
    todo: ['DataTable: الاسم، الإيميل، الدور، تاريخ التسجيل (قراءة فقط)'],
    endpoints: ['GET /dashboard/users', 'GET /dashboard/users/:id'],
  })
