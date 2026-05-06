'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/spinner'

export function ProtectRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, hasCheckedAuth, isLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Redirect only happens after:
  // 1. hasCheckedAuth is true (auth check completed)
  // 2. isLoading is false (no ongoing requests)
  // 3. user is null (not authenticated)
  // 4. hasRedirected is false (not already redirected)
  useEffect(() => {
    if (hasCheckedAuth && !isLoading && !user && !hasRedirected) {
      setHasRedirected(true)
      router.replace('/login')
    }
  }, [hasCheckedAuth, isLoading, user, hasRedirected, router])

  // While loading auth, show spinner
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // If user doesn't exist and we haven't redirected yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
