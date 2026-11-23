import { APP_NAME } from '@/app/app-name'

import { MobileNav } from './mobile-nav'

export const AppHeader = () => (
  <header>
    <div className="flex h-16 items-center gap-3 bg-[var(--govuk-brand-dark)] px-4 text-white">
      <MobileNav />
      <span className="text-xl font-bold">{APP_NAME}</span>
    </div>
    <div className="h-1 bg-[var(--govuk-brand)]" />
  </header>
)
