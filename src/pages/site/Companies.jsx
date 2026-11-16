
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  Bus,
  ArrowLeft,
  Snowflake,
  Wifi,
  Plug,
  MapPin,
  Clock3,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react'

import { getCompanies } from '../../api/site'

// البيانات الوصفية للشركات.
// هذه البيانات تجميلية مأخوذة من التصميم الأصلي وليست حقولاً مؤكدة من Swagger.
const COMPANY_PROFILES = [
  {
    keywords: ['sham', 'الشام'],
    rating: '4.9',
    badge: 'الأعلى تقييماً',
    description: 'رحلات منتظمة بين المحافظات وتجربة سفر مريحة.',
    destinations: '+12',
    schedule: 'يومياً',
    features: ['مكيّف', 'Wi-Fi', 'شحن USB'],
    color: '#109d9c',
    bg: '#e7f9f6',
  },
  {
    keywords: ['furat', 'الفرات'],
    rating: '4.8',
    badge: 'الأكثر حجزاً',
    description: 'أسطول حديث ومواعيد متنوعة على مدار الأسبوع.',
    destinations: '+10',
    schedule: 'يومياً',
    features: ['مكيّف', 'Wi-Fi', 'شحن USB'],
    color: '#e69a46',
    bg: '#fff3df',
  },
  {
    keywords: ['nawras', 'النورس'],
    rating: '4.7',
    badge: 'سعر مميّز',
    description: 'رحلات يومية وخيارات مناسبة لكل المسافرين.',
    destinations: '+8',
    schedule: 'يومياً',
    features: ['مكيّف', 'Wi-Fi'],
    color: '#5085e6',
    bg: '#e9efff',
  },
  {
    keywords: ['ittihad', 'الاتحاد'],
    rating: '4.6',
    badge: 'مواعيد مرنة',
    description: 'ربط المدن السورية بمواعيد مرنة وسهلة الحجز.',
    destinations: '+9',
    schedule: 'يومياً',
    features: ['مكيّف', 'شحن USB'],
    color: '#9969ce',
    bg: '#f1eafe',
  },
]

const DEFAULT_COLORS = [
  { color: '#109d9c', bg: '#e7f9f6' },
  { color: '#e69a46', bg: '#fff3df' },
  { color: '#5085e6', bg: '#e9efff' },
  { color: '#9969ce', bg: '#f1eafe' },
  { color: '#d66b87', bg: '#fff0f4' },
]

// استخراج الاسم بطريقة مرنة
function getCompanyName(company) {
  return (
    company?.name ||
    company?.companyName ||
    company?.title ||
    'شركة نقل'
  )
}

