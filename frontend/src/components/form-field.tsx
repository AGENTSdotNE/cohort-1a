import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormFieldProps = ComponentProps<'input'> & {
  label: string
  hint?: string
  error?: FieldError | string | null
  registration: UseFormRegisterReturn
}

export const FormField = ({ label, hint, error, registration, type, ...props }: FormFieldProps) => {
  const [visible, setVisible] = useState(false)
  const message = typeof error === 'string' ? error : error?.message
  const isPassword = type === 'password'

  return (
    <div className="grid gap-2">
      <Label htmlFor={registration.name}>{label}</Label>
      {hint && !message && <p className="text-muted-foreground text-sm">{hint}</p>}
      <div className={isPassword ? 'flex gap-2' : undefined}>
        <Input
          id={registration.name}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          aria-invalid={Boolean(message)}
          className={isPassword ? 'flex-1' : undefined}
          {...registration}
          {...props}
        />
        {isPassword && (
          <Button type="button" variant="secondary" size="lg" onClick={() => setVisible((current) => !current)}>
            {visible ? 'Hide' : 'Show'}
            <span className="sr-only"> password</span>
          </Button>
        )}
      </div>
      {message && (
        <p role="alert" className="text-destructive text-sm">
          {message}
        </p>
      )}
    </div>
  )
}
