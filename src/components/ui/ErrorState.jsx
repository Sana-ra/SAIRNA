import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <AlertCircle className="mx-auto" size={34} />
      <p className="mt-3 font-bold">{error?.message || 'صار خطأ أثناء تحميل البيانات'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-outline btn-sm mt-4">
          <RefreshCw size={15} /> جرّب مرة تانية
        </button>
      )}
    </div>
  )
}
