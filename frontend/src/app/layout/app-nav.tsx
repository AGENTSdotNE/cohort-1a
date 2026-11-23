import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

// Add your own pages here as you build them. The sidebar and the mobile menu both read this list.
const LINKS = [{ to: '/', label: 'Dashboard' }]

export const AppNav = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="grid gap-2 p-4">
    {LINKS.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn('text-base', isActive ? 'font-bold text-foreground no-underline' : 'text-[var(--govuk-link)]')
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
)
