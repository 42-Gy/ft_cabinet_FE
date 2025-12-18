import {
  Badge,
  Box,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import {
  useExtendTicketMutation,
  usePenaltyTicketMutation,
  useReturnCabinetMutation,
  useSwapTicketMutation,
} from '@/features/lockers/hooks/useLockerData'
import { formatDate } from '@/utils/date'
import type { UserItemType } from '@/types/user'

export const MyLockersPage = () => {
  const { token } = useAuthToken()
  const { data: me, isLoading, isError, refetch } = useMeQuery()
  const returnMutation = useReturnCabinetMutation()
  const extendMutation = useExtendTicketMutation()
  const swapMutation = useSwapTicketMutation()
  const penaltyMutation = usePenaltyTicketMutation()
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure()
  const [swapTarget, setSwapTarget] = useState('')

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.400')
  const itemBg = useColorModeValue('gray.50', 'gray.700')

  if (!token) {
    return (
      <EmptyState
        title="로그인이 필요합니다"
        description="헤더의 로그인 버튼을 눌러 42 OAuth로 이동해 주세요."
      />
    )
  }

  if (isLoading) return <LoadingState label="내 정보를 불러오는 중입니다." />
  if (isError || !me) return <ErrorState onRetry={refetch} />

  const hasLocker = Boolean(me.lentCabinetId)

  const itemCounts = useMemo(() => {
    return me.myItems.reduce<Record<UserItemType, number>>((acc, item) => {
      acc[item.itemType] = (acc[item.itemType] ?? 0) + 1
      return acc
    }, {} as Record<UserItemType, number>)
  }, [me.myItems])

  const getCount = (type: UserItemType) => itemCounts[type] ?? 0

  const handleUseTicket = (type: UserItemType) => {
    if (getCount(type) === 0) return
    if (type === 'EXTENSION') {
      if (!hasLocker) return
      extendMutation.mutate()
      return
    }
    if (type === 'PENALTY_EXEMPTION') {
      penaltyMutation.mutate()
      return
    }
    if (type === 'SWAP') {
      if (!hasLocker) return
      setSwapTarget('')
      onOpen()
    }
  }

  const handleSwapConfirm = () => {
    if (!swapTarget) return
    const numeric = Number(swapTarget)
    if (Number.isNaN(numeric)) return
    swapMutation.mutate(numeric, {
      onSuccess: () => {
        closeModal()
      },
      onSettled: () => {
        setSwapTarget('')
      },
    })
  }

  return (
    <Stack spacing={8}>
      <PageHeader
        title="내 사물함 & 자산"
        description="현재 코인, 대여 중인 사물함, 보유한 아이템을 한 번에 확인하세요."
      />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box borderRadius="xl" bg={cardBg} p={6} shadow="md" borderWidth={1} borderColor={borderColor}>
          <Stack spacing={3}>
            <Text fontSize="lg" fontWeight="bold">
              내 계정
            </Text>
            <Text fontSize="sm" color={textMuted}>
              {me.name} · {me.email}
            </Text>
            <Badge colorScheme="purple" w="fit-content">
              코인 {me.coin.toLocaleString()}개
            </Badge>
            <Text fontSize="sm" color={textMuted}>
              이번 달 로그타임: {me.monthlyLogtime.toLocaleString()}분
            </Text>
            <Text fontSize="sm" color={textMuted}>
              패널티 일수: {me.penaltyDays}일
            </Text>
          </Stack>

          <Divider my={6} />

          {hasLocker ? (
            <Stack spacing={3}>
              <Badge colorScheme="green" w="fit-content">
                사용 중
              </Badge>
              <Text fontSize="2xl" fontWeight="bold">
                #{me.visibleNum} · {me.section}
              </Text>
              {me.lentStartedAt && (
                <Text fontSize="sm" color={textMuted}>
                  대여 시작: {formatDate(me.lentStartedAt)}
                </Text>
              )}
              {(() => {
                const expiresAt = me.expiredAt ?? me.lentExpiredAt ?? null
                if (!expiresAt) return null
                return (
                  <Text fontSize="sm" color={textMuted}>
                    만료 예정: {formatDate(expiresAt)}
                  </Text>
                )
              })()}
              {me.previousPassword && (
                <Text fontSize="sm" color={textMuted}>
                  이전 비밀번호: {me.previousPassword}
                </Text>
              )}
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
                <Button
                  colorScheme="red"
                  flex={1}
                  onClick={() => returnMutation.mutate()}
                  isLoading={returnMutation.isPending}
                >
                  반납
                </Button>
              </Stack>
            </Stack>
          ) : (
            <EmptyState
              title="대여 중인 사물함이 없습니다"
              description="사물함 페이지에서 원하는 섹션을 선택하고 대여 버튼을 눌러보세요."
            />
          )}
        </Box>

        <Box borderRadius="xl" bg={cardBg} p={6} shadow="md" borderWidth={1} borderColor={borderColor}>
          <Stack spacing={3}>
            <Text fontSize="lg" fontWeight="bold">
              내 아이템
            </Text>
            {me.myItems.length === 0 ? (
              <EmptyState
                title="보유한 아이템이 없습니다"
                description="스토어에서 연장권/이사권/감면권을 구매해 보세요."
              />
            ) : (
              <Stack spacing={3}>
                <TicketCard
                  title="연장권"
                  description="현재 사물함을 15일 연장합니다."
                  count={getCount('EXTENSION')}
                  buttonLabel="연장하기"
                  onClick={() => handleUseTicket('EXTENSION')}
                  isLoading={extendMutation.isPending}
                  isDisabled={!hasLocker}
                  bg={itemBg}
                  textMuted={textMuted}
                  borderColor={borderColor}
                />
                <TicketCard
                  title="이사권"
                  description="다른 번호로 이동할 수 있습니다."
                  count={getCount('SWAP')}
                  buttonLabel="이동하기"
                  onClick={() => handleUseTicket('SWAP')}
                  isLoading={swapMutation.isPending}
                  isDisabled={!hasLocker}
                  bg={itemBg}
                  textMuted={textMuted}
                  borderColor={borderColor}
                />
                <TicketCard
                  title="패널티 감면권"
                  description="패널티 일수를 1회 면제합니다."
                  count={getCount('PENALTY_EXEMPTION')}
                  buttonLabel="감면하기"
                  onClick={() => handleUseTicket('PENALTY_EXEMPTION')}
                  isLoading={penaltyMutation.isPending}
                  bg={itemBg}
                  textMuted={textMuted}
                  borderColor={borderColor}
                />
                <TicketCard
                  title="대여권"
                  description="출석/미션 보상으로만 사용할 수 있습니다."
                  count={getCount('LENT')}
                  buttonLabel="관리자 지급"
                  onClick={() => {}}
                  isDisabled
                  bg={itemBg}
                  textMuted={textMuted}
                  borderColor={borderColor}
                />
              </Stack>
            )}
          </Stack>
          <Divider my={6} />
          <Button as={RouterLink} to="/store" colorScheme="brand" variant="solid">
            스토어 바로가기
          </Button>
        </Box>
      </SimpleGrid>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setSwapTarget('')
          closeModal()
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>이사권 사용</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" mb={3}>
              이동할 사물함 번호를 입력하세요.
            </Text>
            <Input
              type="number"
              placeholder="예: 2045"
              value={swapTarget}
              onChange={(event) => setSwapTarget(event.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                setSwapTarget('')
                closeModal()
              }}
            >
              취소
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSwapConfirm}
              isDisabled={!swapTarget}
              isLoading={swapMutation.isPending}
            >
              사용
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  )
}

interface TicketCardProps {
  title: string
  description: string
  count: number
  buttonLabel: string
  onClick: () => void
  isLoading?: boolean
  isDisabled?: boolean
  bg: string
  textMuted: string
  borderColor: string
}

const TicketCard = ({
  title,
  description,
  count,
  buttonLabel,
  onClick,
  isLoading,
  isDisabled,
  bg,
  textMuted,
  borderColor,
}: TicketCardProps) => {
  const disabled = isDisabled || count === 0

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} borderColor={borderColor} bg={bg}>
      <Stack spacing={1}>
        <HStack justify="space-between">
          <Text fontWeight="bold">{title}</Text>
          <Badge colorScheme={count > 0 ? 'green' : 'gray'}>{count}개</Badge>
        </HStack>
        <Text fontSize="sm" color={textMuted}>
          {description}
        </Text>
        <Button
          mt={3}
          size="sm"
          colorScheme="brand"
          variant={disabled ? 'outline' : 'solid'}
          onClick={onClick}
          isDisabled={disabled}
          isLoading={isLoading}
        >
          {disabled ? '사용 불가' : buttonLabel}
        </Button>
      </Stack>
    </Box>
  )
}
