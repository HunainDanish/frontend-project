'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useTasks } from '@/hooks/useTasks'
import { useProject } from '@/hooks/useProject'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { TaskModal } from '@/components/task-modal'
import { KanbanBoard } from '@/components/kanban-board'
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { ProjectModal } from '@/components/project-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { update: updateProject, delete: deleteProject } = useProjects()
  const { project, isLoading: projectLoading, error: projectError } = useProject(resolvedParams.id)
  const { tasks, grouped, isLoading, create, updateStatus, delete: deleteTask } = useTasks(resolvedParams.id)

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const handleCreateTask = async (data: any) => {
    try {
      await create(data)
      toast.success('Task created successfully')
      setIsTaskModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task')
    }
  }

  const handleUpdateProject = async (data: any) => {
    try {
      await updateProject({
        id: resolvedParams.id,
        ...data,
      })
      toast.success('Project updated successfully')
      setIsProjectModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project')
    }
  }

  const handleDeleteProject = async () => {
    if (confirm('Are you sure you want to delete this project? This will delete all associated tasks.')) {
      try {
        await deleteProject(resolvedParams.id)
        toast.success('Project deleted successfully')
        router.push('/projects')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete project')
      }
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateStatus({ id: taskId, status })
      toast.success('Task updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task')
    }
  }

  if (projectLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (!project || projectError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <p className="text-muted-foreground">
          {projectError ? `Error: ${projectError.message}` : 'Project not found'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      {project && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-2">{project.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsProjectModalOpen(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteProject}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsTaskModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <KanbanBoard
        tasks={grouped}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        isLoading={isLoading}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        dialogTitle="Create New Task"
        projectId={resolvedParams.id}
      />

      {project && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSubmit={handleUpdateProject}
          dialogTitle="Edit Project"
          initialData={{
            title: project.title,
            description: project.description,
            color: project.color,
          }}
        />
      )}
    </div>
  )
}
