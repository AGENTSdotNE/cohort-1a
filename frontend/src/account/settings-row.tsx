import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type SettingsRowProps = { label: string; value: ReactNode; changeTo?: string }

export const SettingsRow = ({ label, value, changeTo }: SettingsRowProps) => (
  <div className="grid grid-cols-3 gap-4 border-b border-border py-3">
    <dt className="font-bold">{label}</dt>
    <dd className="col-span-2 flex items-center justify-between gap-4">
      <span>{value}</span>
      {changeTo && (
        <Link to={changeTo} className="shrink-0 text-sm">
          Change<span className="sr-only"> {label.toLowerCase()}</span>
        </Link>
      )}
    </dd>
  </div>
)
