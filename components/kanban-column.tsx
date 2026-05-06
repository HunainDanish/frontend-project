'use client'

import { useDroppable } from '@dnd-kit/core'
import { Task } from '@/hooks/useTasks'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  columnId: string
  tasks: Task[]
  onDelete: (taskId: string) => Promise<void>
}

export function KanbanColumn({
  columnId,
  tasks,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: columnId,
  })

  return (
    <div
      ref={setNodeRef}
      className="space-y-2"
    >
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <KanbanCard
            key={task._id}
            task={task}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tasks
        </div>
      )}
    </div>
  )
}
