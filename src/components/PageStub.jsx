import { Construction } from 'lucide-react'

// صفحة مؤقتة: بتوضح شو لازم ينبنى فيها وأي endpoint بتستعمل. احذفها لما تبني الصفحة.
export default function PageStub({ title, todo = [], endpoints = [] }) {
  return (
    <div className="container-x py-14">
      <div className="card p-8">
        <div className="mb-4 flex items-center gap-3 text-primary">
          <Construction size={26} />
          <h2 className="text-xl">{title}</h2>
        </div>
        {todo.length > 0 && (
          <ul className="mb-4 list-disc space-y-1 ps-5 text-muted">
            {todo.map(t => <li key={t}>{t}</li>)}
          </ul>
        )}
        {endpoints.length > 0 && (
          <div className="flex flex-wrap gap-2" dir="ltr">
            {endpoints.map(e => <code key={e} className="badge font-mono">{e}</code>)}
          </div>
        )}
      </div>
    </div>
  )
}
