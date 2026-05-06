'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/hooks/useTasks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface KanbanCardProps {
  task: Task
  onDelete: (taskId: string) => Promise<void>
}

export function KanbanCard({ task, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task._id,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityColor = () => {
    const priority = task.priority?.toLowerCase()
    switch (priority) {
      case 'low':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      case 'medium':
        return 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'high':
        return 'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'urgent':
        return 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true)
      try {
        await onDelete(task._id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-xl' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium break-words">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 break-words">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {task.priority && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor()}`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
