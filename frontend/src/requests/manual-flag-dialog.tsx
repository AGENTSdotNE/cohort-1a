import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useInboundItems } from '@/inbound/use-inbound-items'

import { createCase, DEPARTMENTS } from './api'
import { useFOICases, useFOIMutation } from './use-requests'

const SELECT_CLASS = 'h-10 w-full rounded-none border-2 border-input bg-transparent px-2 text-sm'

export const ManualFlagDialog = () => {
  const { data: items } = useInboundItems()
  const { data: cases } = useFOICases()
  const [open, setOpen] = useState(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Flag an item the system missed</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag an item the system missed</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <select className={SELECT_CLASS} value={itemId} onChange={(event) => setItemId(event.target.value)}>
            <option value="">Choose an item...</option>
            {unflagged.map((item) => (
              <option key={item.id} value={item.id}>
                {item.reference} - {item.subject || item.message.slice(0, 40)}
              </option>
            ))}
          </select>

          <select
            className={SELECT_CLASS}
            value={decision}
            onChange={(event) => setDecision(event.target.value as 'flag' | 'route')}
          >
            <option value="flag">This is an FOI request</option>
            <option value="route">This is not an FOI request, send to another department</option>
          </select>

          {decision === 'route' && (
            <select className={SELECT_CLASS} value={department} onChange={(event) => setDepartment(event.target.value)}>
              {DEPARTMENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={!itemId || create.isPending}
            onClick={() =>
              create.mutate(undefined, {
                onSuccess: () => {
                  setItemId('')
                  setOpen(false)
                },
                onError: (error) => toast.error(error.message),
              })
            }
          >
            Confirm decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
