import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import type { FOIStatus } from './api'
import { addAction, changeStatus } from './api'
import { useFOICase, useFOIMutation } from './use-requests'

const NEXT_STATUS: Partial<Record<FOIStatus, 'responded' | 'closed'>> = {
  confirmed: 'responded',
  responded: 'closed',
  not_foi: 'closed',
}

const SWITCH_QUESTION: Partial<Record<FOIStatus, string>> = {
  confirmed: 'Has this request now been responded to?',
  responded: 'Is this request now closed?',
  not_foi: 'Is this request now closed?',
}

export const CommentPage = () => {
  const { id } = useParams()
  const foiCaseId = Number(id)
  const { data: foiCase, isPending } = useFOICase(foiCaseId)
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [advanceStatus, setAdvanceStatus] = useState(false)

  const statusMutation = useFOIMutation((payload: Parameters<typeof changeStatus>[1]) =>
    changeStatus(foiCaseId, payload),
  )
  const noteMutation = useFOIMutation((noteText: string) => addAction(foiCaseId, noteText))

  // A comment only makes sense once there's something to comment on (possible needs a decision
  // first) and before it's closed (reopen it first).
  useEffect(() => {
    if (foiCase && (foiCase.status === 'possible' || foiCase.status === 'closed')) {
      navigate(`/requests/${foiCaseId}`, { replace: true })
    }
  }, [foiCase, foiCaseId, navigate])

  if (isPending || !foiCase || foiCase.status === 'possible' || foiCase.status === 'closed') return null

  const nextStatus = NEXT_STATUS[foiCase.status]
  const question = SWITCH_QUESTION[foiCase.status]
  const busy = statusMutation.isPending || noteMutation.isPending
  const onError = (error: Error) => toast.error(error.message)
  const onSuccess = () => navigate(`/requests/${foiCaseId}`)

  const submit = () => {
    if (advanceStatus && nextStatus) {
      statusMutation.mutate({ status: nextStatus, note }, { onSuccess, onError })
    } else {
      noteMutation.mutate(note, { onSuccess, onError })
    }
  }

  return (
    <div className="grid max-w-xl gap-6 px-6 py-6">
      <Link to={`/requests/${foiCaseId}`} className="text-sm">
        &larr; Back to {foiCase.item.reference}
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Respond</h1>
        <p className="mt-2 text-muted-foreground">
          Record what has happened with this request. Other officers will see this in the request's history.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="comment" className="text-lg font-bold">
          Comment
        </label>
        <textarea
          id="comment"
          className="min-h-32 rounded-none border-2 border-input bg-transparent px-3 py-2 text-base"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {nextStatus && question && (
        <fieldset className="grid gap-2">
          <legend className="text-lg font-bold">{question}</legend>
          <label className="flex items-center gap-2">
            <input type="radio" checked={advanceStatus} onChange={() => setAdvanceStatus(true)} />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={!advanceStatus} onChange={() => setAdvanceStatus(false)} />
            No, just add a comment
          </label>
        </fieldset>
      )}

      <Button className="w-fit" disabled={!note || busy} onClick={submit}>
        Save comment
      </Button>
    </div>
  )
}
