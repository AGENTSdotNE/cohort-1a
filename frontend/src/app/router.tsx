import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ChangeAvatarPage } from '@/account/change-avatar-page'
import { ChangeNamePage } from '@/account/change-name-page'
import { ConfirmPasswordStep } from '@/account/change-password/confirm-password-step'
import { CurrentPasswordStep } from '@/account/change-password/current-password-step'
import { NewPasswordStep } from '@/account/change-password/new-password-step'
import { SettingsPage } from '@/account/settings-page'
import { ForgotPasswordPage } from '@/auth/forgot-password-page'
import { RequireAuth } from '@/auth/require-auth'
import { ResendVerificationPage } from '@/auth/resend-verification-page'
import { ResetPasswordPage } from '@/auth/reset-password-page'
import { SignInPage } from '@/auth/sign-in-page'
import { SignUpPage } from '@/auth/sign-up-page'
import { VerifyEmailPage } from '@/auth/verify-email-page'
import { DashboardPage } from '@/requests/dashboard-page'
import { RequestDetailPage } from '@/requests/request-detail-page'

import { AppShell } from './layout/app-shell'
import { NotFoundPage } from './not-found-page'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="requests/:id" element={<RequestDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/name" element={<ChangeNamePage />} />
          <Route path="settings/avatar" element={<ChangeAvatarPage />} />
          <Route path="settings/password" element={<CurrentPasswordStep />} />
          <Route path="settings/password/new" element={<NewPasswordStep />} />
          <Route path="settings/password/confirm" element={<ConfirmPasswordStep />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
