import { signOut } from '@/auth/api'
import { useUser } from '@/auth/use-user'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { clearSession } from '@/lib/query-client'

import { AccountSection } from './account-section'
import { AvatarPicker } from './avatar-picker'
import { ChangePasswordForm } from './change-password-form'
import { ProfileForm } from './profile-form'

export const SettingsPage = () => {
  const user = useUser()

  const leave = async () => {
    await signOut()
    clearSession()
  }

  return (
    <div className="grid max-w-3xl gap-6 px-6 py-6">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">You sign in as {user.email}.</p>
      </div>

      <AccountSection title="Profile" description="Your picture and name are shown in the app.">
        <AvatarPicker />
        <ProfileForm />
      </AccountSection>

      <Separator />

      <AccountSection title="Password" description="You will stay signed in here. Other devices are signed out.">
        <ChangePasswordForm />
      </AccountSection>

      <Separator />

      <AccountSection title="Sign out" description="End your session on this device.">
        <Button variant="outline" className="w-fit" onClick={() => void leave()}>
          Sign out
        </Button>
      </AccountSection>
    </div>
  )
}
