import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { queryClient } from '@/libs/query/queryClient'
import { theme } from '@/styles/theme'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'

interface AppProvidersProps {
  children: ReactNode
}

const MePrefetcher = () => {
  useMeQuery()
  return null
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ChakraProvider theme={theme} resetCSS>
      <QueryClientProvider client={queryClient}>
        <MePrefetcher />
        {children}
      </QueryClientProvider>
    </ChakraProvider>
  )
}
