import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'

export const useAuthBootstrap = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { setToken } = useAuthToken()

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash
    const params = new URLSearchParams(hash)
    const token = params.get('token')
    if (!token) return

    setToken(token)
    params.delete('token')
    const nextHash = params.toString()
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: nextHash ? `#${nextHash}` : '',
      },
      { replace: true },
    )
  }, [location.hash, location.pathname, location.search, navigate, setToken])
}
