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
        // GOV.UK-style status tags: square corners, bold, text carries the meaning (never colour alone).
        'tag-blue': 'rounded-none bg-[var(--tag-blue-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-blue-text)]',
        'tag-green':
          'rounded-none bg-[var(--tag-green-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-green-text)]',
        'tag-red': 'rounded-none bg-[var(--tag-red-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-red-text)]',
        'tag-orange':
          'rounded-none bg-[var(--tag-orange-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-orange-text)]',
        'tag-yellow':
          'rounded-none bg-[var(--tag-yellow-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-yellow-text)]',
        'tag-purple':
          'rounded-none bg-[var(--tag-purple-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-purple-text)]',
        'tag-grey': 'rounded-none bg-[var(--tag-grey-bg)] px-2 py-0.5 text-base font-bold text-[var(--tag-grey-text)]',
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
