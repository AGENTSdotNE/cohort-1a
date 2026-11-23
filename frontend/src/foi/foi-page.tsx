import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { FOIList } from './foi-list'
import { ManualFlagForm } from './manual-flag-form'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'possible', label: 'Possible FOI' },
  { value: 'confirmed', label: 'FOI' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_foi', label: 'Not FOI' },
]

export const FOIPage = () => {
  const [status, setStatus] = useState('all')

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold">FOI requests</h1>
        <p className="mt-1 text-muted-foreground">
          Items flagged as possible or confirmed FOI requests, with deadlines and progress.
        </p>
      </div>

      <ManualFlagForm />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={status === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <FOIList status={status} />
    </div>
  )
}
