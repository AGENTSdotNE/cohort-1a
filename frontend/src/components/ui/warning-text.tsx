import type { ReactNode } from 'react'

export const WarningText = ({ children }: { children: ReactNode }) => (
  <p className="flex items-start gap-2 text-lg font-bold text-[var(--tag-red-text)]">
    <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-current">
      <span className="text-sm font-bold text-white">!</span>
    </span>
    <span>
      <span className="sr-only">Warning</span> {children}
    </span>
  </p>
)
