export interface CalendarEvent {
  id: number
  title: string
  description?: string | null
  eventDate: string
  announcerName?: string | null
}

export interface CalendarEventPayload {
  title: string
  description?: string | null
  eventDate: string
}
