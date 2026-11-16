import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Sparkles, Ticket } from 'lucide-react'

// الإطار المشترك لصفحات الدخول والتسجيل
export default function AuthShell({ eyebrow, title, accent, text, children }) {
  return (
    <div className="container-x grid gap-8 py-12 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <span className="eyebrow"><Sparkles size={13} className="text-primary" /> {eyebrow}</span>
        <h1 className="mt-4 mb-2 text-4xl">{title} <span className="accent">{accent}</span></h1>
        <p className="mb-7 text-muted">{text}</p>
        {children}
      </div>
      <div className="relative hidden min-h-[520px] flex-col justify-between overflow-hidden rounded-[28px] bg-linear-to-bl from-[#0e4653] to-[#0b756e] p-10 text-white lg:flex">
        <div>
          <span className="flex items-center gap-2 text-sm font-bold text-[#c7f6e8]"><Sparkles size={18} /> عالم جديد بانتظارك</span>
          <h2 className="mt-4 text-4xl leading-[1.5] text-white">كل الطرق <br /> بتوصّل لذكريات.</h2>
          <p className="text-[#d4edeb]">ومن أول محطة رح نكون معك.</p>
        </div>
        <img
          src="/assets/hero.jpg"
          alt="حافلة سيرنا على طريق بين المدن السورية"
          className="my-6 w-full aspect-[16/10] -rotate-2 rounded-[20px] border border-white/15 object-cover shadow-xl"
        />
        <div className="flex gap-6 text-sm font-bold">
          <span className="flex items-center gap-2"><ShieldCheck size={19} /> سهل وواضح</span>
          <span className="flex items-center gap-2"><Ticket size={19} /> حجز بخطوات بسيطة</span>
        </div>
      </div>
    </div>
    
  )
}

export function PasswordInput(props) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className="input pe-11" dir="ltr" />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute inset-y-0 end-3 text-muted hover:text-primary" aria-label="إظهار كلمة المرور">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
