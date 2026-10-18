import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'

export const formatReservationTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

interface ReservationPanelProps {
  visibleNum: number | null | undefined
  remainingSeconds: number | null
  isSwap: boolean
  isRefreshing: boolean
  isUnavailable?: boolean
  isCancelPending: boolean
  onContinue: () => void
  onRefresh: () => void
  onCancel: () => void
  continueLabel?: string
}

export const ReservationPanel = ({
  visibleNum,
  remainingSeconds,
  isSwap,
  isRefreshing,
  isCancelPending,
  isUnavailable = false,
  onContinue,
  onRefresh,
  onCancel,
  continueLabel,
}: ReservationPanelProps) => {
  if (visibleNum == null) return null
  return (
    <Box borderWidth={1} borderColor="brand.300" borderRadius="xl" p={4}>
      <Stack spacing={3}>
        <Text fontWeight="bold">
          {isSwap ? '진행 중인 이사 예약' : '진행 중인 대여 예약'} · #{visibleNum}
        </Text>
        <Text fontSize="sm" role="timer" aria-label="예약 남은 시간" aria-live="off">
          {remainingSeconds == null
            ? '남은 시간을 확인할 수 없습니다.'
            : `남은 시간 ${formatReservationTime(remainingSeconds)}`}
        </Text>
        {remainingSeconds === 0 && (
          <Text fontSize="sm">서버에서 예약 상태를 다시 확인해주세요.</Text>
        )}
        <HStack flexWrap="wrap" spacing={2}>
          <Button
            size="sm"
            colorScheme="brand"
            onClick={onContinue}
            isDisabled={isCancelPending || isRefreshing || isUnavailable || remainingSeconds === 0}
          >
            {continueLabel ?? (isSwap ? '진행 중인 이사 이어하기' : '예약 사물함 대여하기')}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} isLoading={isCancelPending}>
            예약 취소
          </Button>
          <Button size="sm" variant="ghost" onClick={onRefresh} isLoading={isRefreshing}>
            예약 상태 새로고침
          </Button>
        </HStack>
      </Stack>
    </Box>
  )
}
