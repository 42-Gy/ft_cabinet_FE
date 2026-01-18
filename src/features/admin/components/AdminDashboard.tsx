import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import {
  useAdminDashboardQuery,
  useAdminUserQuery,
  useCabinetForceReturnMutation,
  useCabinetStatusMutation,
  useCoinProvideMutation,
  useLogtimeUpdateMutation,
} from '@/features/admin/hooks/useAdminDashboard'
import type { CabinetLentType, CabinetStatusValue } from '@/features/admin/types'

const cabinetStatusOptions: CabinetStatusValue[] = ['AVAILABLE', 'BROKEN', 'FULL', 'OVERDUE']
const cabinetLentTypeOptions: CabinetLentType[] = ['PRIVATE', 'SHARE', 'CLUB']

export const AdminDashboard = () => {
  const statsQuery = useAdminDashboardQuery()
  const [nameInput, setNameInput] = useState('')
  const [searchedName, setSearchedName] = useState<string | undefined>(undefined)
  const userQuery = useAdminUserQuery(searchedName)
  const coinMutation = useCoinProvideMutation()
  const logtimeMutation = useLogtimeUpdateMutation()
  const cabinetStatusMutation = useCabinetStatusMutation()
  const forceReturnMutation = useCabinetForceReturnMutation()
  const [coinAmount, setCoinAmount] = useState('100')
  const [coinReason, setCoinReason] = useState('관리자 지급')
  const [logtimeValue, setLogtimeValue] = useState('0')
  const [cabinetNumInput, setCabinetNumInput] = useState('')
  const [cabinetStatus, setCabinetStatus] = useState<CabinetStatusValue>('AVAILABLE')
  const [cabinetLentType, setCabinetLentType] = useState<CabinetLentType>('PRIVATE')
  const [cabinetNote, setCabinetNote] = useState('')

  const highlightBg = useColorModeValue('white', 'gray.800')
  const highlightBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const mutedText = useColorModeValue('gray.500', 'gray.400')

  const handleUserSearch = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setSearchedName(trimmed)
  }

  const userData = userQuery.data
  const cabinetNumber = Number(cabinetNumInput)
  const isCabinetNumberValid = !Number.isNaN(cabinetNumber) && cabinetNumber > 0

  const dashboardCards = useMemo(() => {
    if (!statsQuery.data) return []
    const stats = statsQuery.data
    return [
      { label: '전체 유저', value: stats.totalUserCount.toLocaleString() },
      { label: '전체 사물함', value: stats.totalCabinetCount.toLocaleString() },
      { label: '대여 중', value: stats.activeLentCount.toLocaleString() },
      { label: '점검 중', value: stats.brokenCabinetCount.toLocaleString() },
      { label: '패널티 유저', value: stats.bannedUserCount.toLocaleString() },
    ]
  }, [statsQuery.data])

  return (
    <Stack spacing={10}>
      <PageHeader
        title="SUBAK 관리자 콘솔"
        description="사물함과 사용자 상태를 통합 관리하는 대시보드입니다."
      />

      <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          핵심 통계
        </Text>
        {statsQuery.isLoading ? (
          <LoadingState label="관리자 통계를 불러오는 중입니다." />
        ) : statsQuery.isError ? (
          <ErrorState onRetry={statsQuery.refetch} />
        ) : !dashboardCards.length ? (
          <EmptyState title="표시할 통계가 없습니다" description="잠시 후 다시 시도해 주세요." />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {dashboardCards.map((card) => (
              <Box key={card.label} borderWidth={1} borderRadius="lg" p={4}>
                <Text fontSize="sm" color={mutedText}>
                  {card.label}
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {card.value}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
        <Stack spacing={4}>
          <Text fontSize="lg" fontWeight="bold">
            사용자 관리
          </Text>
          <form onSubmit={handleUserSearch}>
            <FormControl>
              <FormLabel>인트라 ID로 검색</FormLabel>
              <HStack spacing={3}>
                <Input
                  placeholder="예: seonghan"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                />
                <Button type="submit" colorScheme="brand" isLoading={userQuery.isFetching}>
                  조회
                </Button>
              </HStack>
            </FormControl>
          </form>
          {userQuery.isError && (
            <ErrorState onRetry={userQuery.refetch} description="사용자 정보를 찾을 수 없습니다." />
          )}
          {!searchedName ? (
            <EmptyState
              title="검색이 필요합니다"
              description="인트라 ID를 입력하고 조회 버튼을 눌러 주세요."
            />
          ) : userQuery.isLoading ? (
            <LoadingState label="사용자 정보를 불러오는 중입니다." />
          ) : userData ? (
            <Stack spacing={4} borderWidth={1} borderRadius="lg" p={4}>
              <Stack spacing={1}>
                <Text fontSize="xl" fontWeight="bold">
                  {userData.name}
                </Text>
                <Text color={mutedText}>{userData.email}</Text>
              </Stack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem label="코인" value={`${userData.coin.toLocaleString()} 개`} />
                <InfoItem label="패널티 일수" value={`${userData.penaltyDays} 일`} />
                <InfoItem label="이번 달 학습 시간" value={`${userData.monthlyLogtime} 분`} />
                <InfoItem
                  label="대여 중 사물함"
                  value={
                    userData.visibleNum
                      ? `#${userData.visibleNum}${userData.section ? ` (${userData.section})` : ''}`
                      : '없음'
                  }
                />
              </SimpleGrid>
              <Divider />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>코인 지급</FormLabel>
                  <Stack spacing={2}>
                    <NumberInput value={coinAmount} min={1} onChange={(value) => setCoinAmount(value)}>
                      <NumberInputField placeholder="지급 코인" />
                    </NumberInput>
                    <Textarea
                      placeholder="지급 사유"
                      value={coinReason}
                      onChange={(event) => setCoinReason(event.target.value)}
                    />
                    <Button
                      colorScheme="green"
                      isLoading={coinMutation.isPending}
                      onClick={() =>
                        coinMutation.mutate(
                          {
                            name: userData.name,
                            payload: { amount: Number(coinAmount), reason: coinReason },
                          },
                          { onSuccess: () => userQuery.refetch() },
                        )
                      }
                    >
                      코인 지급
                    </Button>
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>이번 달 학습 시간 수정 (분)</FormLabel>
                  <Stack spacing={2}>
                    <NumberInput
                      value={logtimeValue}
                      min={0}
                      onChange={(value) => setLogtimeValue(value)}
                    >
                      <NumberInputField placeholder="예: 1200" />
                    </NumberInput>
                    <Button
                      variant="outline"
                      colorScheme="brand"
                      isLoading={logtimeMutation.isPending}
                      onClick={() =>
                        logtimeMutation.mutate(
                          {
                            name: userData.name,
                            payload: { monthlyLogtime: Number(logtimeValue) },
                          },
                          { onSuccess: () => userQuery.refetch() },
                        )
                      }
                    >
                      학습 시간 수정
                    </Button>
                  </Stack>
                </FormControl>
              </SimpleGrid>
            </Stack>
          ) : null}
        </Stack>
      </Box>

      <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
        <Stack spacing={4}>
          <Text fontSize="lg" fontWeight="bold">
            사물함 관리
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>사물함 번호</FormLabel>
              <NumberInput value={cabinetNumInput} min={1} onChange={(value) => setCabinetNumInput(value)}>
                <NumberInputField placeholder="예: 1001" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>상태</FormLabel>
              <Select
                value={cabinetStatus}
                onChange={(event) => setCabinetStatus(event.target.value as CabinetStatusValue)}
              >
                {cabinetStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>대여 타입</FormLabel>
              <Select
                value={cabinetLentType}
                onChange={(event) => setCabinetLentType(event.target.value as CabinetLentType)}
              >
                {cabinetLentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>메모</FormLabel>
              <Textarea
                placeholder="상태 메모"
                value={cabinetNote}
                onChange={(event) => setCabinetNote(event.target.value)}
              />
            </FormControl>
          </SimpleGrid>
          <HStack spacing={3}>
            <Button
              colorScheme="brand"
              isDisabled={!isCabinetNumberValid}
              isLoading={cabinetStatusMutation.isPending}
              onClick={() =>
                isCabinetNumberValid &&
                cabinetStatusMutation.mutate({
                  visibleNum: cabinetNumber,
                  payload: {
                    status: cabinetStatus,
                    lentType: cabinetLentType,
                    statusNote: cabinetNote,
                  },
                })
              }
            >
              사물함 상태 변경
            </Button>
            <Button
              variant="outline"
              colorScheme="red"
              isDisabled={!isCabinetNumberValid}
              isLoading={forceReturnMutation.isPending}
              onClick={() => isCabinetNumberValid && forceReturnMutation.mutate(cabinetNumber)}
            >
              강제 반납
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Stack>
  )
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text fontWeight="bold">{value}</Text>
  </Box>
)
