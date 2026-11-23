import { Link } from 'react-router-dom'

import type { FOIActionEntry } from './api'
import { formatDate } from './format-date'

export const CaseHistoryPanel = ({ foiCaseId, actions }: { foiCaseId: number; actions: FOIActionEntry[] }) => (
  <div className="border border-border">
    <h2 className="bg-[var(--govuk-brand)] px-4 py-3 text-lg font-bold text-white">History</h2>
    <div className="grid gap-3 bg-muted p-4">
      {actions.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          No actions recorded yet.
        </p>
      ) : (
        <>
          <div className="divide-y divide-border">
            {actions.slice(0, 2).map((action) => (
              <div key={action.id} className="py-2 text-sm first:pt-0">
                <p className="text-muted-foreground">
                  {formatDate(action.created_at)} &middot; {action.created_by ?? 'system'}
                </p>
                <p>{action.note}</p>
              </div>
            ))}
          </div>
          <Link to={`/requests/${foiCaseId}/history`} className="text-sm">
            All history
          </Link>
        </>
      )}
    </div>
  </div>
)
