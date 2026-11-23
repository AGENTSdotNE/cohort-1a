import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { UserSummary } from './api'
import { EMPTY_FILTERS, type Filters } from './filters-state'

const SELECT_CLASS = 'h-10 rounded-none border-2 border-input bg-transparent px-2 text-sm'

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'possible', label: 'Needs review' },
  { value: 'confirmed', label: 'FOI' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_foi', label: 'Reassigned' },
]

const FLAG_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'high', label: 'High confidence' },
  { value: 'medium', label: 'Medium confidence' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'manual', label: 'Manually flagged' },
]

export const RequestFilters = ({
  filters,
  onChange,
  users,
}: {
  filters: Filters
  onChange: (filters: Filters) => void
  users: UserSummary[]
}) => {
  const hasFilters = filters.search || filters.status || filters.owner || filters.flag

  return (
    <div className="flex flex-wrap items-end gap-4 border-y border-border py-4">
      <div className="grid gap-1">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          className="w-56 rounded-none border-2"
          placeholder="Reference, subject, sender..."
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="status-filter">Status</Label>
        <select
          id="status-filter"
          className={SELECT_CLASS}
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="owner-filter">Owner</Label>
        <select
          id="owner-filter"
          className={SELECT_CLASS}
          value={filters.owner}
          onChange={(event) => onChange({ ...filters, owner: event.target.value })}
        >
          <option value="">Any owner</option>
          <option value="unassigned">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.email}>
              {user.full_name || user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="flag-filter">Flag</Label>
        <select
          id="flag-filter"
          className={SELECT_CLASS}
          value={filters.flag}
          onChange={(event) => onChange({ ...filters, flag: event.target.value })}
        >
          {FLAG_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" className="text-sm underline" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear filters
        </button>
      )}
    </div>
  )
}
