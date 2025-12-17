import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react'

interface LockerMapPlaceholderProps {
  description: string
}

const statusLegend = [
  { label: 'Available', color: 'green.300' },
  { label: 'Occupied', color: 'orange.300' },
  { label: 'Maintenance', color: 'red.300' },
]

export const LockerMapPlaceholder = ({ description }: LockerMapPlaceholderProps) => {
  return (
    <Stack spacing={4} w="full">
      <Heading size="sm">락커 맵</Heading>
      <Box
        borderRadius="lg"
        borderWidth={1}
        borderStyle="dashed"
        borderColor="gray.300"
        bgGradient="linear(to-br, white, gray.50)"
        minH={{ base: '220px', md: '320px' }}
        p={4}
      >
        <Text fontSize="sm" color="gray.500">
          {description}
        </Text>
      </Box>
      <HStack spacing={4} flexWrap="wrap">
        {statusLegend.map((item) => (
          <HStack key={item.label} spacing={2}>
            <Box w={3} h={3} borderRadius="full" bg={item.color} />
            <Text fontSize="sm" color="gray.600">
              {item.label}
            </Text>
          </HStack>
        ))}
      </HStack>
    </Stack>
  )
}
