import { ColorModeScript } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { AppProviders } from '@/app/providers/AppProviders'
import { tokenStore } from '@/libs/auth/tokenStore'
import { theme } from '@/styles/theme'
import '@/styles/global.css'

const bootstrapToken = () => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const token = url.searchParams.get('token')
  if (token) {
    tokenStore.set(token)
    url.searchParams.delete('token')
    const nextUrl = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState({}, '', nextUrl)
  }
}

bootstrapToken()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
