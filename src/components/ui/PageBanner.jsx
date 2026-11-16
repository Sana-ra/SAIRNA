import { Link } from 'react-router-dom'
import { ChevronLeft, Sparkles } from 'lucide-react'

// البانر أعلى الصفحات الداخلية (breadcrumb + eyebrow + عنوان)
export default function PageBanner({ crumbs = [], eyebrow, title, accent, text, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-linear-to-bl from-surface-alt to-bg pt-6 pb-11">
      <div className="container-x">
        <nav className="mb-5 flex items-center gap-2 text-[11px] font-extrabold text-muted">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          {crumbs.map(c => (
            <span key={c.label} className="flex items-center gap-2">
              <ChevronLeft size={14} />
              {c.to ? <Link to={c.to} className="hover:text-primary">{c.label}</Link> : <span className="text-ink">{c.label}</span>}
            </span>
          ))}
        </nav>
        {eyebrow && <span className="eyebrow"><Sparkles size={13} className="text-primary" /> {eyebrow}</span>}
        <h1 className="mt-3 mb-1.5 text-[clamp(29px,3.2vw,42px)]">
          {title} {accent && <span className="accent">{accent}</span>}
        </h1>
        {text && <p className="text-[13px] text-muted">{text}</p>}
        {children}
      </div>
    </section>
  )
}
