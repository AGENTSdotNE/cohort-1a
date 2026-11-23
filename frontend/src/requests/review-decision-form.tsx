import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

import { decide, DEPARTMENTS } from './api'
import { useFOIMutation } from './use-requests'

type ReviewDecisionFormProps = {
  foiCaseId: number
  onSuccess: (message: string) => void
  onError: (error: Error) => void
}

export const ReviewDecisionForm = ({ foiCaseId, onSuccess, onError }: ReviewDecisionFormProps) => {
  const [reviewDecision, setReviewDecision] = useState<'confirm' | 'route'>('confirm')
  const [department, setDepartment] = useState(DEPARTMENTS[0]!.value)
  const decideMutation = useFOIMutation((payload: Parameters<typeof decide>[1]) => decide(foiCaseId, payload))

  return (
    <div className="grid gap-3 border-t border-border pt-4">
      <h2 className="text-xl font-bold">Review decision</h2>
      <fieldset className="grid gap-2">
        <label className="flex items-center gap-2">
          <input type="radio" checked={reviewDecision === 'confirm'} onChange={() => setReviewDecision('confirm')} />
          This is an FOI request
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={reviewDecision === 'route'} onChange={() => setReviewDecision('route')} />
          This is not an FOI request, send to another department
        </label>
      </fieldset>

      {reviewDecision === 'route' && (
        <Select className="w-56" value={department} onChange={(event) => setDepartment(event.target.value)}>
          {DEPARTMENTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}

      <Button
        className="w-fit"
        disabled={decideMutation.isPending}
        onClick={() =>
          decideMutation.mutate(
            reviewDecision === 'confirm' ? { decision: 'confirm' } : { decision: 'route', department },
            {
              onSuccess: () => onSuccess(reviewDecision === 'confirm' ? 'Confirmed as FOI' : 'Sent to department'),
              onError,
            },
          )
        }
      >
        Confirm decision
      </Button>
    </div>
  )
}
