import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="rounded-[20px] border border-dashed border-line bg-surface px-6 py-16 text-center">
      <Icon className="mx-auto text-primary" size={40} strokeWidth={1.6} />
      <h3 className="mt-4 mb-1 text-xl">{title}</h3>
      {text && <p className="mb-5 text-muted">{text}</p>}
      {action}
    </div>
  )
}
