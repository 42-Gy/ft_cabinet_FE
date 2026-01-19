import { apiClient } from '@/libs/axios/client'
import { coerceArray, unwrapApiResponse } from '@/libs/axios/unwrap'

export const fetchAttendanceDates = async (): Promise<string[]> => {
  const { data } = await apiClient.get('/v4/users/attendance')
  return coerceArray<string>(unwrapApiResponse<unknown>(data))
}

export const postAttendance = async (): Promise<string> => {
  const { data } = await apiClient.post('/v4/users/attendance', {})
  const payload = unwrapApiResponse<unknown>(data)
  if (typeof payload === 'string') return payload
  return '출석체크가 완료되었습니다.'
}
