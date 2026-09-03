import type { ReactNode } from 'react'

type ProtectedRouteProps = {
  isAuthenticated: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function ProtectedRoute({
  isAuthenticated,
  fallback = <div>Please sign in to continue.</div>,
  children,
}: ProtectedRouteProps) {
  return isAuthenticated ? <>{children}</> : <>{fallback}</>
}
