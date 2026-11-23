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

const ownerOptions = (users: UserSummary[]) => [
  { value: '', label: 'Any owner' },
  { value: 'unassigned', label: 'Unassigned' },
  ...users.map((user) => ({ value: user.email, label: user.full_name || user.email })),
]

const SelectFilter = ({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) => (
  <div className="grid gap-1">
    <Label htmlFor={id}>{label}</Label>
    <Select id={id} className="w-44" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </div>
)

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

      <SelectFilter
        id="status-filter"
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <SelectFilter
        id="owner-filter"
        label="Owner"
        value={filters.owner}
        options={ownerOptions(users)}
        onChange={(owner) => onChange({ ...filters, owner })}
      />

      <SelectFilter
        id="flag-filter"
        label="Flag"
        value={filters.flag}
        options={FLAG_OPTIONS}
        onChange={(flag) => onChange({ ...filters, flag })}
      />

      {hasFilters && (
        <button type="button" className="text-sm underline" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear filters
        </button>
      )}
    </div>
  )
}
