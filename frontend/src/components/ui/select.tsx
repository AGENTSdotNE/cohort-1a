import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative inline-block">
      <select
        data-slot="select"
        className={cn(
          'h-10 w-full appearance-none rounded-none border-2 border-input bg-transparent py-2 pr-9 pl-2 text-sm',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {/* appearance-none drops the browser's own arrow, which wasn't spaced consistently
          across browsers - this one is always centred the same distance from the edge. */}
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
    </div>
  )
}

export { Select }
