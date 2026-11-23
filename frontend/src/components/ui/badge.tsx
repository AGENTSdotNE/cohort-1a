import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline: 'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        // GOV.UK-style status tags: square corners, bold, uppercase - text carries the meaning
        // (never colour alone), and design.md's typography rule allows all-caps for tags specifically.
        'tag-blue':
          'rounded-none bg-[var(--tag-blue-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-blue-text)] uppercase',
        'tag-green':
          'rounded-none bg-[var(--tag-green-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-green-text)] uppercase',
        'tag-red':
          'rounded-none bg-[var(--tag-red-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-red-text)] uppercase',
        'tag-orange':
          'rounded-none bg-[var(--tag-orange-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-orange-text)] uppercase',
        'tag-yellow':
          'rounded-none bg-[var(--tag-yellow-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-yellow-text)] uppercase',
        'tag-purple':
          'rounded-none bg-[var(--tag-purple-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-purple-text)] uppercase',
        'tag-grey':
          'rounded-none bg-[var(--tag-grey-bg)] px-2 py-0.5 text-sm font-bold tracking-wide text-[var(--tag-grey-text)] uppercase',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
