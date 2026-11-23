import { ArrowDown, ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { FOICase } from './api'
import { formatDate } from './format-date'
import type { SortColumn, SortState } from './sorting'
import { deadlineTag, statusTag } from './tags'

const COLUMNS: { column: SortColumn; label: string }[] = [
  { column: 'reference', label: 'Reference' },
  { column: 'subject', label: 'Subject' },
  { column: 'received', label: 'Received' },
  { column: 'due', label: 'Due' },
  { column: 'owner', label: 'Owner' },
  { column: 'status', label: 'Status' },
]

const SortableHead = ({
  column,
  label,
  sort,
  onSort,
}: {
  column: SortColumn
  label: string
  sort: SortState
  onSort: (column: SortColumn) => void
}) => {
  const isActive = sort?.column === column
  const ariaSort = isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <TableHead scope="col" aria-sort={ariaSort}>
      <button type="button" className="flex items-center gap-1 font-bold" onClick={() => onSort(column)}>
        {label}
        {isActive && (sort.direction === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      </button>
    </TableHead>
  )
}

export const RequestsTable = ({
  cases,
  sort,
  onSort,
}: {
  cases: FOICase[]
  sort: SortState
  onSort: (column: SortColumn) => void
}) => (
  <Table>
    <TableCaption>
      FOI requests,{' '}
      {sort
        ? `sorted by ${sort.column} (${sort.direction === 'asc' ? 'ascending' : 'descending'})`
        : 'sorted by deadline, items needing review or most overdue first'}
      .
    </TableCaption>
    <TableHeader>
      <TableRow>
        {COLUMNS.map(({ column, label }) => (
          <SortableHead key={column} column={column} label={label} sort={sort} onSort={onSort} />
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {cases.map((foiCase) => {
        const due = deadlineTag(foiCase)
        const status = statusTag(foiCase)

        return (
          <TableRow key={foiCase.id}>
            <TableCell>
              <Link to={`/requests/${foiCase.id}`} className="font-bold">
                {foiCase.item.reference}
              </Link>
            </TableCell>
            <TableCell className="max-w-xs truncate">{foiCase.item.subject || '-'}</TableCell>
            <TableCell>{foiCase.item.received_at ? formatDate(foiCase.item.received_at) : 'Unknown'}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span>{foiCase.deadline ? formatDate(foiCase.deadline) : '-'}</span>
                {due && <Badge variant={due.variant}>{due.label}</Badge>}
              </div>
            </TableCell>
            <TableCell>{foiCase.owner ?? <Badge variant="tag-grey">Unassigned</Badge>}</TableCell>
            <TableCell>
              <Badge variant={status.variant}>{status.label}</Badge>
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
)
