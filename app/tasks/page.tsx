'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { TaskModal } from '@/components/task-modal'
import { KanbanBoard } from '@/components/kanban-board'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function TasksPage() {
  const { projects } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined)
  const { grouped, isLoading, create, updateStatus, delete: deleteTask } = useTasks(selectedProjectId)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateTask = async (data: any) => {
    try {
      await create(data)
      toast.success('Task created successfully')
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task')
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Organize your tasks in a Kanban board</p>
        </div>
        <Button onClick={() => selectedProjectId && setIsModalOpen(true)} disabled={!selectedProjectId}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="mb-6">
          <label className="text-sm font-medium block mb-2">Select Project</label>
          <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No projects found. Create one first.</p>
        </div>
      )}

      {selectedProjectId && (
        <KanbanBoard
          tasks={grouped}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
          isLoading={isLoading}
        />
      )}

      {selectedProjectId && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
          dialogTitle="Create New Task"
          projectId={selectedProjectId}
        />
      )}
    </div>
  )
}
