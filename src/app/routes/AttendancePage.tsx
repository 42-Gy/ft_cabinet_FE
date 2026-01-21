import {
  Alert,
  AlertIcon,
  Box,
  Button,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useAttendanceMutation, useAttendanceQuery } from '@/features/attendance/hooks/useAttendance'
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
  const { data, isLoading, isError, refetch } = useAttendanceQuery()
  const attendanceMutation = useAttendanceMutation()
  const [current] = useState(() => new Date())

  const attendanceSet = useMemo(
    () => new Set(Array.isArray(data) ? data : []),
    [data],
  )
  const todayKey = formatDateKey(new Date())
  const hasTodayAttendance = attendanceSet.has(todayKey)

  const year = current.getFullYear()
  const month = current.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const calendarCells = useMemo(() => {
    const cells: Array<number | null> = []
    for (let i = 0; i < firstDay; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
    return cells
  }, [firstDay, daysInMonth])

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const attendedColor = useColorModeValue('leaf.100', 'leaf.700')
  const attendedText = useColorModeValue('leaf.800', 'leaf.50')
  const defaultDayBg = useColorModeValue('gray.50', 'gray.700')
  const weekdayColor = useColorModeValue('gray.500', 'gray.400')

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
  if (isError) return <ErrorState onRetry={refetch} />

  const hasRecords = Array.isArray(data) && data.length > 0

  return (
    <Stack spacing={6}>
      <PageHeader
        title="출석 체크"
        description="매일 출석하면 코인을 지급해 드려요. 출석 기록은 이번 달 달력에서 바로 확인할 수 있습니다."
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
        <Text fontWeight="bold" mb={4}>
          {year}년 {month + 1}월 출석 달력
        </Text>
        <SimpleGrid columns={7} spacing={2} mb={2}>
          {weekdayLabels.map((label) => (
            <Text key={label} textAlign="center" fontWeight="semibold" color={weekdayColor} fontSize="sm">
              {label}
            </Text>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} spacing={2}>
          {calendarCells.map((day, index) => {
            if (day === null) {
              return <Box key={`empty-${index}`} />
            }
            const dateKey = formatDateKey(new Date(year, month, day))
            const attended = attendanceSet.has(dateKey)
            return (
              <Box
                key={dateKey}
                borderRadius="md"
                py={3}
                textAlign="center"
                bg={attended ? attendedColor : defaultDayBg}
                color={attended ? attendedText : undefined}
                borderWidth={attended ? 0 : 1}
                borderColor={borderColor}
                fontWeight={attended ? 'bold' : 'medium'}
              >
                {day}
              </Box>
            )
          })}
        </SimpleGrid>

        {!hasRecords && (
          <Box mt={6}>
            <EmptyState title="출석 기록이 없습니다" description="오늘 출석 버튼을 눌러 첫 기록을 만들어 보세요." />
          </Box>
        )}
      </Box>
    </Stack>
  )
}
