import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

import { FOICaseCard } from './foi-case-card'
import { useFOICases } from './use-foi-cases'

export const FOIList = ({ status }: { status: string }) => {
  const { data: cases, isPending, isError, error } = useFOICases(status === 'all' ? undefined : status)

  if (isPending) return <Skeleton className="h-48 w-full" />

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load FOI cases</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (cases.length === 0) return <p className="text-sm text-muted-foreground">No cases for this filter.</p>

  return (
    <div className="grid gap-4">
      {cases.map((foiCase) => (
        <FOICaseCard key={foiCase.id} foiCase={foiCase} />
      ))}
    </div>
  )
}
