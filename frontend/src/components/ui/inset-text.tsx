import type { ReactNode } from 'react'

export const InsetText = ({ children }: { children: ReactNode }) => (
  <div className="border-l-4 border-border pl-4">{children}</div>
)
