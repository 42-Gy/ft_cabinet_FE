import { apiClient } from '@/libs/axios/client'
import { coerceArray, unwrapApiResponse } from '@/libs/axios/unwrap'
import type { CalendarEvent, CalendarEventPayload } from '@/features/calendar/types'

export const fetchCalendarEvents = async (start: string, end: string): Promise<CalendarEvent[]> => {
  const { data } = await apiClient.get('/v4/calendar/events', { params: { start, end } })
  const payload = unwrapApiResponse<unknown>(data)
  return coerceArray<CalendarEvent>(payload)
}

export const createCalendarEvent = async (payload: CalendarEventPayload): Promise<string> => {
  const { data } = await apiClient.post('/v4/admin/calendar/events', payload)
  const response = unwrapApiResponse<unknown>(data)
  if (typeof response === 'string') return response
  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: string }).message
    if (message) return message
  }
  return '일정이 등록되었습니다.'
}

export const updateCalendarEvent = async (
  eventId: number,
  payload: CalendarEventPayload,
): Promise<string> => {
  const { data } = await apiClient.put(`/v4/admin/calendar/events/${eventId}`, payload)
  const response = unwrapApiResponse<unknown>(data)
  if (typeof response === 'string') return response
  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: string }).message
    if (message) return message
  }
  return '일정이 수정되었습니다.'
}

export const deleteCalendarEvent = async (eventId: number): Promise<string> => {
  const { data } = await apiClient.delete(`/v4/admin/calendar/events/${eventId}`)
  const response = unwrapApiResponse<unknown>(data)
  if (typeof response === 'string') return response
  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: string }).message
    if (message) return message
  }
  return '일정이 삭제되었습니다.'
}
