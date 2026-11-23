import { useMemo, useState } from 'react'

import type { FOICase } from './api'
import { EMPTY_FILTERS, type Filters } from './filters-state'
import { type SortColumn, sortRequests, type SortState } from './sorting'
import type { QuickFilter, Tile } from './stat-tiles'
import { deadlineTag } from './tags'

const buildTiles = (cases: FOICase[]): Tile[] => [
  { key: 'overdue', label: 'Overdue', count: cases.filter((foiCase) => foiCase.is_overdue).length },
  {
    key: 'due_soon',
    label: 'Due soon',
    count: cases.filter((foiCase) => deadlineTag(foiCase)?.label === 'Due soon').length,
  },
  { key: 'unassigned', label: 'Unassigned', count: cases.filter((foiCase) => !foiCase.owner).length },
  { key: 'foi', label: 'Flagged as FOI', count: cases.filter((foiCase) => foiCase.status === 'confirmed').length },
]

const PAGE_SIZE = 20

export const useDashboardRequests = (cases: FOICase[] | undefined) => {
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

  const openCount = cases?.filter((foiCase) => foiCase.status !== 'closed').length ?? 0
  const overdueCount = cases?.filter((foiCase) => foiCase.is_overdue).length ?? 0
  const tiles = useMemo(() => buildTiles(cases ?? []), [cases])

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

  const clearAll = () => {
    handleFilterChange(EMPTY_FILTERS)
    handleQuickFilter(null)
  }

  return {
    filters,
    quickFilter,
    sort,
    sorted,
    paginated,
    totalPages,
    safePage,
    setPage,
    handleSort,
    handleFilterChange,
    handleQuickFilter,
    clearAll,
    openCount,
    overdueCount,
    tiles,
  }
}
