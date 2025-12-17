import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'

export const useAuthBootstrap = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { setToken } = useAuthToken()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (!token) return

    setToken(token)
    params.delete('token')
    const nextSearch = params.toString()
    navigate({ pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' }, { replace: true })
  }, [location.pathname, location.search, navigate, setToken])
}
