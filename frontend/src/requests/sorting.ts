import type { FOICase } from './api'

export type SortColumn = 'reference' | 'subject' | 'received' | 'due' | 'owner' | 'status'
export type SortState = { column: SortColumn; direction: 'asc' | 'desc' } | null

/** Deadline-first, the default view: missing dates at the top, then most overdue, then soonest due. */
export const sortByDeadline = (cases: FOICase[]): FOICase[] => {
  const needsReview = cases.filter((foiCase) => !foiCase.deadline)
  const byDeadline = (a: FOICase, b: FOICase) => a.deadline!.localeCompare(b.deadline!)
  const overdue = cases.filter((foiCase) => foiCase.deadline && foiCase.is_overdue).sort(byDeadline)
  const upcoming = cases.filter((foiCase) => foiCase.deadline && !foiCase.is_overdue).sort(byDeadline)

  return [...needsReview, ...overdue, ...upcoming]
}

const compareNullable = (a: string | null, b: string | null) => {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1

  return a.localeCompare(b)
}

const COLUMN_VALUE: Record<SortColumn, (foiCase: FOICase) => string | null> = {
  reference: (foiCase) => foiCase.item.reference,
  subject: (foiCase) => foiCase.item.subject,
  received: (foiCase) => foiCase.item.received_at,
  due: (foiCase) => foiCase.deadline,
  owner: (foiCase) => foiCase.owner,
  status: (foiCase) => foiCase.status,
}

export const sortRequests = (cases: FOICase[], sort: SortState): FOICase[] => {
  if (!sort) return sortByDeadline(cases)

  const getValue = COLUMN_VALUE[sort.column]
  const sorted = [...cases].sort((a, b) => compareNullable(getValue(a), getValue(b)))

  return sort.direction === 'asc' ? sorted : sorted.reverse()
}
