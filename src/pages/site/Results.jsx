
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowLeftRight,
  Bus,
  CalendarDays,
  CheckCircle2,
  Filter,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Users,
  Wifi,
} from 'lucide-react'

import {
  getCities,
  getCompanies,
  searchTrips,
} from '../../api/site'

import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import SearchForm from '../../components/SearchForm'

import { cleanName } from '../../lib/companyMeta'

import {
  durationText,
  formatDate,
  formatTime,
  money,
} from '../../lib/format'


// فلاتر أوقات الانطلاق
const TIME_FILTERS = [
  { value: 'all', label: 'كل الأوقات' },
  { value: 'morning', label: 'صباحاً (قبل 12)' },
  { value: 'afternoon', label: 'ظهراً (12–17)' },
  { value: 'evening', label: 'مساءً (بعد 17)' },
]


// الحصول على تاريخ الغد بالتوقيت المحلي
function getTomorrowDate() {
  const tomorrow = new Date()

  tomorrow.setDate(tomorrow.getDate() + 1)

  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}


// استخراج التاريخ بشكل آمن
function getTimeValue(value) {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? null
    : date
}


// حساب مدة الرحلة بالدقائق
function getDurationMinutes(trip) {
  const departure = getTimeValue(trip.departureAt)
  const arrival = getTimeValue(trip.arrivalAt)

  if (!departure || !arrival) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(
    0,
    (arrival.getTime() - departure.getTime()) / 60000
  )
}


// استخراج ساعة الانطلاق
function getHour(trip) {
  const departure = getTimeValue(trip.departureAt)

  return departure
    ? departure.getHours()
    : null
}


// التحقق من صلاحية رابط شعار الشركة
function getValidLogoUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return ''
  }

  const url = value.trim()

  try {
    const parsedUrl = new URL(url, 'https://sairna.local')

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return ''
    }

    return url
  } catch {
    return ''
  }
}


// شعار الشركة مع صورة احتياطية عند فشل التحميل
function CompanyLogo({ company, small = false }) {
  const name = cleanName(company?.name) || ''
  const logoUrl = getValidLogoUrl(company?.logoUrl)

  const [failedLogo, setFailedLogo] = useState('')

  const sizeClass = small
    ? 'h-9 w-9 rounded-[10px] text-base'
    : 'h-[50px] w-[50px] rounded-[14px] text-2xl'

  const showImage = logoUrl && failedLogo !== logoUrl

  if (showImage) {
    return (
      <span
        className={`company-logo inline-grid shrink-0 place-items-center overflow-hidden border border-line bg-surface-alt ${sizeClass}`}
      >
        <img
          src={logoUrl}
          alt={name || 'شعار الشركة'}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailedLogo(logoUrl)}
        />
      </span>
    )
  }

  return (
    <span
      className={`company-logo inline-grid shrink-0 place-items-center border border-line bg-soft-teal font-black text-primary ${sizeClass}`}
      aria-label={name || 'شركة النقل'}
    >
      {name.charAt(0) || '؟'}
    </span>
  )
}


