'use client'

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Task } from '@/hooks/useTasks'
import { KanbanColumn } from './kanban-column'

interface KanbanBoardProps {
  tasks: {
    'To Do': Task[]
    'In Progress': Task[]
    'Done': Task[]
  }
  onStatusChange: (taskId: string, status: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  isLoading?: boolean
}

const columns = [
  { id: 'To Do', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'Done', title: 'Done', color: 'bg-green-100 dark:bg-green-900' },
]

export function KanbanBoard({
  tasks,
  onStatusChange,
  onDelete,
  isLoading,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string

    // Find the task to get its current status
    let currentStatus: string | null = null
    for (const [status, taskList] of Object.entries(tasks)) {
      if (taskList.find((t) => t._id === taskId)) {
        currentStatus = status
        break
      }
    }

    if (!currentStatus || currentStatus === newStatus) return

    // Call the status change handler
    await onStatusChange(taskId, newStatus)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">{col.title}</h3>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks[column.id as keyof typeof tasks] || []
          const taskIds = columnTasks.map((t) => t._id)

          return (
            <div key={column.id} className={`${column.color} rounded-lg p-4 min-h-96`}>
              <h3 className="font-semibold text-sm mb-4">{column.title}</h3>
              <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  columnId={column.id}
                  tasks={columnTasks}
                  onDelete={onDelete}
                />
              </SortableContext>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}
