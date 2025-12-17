import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { appRoutes } from '@/app/router/routes'

const router = createBrowserRouter(appRoutes)

export const AppRouter = () => <RouterProvider router={router} />
