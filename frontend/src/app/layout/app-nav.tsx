import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

// Add your own pages here as you build them. The sidebar and the mobile menu both read this list.
const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
]

export const AppNav = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="grid gap-2 p-4">
    {LINKS.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'text-base text-[var(--govuk-link)] visited:text-[var(--govuk-link)] no-underline hover:no-underline',
            isActive && 'font-bold',
          )
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
)
