// الباك بيرجّع للشركة { id, name, logoUrl, isActive } بس.
// التقييم والخدمات واللون موجودين بالـ UI، فبنحطهم هون حسب id الشركة.

const META = {
  1: { color: '#109d9c', bg: '#e7f9f6', rating: '4.9', tag: 'الأعلى تقييماً', features: ['مكيّف', 'Wi-Fi', 'شحن USB'], about: 'رحلات منتظمة بين المحافظات وتجربة سفر مريحة.' },
  2: { color: '#e69a46', bg: '#fff3df', rating: '4.8', tag: 'الأكثر حجزاً', features: ['مكيّف', 'مقاعد واسعة'], about: 'أسطول حديث ومواعيد متنوعة على مدار الأسبوع.' },
  3: { color: '#5085e6', bg: '#e9efff', rating: '4.7', tag: 'سعر مميّز', features: ['مكيّف', 'Wi-Fi'], about: 'رحلات يومية وخيارات مناسبة لكل المسافرين.' },
  4: { color: '#9969ce', bg: '#f1eafe', rating: '4.6', tag: 'مواعيد مرنة', features: ['مكيّف', 'شحن USB'], about: 'ربط المدن السورية بمواعيد مرنة وسهلة الحجز.' },
}

const FALLBACK = { color: '#109d9c', bg: '#e7f9f6', rating: '4.5', tag: 'شركة نقل', features: ['مكيّف'], about: 'شركة نقل بين المحافظات السورية.' }

// اسم الشركة بالباك فيه "(تجريبي)" — منشيلها بالعرض
export const cleanName = name => String(name || '').replace(/\s*\(تجريبي\)\s*/g, '').trim()

export function companyMeta(company) {
  const meta = META[company?.id] || FALLBACK
  const name = cleanName(company?.name)
  return { ...meta, name, short: name.replace(/^ال/, '').charAt(0) || 'س' }
}
