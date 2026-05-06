'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { Project } from './useProjects'

export function useProject(projectId: string | undefined) {
  const query = useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<Project> => {
      if (!projectId) throw new Error('Project ID is required')
      const res: any = await apiClient.get(`/projects/${projectId}`)
      // Backend returns { success: true, project }
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
