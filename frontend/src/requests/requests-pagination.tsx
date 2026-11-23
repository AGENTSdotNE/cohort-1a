import { ArrowLeft, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export const RequestsPagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) => {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav aria-label="Pagination" className="flex items-center gap-4 border-t border-border pt-4 text-base">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex items-center gap-1 text-[var(--govuk-link)] underline disabled:pointer-events-none disabled:text-muted-foreground disabled:no-underline"
      >
        <ArrowLeft className="size-4" />
        Previous
      </button>

      <ul className="flex items-center gap-1">
        {pages.map((pageNumber) => (
          <li key={pageNumber}>
            <button
              type="button"
              aria-current={pageNumber === page ? 'page' : undefined}
              onClick={() => onChange(pageNumber)}
              className={cn(
                'flex size-8 items-center justify-center font-bold',
                pageNumber === page ? 'bg-[var(--govuk-brand)] text-white' : 'text-[var(--govuk-link)] underline',
              )}
            >
              {pageNumber}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex items-center gap-1 text-[var(--govuk-link)] underline disabled:pointer-events-none disabled:text-muted-foreground disabled:no-underline"
      >
        Next
        <ArrowRight className="size-4" />
      </button>
    </nav>
  )
}
