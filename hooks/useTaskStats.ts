'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { useProjects, Project } from './useProjects'

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  todo: number
}

const queryKey = ['taskStats']

function transformBackendStats(statsData: any): TaskStats {
  if (!statsData || !statsData.byStatus) {
    return { total: 0, completed: 0, inProgress: 0, todo: 0 }
  }
  
  let todo = 0
  let inProgress = 0
  let completed = 0

  statsData.byStatus.forEach((stat: { _id: string, count: number }) => {
    if (stat._id === 'To Do') todo += stat.count
    if (stat._id === 'In Progress') inProgress += stat.count
    if (stat._id === 'Done') completed += stat.count
  })

  return {
    total: todo + inProgress + completed,
    completed,
    inProgress,
    todo
  }
}

export function useTaskStats(projectId?: string) {
  const { projects } = useProjects()

  const query = useQuery({
    queryKey: projectId ? [...queryKey, projectId] : [...queryKey, 'all', projects?.map((p: Project) => p._id).join(',')],
    queryFn: async (): Promise<TaskStats> => {
      if (projectId) {
        const res: any = await apiClient.get(`/tasks/stats?projectId=${projectId}`)
        return transformBackendStats(res.stats)
      } else {
        if (!projects || projects.length === 0) {
          return { total: 0, completed: 0, inProgress: 0, todo: 0 }
        }
        const promises = projects.map((p: Project) => apiClient.get(`/tasks/stats?projectId=${p._id}`))
        const results = await Promise.all(promises)
        
        return results.reduce((acc, res: any) => {
          const s = transformBackendStats(res.stats)
          return {
            total: acc.total + s.total,
            completed: acc.completed + s.completed,
            inProgress: acc.inProgress + s.inProgress,
            todo: acc.todo + s.todo,
          }
        }, { total: 0, completed: 0, inProgress: 0, todo: 0 })
      }
    },
    enabled: !!projectId || !!projects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    stats: query.data || { total: 0, completed: 0, inProgress: 0, todo: 0 },
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }
}
