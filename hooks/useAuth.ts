import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import {
  getAuthToken,
  setAuthToken,
  setAuthUser,
  getAuthUser,
  clearAuthData,
} from '@/lib/storage'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  hasCheckedAuth: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const queryKey = ['auth']

export function useAuth(): AuthContextType {
  const queryClient = useQueryClient()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const token = getAuthToken()

  // Fetch user only if token exists
  const { data: user, isLoading: isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!token) return null
      try {
        const res: any = await apiClient.get('/auth/me')
        // res is already data thanks to axios interceptor
        setAuthUser(res.user)
        return res.user
      } catch (error) {
        clearAuthData()
        throw error
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mark that auth check has completed
  useEffect(() => {
    if (!token || !isFetching) {
      setHasCheckedAuth(true)
    }
  }, [token, isFetching])

  // If no token on mount, immediately mark as checked
  useEffect(() => {
    if (!token) {
      setHasCheckedAuth(true)
    }
  }, [token])

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res: any = await apiClient.post('/auth/login', credentials)
      // res has token and user
      return res
    },
    onSuccess: (res) => {
      setAuthToken(res.token)
      setAuthUser(res.user)
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      password: string
    }) => {
      const res: any = await apiClient.post('/auth/register', data)
      // res has token and user
      return res
    },
    onSuccess: (res) => {
      setAuthToken(res.token)
      setAuthUser(res.user)
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const logout = () => {
    clearAuthData()
    // Invalidate all queries
    queryClient.invalidateQueries({ queryKey: ['auth'] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  return {
    user: user || getAuthUser(),
    token,
    isLoading: isFetching,
    hasCheckedAuth,
    login: async (email, password) => {
      const res = await loginMutation.mutateAsync({ email, password })
      return res
    },
    register: async (name, email, password) => {
      const res = await registerMutation.mutateAsync({ name, email, password })
      return res
    },
    logout,
  }
}
