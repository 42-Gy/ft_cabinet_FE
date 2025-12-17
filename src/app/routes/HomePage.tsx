import { Badge, Box, Button, Text, VStack } from '@chakra-ui/react'
import { AdminDashboard } from '@/features/status/components/AdminDashboard'

export const HomePage = () => (
  <VStack spacing={10} w="full">
    <Box
      w="full"
      borderRadius="3xl"
      borderWidth={1}
      borderColor="whiteAlpha.200"
      bgImage="url('/waterback.jpg')"
      bgSize="cover"
      bgPos="center 40%"
      bgRepeat="no-repeat"
      p={{ base: 10, md: 16 }}
      color="white"
      shadow="xl"
      position="relative"
      minH={{ base: '320px', md: '420px' }}
    >
      <VStack align="flex-start" spacing={4} maxW="960px">
        <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
          SUBAK Stories
        </Badge>
        <Text fontSize={{ base: '3.25rem', md: '4.5rem' }} fontWeight="black" lineHeight={1.05}>
          무거운 짐은 이제 그만 수박에게 맡기세요
        </Text>
        <Text fontSize="2xl">Safer Under Beside of you, Always Keeping</Text>
      </VStack>
      <Button
        colorScheme="brand"
        size="lg"
        as="a"
        href="/lockers"
        position="absolute"
        bottom={{ base: 6, md: 8 }}
        right={{ base: 6, md: 10 }}
      >
        바로 대여하러 가기
      </Button>
    </Box>

    <AdminDashboard />
  </VStack>
)
