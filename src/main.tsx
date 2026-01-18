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
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
  const token = hashParams.get('token')
  if (token) {
    tokenStore.set(token)
    hashParams.delete('token')
    const nextHash = hashParams.toString()
    const nextUrl = `${url.pathname}${url.search}${nextHash ? `#${nextHash}` : ''}`
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
