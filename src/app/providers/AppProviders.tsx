import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { queryClient } from '@/libs/query/queryClient'
import { theme } from '@/styles/theme'
import { AuthTokenProvider } from '@/features/auth/providers/AuthTokenProvider'
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
        <AuthTokenProvider>
          <MePrefetcher />
          {children}
        </AuthTokenProvider>
      </QueryClientProvider>
    </ChakraProvider>
  )
}
