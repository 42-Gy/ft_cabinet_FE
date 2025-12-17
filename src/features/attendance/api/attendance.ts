import { apiClient } from '@/libs/axios/client'

export const fetchAttendanceDates = async (): Promise<string[]> => {
  const { data } = await apiClient.get<string[]>('/v4/users/attendance')
  return data
}

export const postAttendance = async (): Promise<string> => {
  const { data } = await apiClient.post<string>('/v4/users/attendance', {})
  if (typeof data === 'string') return data
  return '출석체크가 완료되었습니다.'
}
