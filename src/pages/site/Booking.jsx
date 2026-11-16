
import { useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bus,
  Armchair,
  Ticket,
  ShieldCheck,
  UserRound,
  Phone,
  Wallet,
  CreditCard,
  Info,
  Check,
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import {
  getTrip,
  getTripSeats,
  createBooking,
} from "../../api/site";
// استخراج بيانات Axios بشكل مرن
const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? response;
};
// تنسيق السعر
const formatPrice = (price) => {
  return `${Number(price || 0).toLocaleString("en-US")} ل.س`;
};
// تنسيق التاريخ
const formatDate = (date) => {
  if (!date) return "غير محدد";
  return new Date(date).toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// تنسيق الوقت
const formatTime = (date) => {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
// التحقق من رقم الهاتف
const isValidPhone = (phone) => {
  return /^[+\d\s-]{9,18}$/.test(phone.trim());
};
// تحويل قيمة إلى مصفوفة
const toArray = (value) => {
  return Array.isArray(value) ? value : [];
};
export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeTripId } = useParams();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  // بيانات الرابط
  const tripId = routeTripId || searchParams.get("tripId");
  const people = Number(
    searchParams.get("people") || location.state?.people || 1
  );
  // حالات الصفحة
  const [bookingStep, setBookingStep] = useState("seats");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("office");
  const [validationError, setValidationError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  // التحقق من معاملات الرابط
  const validParams =
    Boolean(tripId) &&
    Number.isInteger(people) &&
    people >= 1 &&
    people <= 4;
  // ==========================================
  // 1. جلب تفاصيل الرحلة
  // ==========================================
  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
    error: tripErrorMessage,
  } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const response = await getTrip(tripId);
      return getResponseData(response);
    },
    enabled: validParams,
    staleTime: 60 * 1000,
  });
  // ==========================================
  // 2. جلب المقاعد المتاحة والمحجوزة
  // ==========================================
  const {
    data: seatsData,
    isLoading: seatsLoading,
    isError: seatsError,
    refetch: refetchSeats,
  } = useQuery({
    queryKey: ["trip-seats", tripId],
    queryFn: async () => {
      const response = await getTripSeats(tripId);
      return getResponseData(response);
    },
    enabled: validParams,
    staleTime: 0,
  });
  // ==========================================
  // 3. معالجة بيانات المقاعد
  // ==========================================
  const totalSeats = Number(
    seatsData?.totalSeats ?? trip?.totalSeats ?? 44
  );
  const occupiedSeats = useMemo(() => {
    return new Set(
      toArray(seatsData?.occupiedSeats).map(Number)
    );
  }, [seatsData]);
  // ==========================================
  // 4. معالجة بيانات الرحلة
  // ==========================================
  const company = trip?.company || {};
  const origin = trip?.origin || {};
  const destination = trip?.destination || {};
  const departureAt = trip?.departureAt;
  const arrivalAt = trip?.arrivalAt;
  const price = Number(trip?.price || 0);
  const totalPrice = price * people;
  // ==========================================
  // 5. اختيار وإلغاء اختيار المقاعد
  // ==========================================
  const handleSeatSelection = (seatNumber) => {
    setValidationError("");
    if (occupiedSeats.has(seatNumber)) return;
    setSelectedSeats((previous) => {
      if (previous.includes(seatNumber)) {
        return previous.filter((seat) => seat !== seatNumber);
      }
      if (previous.length >= people) {
        setValidationError(
          `يمكنك اختيار ${people} مقعد فقط.`
        );
        return previous;
      }
      return [...previous, seatNumber].sort((a, b) => a - b);
    });
  };
  // ==========================================
  // 6. بيانات المسافرين
  // ==========================================
  const handlePassengerChange = (index, field, value) => {
    setPassengers((previous) => {
      const updated = [...previous];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
    setValidationError("");
  };
  // ==========================================
  // 7. التحقق من بيانات المسافرين
  // ==========================================
  const validatePassengers = () => {
    if (selectedSeats.length !== people) {
      setValidationError(
        `يجب اختيار ${people} مقعد قبل المتابعة.`
      );
      return false;
    }
    for (let i = 0; i < people; i++) {
      const passenger = passengers[i];
      if (!passenger?.name?.trim()) {
        setValidationError(
          `يرجى إدخال اسم المسافر ${i + 1}.`
        );
        return false;
      }
      if (passenger.name.trim().length < 3) {
        setValidationError(
          `اسم المسافر ${i + 1} يجب أن يتكون من 3 أحرف على الأقل.`
        );
        return false;
      }
      if (!passenger.phone?.trim()) {
        setValidationError(
          `يرجى إدخال رقم هاتف المسافر ${i + 1}.`
        );
        return false;
      }
      if (!isValidPhone(passenger.phone)) {
        setValidationError(
          `رقم هاتف المسافر ${i + 1} غير صحيح.`
        );
        return false;
      }
    }
    return true;
  };
  // ==========================================
  // 8. الانتقال بين المراحل
  // ==========================================
  const handleNextStep = () => {
    setValidationError("");
    if (bookingStep === "seats") {
      if (selectedSeats.length !== people) {
        setValidationError(
          `يجب اختيار ${people} مقعد للمتابعة.`
        );
        return;
      }
      setPassengers((previous) => {
        return Array.from({ length: people }, (_, index) => ({
          name: previous[index]?.name || "",
          phone: previous[index]?.phone || "",
        }));
      });
      setBookingStep("passengers");
      return;
    }
    if (bookingStep === "passengers") {
      if (!validatePassengers()) return;
      setBookingStep("review");
      return;
    }
    if (bookingStep === "review") {
      handleConfirmBooking();
    }
  };
  const handlePreviousStep = () => {
    setValidationError("");
    if (bookingStep === "review") {
      setBookingStep("passengers");
    } else if (bookingStep === "passengers") {
      setBookingStep("seats");
    }
  };
  // ==========================================
  // 9. إنشاء الحجز عبر الباك إند
  // ==========================================
  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      return await createBooking(bookingData);
    },
    onSuccess: async (response) => {
      const booking = getResponseData(response);
      setBookingResult(booking);
      setBookingSuccess(true);
      // تحديث بيانات حجوزات المستخدم والمقاعد دون مغادرة صفحة النجاح
      await queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["trip-seats", tripId],
      });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "حدث خطأ أثناء إنشاء الحجز. حاول مرة أخرى.";
      setValidationError(
        Array.isArray(message) ? message.join("، ") : message
      );
    },
  });
  // ==========================================
  // 10. تأكيد الحجز
  // ==========================================
  const handleConfirmBooking = async () => {
    if (bookingMutation.isPending) return;
    if (!validatePassengers()) {
      setBookingStep("passengers");
      return;
    }
    // إعادة التحقق من المقاعد قبل إرسال الطلب
    const hasUnavailableSeat = selectedSeats.some((seat) =>
      occupiedSeats.has(seat)
    );
    if (hasUnavailableSeat) {
      setValidationError(
        "أحد المقاعد التي اخترتها أصبح محجوزاً. يرجى تحديث المقاعد واختيار مقعد آخر."
      );
      refetchSeats();
      setBookingStep("seats");
      return;
    }
const freshResponse = await refetchSeats();
const latestSeats = freshResponse.data;
const latestOccupied = new Set(
  toArray(latestSeats?.occupiedSeats).map(Number)
);
const unavailable = selectedSeats.some((seat) =>
  latestOccupied.has(seat)
);
if (unavailable) {
  setValidationError(
    "أحد المقاعد أصبح محجوزاً. اختر مقاعد أخرى."
  );
  setSelectedSeats((previous) =>
    previous.filter((seat) => !latestOccupied.has(seat))
  );
  setBookingStep("seats");
  return;
}
    // صيغة الطلب المطابقة تماماً لـ site.js
    const bookingData = {
      tripId: Number(tripId),
      seats: selectedSeats.map((seatNumber, index) => ({
        seatNumber,
        passengerName: passengers[index].name.trim(),
        passengerPhone: passengers[index].phone.trim(),
      })),
    };
    bookingMutation.mutate(bookingData);
  };
  // ==========================================
  // شاشة نجاح الحجز
  // ==========================================
 // ==========================================
