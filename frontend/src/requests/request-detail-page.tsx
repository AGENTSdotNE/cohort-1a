import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { addAction, changeStatus, decide, DEPARTMENTS, setOwner } from './api'
import { EmptyState } from './empty-state'
import { formatDate } from './format-date'
import { deadlineTag, statusTag } from './tags'
import { useFOICase, useFOIMutation, useUsers } from './use-requests'

const SELECT_CLASS = 'h-10 rounded-none border-2 border-input bg-transparent px-2 text-sm'

type Feedback = { type: 'success' | 'error'; message: string } | null

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-4 border-b border-border py-3">
    <dt className="font-bold">{label}</dt>
    <dd className="col-span-2">{value}</dd>
  </div>
)

const WarningText = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-start gap-2 text-lg font-bold text-[var(--tag-red-text)]">
    <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-current">
      <span className="text-sm font-bold text-white">!</span>
    </span>
    <span>
      <span className="sr-only">Warning</span> {children}
    </span>
  </p>
)

const InsetText = ({ children }: { children: React.ReactNode }) => (
  <div className="border-l-4 border-border pl-4">{children}</div>
)

export const RequestDetailPage = () => {
  const { id } = useParams()
  const foiCaseId = Number(id)
  const { data: foiCase, isPending, isError, error } = useFOICase(foiCaseId)
  const { data: users } = useUsers()

  const [feedback, setFeedback] = useState<Feedback>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const [reviewDecision, setReviewDecision] = useState<'confirm' | 'route'>('confirm')
  const [department, setDepartment] = useState(DEPARTMENTS[0]!.value)
  const [note, setNote] = useState('')
  const [changingOwner, setChangingOwner] = useState(false)
  const [ownerId, setOwnerId] = useState('')

  const decideMutation = useFOIMutation((payload: Parameters<typeof decide>[1]) => decide(foiCaseId, payload))
  const statusMutation = useFOIMutation((payload: Parameters<typeof changeStatus>[1]) =>
    changeStatus(foiCaseId, payload),
  )
  const noteMutation = useFOIMutation((noteText: string) => addAction(foiCaseId, noteText))
  const ownerMutation = useFOIMutation((owner: number | null) => setOwner(foiCaseId, owner))

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus()
  }, [feedback])

  if (isPending) return <Skeleton className="mx-auto mt-6 h-96 max-w-5xl" />

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <EmptyState heading="Sorry, there is a problem with the service" body={error.message} />
      </div>
    )
  }

  const due = deadlineTag(foiCase)
  const status = statusTag(foiCase)

  const succeed = (message: string) => setFeedback({ type: 'success', message })
  const fail = (err: Error) => setFeedback({ type: 'error', message: err.message })

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
      <Link to="/" className="text-sm">
        &larr; Back to requests
      </Link>

      {feedback && (
        <Alert
          ref={feedbackRef}
          tabIndex={-1}
          variant={feedback.type === 'error' ? 'destructive' : 'default'}
          className={feedback.type === 'success' ? 'border-[var(--tag-green-text)]' : ''}
        >
          <AlertTitle>{feedback.type === 'success' ? 'Success' : 'There is a problem'}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-4xl font-bold">{foiCase.item.reference}</h1>
        <p className="mt-1 text-lg text-muted-foreground">{foiCase.item.subject || 'No subject'}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
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
            <div className="grid gap-3 border-t border-border pt-4">
              <h2 className="text-xl font-bold">Review decision</h2>
              <fieldset className="grid gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={reviewDecision === 'confirm'}
                    onChange={() => setReviewDecision('confirm')}
                  />
                  This is an FOI request
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={reviewDecision === 'route'}
                    onChange={() => setReviewDecision('route')}
                  />
                  This is not an FOI request, send to another department
                </label>
              </fieldset>

              {reviewDecision === 'route' && (
                <select
                  className={SELECT_CLASS}
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                >
                  {DEPARTMENTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              <Button
                className="w-fit"
                disabled={decideMutation.isPending}
                onClick={() =>
                  decideMutation.mutate(
                    reviewDecision === 'confirm' ? { decision: 'confirm' } : { decision: 'route', department },
                    {
                      onSuccess: () =>
                        succeed(reviewDecision === 'confirm' ? 'Confirmed as FOI' : 'Sent to department'),
                      onError: fail,
                    },
                  )
                }
              >
                Confirm decision
              </Button>
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-sm text-muted-foreground">
              {foiCase.decided_by && foiCase.decided_at
                ? `Decided by ${foiCase.decided_by} on ${formatDate(foiCase.decided_at)}.`
                : 'The system did not flag this as a possible FOI request.'}
            </p>
          )}

          <div>
            <h2 className="mb-2 text-xl font-bold">History</h2>
            {foiCase.actions.length === 0 ? (
              <p role="status">No actions recorded yet.</p>
            ) : (
              <ul className="grid gap-2">
                {foiCase.actions.map((action) => (
                  <li key={action.id} className="border-b border-border pb-2 text-sm">
                    <span className="text-muted-foreground">
                      {formatDate(action.created_at)} - {action.created_by ?? 'system'}:
                    </span>{' '}
                    {action.note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <dl>
            <SummaryRow
              label="Owner"
              value={
                changingOwner ? (
                  <div className="grid gap-2">
                    <select
                      className={SELECT_CLASS}
                      value={ownerId}
                      onChange={(event) => setOwnerId(event.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {(users ?? []).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={ownerMutation.isPending}
                        onClick={() =>
                          ownerMutation.mutate(ownerId ? Number(ownerId) : null, {
                            onSuccess: () => {
                              succeed('Owner changed')
                              setChangingOwner(false)
                            },
                            onError: fail,
                          })
                        }
                      >
                        Save owner
                      </Button>
                      <button type="button" className="text-sm underline" onClick={() => setChangingOwner(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {foiCase.owner ?? <Badge variant="tag-grey">Unassigned</Badge>}
                    <button type="button" className="text-sm underline" onClick={() => setChangingOwner(true)}>
                      Change<span className="sr-only"> owner for {foiCase.item.reference}</span>
                    </button>
                  </span>
                )
              }
            />
            <SummaryRow label="Status" value={<Badge variant={status.variant}>{status.label}</Badge>} />
          </dl>

          {(foiCase.status === 'confirmed' || foiCase.status === 'responded' || foiCase.status === 'not_foi') && (
            <div className="grid gap-2 border-t border-border pt-4">
              <textarea
                className="min-h-20 rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Add a note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <Button
                size="sm"
                disabled={!note || statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate(
                    { status: foiCase.status === 'confirmed' ? 'responded' : 'closed', note },
                    {
                      onSuccess: () => {
                        succeed(foiCase.status === 'confirmed' ? 'Marked as responded' : 'Marked as closed')
                        setNote('')
                      },
                      onError: fail,
                    },
                  )
                }
              >
                {foiCase.status === 'confirmed' ? 'Mark responded' : 'Mark closed'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!note || noteMutation.isPending}
                onClick={() =>
                  noteMutation.mutate(note, {
                    onSuccess: () => {
                      succeed('Note added')
                      setNote('')
                    },
                    onError: fail,
                  })
                }
              >
                Add note only
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
