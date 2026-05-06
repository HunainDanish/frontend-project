'use client'

import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProjectModal } from '@/components/project-modal'
import Link from 'next/link'
import { MoreVertical, Folder, Trash2, Edit2, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    create,
    update,
    delete: deleteProject,
  } = useProjects()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  const handleCreate = async (data: any) => {
    try {
      await create(data)
      toast.success('Project created successfully')
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project')
    }
  }

  const handleUpdate = async (data: any) => {
    try {
      await update({
        id: editingProject._id,
        ...data,
      })
      toast.success('Project updated successfully')
      setEditingProject(null)
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
        toast.success('Project deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete project')
      }
    }
  }

  const handleOpenModal = (project?: any) => {
    if (project) {
      setEditingProject(project)
    } else {
      setEditingProject(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and tasks</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project._id} className="p-6 hover:shadow-lg transition-shadow">
              <Link href={`/projects/${project._id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                      <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenModal(project)
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(project._id)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Link>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              )}

              <div className="text-xs text-muted-foreground">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first project to get started organizing your tasks
          </p>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </Card>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingProject ? handleUpdate : handleCreate}
        dialogTitle={editingProject ? 'Edit Project' : 'Create New Project'}
        initialData={editingProject}
      />
    </div>
  )
}
