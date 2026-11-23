import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchFOICase, fetchFOICases, fetchUsers } from './api'

export const FOI_CASES_KEY = ['foi-cases']
export const USERS_KEY = ['users']

export const useFOICases = (status?: string) =>
  useQuery({ queryKey: [...FOI_CASES_KEY, status ?? 'all'], queryFn: () => fetchFOICases(status) })

export const useFOICase = (id: number) =>
  useQuery({ queryKey: [...FOI_CASES_KEY, 'detail', id], queryFn: () => fetchFOICase(id) })

export const useUsers = () => useQuery({ queryKey: USERS_KEY, queryFn: fetchUsers })

export const useFOIMutation = <TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) => {
  const queryClient = useQueryClient()

  return useMutation({ mutationFn, onSettled: () => queryClient.invalidateQueries({ queryKey: FOI_CASES_KEY }) })
}
