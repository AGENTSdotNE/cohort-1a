import type { FOICase, FOIStatus } from './api'

export type TagVariant = 'tag-blue' | 'tag-green' | 'tag-red' | 'tag-orange' | 'tag-yellow' | 'tag-purple' | 'tag-grey'
export type TagInfo = { label: string; variant: TagVariant }

const STATUS_TAGS: Record<FOIStatus, TagInfo> = {
  possible: { label: 'Needs review', variant: 'tag-yellow' },
  confirmed: { label: 'FOI', variant: 'tag-purple' },
  responded: { label: 'Responded', variant: 'tag-blue' },
  closed: { label: 'Closed', variant: 'tag-green' },
  not_foi: { label: 'Not FOI', variant: 'tag-green' },
}

export const statusTag = (foiCase: FOICase): TagInfo => STATUS_TAGS[foiCase.status]

// Approximates design.md's "within 5 working days" without re-implementing the working-day
// calendar client-side - the backend is the source of truth for is_overdue itself.
const DUE_SOON_DAYS = 7

export const deadlineTag = (foiCase: FOICase): TagInfo | null => {
  if (!foiCase.deadline) return { label: 'Deadline needs review', variant: 'tag-yellow' }
  if (foiCase.is_overdue) return { label: 'Overdue', variant: 'tag-red' }

  const daysUntilDue = (new Date(foiCase.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)

  return daysUntilDue <= DUE_SOON_DAYS ? { label: 'Due soon', variant: 'tag-orange' } : null
}