// شاشة نجاح الحجز
// ==========================================
if (bookingSuccess) {
  const bookingId =
    bookingResult?.id ??
    bookingResult?.booking?.id ??
    bookingResult?.bookingId ??
    bookingResult?.reference ??
    "—";

  return (
    <main className="success-page container">
      <div className="success-card">
        <div className="success-icon">
          <Check size={43} />
        </div>

        <span className="eyebrow">صار الحجز جاهز</span>

        <h1>
          يا سلام! <span>تم تأكيد حجزك.</span>
        </h1>

        <p>
          تم تأكيد حجزك بنجاح. يمكنك الآن مراجعة تفاصيل التذكرة
          والرحلة من صفحة حجوزاتي.
        </p>

        <div className="confirmation-ticket">
          <div className="ticket-detail">
            <span>رقم الحجز</span>
            <strong dir="ltr">{bookingId}</strong>
          </div>

          <div className="ticket-detail">
            <span>الوجهة</span>
            <strong>
              {origin.name || "غير محدد"} ←{" "}
              {destination.name || "غير محدد"}
            </strong>
          </div>

          <div className="ticket-detail">
            <span>المقاعد</span>
            <strong>{selectedSeats.join("، ")}</strong>
          </div>
        </div>

        <div className="success-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate("/my-bookings", {
                state: {
                  booking: bookingResult,
                  success: true,
                },
              })
            }
          >
            عرض تذكرتي <Ticket size={17} />
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              navigate("/tracking", {
                state: {
                  booking: bookingResult,
                },
              })
            }
          >
            تتبع الرحلة <ArrowLeft size={17} />
          </button>
        </div>
      </div>
    </main>
  );
}
  // ==========================================
  // 11. حالات التحميل والأخطاء
  // ==========================================
  if (!validParams) {
    return (
      <main className="inner-main">
        <section className="container section">
          <div className="empty-state">
            <Info size={42} />
            <h3>بيانات الحجز غير صحيحة</h3>
            <p>
              يجب أن يحتوي الرابط على tripId صحيح وعدد مسافرين من 1 إلى 4.
            </p>
            <Link to="/trips" className="btn btn-primary">
              العودة إلى الرحلات
            </Link>
          </div>
        </section>
      </main>
    );
  }
  if (tripLoading || seatsLoading) {
    return (
      <main className="inner-main">
        <section className="container section">
          <div className="empty-state">
            <LoaderCircle size={38} className="loading-spinner" />
            <h3>جاري تجهيز رحلتك...</h3>
            <p>يتم تحميل تفاصيل الرحلة والمقاعد المتاحة.</p>
          </div>
        </section>
      </main>
    );
  }
  if (tripError || seatsError || !trip || !seatsData) {
    return (
      <main className="inner-main">
        <section className="container section">
          <div className="empty-state">
            <Info size={42} />
            <h3>تعذر تحميل بيانات الرحلة</h3>
            <p>
              {tripErrorMessage?.message ||
                "يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </button>
          </div>
        </section>
      </main>
    );
  }
  // ==========================================
  // 12. واجهة الصفحة
  // ==========================================
  return (
    <main className="inner-main booking-page">
      {/*  رأس الصفحة */}
      <section className="container booking-head">
        <div className="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <ArrowLeft size={14} />
          <Link to="/trips">الرحلات</Link>
          <ArrowLeft size={14} />
          <span>إتمام الحجز</span>
        </div>
        <div className="booking-title-row">
          <div>
            <span className="eyebrow">
              باقي شوي وتوصل
            </span>
            <h1>
              كمّل حجز <span>رحلتك.</span>
            </h1>
          </div>
          <Link to="/trips" className="quiet-back">
            <ArrowRight size={17} />
            تغيير الرحلة
          </Link>
        </div>
        {/*  مراحل الحجز */}
        <div className="stepper">
          {[
            ["seats", "اختيار المقاعد"],
            ["passengers", "بيانات المسافرين"],
            ["review", "المراجعة والتأكيد"],
          ].map(([key, label], index) => {
            const currentIndex = [
              "seats",
              "passengers",
              "review",
            ].indexOf(bookingStep);
            const isCurrent = currentIndex === index;
            const isDone = currentIndex > index;
            return (
              <div key={key} className="step-wrapper">
                <div
                  className={`step ${
                    isCurrent ? "current" : ""
                  } ${isDone ? "done" : ""}`}
                >
                  <span>
                    {isDone ? <Check size={17} /> : index + 1}
                  </span>
                  <b>{label}</b>
                </div>
                {index < 2 && (
                  <div className="step-connector" />
                )}
              </div>
            );
          })}
        </div>
      </section>
      {/*  محتوى الحجز */}
      <section className="container booking-layout">
        <div className="booking-main-card">
          {/*  ================================= */}
          {/*  المرحلة الأولى: اختيار المقاعد */}
          {/*  ================================= */}
          {bookingStep === "seats" && (
            <>
              <div className="stage-head">
                <h2>
                  اختار مكانك المفضّل
                  <Armchair size={23} />
                </h2>
                <p>
                  اختار {people} {people === 1 ? "مقعد" : "مقاعد"} من المخطط.
                  المقاعد الرمادية محجوزة مسبقاً.
                </p>
              </div>
              <div className="seat-stage">
                {/*  مخطط الحافلة */}
                <div className="seat-map-card">
                  <div className="bus-driver">
                    <span>
                      <Bus size={20} />
                      مقدمة الحافلة
                    </span>
                    <span className="steering-wheel">
                      <Bus size={27} />
                    </span>
                  </div>
                  <div className="bus-cabin">
                    {Array.from(
                      {
                        length: Math.ceil(totalSeats / 4),
                      },
                      (_, rowIndex) => {
                        const firstSeat = rowIndex * 4 + 1;
                        const rowSeats = [
                          firstSeat,
                          firstSeat + 1,
                          firstSeat + 2,
                          firstSeat + 3,
                        ].filter((seat) => seat <= totalSeats);
                        return (
                          <div className="seat-row" key={rowIndex}>
                            <span className="seat-row-index">
                              {String(rowIndex + 1).padStart(2, "0")}
                            </span>
                            {rowSeats.slice(0, 2).map((seat) => (
                              <button
                                key={seat}
                                type="button"
                                disabled={occupiedSeats.has(seat)}
                                onClick={() => handleSeatSelection(seat)}
                                className={`seat-btn ${
                                  occupiedSeats.has(seat)
                                    ? "busy"
                                    : selectedSeats.includes(seat)
                                    ? "selected"
                                    : ""
                                }`}
                                aria-label={`مقعد ${seat}`}
                                aria-pressed={selectedSeats.includes(seat)}
                              >
                                <Armchair size={24} />
                                <small>{seat}</small>
                              </button>
                            ))}
                            <span className="seat-aisle" />
                            {rowSeats.slice(2, 4).map((seat) => (
                              <button
                                key={seat}
                                type="button"
                                disabled={occupiedSeats.has(seat)}
                                onClick={() => handleSeatSelection(seat)}
                                className={`seat-btn ${
                                  occupiedSeats.has(seat)
                                    ? "busy"
                                    : selectedSeats.includes(seat)
                                    ? "selected"
                                    : ""
                                }`}
                                aria-label={`مقعد ${seat}`}
                                aria-pressed={selectedSeats.includes(seat)}
                              >
                                <Armchair size={24} />
                                <small>{seat}</small>
                              </button>
                            ))}
                          </div>
                        );
                      }
                    )}
                  </div>
                  {/*  دليل الألوان */}
                  <div className="seat-legend">
                    <span>
                      <i className="legend-available" />
                      متاح
                    </span>
                    <span>
                      <i className="legend-selected" />
                      مختار
                    </span>
                    <span>
                      <i className="legend-busy" />
                      محجوز
                    </span>
                  </div>
                </div>
                {/*  بطاقة الإرشاد */}
                <div className="seat-stage-aside">
                  <div className="seat-hint-card">
                    <span className="hint-icon">
                      <Armchair size={24} />
                    </span>
                    <h3>مكانك، راحتك.</h3>
                    <p>
                      اختار مقعدك حسب تفضيلك.
                      المكان عند الشباك أو بالممر، الخيار إلك.
                    </p>
                    <div className="seat-counter">
                      <span>المقاعد المختارة</span>
                      <strong>
                        {selectedSeats.length} / {people}
                      </strong>
                    </div>
                    <div className="seat-selection-tags">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map((seat) => (
                          <span key={seat}>
                            مقعد {seat}
                          </span>
                        ))
                      ) : (
                        <span className="muted">
                          لسا ما اخترت مقعد
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="soft-info">
                    <Info size={19} />
                    <span>
                      لتكمل، اختار عدد مقاعد مساوي لعدد المسافرين.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          {/*  ================================= */}
          {/*  المرحلة الثانية: بيانات المسافرين */}
          {/*  ================================= */}
          {bookingStep === "passengers" && (
            <>
              <div className="stage-head">
                <h2>
                  مين مسافر معنا؟
                  <Users size={23} />
                </h2>
                <p>
                  دخل بيانات المسافرين حسب عدد المقاعد المختارة.
                </p>
              </div>
              <div className="passengers-list">
                {Array.from({ length: people }, (_, index) => (
                  <div className="passenger-card" key={index}>
                    <div className="passenger-heading">
                      <span className="passenger-index">
                        {index + 1}
                      </span>
                      <b>
                        المسافر {index + 1}
                      </b>
                      <small>
                        مقعد رقم {selectedSeats[index]}
                      </small>
                    </div>
                    <div className="input-grid">
                      {/*  الاسم الكامل */}
                      <label className="form-group">
                        <span>
                          الاسم الكامل <em>*</em>
                        </span>
                        <div className="field-control">
                          <UserRound size={18} />
                          <input
                            type="text"
                            placeholder="مثال: أحمد خالد"
                            value={passengers[index]?.name || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            minLength={3}
                            required
                            autoComplete="off"
                          />
                        </div>
                      </label>
                      {/*  رقم الهاتف */}
                      <label className="form-group">
                        <span>
                          رقم الموبايل <em>*</em>
                        </span>
                        <div className="field-control">
                          <Phone size={18} />
                          <input
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            placeholder="09xxxxxxxx"
                            value={passengers[index]?.phone || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                            required
                            autoComplete="off"
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="soft-info">
                <Info size={19} />
                <span>
                  أدخل الاسم ورقم الهاتف الصحيح لكل مسافر.
                </span>
              </div>
            </>
          )}
          {/*  ================================= */}
          {/*  المرحلة الثالثة: المراجعة والتأكيد */}
          {/*  ================================= */}
          {bookingStep === "review" && (
            <>
              <div className="stage-head">
                <h2>
                  كل شي جاهز؟
                  <CheckCircle2 size={24} />
                </h2>
                <p>
                  راجع معلومات الرحلة قبل ما تثبّت الحجز.
                </p>
              </div>
              {/*  بيانات المسافرين */}
              <div className="review-panel">
                <h3>تفاصيل المسافرين</h3>
                {passengers.slice(0, people).map((passenger, index) => (
                  <div className="review-passenger" key={index}>
                    <span className="review-avatar">
                      <UserRound size={19} />
                    </span>
                    <div>
                      <b>{passenger.name}</b>
                      <span dir="ltr">
                        {passenger.phone}
                      </span>
                    </div>
                    <small>
                      المقعد {selectedSeats[index]}
                    </small>
                  </div>
                ))}
              </div>
              {/*  طريقة تأكيد الحجز */}
              <div className="review-panel">
                <h3>طريقة تأكيد الحجز</h3>
                <label className="payment-choice">
                  <input
                    type="radio"
                    name="payment"
                    value="office"
                    checked={paymentMethod === "office"}
                    onChange={() => setPaymentMethod("office")}
                  />
                  <span className="payment-icon">
                    <Wallet size={22} />
                  </span>
                  <span>
                    <b>الدفع في مكتب الشركة</b>
                    <small>
                      ادفع عند الحضور لمكتب الشركة قبل الرحلة.
                    </small>
                  </span>
                </label>
                <label className="payment-choice">
                  <input
                    type="radio"
                    name="payment"
                    value="demo"
                    checked={paymentMethod === "demo"}
                    onChange={() => setPaymentMethod("demo")}
                  />
                  <span className="payment-icon">
                    <CreditCard size={22} />
                  </span>
                  <span>
                    <b>دفع إلكتروني (تجريبي)</b>
                    <small>
                      محاكاة لواجهة الدفع فقط؛ لن يتم تحصيل أي مبلغ.
                    </small>
                  </span>
                </label>
              </div>
              <p className="review-alert">
                <ShieldCheck size={18} />
                بتأكيد الحجز، سيتم إرسال بيانات المسافرين والمقاعد إلى السيرفر.
              </p>
            </>
          )}
          {/*  ================================= */}
          {/*  رسائل التحقق والأخطاء */}
          {/*  ================================= */}
          {validationError && (
            <div className="soft-info" role="alert">
              <Info size={19} />
              <span>{validationError}</span>
            </div>
          )}
          {/*  ================================= */}
          {/*  أزرار التحكم */}
          {/*  ================================= */}
          <div className="booking-controls">
            {bookingStep === "seats" ? (
              <Link to="/trips" className="btn btn-subtle">
                <ArrowRight size={17} />
                رجوع للرحلات
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-subtle"
                onClick={handlePreviousStep}
                disabled={bookingMutation.isPending}
              >
                <ArrowRight size={17} />
                السابق
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? (
                <>
                  <LoaderCircle size={17} />
                  جاري تأكيد الحجز...
                </>
              ) : (
                <>
                  {bookingStep === "review"
                    ? "تأكيد الحجز"
                    : "متابعة الحجز"}
                  <ArrowLeft size={17} />
                </>
              )}
            </button>
          </div>
        </div>
        {/*  ================================= */}
        {/*  ملخص الحجز الجانبي */}
        {/*  ================================= */}
        <aside className="summary-card">
          <div className="summary-title">
            <Ticket size={21} />
            <h3>ملخص الحجز</h3>
          </div>
          {/*  الشركة */}
          <div className="summary-company">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name || "شركة النقل"}
                className="company-logo"
              />
            ) : (
              <div className="company-logo">
                <Bus size={27} />
              </div>
            )}
            <div>
              <strong>
                {company.name || "شركة النقل"}
              </strong>
              <small>رحلة مباشرة</small>
            </div>
          </div>
          {/*  مسار الرحلة */}
          <div className="summary-route">
            <div>
              <small>الانطلاق</small>
              <b>{origin.name || "غير محدد"}</b>
              <span>{formatTime(departureAt)}</span>
            </div>
            <span className="summary-arrow">
              <ArrowLeft size={21} />
            </span>
            <div>
              <small>الوصول</small>
              <b>{destination.name || "غير محدد"}</b>
              <span>{formatTime(arrivalAt)}</span>
            </div>
          </div>
          {/*  تفاصيل الحجز */}
          <div className="summary-details">
            <div>
              <span>تاريخ الرحلة</span>
              <strong>{formatDate(departureAt)}</strong>
            </div>
            <div>
              <span>المسافرين</span>
              <strong>{people}</strong>
            </div>
            <div>
              <span>المقاعد</span>
              <strong>
                {selectedSeats.length
                  ? selectedSeats.join("، ")
                  : "لم تُحدّد بعد"}
              </strong>
            </div>
            <div>
              <span>السعر للمسافر</span>
              <strong>{formatPrice(price)}</strong>
            </div>
          </div>
          {/*  السعر الإجمالي */}
          <div className="summary-total">
            <span>السعر الإجمالي</span>
            <b>{formatPrice(totalPrice)}</b>
          </div>
          <p className="summary-trust">
            <ShieldCheck size={17} />
            بيانات الدفع التجريبي لا تؤدي إلى تحصيل أي مبلغ.
          </p>
        </aside>
      </section>
    </main>
  );
}
