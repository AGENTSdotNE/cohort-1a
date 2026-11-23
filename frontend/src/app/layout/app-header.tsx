import { APP_NAME } from '@/app/app-name'

import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

export const AppHeader = () => (
  <header>
    <div className="flex h-16 items-center gap-3 bg-[var(--govuk-brand-dark)] px-4 text-white">
      <MobileNav />
      <span className="text-xl font-bold">{APP_NAME}</span>
      <div className="ml-auto">
        <UserMenu className="text-white hover:bg-white/10 hover:text-white" />
      </div>
    </div>
    <div className="h-1 bg-[var(--govuk-brand)]" />
    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2 text-sm">
      <span className="bg-[var(--govuk-brand)] px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
        Beta
      </span>
      <span>
        This is a new service - your{' '}
        <a href="#" className="underline">
          feedback
        </a>{' '}
        will help us to improve it.
      </span>
    </div>
  </header>
)
