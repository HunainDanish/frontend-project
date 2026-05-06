'use client'

import { useAuth } from '@/hooks/useAuth'
import { useProjects, Project } from '@/hooks/useProjects'
import { useTaskStats } from '@/hooks/useTaskStats'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Clock, ListTodo, FolderOpen } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects, isLoading: projectsLoading } = useProjects()
  const { stats } = useTaskStats()

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900',
    },
    {
      title: 'Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.name || user?.email}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your tasks and projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 3).map((project: Project, i: number) => (
                <Link
                  key={project._id || i}
                  href={`/projects/${project._id}`}
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium">{project.title}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">No projects yet</p>
              <Link href="/projects">
                <Button size="sm">Create Your First Project</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/projects">
              <Button className="w-full" variant="outline">
                View All Projects
              </Button>
            </Link>
            <Link href="/tasks">
              <Button className="w-full" variant="outline">
                View All Tasks
              </Button>
            </Link>
            <Link href="/projects">
              <Button className="w-full">Create New Project</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
