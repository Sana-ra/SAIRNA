
import { Fragment, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bus,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SearchForm from '../../components/SearchForm'
import { getCities } from '../../api/site'

const destinations = [
  {
    id: 'damascus',
    name: 'دمشق',
    description: 'مدينة الياسمين',
    image: '/assets/damascus.jpg',
    fallbackOriginId: '2',
  },
  {
    id: 'aleppo',
    name: 'حلب',
    description: 'عاصمة الشهباء',
    image: '/assets/aleppo.jpg',
    fallbackOriginId: '1',
  },
  {
    id: 'latakia',
    name: 'اللاذقية',
    description: 'نسمة من البحر',
    image: '/assets/latakia.jpg',
    fallbackOriginId: '2',
  },
  {
    id: 'homs',
    name: 'حمص',
    description: 'قلب سوريا',
    image: '/assets/homs.jpg',
    fallbackOriginId: '2',
  },
]

const metrics = [
  { value: '14', label: 'محافظة سورية' },
  { value: '4', label: 'شركات نقل تجريبية' },
  { value: '+30', label: 'خيار رحلة باليوم' },
  { value: '24/7', label: 'سهولة الوصول للموقع' },
]

const processSteps = [
  {
    number: '01',
    icon: Search,
    title: 'اختار وجهتك',
    description: 'حدّد من وين لوين وتاريخ الرحلة المناسب إلك.',
  },
  {
    number: '02',
    icon: Bus,
    title: 'لاقي رحلتك',
    description: 'قارن الشركات والمواعيد والأسعار واختر الأفضل.',
  },
  {
    number: '03',
    icon: Ticket,
    title: 'احجز مقعدك',
    description: 'اختار مقعدك وأكّد الحجز، وتذكرتك بتصير جاهزة.',
  },
]

function normalizeCityName(name = '') {
  return name.trim().replace(/[أإآ]/g, 'ا')
}

export default function Home() {
  const navigate = useNavigate()

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
    staleTime: Infinity,
  })

  const citiesByName = useMemo(() => {
    return new Map(
      cities.map(city => [normalizeCityName(city.name), city])
    )
  }, [cities])

  const openDestination = destination => {
    const city = citiesByName.get(
      normalizeCityName(destination.name)
    )

    if (!city?.id) {
      toast.error(
        `تعذّر العثور على محافظة ${destination.name}. حاول مرة أخرى بعد تحميل البيانات.`
      )
      return
    }

    const originId =
      String(destination.fallbackOriginId) === String(city.id)
        ? String(city.id) === '2'
          ? '1'
          : '2'
        : destination.fallbackOriginId

    navigate(
      `/trips?${new URLSearchParams({
        originId,
        destinationId: String(city.id),
      }).toString()}`
    )
  }

  return (
    <main>
      {/* Hero */}
      <section className="hero-section relative overflow-hidden bg-bg py-14 md:py-20">

        <div className="container container-x mx-auto">

          <div className="hero-grid grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-9">

            {/* Hero copy */}
            <div className="hero-copy relative z-10 order-2 lg:order-1">

              <span className="eyebrow">
                <Sparkles size={14} className="text-primary" />
                أهلاً فيك بسيرنا
              </span>

              <h1 className="mt-5 mb-3 text-[clamp(44px,5.15vw,79px)] leading-[1.33] font-black tracking-[-2.4px]">
                المحطة الجاية؟
                <br />
                <span className="gradient-text bg-linear-to-l from-[#078a91] to-[#15ba9d] bg-clip-text text-transparent">
                  على كيفك.
                </span>
              </h1>

              <p className="mb-5 max-w-xl text-base leading-9 text-muted">
                من حلب لدمشق، ومن الساحل للجزيرة. لاقي الرحلة
                اللي بتناسبك، اختار مقعدك، وخلّي الطريق علينا.
              </p>

              <div className="hero-points flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-extrabold">

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={17} className="text-primary" />
                  حجز سهل
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={17} className="text-primary" />
                  خيارات متنوعة
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={17} className="text-primary" />
                  متابعة رحلتك
                </span>

              </div>

              {/* Social proof */}
              <div className="hero-social-proof mt-8 flex flex-wrap items-center gap-4 sm:mt-10">

                <div
                  className="proof-avatars flex items-center"
                  aria-label="مجموعة من المسافرين"
                >
                  {['م', 'س', 'ع', 'ر'].map((initial, index) => (
                    <span
                      key={initial}
                      className={`-ms-2 grid size-9 place-items-center rounded-full border-2 border-white text-xs font-black text-white shadow-sm first:ms-0 ${
                        [
                          'bg-[#0d7f83]',
                          'bg-[#e0a35a]',
                          'bg-[#477d9a]',
                          'bg-[#b87983]',
                        ][index]
                      }`}
                    >
                      {initial}
                    </span>
                  ))}
                </div>

                <div>

                  <div className="proof-stars flex items-center gap-0.5 text-[#f7b843]">

                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill="currentColor"
                        strokeWidth={1.5}
                      />
                    ))}

                    <b className="me-1.5 text-sm font-black text-ink">
                      4.9/5
                    </b>

                  </div>

                  <small className="mt-0.5 block text-[11px] font-bold text-muted">
                    تجربة سفر بتستاهل تجرّبها
                  </small>

                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hero-visual relative order-1 mx-auto w-full max-w-[570px] lg:order-2">

              <div className="hero-image-wrap relative z-10 min-h-[270px] overflow-visible sm:min-h-[350px]">

                <img
                  className="hero-photo -rotate-2 block aspect-[1.45] h-full min-h-[270px] w-full rounded-[30px] object-cover object-center shadow-[0_30px_70px_rgba(10,62,70,0.15)] sm:min-h-[350px]"
                  src="/assets/hero.jpg"
                  alt="حافلة سيرنا على طريق بين المدن السورية"
                  fetchPriority="high"
                  decoding="async"
                />

                {/* Top floating stat */}
                <div className="floating-stat stat-top absolute z-20 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-[0_12px_35px_rgba(12,49,58,.16)] sm:px-5">

                  <span className="grid size-10 place-items-center rounded-xl bg-soft-teal text-primary-deep">
                    <MapPin size={19} />
                  </span>

                  <div>
                    <b className="block text-sm font-black text-[#123b4b]">
                      14 محافظة
                    </b>
                    <small className="block text-[10px] font-bold text-muted">
                      وجهات بتجمعنا
                    </small>
                  </div>

                </div>

                {/* Bottom floating stat */}
                <div className="floating-stat stat-bottom absolute z-20 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-[0_12px_35px_rgba(12,49,58,.16)] sm:px-5">

                  <span className="floating-circle grid size-10 place-items-center rounded-full bg-[#e8f7f2] text-primary-deep">
                    <ShieldCheck size={20} />
                  </span>

                  <div>
                    <b className="block text-sm font-black text-[#123b4b]">
                      سافر براحة
                    </b>
                    <small className="block text-[10px] font-bold text-muted">
                      من أول حجز لآخر محطة
                    </small>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Search form */}
          <div className="search-shell card relative z-20 mt-16 rounded-[22px] p-5 shadow-card sm:p-6">

            <div className="search-shell-heading mb-5 flex flex-wrap items-center justify-between gap-3">

              <div className="flex flex-wrap items-center gap-3">

                <span className="search-small-dot size-2.5 rounded-full bg-primary shadow-[0_0_0_5px_var(--soft-teal)]" />

                <strong className="text-[15px] font-black">
                  وين رحلتك الجاية؟
                </strong>

                <span className="text-[11px] text-muted">
                  اختار وجهتك وباقي التفاصيل علينا
                </span>

              </div>

              <span className="steps-tag inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary-deep">
                <Sparkles size={15} />
                الحجز بـ 3 خطوات
              </span>

            </div>

            <SearchForm />

          </div>

        </div>
      </section>

      {/* Metrics strip */}
      <section className="metrics-strip border-y border-line bg-surface">

        <div className="container container-x metrics-inner mx-auto grid min-h-[107px] grid-cols-2 items-center gap-x-3 gap-y-5 py-5 sm:flex sm:justify-around sm:gap-3">

          {metrics.map((metric, index) => (
            <Fragment key={metric.value}>

              <div className="flex min-w-0 flex-1 flex-col items-center text-center">

                <strong className="text-[clamp(20px,3vw,27px)] leading-[1.4] font-black text-heading dark:text-ink">
                  {metric.value}
                </strong>

                <span className="text-[10px] font-bold text-muted sm:text-[11px]">
                  {metric.label}
                </span>

              </div>

              {index < metrics.length - 1 && (
                <span
                  className="metrics-divider hidden h-9 w-px shrink-0 bg-line sm:block"
                  aria-hidden="true"
                />
              )}

            </Fragment>
          ))}

        </div>
      </section>

      {/* Destinations */}
      <section className="section destinations bg-bg py-16 sm:py-20">

        <div className="container container-x mx-auto">

          <div className="section-title-row mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <span className="eyebrow">
                اكتشف سوريا
              </span>

              <h2 className="mt-3 mb-1 text-[clamp(25px,3vw,36px)] font-black tracking-[-.6px]">
                على وين حابب <span className="text-primary">تسافر؟</span>
              </h2>

              <p className="text-xs text-muted">
                وجهات مختلفة، ونفس الشعور الحلو لما تكون بالطريق.
              </p>

            </div>

            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="text-link inline-flex items-center gap-2.5 text-xs font-black whitespace-nowrap text-primary-deep transition hover:gap-3.5"
            >
              استكشف الرحلات
              <ArrowLeft size={18} />
            </button>

          </div>

          <div className="destination-grid grid grid-cols-2 gap-3.5 sm:gap-4.5 lg:grid-cols-4 lg:gap-[18px]">

            {destinations.map((destination, index) => (
              <button
                key={destination.id}
                type="button"
                className={`destination-card destination-${index} group relative block aspect-[.98] overflow-hidden rounded-2xl border-0 bg-[#23586a] p-0 text-right shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-card-md sm:aspect-[1.1] lg:aspect-[.87]`}
                onClick={() => openDestination(destination)}
                aria-label={`استكشف الرحلات إلى ${destination.name}`}
              >

                <img
                  src={destination.image}
                  alt={`صورة من ${destination.name} في سوريا`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <span className="destination-overlay absolute inset-0 flex items-end justify-between bg-linear-to-t from-[#072330]/90 via-[#072330]/25 to-transparent p-3.5 text-white sm:p-5">

                  <span className="flex flex-col">

                    <strong className="text-lg font-black sm:text-[21px]">
                      {destination.name}
                    </strong>

                    <small className="text-[10px] opacity-85 sm:text-[11px]">
                      {destination.description}
                    </small>

                  </span>

                  <span className="destination-arrow grid size-8 shrink-0 place-items-center rounded-full border border-white/40 bg-white/20 transition group-hover:-translate-x-1 group-hover:bg-primary sm:size-[39px]">
                    <ArrowLeft size={18} />
                  </span>

                </span>

              </button>
            ))}

          </div>

        </div>
      </section>

      {/* ==================================
          1. Booking Process Section
         ================================== */}
      <section className="section process-section">

        <div className="container container-x mx-auto">

          <div className="section-centered">

            <span className="eyebrow">
              <Star size={14} />
              السفر صار أبسط
            </span>

            <h2>
              3 خطوات... <span>وتكون بالطريق</span>
            </h2>

            <p>
              ما في داعي للتعقيد. كل شي مرتب بواجهة وحدة.
            </p>

          </div>

          <div className="process-grid">

            {processSteps.map(step => {
              const StepIcon = step.icon

              return (
                <div className="process-card" key={step.number}>

                  <span className="process-number">
                    {step.number}
                  </span>

                  <div className="process-icon">
                    <StepIcon size={27} strokeWidth={1.8} />
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.description}</p>

                </div>
              )
            })}

          </div>

        </div>
      </section>

      {/* ==================================
          2. Trip Tracking Feature Section
         ================================== */}
      <section className="section tracking-feature-section">

        <div className="container container-x mx-auto">

          <div className="split-feature">

            {/* Right feature content */}
            <div className="feature-content">

              <span className="eyebrow">
                وين وصلت الرحلة؟
              </span>

              <h2>
                الطريق قدامك.
                <br />
                <span>لحظة بلحظة؟</span>
              </h2>

              <p>
                بصفحة التتبّع بتشوف خط سير الرحلة ومحطاتها
                وحالتها ضمن نموذج تفاعلي سهل وواضح.
              </p>

              <div className="feature-check">
                <CheckCircle2 size={19} />
                <span>عرض المسار على الخريطة</span>
              </div>

              <div className="feature-check">
                <CheckCircle2 size={19} />
                <span>وقت وصول تقديري ومحطات الطريق</span>
              </div>

              <div className="feature-actions">

                <Link className="btn btn-primary" to="/tracking">
                  جرّب تتبّع رحلة
                  <ArrowLeft size={18} />
                </Link>

              </div>

              <small className="demo-note">
                * الخريطة وحركة الحافلة في هذا النموذج توضيحية وليست GPS مباشر.
              </small>

            </div>

            {/* Left map preview */}
            <div className="feature-map-preview">

              <div className="map-preview-top">

                <div className="map-preview-status">
                  <span className="live-indicator" />
                  <span>معاينة مسار رحلة</span>
                </div>

                <b>حلب ← دمشق</b>

              </div>

              <div className="mini-map-svg">

                <iframe
                  title="خريطة مسار الرحلة من حلب إلى دمشق عبر حمص"
                  src="https://www.google.com/maps?q=Aleppo%20Syria%20to%20Homs%20Syria%20to%20Damascus%20Syria&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                <a
                  className="map-open-link"
                  href="https://www.google.com/maps/dir/?api=1&origin=Aleppo,+Syria&destination=Damascus,+Syria&waypoints=Homs,+Syria"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  فتح المسار في Google Maps ↗
                </a>

              </div>

              <div className="map-preview-footer">

                <span>
                  <MapPin size={16} />
                  حلب
                </span>

                <div className="preview-line">
                  <span />
                </div>

                <span>
                  <MapPin size={16} />
                  دمشق
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================
          3. Bottom CTA Section
         ================================== */}
      <section className="cta-wrap">

        <div className="container container-x mx-auto">

          <div className="cta-banner">

            <div className="cta-content">

              <span className="eyebrow">
                جاهز تغير جو؟
              </span>

              <h2>
                الطريق الجاي بيناديك.
              </h2>

              <p>
                دوّر على رحلة، واحجز أول مقعد إلك.
              </p>

            </div>

            <Link className="btn btn-white" to="/trips">
              يلا نلاقي رحلة
              <ArrowLeft size={18} />
            </Link>

            <div className="cta-decor d1" />
            <div className="cta-decor d2" />

          </div>

        </div>
      </section>

    </main>
  )
}
