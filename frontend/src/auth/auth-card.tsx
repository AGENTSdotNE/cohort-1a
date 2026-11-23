import type { ReactNode } from 'react'

import { APP_NAME } from '@/app/app-name'

type AuthCardProps = { title: string; description?: string; children?: ReactNode; footer?: ReactNode }

export const AuthCard = ({ title, description, children, footer }: AuthCardProps) => (
  <div className="min-h-svh bg-background">
    <header>
      <div className="flex h-16 items-center bg-[var(--govuk-brand-dark)] px-4 text-white">
        <span className="text-xl font-bold">{APP_NAME}</span>
      </div>
      <div className="h-1 bg-[var(--govuk-brand)]" />
    </header>

    <div className="grid max-w-xl gap-6 px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">{title}</h1>
        {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
      </div>

      {children}

      {footer && <div>{footer}</div>}
    </div>
  </div>
)
