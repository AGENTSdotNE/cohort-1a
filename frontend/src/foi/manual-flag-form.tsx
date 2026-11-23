import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInboundItems } from '@/inbound/use-inbound-items'

import { createCase, DEPARTMENTS } from './api'
import { useFOICases, useFOIMutation } from './use-foi-cases'

export const ManualFlagForm = () => {
  const { data: items } = useInboundItems()
  const { data: cases } = useFOICases()
  const [itemId, setItemId] = useState('')
  const [decision, setDecision] = useState<'flag' | 'route'>('flag')
  const [department, setDepartment] = useState(DEPARTMENTS[0]!.value)

  const create = useFOIMutation(() =>
    createCase({ item: Number(itemId), decision, ...(decision === 'route' ? { department } : {}) }),
  )

  if (!items || !cases) return null

  const flaggedIds = new Set(cases.map((foiCase) => foiCase.item.id))
  const unflagged = items.filter((item) => !flaggedIds.has(item.id))

  if (unflagged.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Flag an item the detector missed</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
        >
          <option value="">Choose an item...</option>
          {unflagged.map((item) => (
            <option key={item.id} value={item.id}>
              {item.reference} - {item.subject || item.message.slice(0, 40)}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          value={decision}
          onChange={(event) => setDecision(event.target.value as 'flag' | 'route')}
        >
          <option value="flag">Flag as possible FOI</option>
          <option value="route">Not FOI, route to department</option>
        </select>
        {decision === 'route' && (
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
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
          size="sm"
          disabled={!itemId || create.isPending}
          onClick={() =>
            create.mutate(undefined, {
              onSuccess: () => setItemId(''),
              onError: (error) => toast.error(error.message),
            })
          }
        >
          Submit
        </Button>
      </CardContent>
    </Card>
  )
}
