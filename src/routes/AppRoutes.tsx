import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import type { ReactElement } from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'

type RouteConfig = {
  path: string
  element: ReactElement
  protected?: boolean
  guestOnly?: boolean
}

function PrivateRoute({ element }: { element: ReactElement }): ReactElement {
  const token = localStorage.getItem('accessToken')

  useLayoutEffect(() => {
    if (!token) {
      window.location.replace('/login')
    }
  }, [token])

  if (!token) {
    return <></>
  }
  return element
}

function GuestRoute({ element }: { element: ReactElement }): ReactElement {
  const token = localStorage.getItem('accessToken')

  useLayoutEffect(() => {
    if (token) {
      window.location.replace('/home')
    }
  }, [token])

  if (token) {
    return <></>
  }
  return element
}

const routes: RouteConfig[] = [
  { path: '/', element: <LoginPage />, guestOnly: true },
  { path: '/login', element: <LoginPage />, guestOnly: true },
  { path: '/signup', element: <SignupPage />, guestOnly: true },
  { path: '/home', element: <HomePage />, protected: true },
]

export function AppRoutes() {
  const [pathname, setPathname] = useState(
    () => window.location.pathname.replace(/\/+$/, '') || '/'
  )

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname.replace(/\/+$/, '') || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const matchedRoute = routes.find((route) => route.path === pathname)

  if (!matchedRoute) {
    return <NotFoundPage />
  }

  if (matchedRoute.protected) {
    return <PrivateRoute element={matchedRoute.element} />
  }

  if (matchedRoute.guestOnly) {
    return <GuestRoute element={matchedRoute.element} />
  }

  return matchedRoute.element
}
