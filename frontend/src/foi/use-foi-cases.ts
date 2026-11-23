import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchFOICases } from './api'

export const FOI_CASES_KEY = ['foi-cases']

export const useFOICases = (status?: string) =>
  useQuery({ queryKey: [...FOI_CASES_KEY, status ?? 'all'], queryFn: () => fetchFOICases(status) })

export const useFOIMutation = <TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) => {
  const queryClient = useQueryClient()

  return useMutation({ mutationFn, onSettled: () => queryClient.invalidateQueries({ queryKey: FOI_CASES_KEY }) })
}
