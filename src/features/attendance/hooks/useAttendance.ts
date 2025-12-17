import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { fetchAttendanceDates, postAttendance } from '@/features/attendance/api/attendance'
import { meQueryKeys } from '@/features/users/hooks/useMeQuery'

const attendanceKeys = {
  root: ['attendance'] as const,
}

const parseError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data?.message) return data.message
  }
  if (error instanceof Error) return error.message
  return '요청 중 문제가 발생했습니다.'
}

export const useAttendanceQuery = () =>
  useQuery({
    queryKey: attendanceKeys.root,
    queryFn: fetchAttendanceDates,
  })

export const useAttendanceMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()

  return useMutation<string>({
    mutationFn: postAttendance,
    onSuccess: (message) => {
      toast({ description: message, status: 'success' })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.root })
      queryClient.invalidateQueries({ queryKey: meQueryKeys.root })
    },
    onError: (error) => {
      toast({ description: parseError(error), status: 'error' })
    },
  })
}

export const attendanceQueryKeys = attendanceKeys
