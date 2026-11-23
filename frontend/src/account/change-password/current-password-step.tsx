import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'

const schema = z.object({ current_password: z.string().min(1, 'Enter your current password') })

type Values = z.infer<typeof schema>

export const CurrentPasswordStep = () => {
  const navigate = useNavigate()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { current_password: '' } })

  const onSubmit = form.handleSubmit(({ current_password }) => {
    navigate('/settings/password/new', { state: { currentPassword: current_password } })
  })

  return (
    <div className="grid max-w-xl gap-6 px-6 py-6">
      <button type="button" className="justify-self-start text-sm underline" onClick={() => navigate('/settings')}>
        &larr; Back to settings
      </button>
      <h1 className="text-3xl font-bold">Enter your current password</h1>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormField
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={form.formState.errors.current_password}
          registration={form.register('current_password')}
        />
        <Button type="submit" className="justify-self-start">
          Continue
        </Button>
      </form>
    </div>
  )
}
