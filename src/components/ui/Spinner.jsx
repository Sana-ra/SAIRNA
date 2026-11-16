export default function Spinner({ full = false, label = 'جاري التحميل...' }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3 py-10 text-muted" role="status">
      <span className="size-9 animate-spin rounded-full border-4 border-line border-t-primary" />
      <span className="text-xs font-bold">{label}</span>
    </div>
  )
  return full ? <div className="grid min-h-[60vh] place-items-center">{spinner}</div> : spinner
}
