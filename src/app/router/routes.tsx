import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '@/components/templates/AppLayout'
import { HomePage } from '@/app/routes/HomePage'
import { LockersPage } from '@/app/routes/LockersPage'
import { MyLockersPage } from '@/app/routes/MyLockersPage'
import { PolicyPage } from '@/app/routes/PolicyPage'
import { AttendancePage } from '@/app/routes/AttendancePage'
import { StorePage } from '@/app/routes/StorePage'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { AdminPage } from '@/app/routes/AdminPage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'lockers', element: <LockersPage /> },
      { path: 'my/lockers', element: <MyLockersPage /> },
      { path: 'store', element: <StorePage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'policy', element: <PolicyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
