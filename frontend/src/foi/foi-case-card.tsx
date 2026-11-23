import { useState } from 'react'
import { toast } from 'sonner'

import { useSession } from '@/auth/use-session'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ReceivedDate } from '@/inbound/received-date'

import { addAction, changeStatus, decide, DEPARTMENTS, type FOICase, setOwner } from './api'
import { useFOIMutation } from './use-foi-cases'

const STATUS_LABEL: Record<FOICase['status'], string> = {
  possible: 'Possible FOI',
  confirmed: 'FOI',
  responded: 'Responded',
  closed: 'Closed',
  not_foi: 'Not FOI',
}

const showError = (error: Error) => toast.error(error.message)

export const FOICaseCard = ({ foiCase }: { foiCase: FOICase }) => {
  const { data: user } = useSession()
  const [department, setDepartment] = useState(DEPARTMENTS[0]!.value)
  const [note, setNote] = useState('')

  const confirm = useFOIMutation(() => decide(foiCase.id, { decision: 'confirm' }))
  const route = useFOIMutation(() => decide(foiCase.id, { decision: 'route', department }))
  const markResponded = useFOIMutation(() => changeStatus(foiCase.id, { status: 'responded', note }))
  const markClosed = useFOIMutation(() => changeStatus(foiCase.id, { status: 'closed', note }))
  const addNote = useFOIMutation(() => addAction(foiCase.id, note))
  const assignToMe = useFOIMutation(() => setOwner(foiCase.id, user!.id))
  const unassign = useFOIMutation(() => setOwner(foiCase.id, null))

  const addingNote = markResponded.isPending || markClosed.isPending || addNote.isPending

  return (
    <Card className={foiCase.is_overdue ? 'border-destructive' : ''}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{foiCase.item.reference}</span>
          <ReceivedDate receivedAt={foiCase.item.received_at} receivedRaw={foiCase.item.received_raw} />
          <span className="capitalize">{foiCase.item.channel}</span>
          <span>{foiCase.item.sender || '-'}</span>
        </div>
        <p className="text-sm font-medium">{foiCase.item.subject || '-'}</p>
        <p className="text-sm text-muted-foreground">{foiCase.item.message}</p>
      </CardHeader>

      <CardContent className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={foiCase.status === 'not_foi' ? 'secondary' : 'default'}>{STATUS_LABEL[foiCase.status]}</Badge>
          <Badge variant="outline" className="capitalize">
            {foiCase.confidence} confidence (score {foiCase.score})
          </Badge>
          {foiCase.is_overdue && <Badge variant="destructive">Overdue</Badge>}
          {foiCase.deadline && <span className="text-xs text-muted-foreground">Deadline: {foiCase.deadline}</span>}
          {foiCase.department && <span className="text-xs text-muted-foreground">Routed to: {foiCase.department}</span>}
        </div>

        {foiCase.reasons.length > 0 && (
          <p className="text-xs text-muted-foreground">Why it was flagged: {foiCase.reasons.join(', ')}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Owner: {foiCase.owner ?? 'Unassigned'}</span>
          <Button variant="outline" size="xs" onClick={() => assignToMe.mutate(undefined, { onError: showError })}>
            Assign to me
          </Button>
          {foiCase.owner && (
            <Button variant="ghost" size="xs" onClick={() => unassign.mutate(undefined, { onError: showError })}>
              Unassign
            </Button>
          )}
        </div>

        {foiCase.status === 'possible' && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Button
              size="sm"
              disabled={confirm.isPending}
              onClick={() => confirm.mutate(undefined, { onError: showError })}
            >
              Confirm as FOI
            </Button>
            <select
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              {DEPARTMENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={route.isPending}
              onClick={() => route.mutate(undefined, { onError: showError })}
            >
              Not FOI, route here
            </Button>
          </div>
        )}

        {(foiCase.status === 'confirmed' || foiCase.status === 'responded') && (
          <div className="grid gap-2 border-t pt-3">
            <textarea
              className="min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Add a note (required to change status)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                disabled={addingNote || !note}
                onClick={() =>
                  (foiCase.status === 'confirmed' ? markResponded : markClosed).mutate(undefined, {
                    onSuccess: () => setNote(''),
                    onError: showError,
                  })
                }
              >
                {foiCase.status === 'confirmed' ? 'Mark responded' : 'Mark closed'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={addingNote || !note}
                onClick={() => addNote.mutate(undefined, { onSuccess: () => setNote(''), onError: showError })}
              >
                Add note only
              </Button>
            </div>
          </div>
        )}

        {foiCase.actions.length > 0 && (
          <ul className="grid gap-1 border-t pt-3 text-xs text-muted-foreground">
            {foiCase.actions.map((action) => (
              <li key={action.id}>
                {new Date(action.created_at).toLocaleString('en-GB')} - {action.created_by ?? 'system'}: {action.note}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
