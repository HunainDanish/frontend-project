import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export interface Subtask {
  _id: string
  title: string
  completed: boolean
  completedBy?: any
  completedAt?: string
}

export interface Comment {
  _id: string
  text: string
  author: any
  mentions?: any[]
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  _id: string
  filename: string
  url: string
  uploadedBy?: any
  uploadedAt: string
}

export interface Activity {
  _id: string
  user: any
  action: string
  details?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  progressPercentage: number
  subtasks: Subtask[]
  estimatedHours?: number
  actualHours: number
  watchers: any[]
  activityLog: Activity[]
  lastActivityAt: string
  deadline?: string
  project: any
  createdBy: any
  assignedTo: any[]
  tags: string[]
  comments: Comment[]
  attachments: Attachment[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TasksResponse {
  count: number
  tasks: Task[]
  grouped: {
    'To Do': Task[]
    'In Progress': Task[]
    'Done': Task[]
  }
}

const queryKey = ['tasks']

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient()
  const qKey = projectId ? [...queryKey, projectId] : queryKey

  const query = useQuery({
    queryKey: qKey,
    queryFn: async (): Promise<TasksResponse> => {
      if (!projectId) {
        return {
          count: 0,
          tasks: [],
          grouped: { 'To Do': [], 'In Progress': [], 'Done': [] },
        }
      }
      const res: any = await apiClient.get(`/tasks?projectId=${projectId}`)
      // Backend returns { success: true, count, tasks, grouped }
      return {
        count: res.count || 0,
        tasks: res.tasks || [],
        grouped: res.grouped || { 'To Do': [], 'In Progress': [], 'Done': [] },
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      status?: string
      priority?: string
      deadline?: string
      assignedTo?: string[]
      tags?: string[]
    }) => apiClient.post('/tasks', { ...data, projectId }),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData(qKey)

      queryClient.setQueryData(qKey, (old: TasksResponse | undefined) => {
        if (!old) return old

        const tempId = `temp-${Date.now()}`
        const status = (newTask.status || 'To Do') as 'To Do' | 'In Progress' | 'Done'
        const newTaskObj: Task = {
          _id: tempId,
          title: newTask.title,
          description: newTask.description,
          status,
          priority: (newTask.priority as any) || 'Medium',
          progressPercentage: 0,
          subtasks: [],
          actualHours: 0,
          watchers: [],
          activityLog: [],
          lastActivityAt: new Date().toISOString(),
          deadline: newTask.deadline,
          project: projectId || '',
          createdBy: {},
          assignedTo: [],
          tags: newTask.tags || [],
          comments: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return {
          count: old.count + 1,
          tasks: [...old.tasks, newTaskObj],
          grouped: {
            ...old.grouped,
            [status]: [...old.grouped[status], newTaskObj],
          },
        }
      })

      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string
      title?: string
      description?: string
      priority?: string
      deadline?: string
      assignedTo?: string[]
      tags?: string[]
    }) =>
      apiClient.put(`/tasks/${data.id}`, data),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData(qKey)

      queryClient.setQueryData(qKey, (old: TasksResponse | undefined) => {
        if (!old) return old

        const updatedTasks = old.tasks.map((t) =>
          t._id === updated.id ? { ...t, ...updated } as Task : t
        )

        return {
          count: old.count,
          tasks: updatedTasks,
          grouped: regroupTasks(updatedTasks),
        }
      })

      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  const statusMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) =>
      apiClient.patch(`/tasks/${data.id}/status`, { status: data.status }),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData(qKey)

      queryClient.setQueryData(qKey, (old: TasksResponse | undefined) => {
        if (!old) return old

        const updatedTasks = old.tasks.map((t) =>
          t._id === updated.id
            ? { ...t, status: updated.status as 'To Do' | 'In Progress' | 'Done' }
            : t
        )

        return {
          count: old.count,
          tasks: updatedTasks,
          grouped: regroupTasks(updatedTasks),
        }
      })

      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qKey })
      const previous = queryClient.getQueryData(qKey)

      queryClient.setQueryData(qKey, (old: TasksResponse | undefined) => {
        if (!old) return old

        const updatedTasks = old.tasks.filter((t) => t._id !== id)

        return {
          count: old.count - 1,
          tasks: updatedTasks,
          grouped: regroupTasks(updatedTasks),
        }
      })

      return { previous }
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qKey, context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: (data: { taskId: string; text: string; mentions?: string[] }) =>
      apiClient.post(`/tasks/${data.taskId}/comments`, {
        text: data.text,
        mentions: data.mentions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  return {
    tasks: query.data?.tasks || [],
    grouped: query.data?.grouped || { 'To Do': [], 'In Progress': [], 'Done': [] },
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    addComment: addCommentMutation.mutateAsync,
  }
}

// Fetch single task
export function useTask(taskId: string | undefined) {
  const query = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null
      const res: any = await apiClient.get(`/tasks/${taskId}`)
      return res.task
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    task: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }
}

// Helper to regroup tasks by status
function regroupTasks(tasks: Task[]) {
  return {
    'To Do': tasks.filter((t) => t.status === 'To Do'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    'Done': tasks.filter((t) => t.status === 'Done'),
  }
}
