
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  Check,
  Clock3,
  Globe2,
  Info,
  MapPin,
  Navigation,
  Pause,
  Play,
  RefreshCw,
  Route,
} from "lucide-react";

// عدّل مسار الاستيراد إذا كان ملف site.js موجوداً في مجلد آخر.
import { getMyBookings, getBooking } from "../../api/site";

const DEMO_BOOKING = {
  id: "SR-24081",
  code: "SR-24081",
  origin: { id: 2, name: "حلب" },
  destination: { id: 1, name: "دمشق" },
  company: { name: "شركة الشام للنقل" },
  departureAt: "07:30",
  arrivalAt: "13:10",
  departure: "07:30",
  arrival: "13:10",
  status: "CONFIRMED",
  demo: true,
};

const getResponseData = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const getCityName = (city) => {
  if (typeof city === "string") return city;
  return city?.name || city?.cityName || "غير محدد";
};

const getDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("ar-SY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeBooking = (booking) => {
  if (!booking) return DEMO_BOOKING;

  const trip = booking.trip || booking.tripDetails || booking;

  const origin =
    trip.origin ||
    booking.origin ||
    trip.originCity ||
    DEMO_BOOKING.origin;

  const destination =
    trip.destination ||
    booking.destination ||
    trip.destinationCity ||
    DEMO_BOOKING.destination;

  const company = trip.company || booking.company || {};

  const departureAt =
    trip.departureAt ||
    booking.departureAt ||
    booking.departure ||
    "";

  const arrivalAt =
    trip.arrivalAt ||
    booking.arrivalAt ||
    booking.arrival ||
    "";

  return {
    ...booking,
    id: booking.id ?? booking.bookingId ?? booking.code ?? DEMO_BOOKING.id,
    code: booking.code || booking.bookingCode || booking.id || DEMO_BOOKING.code,
    origin,
    destination,
    company,
    departureAt,
    arrivalAt,
    departure: getDateTime(departureAt) || booking.departure || "07:30",
    arrival: getDateTime(arrivalAt) || booking.arrival || "13:10",
    demo: false,
  };
};

const getDistance = (booking) => {
  const origin = booking.origin;
  const destination = booking.destination;

  const lat1 = Number(origin?.latitude ?? origin?.lat);
  const lng1 = Number(origin?.longitude ?? origin?.lng);
  const lat2 = Number(destination?.latitude ?? destination?.lat);
  const lng2 = Number(destination?.longitude ?? destination?.lng);

  if ([lat1, lng1, lat2, lng2].every(Number.isFinite)) {
    const toRad = (value) => (value * Math.PI) / 180;

    const distance =
      6371 *
      Math.acos(
        Math.min(
          1,
          Math.max(
            -1,
            Math.sin(toRad(lat1)) * Math.sin(toRad(lat2)) +
              Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.cos(toRad(lng2 - lng1))
          )
        )
      );

    return `~${Math.round(distance)} كم`;
  }

  // القيمة التقريبية المستخدمة في نموذج حلب - دمشق الأصلي.
  if (
    getCityName(origin) === "حلب" &&
    getCityName(destination) === "دمشق"
  ) {
    return "~366 كم";
  }

  return "غير متاحة";
};

const getRemainingTime = (booking, progress) => {
  const departure = new Date(booking.departureAt).getTime();
  const arrival = new Date(booking.arrivalAt).getTime();

  if (
    Number.isFinite(departure) &&
    Number.isFinite(arrival) &&
    arrival > departure
  ) {
    const remainingMinutes = Math.max(
      0,
      Math.round(((arrival - departure) * (1 - progress)) / 60000)
    );

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    if (hours && minutes) return `${hours} س ${minutes} د`;
    if (hours) return `${hours} ساعات تقريباً`;
    return `${minutes} دقيقة تقريباً`;
  }

  return progress >= 1 ? "وصلت الرحلة" : "1 ساعات تقريباً";
};

