import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/features/calendar/api/calendar'
import type { CalendarEventPayload } from '@/features/calendar/types'

export const calendarQueryKeys = {
  root: ['calendar'] as const,
  range: (start: string, end: string) => ['calendar', 'events', start, end] as const,
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

export const useCalendarEventsQuery = (start: string, end: string, enabled = true) =>
  useQuery({
    queryKey: calendarQueryKeys.range(start, end),
    queryFn: () => fetchCalendarEvents(start, end),
    enabled: enabled && Boolean(start) && Boolean(end),
  })

export const useCreateCalendarEventMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()
  return useMutation<string, unknown, CalendarEventPayload>({
    mutationFn: createCalendarEvent,
    onSuccess: (message) => {
      toast({ description: message, status: 'success' })
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.root })
    },
    onError: (error) => {
      toast({ description: parseError(error), status: 'error' })
    },
  })
}

export const useUpdateCalendarEventMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()
  return useMutation<string, unknown, { eventId: number; payload: CalendarEventPayload }>({
    mutationFn: ({ eventId, payload }) => updateCalendarEvent(eventId, payload),
    onSuccess: (message) => {
      toast({ description: message, status: 'success' })
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.root })
    },
    onError: (error) => {
      toast({ description: parseError(error), status: 'error' })
    },
  })
}

export const useDeleteCalendarEventMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()
  return useMutation<string, unknown, number>({
    mutationFn: deleteCalendarEvent,
    onSuccess: (message) => {
      toast({ description: message, status: 'success' })
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.root })
    },
    onError: (error) => {
      toast({ description: parseError(error), status: 'error' })
    },
  })
}