// إنشاء البيانات الوصفية للشركة
function companyMeta(company) {
  const name = getCompanyName(company)

  const normalizedName = String(name).toLowerCase()
  const normalizedId = String(company?.id ?? '').toLowerCase()

  const profile = COMPANY_PROFILES.find(item =>
    item.keywords.some(keyword =>
      normalizedName.includes(keyword) ||
      normalizedId.includes(keyword)
    )
  )

  const colorIndex = Math.abs(
    String(company?.id ?? name)
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % DEFAULT_COLORS.length

  const fallback = DEFAULT_COLORS[colorIndex]

  return {
    rating: company?.rating ?? company?.averageRating ?? profile?.rating ?? '4.5',

    badge:
      company?.badge ||
      company?.tag ||
      profile?.badge ||
      (company?.isActive === false ? 'غير نشطة' : 'شركة نقل'),

    description:
      company?.description ||
      company?.about ||
      company?.bio ||
      profile?.description ||
      'اكتشف رحلات الشركة وخيارات النقل المتاحة بين المحافظات السورية.',

    destinations:
      company?.destinationsCount ??
      company?.destinationCount ??
      company?.stats?.destinations ??
      profile?.destinations ??
      '+0',

    schedule:
      company?.schedule ||
      company?.availability ||
      profile?.schedule ||
      'حسب الرحلات المتاحة',

    features: Array.isArray(company?.features) && company.features.length
      ? company.features
      : profile?.features || ['مكيّف', 'Wi-Fi', 'شحن USB'],

    color:
      company?.color ||
      profile?.color ||
      fallback.color,

    bg:
      company?.bg ||
      profile?.bg ||
      fallback.bg,
  }
}

// استخراج مصفوفة الشركات من مختلف أشكال استجابة Axios
function extractCompanies(response) {
  const root = response?.data ?? response

  if (Array.isArray(root)) {
    return root
  }

  if (!root || typeof root !== 'object') {
    return []
  }

  const candidates = [
    root.data,
    root.companies,
    root.items,
    root.data?.companies,
    root.data?.items,
    root.data?.data,
    root.data?.data?.companies,
    root.data?.data?.items,
  ]

  return candidates.find(Array.isArray) || []
}

// عرض شعار الشركة أو الحرف الأول
function CompanyLogo({ company, meta }) {
  const name = getCompanyName(company)

  const logo =
    company?.logoUrl ||
    company?.logo ||
    company?.imageUrl ||
    company?.image ||
    company?.photo

  if (logo) {
    return (
      <div className="company-logo-wrap">
        <img
          src={logo}
          alt={`شعار ${name}`}
          className="company-logo-image"
          onError={event => {
            event.currentTarget.style.display = 'none'
            event.currentTarget.nextElementSibling?.classList.remove(
              'company-logo-fallback-hidden'
            )
          }}
        />

        <span
          className="company-logo company-logo-fallback company-logo-fallback-hidden"
          style={{
            '--logo-color': meta.color,
            '--logo-bg': meta.bg,
          }}
        >
          {name.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <span
      className="company-logo"
      style={{
        '--logo-color': meta.color,
        '--logo-bg': meta.bg,
      }}
    >
      {name.charAt(0)}
    </span>
  )
}

// شارات الخدمات
function ServiceBadges({ features }) {
  const serviceIcons = {
    'مكيّف': Snowflake,
    'Wi-Fi': Wifi,
    'شحن USB': Plug,
  }

  return (
    <div className="company-amenities">
      {features.map((feature, index) => {
        const Icon = serviceIcons[feature]

        return (
          <span className="service-pill" key={`${feature}-${index}`}>
            {Icon && <Icon size={13} />}
            {feature}
          </span>
        )
      })}
    </div>
  )
}

// بطاقة الشركة
function CompanyCard({ company }) {
  const meta = companyMeta(company)
  const name = getCompanyName(company)

  return (
    <article className="company-card">
      <div className="company-card-head">
        <CompanyLogo company={company} meta={meta} />

        <span className="tag teal-tag">
          <Star size={14} fill="currentColor" />
          {meta.rating} / 5
        </span>
      </div>

      <div className="company-card-title">
        <h2>{name}</h2>

        <span className="company-card-badge">
          <ShieldCheck size={13} />
          {meta.badge}
        </span>
      </div>

      <p className="company-description">
        {meta.description}
      </p>

      <ServiceBadges features={meta.features} />

      <div className="company-meta">
        <div>
          <b>{meta.destinations}</b>
          <small>وجهة تجريبية</small>
        </div>

        <div>
          <b>{meta.schedule}</b>
          <small>مواعيد متاحة</small>
        </div>
      </div>

      <Link
        to={`/trips?companyId=${encodeURIComponent(company.id)}`}
        className="btn btn-outline full company-trips-button"
      >
        شوف الرحلات
        <ArrowLeft size={17} />
      </Link>
    </article>
  )
}

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCompanies() {
      try {
        setLoading(true)
        setError(null)

        const response = await getCompanies()

        if (cancelled) return

        setData(response)

        const companiesArray = extractCompanies(response)

        setCompanies(companiesArray)
      } catch (err) {
        if (cancelled) return

        console.error('Failed to fetch companies:', err)

        setError(err)
        setData(null)
        setCompanies([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchCompanies()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="inner-main companies-page">
      {/* Page Banner */}
      <section className="page-banner">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <ArrowLeft size={14} />
            <span>شركات النقل</span>
          </div>

          <span className="eyebrow">
            <Bus size={14} />
            شركاء الطريق
          </span>

          <h1 className="page-title">
            شركات بتوصلك <span>لوين ما بدك.</span>
          </h1>

          <p>
            تعرّف على شركات النقل الموجودة واختار الأنسب إلك.
          </p>
        </div>
      </section>

      {/* Companies Content */}
      <section className="container section companies-section">
        {loading ? (
          <div className="companies-loading">
            <RefreshCw size={30} className="companies-spinner" />
            <h3>عم نحضّر شركات النقل...</h3>
            <p>يرجى الانتظار قليلاً.</p>
          </div>
        ) : companies.length > 0 ? (
          <>
          

            <div className="companies-grid">
              {companies.map((company, index) => (
                <CompanyCard
                  key={company.id ?? index}
                  company={company}
                />
              ))}
            </div>

            <p className="disclaimer-line">
              قد تختلف الخدمات والتقييمات حسب البيانات المتوفرة لكل شركة.
            </p>
          </>
        ) : (
          <div className="companies-empty-state">
            <div className="companies-empty-icon">
              <Bus size={35} />
            </div>

            <h3>لا توجد شركات نقل حالياً</h3>

            <p>
              لم نتمكن من العثور على شركات نقل لعرضها حالياً.
              يمكنك إعادة المحاولة لاحقاً.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
              إعادة المحاولة
            </button>

            <div className="companies-debug">
              <strong>رد السيرفر للتشخيص</strong>
              <pre dir="ltr">
                {JSON.stringify(
                  {
                    data,
                    error: error?.message,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