export default function Tracking() {
  const location = useLocation();

  const passedBooking = location.state?.booking || null;
  const bookingId =
    location.state?.bookingId ||
    new URLSearchParams(location.search).get("bookingId");

  const [booking, setBooking] = useState(
    passedBooking ? normalizeBooking(passedBooking) : null
  );

  const [loading, setLoading] = useState(!passedBooking);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0.48);
  const [playing, setPlaying] = useState(true);

  // تحميل الحجز المختار أو أحدث حجز للمستخدم.
  useEffect(() => {
    let cancelled = false;

    const loadBooking = async () => {
      if (passedBooking) {
        setBooking(normalizeBooking(passedBooking));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        let selected = null;

        if (bookingId) {
          try {
            const response = await getBooking(bookingId);
            selected = response?.data ?? response;
          } catch {
            // نتابع البحث ضمن قائمة حجوزات المستخدم.
          }
        }

        if (!selected) {
          const response = await getMyBookings();
          const bookings = getResponseData(response);

          selected = bookings[0] || null;
        }

        if (!cancelled) {
          if (selected) {
            setBooking(normalizeBooking(selected));
          } else {
            setBooking(DEMO_BOOKING);
          }
        }
      } catch {
        if (!cancelled) {
          setBooking(DEMO_BOOKING);
          setError("تعذر تحميل الحجوزات. يتم عرض الرحلة التجريبية.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBooking();

    return () => {
      cancelled = true;
    };
  }, [passedBooking, bookingId]);

  // محاكاة تقدم الرحلة.
  useEffect(() => {
    if (!playing || loading) return;

    const timer = window.setInterval(() => {
      setProgress((current) =>
        current >= 1 ? 0 : Math.min(1, current + 0.005)
      );
    }, 1500);

    return () => window.clearInterval(timer);
  }, [playing, loading]);

  const originName = getCityName(booking?.origin);
  const destinationName = getCityName(booking?.destination);

  const company = booking?.company || {};

  const companyName = company.name || "شركة النقل";
  const companyLogo =
    typeof company.logoUrl === "string" ? company.logoUrl : "";
  const hasValidCompanyLogo = /^https?:\/\//i.test(companyLogo);
  const [logoFailed, setLogoFailed] = useState("");

  const departureTime = booking?.departure || "07:30";
  const arrivalTime = booking?.arrival || "13:10";

  const distance = useMemo(
    () => getDistance(booking || DEMO_BOOKING),
    [booking]
  );

  const remainingTime = getRemainingTime(
    booking || DEMO_BOOKING,
    progress
  );

  const mapUrl = useMemo(() => {
    const origin = encodeURIComponent(`${originName}, Syria`);
    const destination = encodeURIComponent(`${destinationName}, Syria`);

    return `https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&output=embed`;
  }, [originName, destinationName]);

  const resetTracking = useCallback(() => {
    setProgress(0);
    setPlaying(true);
  }, []);

  if (loading) {
    return (
      <main className="tracking-main">
        <div className="container tracking-loading">
          <span className="tracking-spinner" />
          <p>يتم تحميل بيانات الرحلة...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="tracking-main">
      {/* رأس الصفحة */}
      <section className="container tracking-title">
        <div>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>‹</span>
            <Link to="/my-bookings">حجوزاتي</Link>
            <span>‹</span>
            <span>تتبع الرحلة</span>
          </div>

          <h1>
            رحلتك قدام عيونك

            <span className="tracking-live">
              <Navigation size={15} />
              محاكاة تفاعلية
            </span>
          </h1>

          <p>
            خط السير على الخريطة مع محطات ووقت وصول توضيحي.
          </p>
        </div>

        <div className="tracking-actions">
          <Link to="/my-bookings" className="btn btn-outline">
            <ArrowRight size={17} />
            كل الحجوزات
          </Link>
        </div>
      </section>

      {error && (
        <div className="container tracking-error">
          <Info size={16} />
          {error}
        </div>
      )}

      {/* تفاصيل الرحلة والخريطة */}
      <section className="container tracking-layout">

        {/* بطاقة تفاصيل التتبع */}
        <aside className="tracking-sidebar">

          <div className="tracking-status">
            <span className="status-dot" />
            الرحلة قيد العرض التجريبي

            <small dir="ltr">
              {booking?.code || booking?.id}
            </small>
          </div>

          {/* المسار */}
          <div className="track-route-heading">
            <div>
              <small>من</small>
              <h2>{originName}</h2>
            </div>

            <span>
              <ArrowLeft size={21} />
            </span>

            <div>
              <small>إلى</small>
              <h2>{destinationName}</h2>
            </div>
          </div>

          {/* شركة النقل */}
          <div className="track-company">
            <div className="company-logo tracking-company-logo w-11 h-11 rounded-2xl bg-[#d9f3ee] text-[#0b9b8a] font-black text-lg flex items-center justify-center shrink-0">
              {hasValidCompanyLogo && logoFailed !== companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  onError={() => setLogoFailed(companyLogo)}
                />
              ) : (
                companyName.charAt(0)
              )}
            </div>

            <div>
              <b className="text-base font-bold text-slate-900 truncate max-w-[180px]">
                {companyName}
              </b>
              <small>موعد الانطلاق {departureTime}</small>
            </div>
          </div>

          <div className="track-divider" />

          {/* تقدم الرحلة */}
          <div className="track-progress-head">
            <h3>تقدّم الرحلة</h3>

            <strong>{Math.round(progress * 100)}%</strong>
          </div>

          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* الخط الزمني */}
          <div className="track-timeline">

            <div className="timeline-stop">
              <span className="stop-indicator completed">
                <Check size={13} />
              </span>

              <div>
                <b>{originName}</b>
                <small>محطة الانطلاق</small>
              </div>

              <time>{departureTime}</time>
            </div>

            <div className="timeline-stop active">
              <span className="stop-indicator">
                <Bus size={14} />
              </span>

              <div>
                <b>على الطريق</b>
                <small>الحافلة تتحرك نحو الوجهة</small>
              </div>

              <time>الآن*</time>
            </div>

            <div className="timeline-stop">
              <span className="stop-indicator last">
                <MapPin size={13} />
              </span>

              <div>
                <b>{destinationName}</b>
                <small>محطة الوصول</small>
              </div>

              <time>{arrivalTime}</time>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="track-quick-stats">
            <div>
              <span>
                <Route size={16} />
                المسافة الكلية
              </span>

              <b className="tabular-nums">{distance}</b>
            </div>

            <div>
              <span>
                <Clock3 size={16} />
                المتبقي التقديري
              </span>

              <b className="tabular-nums">{remainingTime}</b>
            </div>
          </div>

          {/* التحكم بالمحاكاة */}
          <div className="track-controls">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? (
                <>
                  <Pause size={17} />
                  إيقاف الحركة
                </>
              ) : (
                <>
                  <Play size={17} />
                  متابعة الحركة
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline small-square"
              onClick={resetTracking}
              aria-label="إعادة المحاكاة"
              title="إعادة المحاكاة"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <p className="tracking-warning">
            <Info size={17} />

            هذه محاكاة تعليمية فوق خريطة جغرافية حقيقية،
            وليست تتبع GPS. خط الربط بين المدن تقريبي؛
            افتح Google Maps لمعرفة الطرق الفعلية.
          </p>
        </aside>

        {/* بطاقة الخريطة */}
        <div className="tracking-map-panel">

          <div className="map-toolbar">
            <div>
              <span className="map-green-dot" />
              خريطة تفاعلية • OpenFreeMap
            </div>

            <div className="map-toggle">
              <span>
                <Globe2 size={16} />
                عرض الخريطة
              </span>
            </div>
          </div>

          <div
            className="real-tracking-map"
            role="region"
            aria-label={`خريطة من ${originName} إلى ${destinationName}`}
          >
            <iframe
              title={`المسار من ${originName} إلى ${destinationName}`}
              src={mapUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="map-bottom-overlay">
            <span>
              <MapPin size={17} />
              {originName} ← {destinationName}
            </span>

            <span className="map-caption">
              المسار تقريبي · افتح Google Maps للاتجاهات الفعلية
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
