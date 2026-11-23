import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

// GOV.UK notification-banner style: a thick coloured border box, bold heading, rather than a thin
// subtle-background card - used for every banner in the app (success, error, info), not just this.
const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 border-4 bg-card p-4 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'border-[var(--govuk-brand)] text-card-foreground',
        destructive:
          'border-[var(--tag-red-text)] text-card-foreground *:data-[slot=alert-description]:text-destructive/90',
        success: 'border-[var(--tag-green-text)] text-card-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('col-start-2 text-lg font-bold', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
