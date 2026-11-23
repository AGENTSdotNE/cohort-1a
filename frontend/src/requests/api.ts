import type { InboundItem } from '@/inbound/api'
import { apiRequest } from '@/lib/api-client'

export type FOIStatus = 'possible' | 'confirmed' | 'responded' | 'closed' | 'not_foi'
export type FOIConfidence = 'high' | 'medium' | 'unclear' | 'not_flagged'

export type FOIActionEntry = {
  id: number
  note: string
  new_status: string
  created_by: string | null
  created_at: string
}

export type FOICase = {
  id: number
  item: InboundItem
  status: FOIStatus
  confidence: FOIConfidence
  score: number
  reasons: string[]
  suggest_sar: boolean
  department: string
  owner: string | null
  deadline: string | null
  is_overdue: boolean
  decided_by: string | null
  decided_at: string | null
  created_at: string
  actions: FOIActionEntry[]
}

export const DEPARTMENTS = [
  { value: 'housing', label: 'Housing' },
  { value: 'council_tax', label: 'Council Tax' },
  { value: 'planning', label: 'Planning' },
  { value: 'waste', label: 'Waste & Recycling' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'customer_services', label: 'Customer Services' },
  { value: 'other', label: 'Other' },
]

export type UserSummary = { id: number; email: string; full_name: string }

export const fetchUsers = () => apiRequest<UserSummary[]>('/auth/users/')

export const fetchFOICases = (status?: string) => apiRequest<FOICase[]>(`/foi/${status ? `?status=${status}` : ''}`)

export const fetchFOICase = (id: number) => apiRequest<FOICase>(`/foi/${id}/`)

export const setOwner = (id: number, owner: number | null) =>
  apiRequest<FOICase>(`/foi/${id}/`, { method: 'PATCH', body: { owner } })

export const decide = (id: number, body: { decision: 'confirm' | 'route'; department?: string }) =>
  apiRequest<FOICase>(`/foi/${id}/decide/`, { body })

export const changeStatus = (id: number, body: { status: 'responded' | 'closed'; note: string }) =>
  apiRequest<FOICase>(`/foi/${id}/status/`, { body })

export const addAction = (id: number, note: string) => apiRequest<FOICase>(`/foi/${id}/actions/`, { body: { note } })
