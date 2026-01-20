import { Navigate } from 'react-router-dom'
import { LoadingState } from '@/components/molecules/LoadingState'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import { AdminPage } from '@/app/routes/AdminPage'

export const AdminGate = () => {
  const { data: me, isLoading } = useMeQuery()
  const isAdmin = me?.role === 'ADMIN' || me?.role === 'ROLE_ADMIN' || me?.role === 'MASTER'

  if (isLoading) {
    return <LoadingState label="관리자 권한을 확인하는 중입니다." />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <AdminPage />
}
