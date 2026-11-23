import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

import type { UserSummary } from './api'
import { EMPTY_FILTERS, type Filters } from './filters-state'

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'possible', label: 'Needs review' },
  { value: 'confirmed', label: 'FOI' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_foi', label: 'Not FOI' },
]

const FLAG_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'high', label: 'High confidence' },
  { value: 'medium', label: 'Medium confidence' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'not_flagged', label: 'Not flagged' },
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
        <Select
          id="status-filter"
          className="w-44"
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="owner-filter">Owner</Label>
        <Select
          id="owner-filter"
          className="w-44"
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
        </Select>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="flag-filter">Flag</Label>
        <Select
          id="flag-filter"
          className="w-44"
          value={filters.flag}
          onChange={(event) => onChange({ ...filters, flag: event.target.value })}
        >
          {FLAG_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <button type="button" className="text-sm underline" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear filters
        </button>
      )}
    </div>
  )
}
