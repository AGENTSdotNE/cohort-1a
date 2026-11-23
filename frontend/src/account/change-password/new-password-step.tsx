import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { PASSWORD_HINT, passwordSchema } from '@/auth/password-rules'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'

const schema = z.object({ new_password: passwordSchema })

type Values = z.infer<typeof schema>
type LocationState = { currentPassword?: string } | null

export const NewPasswordStep = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPassword = (location.state as LocationState)?.currentPassword
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { new_password: '' } })

  // Arriving here without going through the first step (e.g. a direct URL or a refresh, which
  // drops router navigation state) means there's nothing to confirm against yet.
  useEffect(() => {
    if (!currentPassword) navigate('/settings/password', { replace: true })
  }, [currentPassword, navigate])

  const onSubmit = form.handleSubmit(({ new_password }) => {
    navigate('/settings/password/confirm', { state: { currentPassword, newPassword: new_password } })
  })

  if (!currentPassword) return null

  return (
    <div className="grid max-w-xl gap-6 px-6 py-6">
      <button type="button" className="justify-self-start text-sm underline" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold">Enter your new password</h1>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          error={form.formState.errors.new_password}
          registration={form.register('new_password')}
        />
        <Button type="submit" className="justify-self-start">
          Continue
        </Button>
      </form>
    </div>
  )
}
