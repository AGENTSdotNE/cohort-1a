import { Link } from 'react-router-dom'

import { AvatarPicker } from './avatar-picker'

export const ChangeAvatarPage = () => (
  <div className="grid max-w-xl gap-6 px-6 py-6">
    <Link to="/settings" className="text-sm">
      &larr; Back to settings
    </Link>
    <h1 className="text-3xl font-bold">Change your profile picture</h1>
    <AvatarPicker />
  </div>
)
