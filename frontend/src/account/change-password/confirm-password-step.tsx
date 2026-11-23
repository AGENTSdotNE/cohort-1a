import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormField } from '@/components/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useApiForm } from '@/lib/use-api-form'

import { changePassword } from '../api'

const schema = z.object({ confirm_password: z.string().min(1, 'Re-enter your new password') })

type Values = z.infer<typeof schema>
type LocationState = { currentPassword?: string; newPassword?: string } | null

export const ConfirmPasswordStep = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentPassword, newPassword } = (location.state as LocationState) ?? {}
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { confirm_password: '' } })

  useEffect(() => {
    if (!currentPassword || !newPassword) navigate('/settings/password', { replace: true })
  }, [currentPassword, newPassword, navigate])

  const { submit, error, isSubmitting } = useApiForm(form, async ({ confirm_password }) => {
    if (confirm_password !== newPassword) {
      form.setError('confirm_password', { message: 'Passwords do not match' })
      return
    }

    await changePassword(currentPassword!, newPassword!)
    toast.success('Your password has been changed')
    navigate('/settings')
  })

  if (!currentPassword || !newPassword) return null

  return (
    <div className="grid max-w-xl gap-6 px-6 py-6">
      <button type="button" className="justify-self-start text-sm underline" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold">Confirm your new password</h1>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <FormField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.confirm_password}
          registration={form.register('confirm_password')}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSubmitting} className="justify-self-start">
          {isSubmitting ? 'Changing...' : 'Confirm'}
        </Button>
      </form>
    </div>
  )
}