// تقييم الشركة والوسم
function CompanyRating({ company, compact = false }) {
  const rating = company?.rating

  const hasRating =
    rating !== undefined &&
    rating !== null &&
    rating !== ''

  const tag = cleanName(
    company?.tag || company?.badge || company?.type || ''
  )

  if (!hasRating && !tag) return null

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold ${
        compact ? '' : 'mt-1'
      }`}
    >
      {hasRating && (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Star size={12} fill="currentColor" />
          {rating}
        </span>
      )}

      {hasRating && tag && (
        <span className="text-muted">·</span>
      )}

      {tag && (
        <span className="text-muted">
          {tag}
        </span>
      )}
    </span>
  )
}


// بطاقة اختيار الشركة
function CompanyPickCard({ company, active, onClick }) {
  const name = cleanName(company?.name)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`company-pick flex min-w-0 flex-col items-center gap-2 rounded-[14px] border px-2.5 py-4 text-center transition duration-200 hover:-translate-y-0.5 hover:border-primary focus-visible:outline-primary ${
        active
          ? 'active border-primary bg-soft-teal shadow-[0_0_0_2px_rgba(16,177,155,.08)]'
          : 'border-line bg-surface'
      }`}
    >
      <CompanyLogo company={company} small />

      <span className="max-w-full truncate text-[11px] font-black text-ink">
        {name}
      </span>

      <CompanyRating company={company} compact />

      {!company?.rating && (
        <small className="text-[10px] text-muted">
          شركة نقل
        </small>
      )}
    </button>
  )
}


// عنصر من عناصر الفلترة
function RadioOption({
  name,
  value,
  checked,
  onChange,
  children,
  count,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[11px] font-bold text-muted">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="accent-primary"
      />

      <span className="min-w-0 flex-1">
        {children}
      </span>

      {count !== undefined && (
        <span className="rounded-md bg-surface-alt px-2 py-0.5 text-[10px] text-muted">
          {count}
        </span>
      )}
    </label>
  )
}


// بطاقة الرحلة
function TripCard({ trip, people }) {
  const company = trip.company || {}
  const origin = trip.origin || {}
  const destination = trip.destination || {}

  const availableSeats = Number(
    trip.availableSeats ?? 0
  )

  // الخدمات من الرحلة، أو من الشركة عند عدم توفرها
  const features = Array.isArray(trip.features)
    ? trip.features
    : Array.isArray(company.features)
      ? company.features
      : []

  const distance = trip.distance

  const departure = getTimeValue(trip.departureAt)
  const arrival = getTimeValue(trip.arrivalAt)

  const canBook = availableSeats >= people

  return (
    <article className="trip-card overflow-hidden rounded-[17px] border border-line bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-[#b4e4db] hover:shadow-card-md">

      {/* معلومات الشركة */}

      <header className="trip-card-header flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">

        <div className="trip-company flex min-w-0 items-center gap-3">

          <CompanyLogo company={company} />

          <div className="min-w-0">
            <strong className="block truncate text-[13px] font-black text-heading">
              {cleanName(company.name) || 'شركة النقل'}
            </strong>

            <CompanyRating company={company} />
          </div>
        </div>

        <span className="trip-type inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[10px] font-bold text-muted">
          <Bus size={15} />
          {trip.type || 'حافلة'}
        </span>
      </header>


      {/* مواعيد الرحلة والسعر */}

      <div className="trip-card-body grid gap-5 px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">

        <div className="trip-timing flex min-w-0 items-center justify-between gap-3 sm:gap-5">

          {/* الانطلاق */}

          <div className="timing-point flex min-w-0 flex-col">
            <strong
              className="text-[22px] font-black leading-relaxed tabular-nums text-heading"
              dir="ltr"
            >
              {departure
                ? formatTime(trip.departureAt)
                : '--:--'}
            </strong>

            <span className="truncate text-[11px] font-extrabold text-muted">
              {origin.name || 'مدينة الانطلاق'}
            </span>
          </div>


          {/* مسار الرحلة */}

          <div className="timing-route flex min-w-[90px] flex-1 flex-col items-center text-center">

            <span className="text-[10px] font-extrabold text-muted">
              {departure && arrival
                ? durationText(
                    trip.departureAt,
                    trip.arrivalAt
                  )
                : 'المدة غير محددة'}
            </span>

            <div className="my-1 flex w-full items-center justify-center gap-2 text-primary">
              <i className="h-px flex-1 border-t border-dashed border-[#b6ccd2]" />

              <Bus size={18} />

              <i className="h-px flex-1 border-t border-dashed border-[#b6ccd2]" />
            </div>

            <small className="text-[10px] font-extrabold text-primary">
              مباشرة
            </small>
          </div>


          {/* الوصول */}

          <div className="timing-point flex min-w-0 flex-col text-end">
            <strong
              className="text-[22px] font-black leading-relaxed tabular-nums text-heading"
              dir="ltr"
            >
              {arrival
                ? formatTime(trip.arrivalAt)
                : '--:--'}
            </strong>

            <span className="truncate text-[11px] font-extrabold text-muted">
              {destination.name || 'مدينة الوصول'}
            </span>
          </div>
        </div>


        {/* السعر والحجز */}

        <div className="trip-booking flex flex-row items-center justify-between gap-3 border-t border-line pt-4 lg:flex-col lg:items-stretch lg:border-s lg:border-t-0 lg:py-1 lg:pe-0 lg:ps-5">

          <div>
            <small className="block text-[10px] text-muted">
              السعر للشخص
            </small>

            <strong className="block whitespace-nowrap text-[19px] font-black text-heading">
              {money(trip.price)}
            </strong>

            <span
              className={`mt-0.5 flex items-center gap-1 text-[10px] font-extrabold ${
                canBook
                  ? 'text-primary'
                  : 'text-red-500'
              }`}
            >
              <Ticket size={14} />
              {availableSeats} مقعد متاح
            </span>
          </div>


          <Link
            to={`/trips/${trip.id}/book`}
            state={{ trip, people }}
            aria-disabled={!canBook}
            onClick={event => {
              if (!canBook) event.preventDefault()
            }}
            className={`btn btn-primary btn-sm min-h-10 ${
              !canBook
                ? 'pointer-events-none opacity-50'
                : ''
            }`}
          >
            اختيار المقاعد
            <ArrowLeft size={15} />
          </Link>
        </div>
      </div>


      {/* الخدمات والمسافة */}

      {(features.length > 0 ||
        (distance !== undefined && distance !== null)) && (
        <footer className="trip-card-footer flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 sm:px-6">

          {features.map((feature, index) => (
            <span
              key={`${feature}-${index}`}
              className="service-pill inline-flex items-center gap-1.5 rounded-md bg-surface-alt px-2.5 py-1 text-[10px] font-bold text-muted"
            >
              {index === 0
                ? <CheckCircle2 size={12} />
                : <Wifi size={12} />}

              {feature}
            </span>
          ))}

          {distance !== undefined &&
            distance !== null && (
              <span className="trip-distance ms-auto inline-flex items-center gap-1 text-[10px] text-muted">
                <MapPin size={13} />
                {distance} كم
              </span>
            )}
        </footer>
      )}
    </article>
  )
}


// صفحة النتائج الرئيسية
export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams()

  // حساب تاريخ الغد مرة واحدة عند تحميل الصفحة
  const defaultDate = useMemo(() => getTomorrowDate(), [])

  // القيم الافتراضية للبحث
  const originId = searchParams.get('originId') || '2'
  const destinationId = searchParams.get('destinationId') || '1'
  const date = searchParams.get('date') || defaultDate

  const requestedPeople = Number(
    searchParams.get('people') || 1
  )

  const people = Number.isFinite(requestedPeople)
    ? Math.min(4, Math.max(1, requestedPeople))
    : 1


  // إضافة المعاملات الناقصة إلى الرابط
  useEffect(() => {
    const needsDefaults =
      !searchParams.get('originId') ||
      !searchParams.get('destinationId') ||
      !searchParams.get('date') ||
      !searchParams.get('people')

    if (!needsDefaults) return

    setSearchParams(current => {
      const next = new URLSearchParams(current)

      if (!next.get('originId')) {
        next.set('originId', '2')
      }

      if (!next.get('destinationId')) {
        next.set('destinationId', '1')
      }

      if (!next.get('date')) {
        next.set('date', defaultDate)
      }

      if (!next.get('people')) {
        next.set('people', '1')
      }

      return next
    }, { replace: true })
  }, [searchParams, setSearchParams, defaultDate])


  // حالات الفلترة والترتيب

  const [companyFilter, setCompanyFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [sort, setSort] = useState('earliest')


  const validSearch = Boolean(
    originId &&
    destinationId &&
    date &&
    originId !== destinationId
  )


  // إعادة إنشاء SearchForm عند تغير معاملات البحث
  const searchFormKey =
    `${originId}-${destinationId}-${date}-${people}`


  // جلب الرحلات

  const tripsQuery = useQuery({
    queryKey: [
      'trips',
      {
        originId,
        destinationId,
        date,
      },
    ],

    queryFn: () => searchTrips({
      originId,
      destinationId,
      date,
    }),

    enabled: validSearch,
  })


  // جلب الشركات

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
    staleTime: 5 * 60 * 1000,
  })


  // جلب المدن

  const citiesQuery = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
    staleTime: Infinity,
  })


  const trips = useMemo(
    () => (Array.isArray(tripsQuery.data) ? tripsQuery.data : []),
    [tripsQuery.data],
  )

  const companies = Array.isArray(companiesQuery.data)
    ? companiesQuery.data.filter(
        company => company?.isActive !== false
      )
    : []

  const cities = Array.isArray(citiesQuery.data)
    ? citiesQuery.data
    : []


  // أسماء المدن من الرحلات أو قائمة المدن

  const originName =
    trips[0]?.origin?.name ||
    cities.find(
      city => String(city.id) === String(originId)
    )?.name

  const destinationName =
    trips[0]?.destination?.name ||
    cities.find(
      city => String(city.id) === String(destinationId)
    )?.name


  // عدد الرحلات لكل شركة

  const companyCounts = useMemo(() => {
    const counts = new Map()

    trips.forEach(trip => {
      const id = trip.company?.id

      if (id !== undefined && id !== null) {
        const key = String(id)

        counts.set(
          key,
          (counts.get(key) || 0) + 1
        )
      }
    })

    return counts
  }, [trips])


  // تطبيق الفلاتر والترتيب

  const filteredTrips = useMemo(() => {
    const filtered = trips.filter(trip => {

      if (
        companyFilter !== 'all' &&
        String(trip.company?.id) !== companyFilter
      ) {
        return false
      }

      const hour = getHour(trip)

      if (
        timeFilter === 'morning' &&
        !(hour !== null && hour < 12)
      ) {
        return false
      }

      if (
        timeFilter === 'afternoon' &&
        !(hour !== null && hour >= 12 && hour < 17)
      ) {
        return false
      }

      if (
        timeFilter === 'evening' &&
        !(hour !== null && hour >= 17)
      ) {
        return false
      }

      return true
    })


    return [...filtered].sort((a, b) => {
      if (sort === 'cheap') {
        return Number(a.price || 0) -
          Number(b.price || 0)
      }

      if (sort === 'quick') {
        return getDurationMinutes(a) -
          getDurationMinutes(b)
      }

      const aTime =
        getTimeValue(a.departureAt)?.getTime() ??
        Number.POSITIVE_INFINITY

      const bTime =
        getTimeValue(b.departureAt)?.getTime() ??
        Number.POSITIVE_INFINITY

      return aTime - bTime
    })
  }, [
    trips,
    companyFilter,
    timeFilter,
    sort,
  ])


  // إعادة ضبط الفلاتر

  const resetFilters = () => {
    setCompanyFilter('all')
    setTimeFilter('all')
    setSort('earliest')
  }


  return (
    <main className="inner-main min-h-[70vh]">

      {/* البانر العلوي */}

      <section className="page-banner relative overflow-hidden border-b border-line bg-gradient-to-br from-surface-alt to-bg pb-10 pt-6">

        <div className="container-x relative z-[1]">

          <nav
            className="breadcrumb mb-5 flex items-center gap-2 text-[11px] font-extrabold text-muted"
            aria-label="مسار التنقل"
          >
            <Link
              to="/"
              className="transition hover:text-primary"
            >
              الرئيسية
            </Link>

            <ArrowLeft size={13} />

            <span className="text-ink">
              نتائج البحث
            </span>
          </nav>


          <div className="banner-heading flex items-center justify-between gap-6">

            <div>
              <span className="eyebrow">
                لنكمل الطريق
              </span>

              <h1 className="page-title mt-3 text-[clamp(29px,3.2vw,42px)] font-black text-heading">
                اختار الرحلة
                {' '}
                <span className="text-primary">
                  اللي بتشبهك.
                </span>
              </h1>

              <p className="mt-1 text-[13px] text-muted">
                قارن بين الشركات والأوقات، واحجز مقعدك بكل سهولة.
              </p>
            </div>


            <div
              className="banner-art hidden rotate-[-7deg] text-primary opacity-35 sm:block"
              aria-hidden="true"
            >
              <Bus size={70} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>


      <section className="results-content container-x pb-20">

        {/* نموذج البحث */}

        <div className="compact-search relative z-[2] -mt-6 rounded-[18px] border border-line bg-surface p-4 shadow-card sm:p-5">
          <SearchForm
            key={searchFormKey}
            compact
          />
        </div>


        {/* اختيار شركة النقل */}

        <section
          className="company-pick-section mt-8"
          aria-labelledby="company-pick-title"
        >

          <div className="pick-heading mb-4 flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <span className="pick-step grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft-teal text-sm font-black text-primary">
                01
              </span>

              <div>
                <h2
                  id="company-pick-title"
                  className="text-[15px] font-black text-heading"
                >
                  اختار شركة النقل
                </h2>

                <p className="text-[11px] text-muted">
                  حدد الشركة اللي بتفضّلها، ومنعرضلك مواعيدها المتاحة.
                </p>
              </div>
            </div>


            <span className="pick-next flex items-center gap-2 text-[11px] font-extrabold text-muted">
              02
              <ArrowLeft size={14} />
              اختار الوقت والمقعد
            </span>
          </div>


          {companiesQuery.isPending ? (

            <div className="rounded-xl border border-line bg-surface px-4 py-5 text-center text-xs text-muted">
              عم نحمل شركات النقل...
            </div>

          ) : companiesQuery.isError ? (

            <div className="rounded-xl border border-line bg-surface px-4 py-4 text-xs text-muted">
              تعذّر تحميل قائمة الشركات. ما زال بإمكانك تصفية الرحلات من القائمة الجانبية.
            </div>

          ) : (

            <div className="company-pick-grid grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">

              <button
                type="button"
                onClick={() => setCompanyFilter('all')}
                aria-pressed={companyFilter === 'all'}
                className={`company-pick flex min-w-0 flex-col items-center gap-2 rounded-[14px] border px-2.5 py-4 text-center transition hover:-translate-y-0.5 hover:border-primary ${
                  companyFilter === 'all'
                    ? 'active border-primary bg-soft-teal shadow-[0_0_0_2px_rgba(16,177,155,.08)]'
                    : 'border-line bg-surface'
                }`}
              >
                <span className="grid h-9 w-9 place-items-center text-primary">
                  <Bus size={24} />
                </span>

                <span className="text-[11px] font-black text-ink">
                  كل الشركات
                </span>

                <small className="text-[10px] text-muted">
                  قارن الخيارات
                </small>
              </button>


              {companies.map(company => (
                <CompanyPickCard
                  key={company.id}
                  company={company}
                  active={
                    companyFilter === String(company.id)
                  }
                  onClick={() => {
                    setCompanyFilter(String(company.id))
                  }}
                />
              ))}

            </div>
          )}
        </section>


        {/* ترويسة النتائج والترتيب */}

        <div className="results-heading my-8 flex flex-wrap items-end justify-between gap-4">

          <div>
            <h2 className="flex flex-wrap items-center gap-3 text-xl font-black text-heading">

              الرحلات المتاحة

              <span className="result-counter inline-flex items-center gap-1.5 rounded-lg bg-soft-teal px-2.5 py-1 text-xs font-extrabold text-primary-deep">
                {filteredTrips.length} رحلة
              </span>
            </h2>


            <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">

              <MapPin size={14} />

              {originName ||
                (originId ? `#${originId}` : 'مدينة الانطلاق')}

              <ArrowLeftRight
                size={13}
                className="text-primary"
              />

              {destinationName ||
                (destinationId ? `#${destinationId}` : 'مدينة الوصول')}

              <span>·</span>

              <CalendarDays size={14} />

              {date
                ? formatDate(date)
                : 'حدد تاريخ الرحلة'}

              <span>·</span>

              <Users size={14} />

              {people}
              {' '}
              {people === 1 ? 'مسافر' : 'مسافرين'}
            </p>
          </div>


          <label className="sort-box flex items-center gap-2.5 text-[11px] font-bold text-muted">

            ترتيب حسب

            <select
              value={sort}
              onChange={event => {
                setSort(event.target.value)
              }}
              className="min-h-[42px] cursor-pointer rounded-[10px] border border-line bg-surface px-3 text-ink outline-none focus:border-primary"
            >
              <option value="earliest">
                وقت الانطلاق
              </option>

              <option value="cheap">
                أقل سعر
              </option>

              <option value="quick">
                أقصر مدة
              </option>
            </select>
          </label>
        </div>


        {/* تخطيط النتائج والفلاتر */}

        <div className="results-layout grid items-start gap-5 lg:grid-cols-[244px_minmax(0,1fr)]">

          {/* القائمة الجانبية */}

          <aside
            className="filters-panel rounded-[17px] border border-line bg-surface p-5 lg:sticky lg:top-[103px]"
            aria-label="تصفية النتائج"
          >

            <div className="filters-top flex items-center justify-between gap-2 border-b border-line pb-4">

              <h3 className="flex items-center gap-2 text-[13px] font-black text-heading">
                <Filter size={18} />
                تصفية النتائج
              </h3>

              <button
                type="button"
                onClick={resetFilters}
                className="quiet-button inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                <RotateCcw size={13} />
                إعادة ضبط
              </button>
            </div>


            {/* فلتر الشركات */}

            <div className="filter-group pt-5">

              <h4 className="mb-3 text-xs font-black text-heading">
                شركة النقل
              </h4>

              <div className="radio-list flex flex-col gap-3">

                <RadioOption
                  name="company-filter"
                  value="all"
                  checked={companyFilter === 'all'}
                  onChange={setCompanyFilter}
                  count={trips.length}
                >
                  كل الشركات
                </RadioOption>


                {companies.map(company => (
                  <RadioOption
                    key={company.id}
                    name="company-filter"
                    value={String(company.id)}
                    checked={
                      companyFilter === String(company.id)
                    }
                    onChange={setCompanyFilter}
                    count={
                      companyCounts.get(String(company.id)) || 0
                    }
                  >
                    {cleanName(company.name)}
                  </RadioOption>
                ))}

              </div>
            </div>


            {/* فلتر وقت الانطلاق */}

            <div className="filter-group mt-5 border-t border-line pt-5">

              <h4 className="mb-3 text-xs font-black text-heading">
                وقت الانطلاق
              </h4>

              <div className="radio-list flex flex-col gap-3">

                {TIME_FILTERS.map(option => (
                  <RadioOption
                    key={option.value}
                    name="time-filter"
                    value={option.value}
                    checked={timeFilter === option.value}
                    onChange={setTimeFilter}
                  >
                    {option.label}
                  </RadioOption>
                ))}

              </div>
            </div>


            {/* ملاحظة الحجز */}

            <div className="filter-info mt-6 flex items-start gap-2.5 rounded-xl bg-soft-teal p-3 text-primary-deep">

              <ShieldCheck
                size={22}
                className="shrink-0"
              />

              <p className="text-[10px] leading-7 text-ink">

                <strong className="text-[11px]">
                  الحجز بشكل واضح
                </strong>

                <br />

                كل تفاصيل الرحلة قدامك قبل التأكيد.
              </p>
            </div>
          </aside>


          {/* قائمة الرحلات */}

          <div className="trip-list flex min-w-0 flex-col gap-4">

            {!validSearch ? (

              <EmptyState
                icon={Search}
                title="بيانات البحث غير مكتملة"
                text="اختار مدينة الانطلاق والوصول وتاريخ الرحلة من نموذج البحث بالأعلى."
                action={
                  <Link
                    to="/"
                    className="btn btn-primary btn-sm"
                  >
                    عرض كل الرحلات
                  </Link>
                }
              />

            ) : tripsQuery.isPending ? (

              <Spinner label="عم نبحث عن الرحلات المتاحة..." />

            ) : tripsQuery.isError ? (

              <ErrorState
                error={tripsQuery.error}
                onRetry={() => tripsQuery.refetch()}
              />

            ) : filteredTrips.length > 0 ? (

              filteredTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  people={people}
                />
              ))

            ) : (

              <EmptyState
                icon={Bus}
                title={
                  trips.length
                    ? 'ما في رحلات مطابقة'
                    : 'ما في رحلات متاحة بهالتاريخ'
                }
                text={
                  trips.length
                    ? 'جرّب تغيّر شركة النقل أو وقت الانطلاق.'
                    : 'جرّب تاريخاً آخر أو غيّر مدينتي الانطلاق والوصول.'
                }
                action={
                  trips.length ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="btn btn-primary btn-sm"
                    >
                      عرض كل الرحلات
                    </button>
                  ) : (
                    <Link
                      to="/"
                      className="btn btn-primary btn-sm"
                    >
                      عرض كل الرحلات
                    </Link>
                  )
                }
              />
            )}

          </div>
        </div>
      </section>
    </main>
  )
}
