
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Ticket,
  Bus,
  Users,
  Armchair,
  Wallet,
  Route,
  Printer,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Building2,
  QrCode,
  LoaderCircle,
  ChevronLeft,
} from 'lucide-react'

import { getMyBookings, cancelBooking } from '../../api/site'

/* -----------------------------------------
   Helpers
----------------------------------------- */

const unwrap = (response) => {
  let result = response?.data ?? response

  // دعم استجابات API المغلفة داخل data
  while (
    result &&
    !Array.isArray(result) &&
    typeof result === 'object' &&
    result.data !== undefined
  ) {
    result = result.data
  }

  if (Array.isArray(result)) return result

  return (
    result?.bookings ??
    result?.items ??
    result?.results ??
    result?.content ??
    []
  )
}

const getBookingData = (booking) => {
  const trip = booking?.trip ?? booking?.tripDetails ?? {}

  const company =
    booking?.company ??
    trip?.company ??
    booking?.transportCompany ??
    {}

  const origin =
    booking?.origin ??
    trip?.origin ??
    booking?.originCity ??
    {}

  const destination =
    booking?.destination ??
    trip?.destination ??
    booking?.destinationCity ??
    {}

  const seats =
    booking?.seats ??
    booking?.bookedSeats ??
    booking?.selectedSeats ??
    []

  const passengers =
    booking?.passengers ??
    booking?.travelers ??
    booking?.bookingPassengers ??
    []

  const departureAt =
    booking?.departureAt ??
    booking?.departureDateTime ??
    trip?.departureAt ??
    trip?.departureDateTime ??
    null

  const arrivalAt =
    booking?.arrivalAt ??
    trip?.arrivalAt ??
    null

  const bookingId =
    booking?.bookingCode ??
    booking?.code ??
    booking?.reference ??
    booking?.id

  const tripId =
    booking?.tripId ??
    trip?.id ??
    booking?.trip?.tripId

  const rawStatus = String(
    booking?.status ?? booking?.bookingStatus ?? ''
  ).toUpperCase()

  const isCancelled = [
    'CANCELLED',
    'CANCELED',
    'REJECTED',
    'CANCEL',
  ].includes(rawStatus)

  const seatNumbers = (Array.isArray(seats) ? seats : [])
    .map((seat) => {
      if (typeof seat === 'object' && seat !== null) {
        return (
          seat?.seatNumber ??
          seat?.number ??
          seat?.seat?.seatNumber ??
          seat?.id ??
          ''
        )
      }

      return seat
    })
    .filter(Boolean)

  const passengerCount =
    booking?.passengerCount ??
    booking?.people ??
    booking?.numberOfPassengers ??
    (Array.isArray(passengers) && passengers.length > 0
      ? passengers.length
      : seatNumbers.length)

  const total =
    booking?.totalPrice ??
    booking?.totalAmount ??
    booking?.total ??
    booking?.amount ??
    booking?.price ??
    trip?.price ??
    0

  return {
    original: booking,
    id: bookingId,
    tripId,
    company,
    origin,
    destination,
    seats: seatNumbers,
    passengers: Array.isArray(passengers) ? passengers : [],
    passengerCount,
    total,
    departureAt,
    arrivalAt,
    status: rawStatus,
    isCancelled,
  }
}

const formatDate = (value) => {
  if (!value) return 'غير محدد'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('ar-SY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const formatTime = (value) => {
  if (!value) return '--:--'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

const formatMoney = (value) => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) return '0 ل.س'

  return `${amount.toLocaleString('en-US')} ل.س`
}

const getCityName = (city) => {
  if (!city) return 'غير محدد'

  if (typeof city === 'string') return city

  return (
    city.name ??
    city.cityName ??
    city.title ??
    'غير محدد'
  )
}

const getBookingNumber = (id) => {
  if (!id) return 'غير متوفر'

  const value = String(id)

  return value.startsWith('SR-')
    ? value
    : `SR-${value}`
}

/* -----------------------------------------
   Component
----------------------------------------- */

