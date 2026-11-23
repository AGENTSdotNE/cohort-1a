import type { ReactNode } from 'react'

export const SummaryRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="grid grid-cols-3 gap-4 border-b border-border py-3">
    <dt className="font-bold">{label}</dt>
    <dd className="col-span-2">{value}</dd>
  </div>
)
