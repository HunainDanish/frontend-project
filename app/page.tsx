'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/spinner'

export default function Home() {
  const router = useRouter()
  const { user, token, hasCheckedAuth, isLoading } = useAuth()

  useEffect(() => {
    if (hasCheckedAuth && !isLoading) {
      if (user && token) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [hasCheckedAuth, isLoading, user, token, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  )
}
