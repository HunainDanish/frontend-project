'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export interface Project {
  _id: string
  title: string
  description?: string
  color?: string
  owner: any
  members: any[]
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

const queryKey = ['projects']

export function useProjects() {
  const queryClient = useQueryClient()

  // Fetch all projects
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res: any = await apiClient.get('/projects')
      // Backend returns { success: true, count, projects }
      return res.projects || []
    },
    staleTime: 1000 * 60 * 5,
  })

  // Create project
  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; color?: string }) =>
      apiClient.post('/projects', data),
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: Project[] | undefined) => [
        ...(old || []),
        {
          _id: `temp-${Date.now()}`,
          title: newProject.title,
          description: newProject.description,
          color: newProject.color,
          owner: {},
          members: [],
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Update project
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; description?: string; color?: string; isArchived?: boolean }) =>
      apiClient.put(`/projects/${data.id}`, {
        title: data.title,
        description: data.description,
        color: data.color,
        isArchived: data.isArchived,
      }),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: Project[] | undefined) =>
        old?.map(p => p._id === updated.id ? { ...p, ...updated } : p)
      )
      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Delete project
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => apiClient.delete(`/projects/${projectId}`),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: Project[] | undefined) =>
        old?.filter(p => p._id !== projectId)
      )
      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Add member to project
  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      apiClient.post(`/projects/${projectId}/members`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Remove member from project
  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      apiClient.delete(`/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
  }
}

// Fetch single project
export function useProject(projectId: string | undefined) {
  const query = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null
      const res: any = await apiClient.get(`/projects/${projectId}`)
      return res.project
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    project: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }
}
