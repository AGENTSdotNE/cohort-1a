import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { LoadingState } from '@/components/loading-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InsetText } from '@/components/ui/inset-text'
import { SummaryRow } from '@/components/ui/summary-row'
import { WarningText } from '@/components/ui/warning-text'

import { reopen } from './api'
import { CaseHistoryPanel } from './case-history-panel'
import { EmptyState } from './empty-state'
import { formatDate } from './format-date'
import { ReviewDecisionForm } from './review-decision-form'
import { deadlineTag, statusTag } from './tags'
import { useFOICase, useFOIMutation } from './use-requests'

type Feedback = { type: 'success' | 'error'; message: string } | null

export const RequestDetailPage = () => {
  const { id } = useParams()
  const foiCaseId = Number(id)
  const { data: foiCase, isPending, isError, error } = useFOICase(foiCaseId)

  const [feedback, setFeedback] = useState<Feedback>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  const reopenMutation = useFOIMutation(() => reopen(foiCaseId))

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus()
  }, [feedback])

  if (isPending) return <LoadingState label="Loading request" />

  if (isError) {
    return (
      <div className="max-w-5xl px-6 py-6">
        <EmptyState heading="Sorry, there is a problem with the service" body={error.message} />
      </div>
    )
  }

  const due = deadlineTag(foiCase)
  const status = statusTag(foiCase)
  const canComment = foiCase.status === 'confirmed' || foiCase.status === 'responded' || foiCase.status === 'not_foi'

  const succeed = (message: string) => setFeedback({ type: 'success', message })
  const fail = (err: Error) => setFeedback({ type: 'error', message: err.message })

  return (
    <div className="grid max-w-5xl gap-6 px-6 py-6">
      <Link to="/" className="text-sm">
        &larr; Back to requests
      </Link>

      {feedback && (
        <Alert ref={feedbackRef} tabIndex={-1} variant={feedback.type === 'error' ? 'destructive' : 'success'}>
          <AlertTitle>{feedback.type === 'success' ? 'Success' : 'There is a problem'}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-4xl font-bold">{foiCase.item.reference}</h1>
        <p className="mt-1 text-lg text-muted-foreground">{foiCase.item.subject || 'No subject'}</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          {due?.label === 'Overdue' && foiCase.deadline && (
            <WarningText>This request is overdue. It was due {formatDate(foiCase.deadline)}.</WarningText>
          )}
          {due?.label === 'Due soon' && foiCase.deadline && (
            <WarningText>This request is due soon: {formatDate(foiCase.deadline)}.</WarningText>
          )}
          {due?.label === 'Deadline needs review' && (
            <WarningText>The deadline needs review: the received date is missing or unreadable.</WarningText>
          )}
          {!due && foiCase.deadline && <p className="text-lg">Due {formatDate(foiCase.deadline)}.</p>}
          {foiCase.status === 'closed' && <WarningText>This request is closed.</WarningText>}

          <dl>
            <SummaryRow
              label="Received"
              value={
                foiCase.item.received_at ? formatDate(foiCase.item.received_at) : foiCase.item.received_raw || 'Unknown'
              }
            />
            <SummaryRow label="Due" value={foiCase.deadline ? formatDate(foiCase.deadline) : 'Needs review'} />
            <SummaryRow label="Sender" value={foiCase.item.sender || '-'} />
            <SummaryRow label="Channel" value={foiCase.item.channel} />
            <SummaryRow label="Subject" value={foiCase.item.subject || '-'} />
            <SummaryRow label="Original message" value={<InsetText>{foiCase.item.message}</InsetText>} />
            <SummaryRow
              label="Owner"
              value={
                <span className="flex items-center gap-2">
                  {foiCase.owner ?? <Badge variant="tag-grey">Unassigned</Badge>}
                  <Link to={`/requests/${foiCaseId}/owner`} className="text-sm">
                    Change<span className="sr-only"> owner for {foiCase.item.reference}</span>
                  </Link>
                </span>
              }
            />
            <SummaryRow label="Status" value={<Badge variant={status.variant}>{status.label}</Badge>} />
          </dl>

          <div>
            <h2 className="mb-2 text-xl font-bold">Why this was flagged</h2>
            <InsetText>
              <p className="mb-1 capitalize">
                {foiCase.confidence} confidence (score {foiCase.score})
              </p>
              {foiCase.reasons.length > 0 ? (
                <ul className="list-disc pl-6">
                  {foiCase.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p>No reasons recorded.</p>
              )}
            </InsetText>
          </div>

          {foiCase.status === 'possible' ? (
            <ReviewDecisionForm foiCaseId={foiCaseId} onSuccess={succeed} onError={fail} />
          ) : (
            <p className="border-t border-border pt-4">
              {foiCase.decided_by && foiCase.decided_at
                ? `Decided by ${foiCase.decided_by} on ${formatDate(foiCase.decided_at)}.`
                : 'The system did not flag this as a possible FOI request.'}
            </p>
          )}

          {foiCase.status === 'closed' ? (
            <div className="border-t border-border pt-4">
              <Button
                variant="secondary"
                disabled={reopenMutation.isPending}
                onClick={() =>
                  reopenMutation.mutate(undefined, { onSuccess: () => succeed('Request reopened'), onError: fail })
                }
              >
                Reopen this request
              </Button>
            </div>
          ) : (
            canComment && (
              <div className="border-t border-border pt-4">
                <Button asChild size="lg">
                  <Link to={`/requests/${foiCaseId}/comment`}>Respond</Link>
                </Button>
              </div>
            )
          )}
        </div>

        <CaseHistoryPanel foiCaseId={foiCaseId} actions={foiCase.actions} />
      </div>
    </div>
  )
}
