import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import type { ReactElement } from 'react'

type RouteConfig = {
  path: string
  element: ReactElement
  protected?: boolean
}

function PrivateRoute({ element }: { element: ReactElement }): ReactElement {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/login'
    return <></>
  }
  return element
}

const routes: RouteConfig[] = [
  { path: '/', element: <LoginPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/home', element: <HomePage />, protected: true },
]

export function AppRoutes() {
  const pathname = window.location.pathname
  const matchedRoute = routes.find((route) => route.path === pathname)

  if (!matchedRoute) {
    return <NotFoundPage />
  }

  if (matchedRoute.protected) {
    return <PrivateRoute element={matchedRoute.element} />
  }

  return matchedRoute.element
}
