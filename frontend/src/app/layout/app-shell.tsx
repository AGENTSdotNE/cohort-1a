import { Outlet } from 'react-router-dom'

import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

export const AppShell = () => (
  <div className="flex min-h-svh flex-col">
    <AppHeader />

    <div className="flex min-h-0 flex-1">
      <AppSidebar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  </div>
)
