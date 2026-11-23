import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

import { setOwner } from './api'
import { useFOICase, useFOIMutation, useUsers } from './use-requests'

export const ChangeOwnerPage = () => {
  const { id } = useParams()
  const foiCaseId = Number(id)
  const { data: foiCase } = useFOICase(foiCaseId)
  const { data: users } = useUsers()
  const navigate = useNavigate()
  // null until the officer picks something - until then, the select shows whoever is currently
  // the owner (derived from the case + user list), not a copy of it held in state.
  const [ownerOverride, setOwnerOverride] = useState<string | null>(null)

  const ownerMutation = useFOIMutation((owner: number | null) => setOwner(foiCaseId, owner))

  if (!foiCase) return null

  const currentOwnerId = users?.find((user) => user.email === foiCase.owner)?.id
  const ownerId = ownerOverride ?? (currentOwnerId !== undefined ? String(currentOwnerId) : '')

  return (
    <div className="grid max-w-xl gap-6 px-6 py-6">
      <Link to={`/requests/${foiCaseId}`} className="text-sm">
        &larr; Back to {foiCase.item.reference}
      </Link>
      <h1 className="text-3xl font-bold">Change owner</h1>

      <div className="grid gap-4">
        <Select value={ownerId} onChange={(event) => setOwnerOverride(event.target.value)}>
          <option value="">Unassigned</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name || user.email}
            </option>
          ))}
        </Select>

        <Button
          className="w-fit"
          disabled={ownerMutation.isPending}
          onClick={() =>
            ownerMutation.mutate(ownerId ? Number(ownerId) : null, {
              onSuccess: () => navigate(`/requests/${foiCaseId}`),
              onError: (error) => toast.error(error.message),
            })
          }
        >
          Save owner
        </Button>
      </div>
    </div>
  )
}
