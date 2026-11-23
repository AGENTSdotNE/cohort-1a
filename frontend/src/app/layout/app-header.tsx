import { APP_NAME } from '@/app/app-name'
import { signOut } from '@/auth/api'
import { useUser } from '@/auth/use-user'
import { clearSession } from '@/lib/query-client'

import { MobileNav } from './mobile-nav'

export const AppHeader = () => {
  const user = useUser()

  const leave = async () => {
    await signOut()
    clearSession()
  }

  return (
    <header>
      <div className="flex h-16 items-center gap-3 bg-[var(--govuk-brand-dark)] px-4 text-white">
        <MobileNav />
        <span className="text-xl font-bold">{APP_NAME}</span>

        <div className="ml-auto flex items-center gap-6 text-sm font-bold">
          <span>{user.full_name || user.email}</span>
          <button type="button" className="no-underline hover:underline" onClick={() => void leave()}>
            Sign out
          </button>
        </div>
      </div>
      <div className="h-1 bg-[var(--govuk-brand)]" />
    </header>
  )
}
