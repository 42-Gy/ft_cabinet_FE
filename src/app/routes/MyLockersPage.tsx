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
import { useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import {
  useBuyItemMutation,
  useExtendTicketMutation,
  usePenaltyTicketMutation,
  useReturnCabinetMutation,
  useSwapTicketMutation,
} from '@/features/lockers/hooks/useLockerData'
import { STORE_ITEM_IDS } from '@/features/store/data/items'
import { formatDate } from '@/utils/date'
import type { UserItem } from '@/types/user'

type ItemUsage = 'extend' | 'swap' | 'penalty' | null

const detectUsage = (itemName: string): ItemUsage => {
  if (itemName.includes('연장')) return 'extend'
  if (itemName.includes('이사')) return 'swap'
  if (itemName.includes('감면')) return 'penalty'
  return null
}

export const MyLockersPage = () => {
  const { token } = useAuthToken()
  const { data: me, isLoading, isError, refetch } = useMeQuery()
  const returnMutation = useReturnCabinetMutation()
  const buyMutation = useBuyItemMutation()
  const extendMutation = useExtendTicketMutation()
  const swapMutation = useSwapTicketMutation()
  const penaltyMutation = usePenaltyTicketMutation()
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure()
  const [swapTarget, setSwapTarget] = useState('')
  const [swapItem, setSwapItem] = useState<UserItem | null>(null)

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

  const handleUseItem = (item: UserItem) => {
    const usage = detectUsage(item.itemName)
    if (!usage) return
    if (usage === 'extend') {
      extendMutation.mutate()
      return
    }
    if (usage === 'penalty') {
      penaltyMutation.mutate()
      return
    }
    if (usage === 'swap') {
      setSwapItem(item)
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
        setSwapItem(null)
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
              {me.lentExpiredAt && (
                <Text fontSize="sm" color={textMuted}>
                  만료 예정: {formatDate(me.lentExpiredAt)}
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
                <Button
                  variant="outline"
                  flex={1}
                  onClick={() =>
                    buyMutation.mutate(STORE_ITEM_IDS.RENT, {
                      onSettled: () => void 0,
                    })
                  }
                  isLoading={buyMutation.isPending}
                >
                  대여권 구매
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
                description="스토어에서 대여권/연장권을 구매해 보세요."
              />
            ) : (
              <Stack spacing={3}>
                {me.myItems.map((item) => {
                  const usage = detectUsage(item.itemName)
                  return (
                    <Box
                      key={item.itemHistoryId}
                      borderWidth={1}
                      borderRadius="lg"
                      p={4}
                      borderColor={borderColor}
                      bg={itemBg}
                    >
                      <Stack spacing={1}>
                        <Text fontWeight="bold">{item.itemName}</Text>
                        <Text fontSize="xs" color={textMuted}>
                          구매일: {formatDate(item.purchaseAt)}
                        </Text>
                        <Button
                          mt={2}
                          size="sm"
                          colorScheme="brand"
                          onClick={() => handleUseItem(item)}
                          isDisabled={!usage || (!hasLocker && usage !== 'penalty')}
                          isLoading={
                            (usage === 'extend' && extendMutation.isPending) ||
                            (usage === 'penalty' && penaltyMutation.isPending) ||
                            (usage === 'swap' && swapMutation.isPending && swapItem?.itemHistoryId === item.itemHistoryId)
                          }
                        >
                          {usage ? '사용' : '사용 불가'}
                        </Button>
                      </Stack>
                    </Box>
                  )
                })}
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
          setSwapItem(null)
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
                setSwapItem(null)
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
