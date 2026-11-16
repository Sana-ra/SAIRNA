import { Link } from 'react-router-dom'

export default function Logo({ to = '/', light = false, subtitle = 'رحلتك بين المحافظات' }) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-2.5" aria-label="سيرنا - الرئيسية">
      <img src="/logo.svg" alt="" className="size-11" />
      <span className="flex flex-col leading-tight">
        <strong className={`text-[28px] font-black tracking-[-1.5px] ${light ? 'text-white' : 'text-heading'}`}>
          سيرنا<span className="text-primary">.</span>
        </strong>
        {subtitle && <small className={`mt-1 text-[9px] font-bold ${light ? 'text-[#9ac4cd]' : 'text-muted'}`}>{subtitle}</small>}
      </span>
    </Link>
  )
}
