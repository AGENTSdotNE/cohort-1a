import { Link, useNavigate } from 'react-router-dom'

import { ProfileForm } from './profile-form'

export const ChangeNamePage = () => {
  const navigate = useNavigate()

  return (
    <div className="grid max-w-xl gap-6 px-6 py-6">
      <Link to="/settings" className="text-sm">
        &larr; Back to settings
      </Link>
      <h1 className="text-3xl font-bold">What is your name?</h1>
      <ProfileForm onSuccess={() => navigate('/settings')} />
    </div>
  )
}
