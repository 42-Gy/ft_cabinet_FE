import { Spinner, Stack, Text, useColorModeValue } from '@chakra-ui/react'

interface LoadingStateProps {
  label?: string
}

export const LoadingState = ({ label = '데이터를 불러오는 중입니다.' }: LoadingStateProps) => {
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Stack spacing={3} align="center" py={10} w="full">
      <Spinner size="lg" color="brand.500" thickness="4px" />
      <Text color={textColor} fontSize="sm">
        {label}
      </Text>
    </Stack>
  )
}
