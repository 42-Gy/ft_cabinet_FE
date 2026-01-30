import {
  Alert,
  AlertIcon,
  Box,
  Button,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useAttendanceMutation, useAttendanceQuery } from '@/features/attendance/hooks/useAttendance'
import { useCalendarEventsQuery } from '@/features/calendar/hooks/useCalendar'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'

const formatDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']

export const AttendancePage = () => {
  const { data: me, isLoading: meLoading } = useMeQuery()
  const isLoggedIn = Boolean(me)
  const { data, isLoading, isError, refetch } = useAttendanceQuery(isLoggedIn)
  const attendanceMutation = useAttendanceMutation()
  const [current, setCurrent] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))

  const attendanceSet = useMemo(() => new Set(Array.isArray(data) ? data : []), [data])
  const todayKey = formatDateKey(new Date())
  const hasTodayAttendance = attendanceSet.has(todayKey)

  const year = current.getFullYear()
  const month = current.getMonth()
  const monthStart = useMemo(() => formatDateKey(new Date(year, month, 1)), [year, month])
  const monthEnd = useMemo(() => formatDateKey(new Date(year, month + 1, 0)), [year, month])
  const calendarQuery = useCalendarEventsQuery(monthStart, monthEnd, isLoggedIn)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const calendarCells = useMemo(() => {
    const cells: Array<number | null> = []
    for (let i = 0; i < firstDay; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
    return cells
  }, [firstDay, daysInMonth])

  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      Array<{ title: string; description?: string | null; announcerName?: string | null }>
    >()
    const items = calendarQuery.data ?? []
    for (const event of items) {
      const list = map.get(event.eventDate) ?? []
      list.push({
        title: event.title,
        description: event.description,
        announcerName: event.announcerName,
      })
      map.set(event.eventDate, list)
    }
    return map
  }, [calendarQuery.data])

  const selectedDayEvents = eventsByDate.get(selectedDate) ?? []

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const attendedColor = useColorModeValue('leaf.100', 'leaf.700')
  const attendedText = useColorModeValue('leaf.800', 'leaf.50')
  const defaultDayBg = useColorModeValue('gray.50', 'gray.700')
  const weekdayColor = useColorModeValue('gray.500', 'gray.400')
  const selectedBg = useColorModeValue('blue.50', 'blue.900')
  const calendarBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const monthLabel = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' })

  useEffect(() => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    if (!selectedDate.startsWith(monthKey)) {
      setSelectedDate(formatDateKey(new Date(year, month, 1)))
    }
  }, [year, month, selectedDate])

  if (meLoading) return <LoadingState label="로그인 상태를 확인하는 중입니다." />
  if (!isLoggedIn) {
    return (
      <EmptyState
        title="로그인이 필요해요"
        description="우측 상단의 로그인 버튼을 눌러 로그인한 뒤 이용해 주세요."
      />
    )
  }
  if (isLoading) return <LoadingState label="출석 기록을 불러오는 중입니다." />
  if (calendarQuery.isLoading) return <LoadingState label="일정을 불러오는 중입니다." />
  if (isError) return <ErrorState onRetry={refetch} />
  if (calendarQuery.isError) return <ErrorState onRetry={calendarQuery.refetch} />

  const hasRecords = Array.isArray(data) && data.length > 0

  return (
    <Stack spacing={6}>
      <PageHeader
        title="42 캘린더"
        description="출석 기록과 42 일정이 함께 표시됩니다. 이번 달 일정을 한눈에 확인하세요."
      />

      <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={cardBg} p={6}>
        <Stack spacing={3}>
          <Button
            alignSelf="flex-start"
            colorScheme="brand"
            onClick={() =>
              attendanceMutation.mutate(undefined, {
                onSettled: () => {
                  // handled inside hook invalidation
                },
              })
            }
            isDisabled={hasTodayAttendance}
            isLoading={attendanceMutation.isPending}
          >
            {hasTodayAttendance ? '오늘 출석 완료' : '오늘 출석 체크'}
          </Button>
          {hasTodayAttendance && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              오늘은 이미 출석을 완료했어요. 내일 다시 찾아주세요!
            </Alert>
          )}
        </Stack>
      </Box>

      <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={cardBg} p={6}>
        <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
          <HStack spacing={2}>
            <Button size="sm" variant="ghost" onClick={() => setCurrent(new Date(year, month - 1, 1))}>
              ◀
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCurrent(new Date())}>
              오늘
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCurrent(new Date(year, month + 1, 1))}>
              ▶
            </Button>
          </HStack>
          <Text fontWeight="bold" fontSize="lg" textAlign="center" flex="1">
            {monthLabel}
          </Text>
          <HStack spacing={1} p={1} borderRadius="full" bg={defaultDayBg}>
            <Button size="xs" variant="solid">
              Month
            </Button>
            <Button size="xs" variant="ghost" isDisabled>
              Week
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={7} spacing={0} borderWidth={1} borderColor={calendarBorder} borderRadius="lg" overflow="hidden">
          {weekdayLabels.map((label, index) => (
            <Box
              key={label}
              py={2}
              textAlign="center"
              borderRightWidth={index === 6 ? 0 : 1}
              borderBottomWidth={1}
              borderColor={calendarBorder}
              bg={cardBg}
            >
              <Text fontWeight="semibold" color={weekdayColor} fontSize="sm">
                {label}
              </Text>
            </Box>
          ))}

          {calendarCells.map((day, index) => {
            const isLastColumn = (index + 1) % 7 === 0
            const isLastRow = index >= calendarCells.length - 7
            if (day === null) {
              return (
                <Box
                  key={`empty-${index}`}
                  minH="96px"
                  borderRightWidth={isLastColumn ? 0 : 1}
                  borderBottomWidth={isLastRow ? 0 : 1}
                  borderColor={calendarBorder}
                />
              )
            }
            const dateKey = formatDateKey(new Date(year, month, day))
            const attended = attendanceSet.has(dateKey)
            const dailyEvents = eventsByDate.get(dateKey) ?? []
            const isSelected = dateKey === selectedDate
            return (
              <Box
                key={dateKey}
                minH="96px"
                px={3}
                py={2}
                borderRightWidth={isLastColumn ? 0 : 1}
                borderBottomWidth={isLastRow ? 0 : 1}
                borderColor={calendarBorder}
                bg={isSelected ? selectedBg : attended ? attendedColor : 'transparent'}
                color={attended ? attendedText : undefined}
                cursor="pointer"
                onClick={() => setSelectedDate(dateKey)}
              >
                <Text fontWeight="semibold" fontSize="sm">
                  {day}
                </Text>
                <Stack spacing={1} mt={1}>
                  {dailyEvents.slice(0, 1).map((event, idx) => (
                    <HStack key={`${event.title}-${idx}`} spacing={1} align="center">
                      <Box w="6px" h="6px" borderRadius="full" bg="blue.400" />
                      <Text fontSize="xs" noOfLines={1}>
                        {event.title}
                      </Text>
                    </HStack>
                  ))}
                  {dailyEvents.length > 1 && (
                    <Text fontSize="xs" color={weekdayColor}>
                      +{dailyEvents.length - 1} more
                    </Text>
                  )}
                </Stack>
              </Box>
            )
          })}
        </SimpleGrid>

        <Box mt={4} borderWidth={1} borderColor={borderColor} borderRadius="lg" p={4}>
          <Text fontWeight="bold" mb={2}>
            {selectedDate}
          </Text>
          {selectedDayEvents.length ? (
            <Stack spacing={3}>
              {selectedDayEvents.map((event, idx) => (
                <Box key={`${event.title}-${idx}`} borderWidth={1} borderRadius="md" p={3}>
                  <Text fontWeight="semibold">{event.title}</Text>
                  {event.description && (
                    <Text fontSize="sm" color={weekdayColor}>
                      {event.description}
                    </Text>
                  )}
                  {event.announcerName && (
                    <Text fontSize="xs" color={weekdayColor}>
                      등록자: {event.announcerName}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Text fontSize="sm" color={weekdayColor}>
              선택한 날짜에 일정이 없습니다.
            </Text>
          )}
        </Box>

        {!hasRecords && (
          <Box mt={6}>
            <EmptyState title="출석 기록이 없습니다" description="오늘 출석 버튼을 눌러 첫 기록을 만들어 보세요." />
          </Box>
        )}
      </Box>
    </Stack>
  )
}
