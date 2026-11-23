import { signOut } from '@/auth/api'
import { useUser } from '@/auth/use-user'
import { Button } from '@/components/ui/button'
import { clearSession } from '@/lib/query-client'

import { SettingsRow } from './settings-row'

export const SettingsPage = () => {
  const user = useUser()

  const leave = async () => {
    await signOut()
    clearSession()
  }

  return (
    <div className="grid max-w-3xl gap-6 px-6 py-6">
      <h1 className="text-4xl font-bold">Settings</h1>

      <dl>
        <SettingsRow label="Full name" value={user.full_name || 'Not set'} changeTo="/settings/name" />
        <SettingsRow label="Email address" value={user.email} />
        <SettingsRow
          label="Profile picture"
          value={user.avatar_url ? 'Uploaded' : 'Not set'}
          changeTo="/settings/avatar"
        />
        <SettingsRow label="Password" value="••••••••" changeTo="/settings/password" />
      </dl>

      <div>
        <h2 className="mb-2 text-xl font-bold">Sign out</h2>
        <Button variant="outline" onClick={() => void leave()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
