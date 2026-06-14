import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '@/components/templates/AppLayout'
import { HomePage } from '@/app/routes/HomePage'
import { LockersPage } from '@/app/routes/LockersPage'
import { MyLockersPage } from '@/app/routes/MyLockersPage'
import { PolicyPage } from '@/app/routes/PolicyPage'
import { AttendancePage } from '@/app/routes/AttendancePage'
import { StorePage } from '@/app/routes/StorePage'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { AdminGate } from '@/app/routes/AdminGate'
import { AuthCallbackPage } from '@/app/routes/AuthCallbackPage'
import { LoginPage } from '@/app/routes/LoginPage'
import { MaintenancePage } from '@/app/routes/MaintenancePage'
import { SocialLinkCallbackPage } from '@/app/routes/SocialLinkCallbackPage'
import { WatermelonEventPage } from '@/app/routes/WatermelonEventPage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'admin', element: <AdminGate /> },
      { path: 'event', element: <WatermelonEventPage /> },
      { path: 'lockers', element: <LockersPage /> },
      { path: 'my/lockers', element: <MyLockersPage /> },
      { path: 'store', element: <StorePage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'policy', element: <PolicyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
      { path: 'auth/link/callback/:provider', element: <SocialLinkCallbackPage /> },
      { path: 'repair', element: <MaintenancePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