export default function MyBookings() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  /* -----------------------------------------
     Fetch bookings
  ----------------------------------------- */

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const response = await getMyBookings()
      return unwrap(response)
    },
    staleTime: 30 * 1000,
  })

  /* -----------------------------------------
     Normalize bookings
  ----------------------------------------- */

  const normalizedBookings = useMemo(() => {
    return bookings.map(getBookingData)
  }, [bookings])

  /* -----------------------------------------
     Cancel booking
  ----------------------------------------- */

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),

    onSuccess: async () => {
      setCancelTarget(null)

      await queryClient.invalidateQueries({
        queryKey: ['myBookings'],
      })

      await refetch()
    },
  })

  const handleCancel = () => {
    if (!cancelTarget?.original?.id) return

    cancelMutation.mutate(cancelTarget.original.id)
  }

  /* -----------------------------------------
     Tracking
  ----------------------------------------- */

  const handleTracking = (booking) => {
    // منع تتبع الحجز الملغى أو غير المرتبط بمعرّف
    if (
      !booking ||
      booking.isCancelled ||
      (!booking.tripId && !booking.original?.id && !booking.id)
    ) {
      return
    }

    const bookingId = booking.original?.id ?? booking.id
    const tripId = booking.tripId

    const params = new URLSearchParams()

    if (tripId) {
      params.set('tripId', String(tripId))
    }

    if (bookingId) {
      params.set('bookingId', String(bookingId))
    }

    // إرسال بيانات الحجز إلى صفحة التتبع
    navigate(`/tracking?${params.toString()}`, {
      state: {
        booking: booking.original,
        bookingDetails: booking,
        bookingId,
        tripId,
      },
    })
  }

  /* -----------------------------------------
     Print ticket
  ----------------------------------------- */

  const handlePrint = () => {
    window.print()
  }

  /* -----------------------------------------
     Loading
  ----------------------------------------- */

  if (isLoading) {
    return (
      <main className="inner-main my-bookings-page">
        <section className="container my-bookings-loading">
          <LoaderCircle size={38} className="loading-spinner" />

          <h3>عم نحضّر حجوزاتك...</h3>

          <p>
            لحظات وبتظهر كل تفاصيل رحلاتك.
          </p>
        </section>
      </main>
    )
  }

  /* -----------------------------------------
     Error
  ----------------------------------------- */

  if (isError) {
    return (
      <main className="inner-main my-bookings-page">
        <section className="container section">
          <div className="empty-state">
            <AlertCircle size={45} />

            <h3>تعذّر تحميل حجوزاتك</h3>

            <p>
              {error?.response?.data?.message ||
                error?.message ||
                'حدث خطأ أثناء الاتصال بالخادم.'}
            </p>

            <button
              className="btn btn-primary"
              onClick={() => refetch()}
            >
              <RefreshCw size={17} />
              إعادة المحاولة
            </button>
          </div>
        </section>
      </main>
    )
  }

  /* -----------------------------------------
     Render
  ----------------------------------------- */

  return (
    <main className="inner-main my-bookings-page">

      {/* Hero */}

      <section className="page-banner my-bookings-hero">
        <div className="container">

          <div className="breadcrumb">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              الرئيسية
            </a>

            <ChevronLeft size={14} />

            <span>حجوزاتي</span>
          </div>

          <div className="my-bookings-hero-content">

            <div>
              <span className="eyebrow">
                <span className="mini-star">✦</span>
                كل رحلاتك بمكان واحد
              </span>

              <h1 className="page-title">
                تذاكرك <span>دايماً معك.</span>
              </h1>

              <p>
                راقب حجوزاتك، وارجع لتفاصيل الرحلة وقت ما تحتاج.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Bookings */}

      <section className="container section my-bookings-content">

        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-slate-900">
            رحلاتي القادمة
          </h2>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/trips')}
          >
            <Ticket size={16} />
            حجز جديد
          </button>
        </div>

        {/* Empty state */}

        {normalizedBookings.length === 0 && (
          <div className="empty-state bookings-empty">

            <div className="empty-ticket-icon">
              <Ticket size={48} strokeWidth={1.4} />
            </div>

            <h3>
              لسه ما عندك حجوزات!
            </h3>

            <p>
              رحلتك الجاية ممكن تبدأ من هون. استكشف الرحلات واختار وجهتك.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate('/trips')}
            >
              استكشف الرحلات
              <ArrowLeft size={17} />
            </button>

          </div>
        )}

        {/* Booking cards */}

        <div className="my-trips-list">

          {normalizedBookings.map((booking, index) => {
            const {
              id,
              company,
              origin,
              destination,
              seats,
              passengerCount,
              total,
              departureAt,
              arrivalAt,
              isCancelled,
            } = booking

            const companyName =
              company?.name ??
              company?.companyName ??
              'شركة النقل'

            const companyLogo =
              company?.logoUrl ??
              company?.logo ??
              null

            const companyInitial = companyName.charAt(0)

            const canTrack =
              !isCancelled &&
              Boolean(booking.tripId || booking.original?.id || booking.id)

            return (
              <article
                className={`my-trip-card ${
                  isCancelled ? 'booking-cancelled' : ''
                }`}
                key={id ?? index}
              >

                {/* Card header */}

                <div className="mytrip-head">

                  <div className="mytrip-head-main">

                    <span className="ticket-icon">
                      <Ticket size={21} />
                    </span>

                    <div>
                      <span className="small-muted">
                        رقم الحجز
                      </span>

                      <b dir="ltr">
                        {getBookingNumber(id)}
                      </b>
                    </div>

                  </div>

                  <div className="booking-header-left">

                    <span
                      className={`tag booking-status ${
                        isCancelled
                          ? 'tag-cancelled'
                          : 'tag-success'
                      }`}
                    >
                      {isCancelled ? (
                        <XCircle size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}

                      {isCancelled ? 'حجز ملغى' : 'حجز مؤكد'}
                    </span>

                  </div>

                </div>

                {/* Card body */}

                <div className="mytrip-center">

                  <div className="mytrip-route">

                    <div>
                      <small>من</small>

                      <h3>{getCityName(origin)}</h3>

                      <b>
                        {formatTime(departureAt)}
                      </b>
                    </div>

                    <div className="mytrip-route-graphic">

                      <span>
                        <Bus size={21} />
                      </span>

                      <div />

                      <small>
                        {formatDate(departureAt)}
                      </small>

                    </div>

                    <div>
                      <small>إلى</small>

                      <h3>{getCityName(destination)}</h3>

                      <b>
                        {formatTime(arrivalAt)}
                      </b>
                    </div>

                  </div>

                  {/* Details */}

                  <div className="mytrip-detail">

                    <span>
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={companyName}
                          className="booking-company-logo"
                        />
                      ) : (
                        <span className="booking-company-fallback">
                          {companyInitial || <Building2 size={15} />}
                        </span>
                      )}

                      {companyName}
                    </span>

                    <span>
                      <Armchair size={16} />
                      المقاعد:{' '}
                      {seats.length ? seats.join('، ') : 'غير محددة'}
                    </span>

                    <span>
                      <Users size={16} />
                      {passengerCount || 0} مسافر
                    </span>

                    <span>
                      <Wallet size={16} />
                      {formatMoney(total)}
                    </span>

                  </div>

                </div>

                {/* Actions */}

                <div className="mytrip-actions">

                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <Ticket size={16} />
                    عرض التذكرة
                  </button>

                  <button
                    className="btn btn-subtle"
                    onClick={() => handleTracking(booking)}
                    disabled={!canTrack}
                    title={
                      isCancelled
                        ? 'لا يمكن تتبع حجز ملغى'
                        : !canTrack
                          ? 'بيانات الرحلة غير متوفرة'
                          : 'تتبّع الرحلة'
                    }
                  >
                    <Route size={16} />
                    تتبّع الرحلة
                  </button>

                  {!isCancelled && (
                    <button
                      className="btn btn-cancel"
                      onClick={() => setCancelTarget(booking)}
                    >
                      <XCircle size={16} />
                      إلغاء الحجز
                    </button>
                  )}

                </div>

              </article>
            )
          })}

        </div>

      </section>

      {/* ---------------------------------------
          Ticket Modal
      --------------------------------------- */}

      {selectedBooking && (
        <div
          className="modal-scrim ticket-modal-scrim"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedBooking(null)
            }
          }}
        >

          <div
            className="ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-label="تفاصيل التذكرة"
          >

            <button
              className="modal-close icon-button no-print"
              onClick={() => setSelectedBooking(null)}
              aria-label="إغلاق"
            >
              <X size={21} />
            </button>

            <div className="ticket-modal-head">

              <Ticket size={30} />

              <span>تذكرتك مع سيرنا</span>

              <strong>SAIRNA</strong>

            </div>

            <div className="ticket-modal-body">

              <div className="ticket-code">
                <small>رقم الحجز</small>

                <strong dir="ltr">
                  {getBookingNumber(selectedBooking.id)}
                </strong>
              </div>

              <div className="ticket-big-route">

                <span>
                  {getCityName(selectedBooking.origin)}
                </span>

                <ArrowLeft size={24} />

                <span>
                  {getCityName(selectedBooking.destination)}
                </span>

              </div>

              {/* Ticket details */}

              <div className="ticket-meta">

                <span>
                  شركة النقل
                  <b>
                    {selectedBooking.company?.name ??
                      selectedBooking.company?.companyName ??
                      'غير محدد'}
                  </b>
                </span>

                <span>
                  التاريخ
                  <b>
                    {formatDate(selectedBooking.departureAt)}
                  </b>
                </span>

                <span>
                  موعد الانطلاق
                  <b dir="ltr">
                    {formatTime(selectedBooking.departureAt)}
                  </b>
                </span>

                <span>
                  موعد الوصول
                  <b dir="ltr">
                    {formatTime(selectedBooking.arrivalAt)}
                  </b>
                </span>

                <span>
                  المقاعد
                  <b>
                    {selectedBooking.seats.join('، ') || 'غير محددة'}
                  </b>
                </span>

                <span>
                  عدد المسافرين
                  <b>
                    {selectedBooking.passengerCount || 0}
                  </b>
                </span>

                <span>
                  الإجمالي
                  <b>
                    {formatMoney(selectedBooking.total)}
                  </b>
                </span>

                <span>
                  حالة الحجز
                  <b>
                    {selectedBooking.isCancelled
                      ? 'ملغى'
                      : 'مؤكد'}
                  </b>
                </span>

              </div>

              {/* Passengers */}

              <div className="ticket-passengers">

                <h4>
                  <Users size={17} />
                  بيانات المسافرين
                </h4>

                {selectedBooking.passengers.length > 0 ? (
                  selectedBooking.passengers.map((passenger, index) => (
                    <div
                      className="ticket-passenger"
                      key={passenger.id ?? index}
                    >
                      <div className="ticket-passenger-avatar">
                        {index + 1}
                      </div>

                      <div>
                        <b>
                          {passenger.name ??
                            passenger.passengerName ??
                            `المسافر ${index + 1}`}
                        </b>

                        <small>
                          {passenger.phone ??
                            passenger.passengerPhone ??
                            'لا يوجد رقم هاتف'}
                        </small>
                      </div>

                      <span>
                        المقعد{' '}
                        {selectedBooking.seats[index] ?? '--'}
                      </span>
                    </div>
                  ))
                ) : (
                  selectedBooking.seats.map((seat, index) => (
                    <div className="ticket-passenger" key={index}>
                      <div className="ticket-passenger-avatar">
                        {index + 1}
                      </div>

                      <div>
                        <b>المسافر {index + 1}</b>

                        <small>
                          بيانات المسافر غير متوفرة
                        </small>
                      </div>

                      <span>المقعد {seat}</span>
                    </div>
                  ))
                )}

              </div>

              {/* Decorative QR */}

              <div className="ticket-qr-section">

                <div className="ticket-qr">
                  <QrCode size={72} strokeWidth={1.5} />
                </div>

                <div>
                  <b>رمز التذكرة</b>

                  <small>
                    احتفظ بهذه التذكرة لإبراز تفاصيل حجزك.
                  </small>

                  <strong dir="ltr">
                    {getBookingNumber(selectedBooking.id)}
                  </strong>
                </div>

              </div>

              <p className="ticket-disclaimer">
                تذكرة إلكترونية صادرة عن منصة سيرنا.
              </p>

              <button
                className="btn btn-outline full no-print ticket-print-button"
                onClick={handlePrint}
              >
                <Printer size={17} />
                طباعة التذكرة
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ---------------------------------------
          Cancel Confirmation
      --------------------------------------- */}

      {cancelTarget && (
        <div
          className="modal-scrim cancel-modal-scrim"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !cancelMutation.isPending
            ) {
              setCancelTarget(null)
            }
          }}
        >

          <div className="cancel-confirm-modal">

            <div className="cancel-icon">
              <AlertCircle size={32} />
            </div>

            <h3>إلغاء الحجز؟</h3>

            <p>
              هل أنت متأكد من رغبتك بإلغاء الحجز{' '}
              <strong dir="ltr">
                {getBookingNumber(cancelTarget.id)}
              </strong>
              ؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </p>

            {cancelMutation.isError && (
              <p className="cancel-error">
                {cancelMutation.error?.response?.data?.message ??
                  'تعذّر إلغاء الحجز. حاول مرة أخرى.'}
              </p>
            )}

            <div className="cancel-modal-actions">

              <button
                className="btn btn-subtle"
                onClick={() => setCancelTarget(null)}
                disabled={cancelMutation.isPending}
              >
                تراجع
              </button>

              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="loading-spinner"
                    />
                    جارٍ الإلغاء...
                  </>
                ) : (
                  <>
                    <XCircle size={17} />
                    تأكيد الإلغاء
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}
