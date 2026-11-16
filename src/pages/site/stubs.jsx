import { Link } from 'react-router-dom'
import PageStub from '../../components/PageStub'
import PageBanner from '../../components/ui/PageBanner'
import EmptyState from '../../components/ui/EmptyState'

// صفحات الموقع اللي لسا ما انبنت. كل وحدة لما تبنيها انقلها لملف خاص فيها.



export function Booking() {
  return (
    <PageStub
      title="إتمام الحجز (3 خطوات)"
      todo={[
        'getTrip(id) + getTripSeats(id) → occupiedSeats',
        'خطوة 1: مخطط المقاعد من totalSeats (صفوف من 4)، عدد المقاعد = people (1-4)',
        'خطوة 2: اسم ورقم هاتف لكل مسافر',
        'خطوة 3: مراجعة ← إذا مو مسجّل دخول navigate("/login", { state: { from: location } })',
        'createBooking({ tripId, seats: [{ seatNumber, passengerName, passengerPhone }] }) ← /booking/success/:id',
      ]}
      endpoints={['GET /website/trips/:id', 'GET /website/trips/:id/seats', 'POST /website/bookings']}
    />
  )
}

export function BookingSuccess() {
  return <PageStub title="تم الحجز" todo={['getBooking(id) واعرض رقم الحجز والوجهة والمقاعد', 'أزرار: حجوزاتي / تتبع الرحلة']} endpoints={['GET /website/bookings/:id']} />
}

export function MyBookings() {
  return (
    <>
      <PageBanner crumbs={[{ label: 'حجوزاتي' }]} eyebrow="كل رحلاتك بمكان واحد" title="تذاكرك" accent="دايماً معك." />
      <PageStub title="حجوزاتي" todo={['getMyBookings() → قائمة بطاقات', 'نافذة التذكرة (Modal)', 'زر إلغاء → cancelBooking(id) ثم refetch']} endpoints={['GET /website/bookings/me', 'POST /website/bookings/:id/cancel']} />
    </>
  )
}

export function Companies() {
  return (
    <>
      <PageBanner crumbs={[{ label: 'شركات النقل' }]} eyebrow="شركاء الطريق" title="شركات" accent="النقل." />
      <PageStub title="شركات النقل" todo={['getCompanies() + companyMeta(company) للتقييم والخدمات', 'زر "شوف الرحلات" → /trips?companyId=']} endpoints={['GET /website/companies']} />
    </>
  )
}

export function Tracking() {
  return <PageStub title="تتبّع الرحلة (محاكاة)" todo={['ما في endpoint للتتبع — محاكاة من latitude/longitude تبع المدن', 'شريط تقدّم + وقت وصول تقريبي (الخريطة اختيارية)']} endpoints={['GET /website/bookings/:id']} />
}

export function Account() {
  return <PageStub title="حسابي" todo={['اعرض user من useSiteAuth()', 'عدد الحجوزات + زر تسجيل خروج']} endpoints={['GET /website/auth/me']} />
}

export function About() {
  return <PageBanner crumbs={[{ label: 'من نحن' }]} eyebrow="قصتنا" title="سيرنا." accent="رحلة أبسط لكل حدا." text="منصة لحجز الرحلات البرية بين المحافظات السورية." />
}

export function Support() {
  return <PageBanner crumbs={[{ label: 'الأسئلة الشائعة' }]} eyebrow="نحن معك" title="شو حابب" accent="تعرف؟" />
}

export function NotFound() {
  return (
    <div className="container-x py-20">
      <EmptyState title="الصفحة مو موجودة" text="يمكن الرابط غلط أو الصفحة انشالت." action={<Link to="/" className="btn btn-primary">رجوع للرئيسية</Link>} />
    </div>
  )
}
