import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Cabinet } from '@/types/locker'

interface LockerSectionMapProps {
  lockers: Cabinet[]
  selectedLockerNumber?: number | null
  onSelect?: (locker: Cabinet) => void
}

const colorByStatus: Record<Cabinet['status'], { bg: string; color: string }> = {
  AVAILABLE: { bg: 'gray.100', color: 'gray.800' },
  FULL: { bg: 'orange.200', color: 'orange.900' },
  BROKEN: { bg: 'red.200', color: 'red.900' },
  OVERDUE: { bg: 'purple.200', color: 'purple.900' },
  DISABLED: { bg: 'gray.300', color: 'gray.600' },
}

export const LockerSectionMap = ({ lockers, selectedLockerNumber, onSelect }: LockerSectionMapProps) => {
  const handleSelect = (locker: Cabinet) => {
    if (!onSelect) return
    if (locker.status !== 'AVAILABLE') return
    onSelect(locker)
  }

  return (
    <Stack spacing={4} w="full">
      <SimpleGrid columns={{ base: 6, sm: 8, md: 10 }} spacing={2}>
        {lockers.map((locker) => {
          const color = colorByStatus[locker.status]
          const isSelected = selectedLockerNumber === locker.visibleNum

          return (
            <Button
              key={locker.cabinetId}
              variant="solid"
              size="sm"
              borderRadius="md"
              height="36px"
              fontSize="xs"
              bg={isSelected ? 'brand.500' : color.bg}
              color={isSelected ? 'white' : color.color}
              _hover={{ opacity: locker.status === 'AVAILABLE' ? 0.9 : 1 }}
              _active={{ opacity: locker.status === 'AVAILABLE' ? 0.8 : 1 }}
              disabled={locker.status !== 'AVAILABLE'}
              onClick={() => handleSelect(locker)}
            >
              {locker.visibleNum}
            </Button>
          )
        })}
      </SimpleGrid>

      <HStack spacing={4} flexWrap="wrap" fontSize="sm" color="gray.600">
        <Legend color="gray.300" label="대여 가능" />
        <Legend color="orange.300" label="사용 중" />
        <Legend color="red.300" label="점검" />
        <Legend color="purple.300" label="연체" />
        <Legend color="gray.500" label="비활성" />
      </HStack>
    </Stack>
  )
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <HStack spacing={2}>
    <Box w={3} h={3} borderRadius="md" bg={color} />
    <Text>{label}</Text>
  </HStack>
)
