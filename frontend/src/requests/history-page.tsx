import { Link, useParams } from 'react-router-dom'

import { formatDate } from './format-date'
import { useFOICase } from './use-requests'

export const HistoryPage = () => {
  const { id } = useParams()
  const foiCaseId = Number(id)
  const { data: foiCase } = useFOICase(foiCaseId)

  if (!foiCase) return null

  return (
    <div className="grid max-w-3xl gap-6 px-6 py-6">
      <Link to={`/requests/${foiCaseId}`} className="text-sm">
        &larr; Back to {foiCase.item.reference}
      </Link>
      <h1 className="text-3xl font-bold">History</h1>

      {foiCase.actions.length === 0 ? (
        <p role="status">No actions recorded yet.</p>
      ) : (
        <div>
          {foiCase.actions.map((action) => (
            <div key={action.id} className="grid grid-cols-3 gap-4 border-b border-border py-3">
              <dt className="text-sm text-muted-foreground">
                {formatDate(action.created_at)}
                <br />
                {action.created_by ?? 'system'}
              </dt>
              <dd className="col-span-2">{action.note}</dd>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
