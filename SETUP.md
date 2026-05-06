# Task Management System - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:5000`
- pnpm or npm installed

## Installation

1. **Install dependencies:**
```bash
pnpm install
```

2. **Set up environment variables:**

The `.env.local` file is already configured to point to the backend API:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

If your backend is running on a different URL, update this value.

3. **Start the development server:**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Features

### Authentication
- **Login/Register** - Create an account or sign in with existing credentials
- **Session Management** - Automatic token persistence and refresh
- **Protected Routes** - All dashboard pages require authentication

### Projects
- **Create Projects** - Organize tasks into projects
- **Edit Projects** - Update project details and color
- **Delete Projects** - Remove projects and associated tasks
- **Project Members** - Add/remove team members to projects

### Tasks
- **Create Tasks** - Add tasks with title, description, priority, and deadline
- **Edit Tasks** - Modify task details
- **Task Status** - Move tasks between "To Do", "In Progress", and "Done"
- **Kanban Board** - Drag-and-drop task management
- **Task Filtering** - Filter tasks by project, status, and priority
- **Task Comments** - Add comments and mentions to tasks

### Dashboard
- **Overview** - View task statistics and project summary
- **Quick Stats** - See total tasks, completed, in progress, and project count
- **Recent Projects** - Quick access to your latest projects

### Real-Time Data
- **Optimistic Updates** - UI updates instantly while API calls process
- **Smart Caching** - 5-minute cache to reduce unnecessary API calls
- **Error Recovery** - Automatic rollback if operations fail

## API Integration

The frontend communicates with the backend via REST API endpoints:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile
- `PUT /auth/change-password` - Change password

### Projects
- `POST /projects` - Create project
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get single project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/members` - Add member
- `DELETE /projects/:id/members/:userId` - Remove member

### Tasks
- `POST /tasks` - Create task
- `GET /tasks?projectId=xxx` - Get tasks (returns `tasks` and `grouped`)
- `GET /tasks/:id` - Get single task
- `PUT /tasks/:id` - Update task
- `PATCH /tasks/:id/status` - Change task status
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comments` - Add comment
- `GET /tasks/stats` - Get task statistics

### Notifications
- `GET /notifications` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

## Project Structure

```
/app
  /dashboard          - Dashboard overview page
  /login             - Login page
  /register          - Registration page
  /projects          - Projects list page
  /projects/[id]     - Project detail page with Kanban board
  /tasks             - Global tasks page
  /layout.tsx        - Root layout with QueryClientProvider
  /layout-client.tsx - Client-side layout wrapper

/components
  /ui               - shadcn/ui components
  kanban-board.tsx  - Kanban board component
  kanban-column.tsx - Kanban column component
  kanban-card.tsx   - Task card component
  dashboard-header.tsx - Header with user menu
  dashboard-sidebar.tsx - Navigation sidebar
  project-modal.tsx - Create/edit project modal
  task-modal.tsx    - Create/edit task modal
  protect-route.tsx - Authentication guard

/hooks
  useAuth.ts        - Authentication management
  useProjects.ts    - Projects CRUD operations
  useTasks.ts       - Tasks CRUD operations
  useTaskStats.ts   - Task statistics

/lib
  api-client.ts     - Axios instance with interceptors
  api-error.ts      - Error normalization
  storage.ts        - localStorage helpers
```

## Key Technologies

- **Next.js 16** - React framework
- **React Query** - Server state management with caching
- **Axios** - HTTP client
- **@dnd-kit** - Drag and drop library for Kanban
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Sonner** - Toast notifications

## Development Tips

### Debugging API Calls
- Check browser DevTools Network tab
- Verify backend is running on correct port
- Check `.env.local` for correct API base URL

### Troubleshooting Auth Issues
- Clear localStorage and refresh the page
- Ensure backend is returning correct token format
- Check that JWT token is being sent in Authorization header

### Performance Optimization
- React Query caches data for 5 minutes
- Optimistic updates make UI feel instant
- Queries are invalidated after mutations

## Building for Production

```bash
pnpm build
pnpm start
```

The production build is optimized and ready for deployment.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |

## Support

For issues or questions:
1. Check the console for error messages
2. Verify backend is running and accessible
3. Check that all environment variables are set correctly
4. Review the README.md for additional information
