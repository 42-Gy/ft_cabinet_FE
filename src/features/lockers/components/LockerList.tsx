import { Badge, Box, Button, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import type { Cabinet } from '@/types/locker'
import { formatDate } from '@/utils/date'

interface LockerListProps {
  lockers: Cabinet[]
  onRent?: (locker: Cabinet) => void
  rentingCabinetNumber?: number | null
  selectedLockerNumber?: number | null
  onSelect?: (locker: Cabinet) => void
}

const colorByStatus: Record<Cabinet['status'], string> = {
  AVAILABLE: 'green',
  FULL: 'orange',
  BROKEN: 'red',
  OVERDUE: 'purple',
  DISABLED: 'gray',
}

export const LockerList = ({
  lockers,
  onRent,
  rentingCabinetNumber,
  selectedLockerNumber,
  onSelect,
}: LockerListProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
      {lockers.map((locker) => {
        const badgeColor = colorByStatus[locker.status] ?? 'gray'
        const badgeLabel = locker.status
        const isSelected = locker.visibleNum === selectedLockerNumber

        return (
          <Box
            key={locker.cabinetId}
            p={4}
            borderWidth={2}
            borderColor={isSelected ? 'brand.400' : 'gray.100'}
            borderRadius="lg"
            bg="white"
            shadow="sm"
          >
            <HStack justify="space-between" mb={2}>
              <Text fontSize="lg" fontWeight="bold">
                #{locker.visibleNum}
              </Text>
              <Badge colorScheme={badgeColor}>{badgeLabel}</Badge>
            </HStack>
            <VStack align="flex-start" spacing={1} fontSize="sm" color="gray.600" mb={3}>
              <Text>층: {locker.floor}F</Text>
              {locker.lentUserName && <Text>사용자: {locker.lentUserName}</Text>}
              {locker.lentStartedAt && <Text>대여 시작: {formatDate(locker.lentStartedAt)}</Text>}
            </VStack>
            {locker.status === 'AVAILABLE' && (
              <HStack spacing={3}>
                {onSelect && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelect(locker)}
                    flex={1}
                    isDisabled={isSelected}
                  >
                    {isSelected ? '선택됨' : '선택'}
                  </Button>
                )}
                {onRent && (
                  <Button
                    size="sm"
                    colorScheme="brand"
                    flex={1}
                    onClick={() => onRent(locker)}
                    isLoading={rentingCabinetNumber === locker.visibleNum}
                  >
                    대여
                  </Button>
                )}
              </HStack>
            )}
          </Box>
        )
      })}
    </SimpleGrid>
  )
}
