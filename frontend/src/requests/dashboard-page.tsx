import { LoadingState } from '@/components/loading-state'

import { EmptyState } from './empty-state'
import { NoMatchingResults } from './no-matching-results'
import { NoRequestsYet } from './no-requests-yet'
import { RequestFilters } from './request-filters'
import { RequestsPagination } from './requests-pagination'
import { RequestsTable } from './requests-table'
import { StatTiles } from './stat-tiles'
import { useDashboardRequests } from './use-dashboard-requests'
import { useFOICases, useUsers } from './use-requests'

export const DashboardPage = () => {
  const { data: cases, isPending, isError, error } = useFOICases()
  const { data: users } = useUsers()
  const {
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
  } = useDashboardRequests(cases)

  if (isPending) return <LoadingState label="Loading requests" />

  if (isError) {
    return <EmptyState heading="Sorry, there is a problem with the service" body={error.message} />
  }

  return (
    <div className="grid max-w-5xl gap-6 px-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Requests</h1>
        <p className="mt-1 text-muted-foreground">
          {openCount} open, {overdueCount} overdue
        </p>
      </div>

      <StatTiles tiles={tiles} active={quickFilter} onSelect={handleQuickFilter} />

      <RequestFilters filters={filters} onChange={handleFilterChange} users={users ?? []} />

      {cases.length === 0 ? (
        <NoRequestsYet />
      ) : sorted.length === 0 ? (
        <NoMatchingResults onClear={clearAll} />
      ) : (
        <>
          <RequestsTable cases={paginated} sort={sort} onSort={handleSort} />

          <RequestsPagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
