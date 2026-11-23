import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { EmptyState, NoMatchingResults, NoRequestsYet } from './empty-state'
import { EMPTY_FILTERS, type Filters } from './filters-state'
import { ManualFlagDialog } from './manual-flag-dialog'
import { RequestFilters } from './request-filters'
import { RequestsTable } from './requests-table'
import { type SortColumn, sortRequests, type SortState } from './sorting'
import { type QuickFilter, StatTiles } from './stat-tiles'
import { deadlineTag } from './tags'
import { useFOICases, useUsers } from './use-requests'

const PAGE_SIZE = 20

const LoadingState = () => (
  <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-16">
    <div className="size-6 animate-spin rounded-full border-4 border-muted border-t-[var(--govuk-brand)]" />
    <span className="text-base">Loading requests</span>
  </div>
)

export const DashboardPage = () => {
  const { data: cases, isPending, isError, error } = useFOICases()
  const { data: users } = useUsers()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [quickFilter, setQuickFilter] = useState<QuickFilter | null>(null)
  const [sort, setSort] = useState<SortState>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!cases) return []

    const search = filters.search.trim().toLowerCase()

    return cases.filter((foiCase) => {
      if (filters.status && foiCase.status !== filters.status) return false
      if (filters.flag && foiCase.confidence !== filters.flag) return false
      if (filters.owner === 'unassigned' && foiCase.owner !== null) return false
      if (filters.owner && filters.owner !== 'unassigned' && foiCase.owner !== filters.owner) return false

      if (search) {
        const haystack =
          `${foiCase.item.reference} ${foiCase.item.subject} ${foiCase.item.sender} ${foiCase.item.message}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }

      if (quickFilter === 'overdue' && !foiCase.is_overdue) return false
      if (quickFilter === 'due_soon' && deadlineTag(foiCase)?.label !== 'Due soon') return false
      if (quickFilter === 'unassigned' && foiCase.owner !== null) return false
      if (quickFilter === 'foi' && foiCase.status !== 'confirmed') return false

      return true
    })
  }, [cases, filters, quickFilter])

  const sorted = useMemo(() => sortRequests(filtered, sort), [filtered, sort])
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSort = (column: SortColumn) => {
    setSort((current) =>
      current?.column === column
        ? { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' },
    )
    setPage(1)
  }

  const handleFilterChange = (next: Filters) => {
    setFilters(next)
    setPage(1)
  }

  const handleQuickFilter = (key: QuickFilter | null) => {
    setQuickFilter(key)
    setPage(1)
  }

  if (isPending) return <LoadingState />

  if (isError) {
    return <EmptyState heading="Sorry, there is a problem with the service" body={error.message} />
  }

  const openCount = cases.filter((foiCase) => !['closed', 'not_foi'].includes(foiCase.status)).length
  const overdueCount = cases.filter((foiCase) => foiCase.is_overdue).length

  const tiles = [
    { key: 'overdue' as const, label: 'Overdue', count: overdueCount },
    {
      key: 'due_soon' as const,
      label: 'Due soon',
      count: cases.filter((foiCase) => deadlineTag(foiCase)?.label === 'Due soon').length,
    },
    { key: 'unassigned' as const, label: 'Unassigned', count: cases.filter((foiCase) => !foiCase.owner).length },
    {
      key: 'foi' as const,
      label: 'Flagged as FOI',
      count: cases.filter((foiCase) => foiCase.status === 'confirmed').length,
    },
  ]

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Requests</h1>
          <p className="mt-1 text-muted-foreground">
            {openCount} open, {overdueCount} overdue
          </p>
        </div>
        <ManualFlagDialog />
      </div>

      <StatTiles tiles={tiles} active={quickFilter} onSelect={handleQuickFilter} />

      <RequestFilters filters={filters} onChange={handleFilterChange} users={users ?? []} />

      {cases.length === 0 ? (
        <NoRequestsYet />
      ) : sorted.length === 0 ? (
        <NoMatchingResults
          onClear={() => {
            handleFilterChange(EMPTY_FILTERS)
            handleQuickFilter(null)
          }}
        />
      ) : (
        <>
          <RequestsTable cases={paginated} sort={sort} onSort={handleSort} />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, sorted.length)} of{' '}
              {sorted.length} requests
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
