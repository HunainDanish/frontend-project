# Task Manager - Full-Stack Application

A modern, production-ready task management system built with Next.js, React Query, and @dnd-kit for drag-and-drop functionality.

## Features

✨ **Core Features**
- User authentication (Login & Register)
- Project management (Create, Read, Update, Delete)
- Task management with Kanban board
- Drag-and-drop task status updates using @dnd-kit
- Task stats and analytics on dashboard
- Dark mode support
- Responsive design for all screen sizes

⚡ **Performance & UX**
- Optimistic updates for instant UI feedback (like Trello)
- 5-minute cache for queries (configurable)
- Debounced search/filter inputs
- Loading states and skeleton loaders
- Empty state messages with helpful CTAs
- Toast notifications for user feedback

♿ **Accessibility**
- Proper ARIA labels on all interactive elements
- Semantic HTML structure
- Focus management in modals
- Keyboard navigation support
- Screen reader friendly

🔐 **Security & Architecture**
- JWT-based authentication
- Secure token storage in localStorage
- Protected routes with ProtectRoute component
- Error normalization across the app
- Non-blocking auth checks (no redirect loops)

## Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env.local
```

2. Update `NEXT_PUBLIC_API_BASE_URL` to match your backend API:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Getting Started

### Installation

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### API Integration (`lib/`)

- **`api-client.ts`** - Axios instance with automatic token injection and error normalization
- **`api-error.ts`** - Global error normalizer for clean error messages
- **`storage.ts`** - localStorage utilities for auth token and user data

### Authentication (`hooks/useAuth.ts`)

- Token-first check: Only calls `/auth/me` if token exists
- Prevents auth check loops with `hasCheckedAuth` flag
- Automatic query invalidation after login: `['auth']`, `['projects']`, `['tasks']`
- No inline redirects - errors are handled by ProtectRoute

### Data Fetching (`hooks/`)

All React Query hooks use:
- `staleTime: 5 minutes` to minimize API calls
- Optimistic updates with rollback on error
- Automatic query invalidation on mutation

**Available hooks:**
- `useAuth()` - Authentication state and operations
- `useProjects()` - Project CRUD operations
- `useTasks()` - Task CRUD with Kanban support
- `useTaskStats()` - Dashboard statistics

### Components

- **`ProtectRoute`** - Redirects unauthenticated users to `/login`
- **`DashboardHeader`** - Displays user info, dark mode toggle, logout
- **`DashboardSidebar`** - Navigation between Projects, Tasks, Dashboard
- **`KanbanBoard`** - Main Kanban board component
- **`KanbanColumn`** - Individual Kanban columns (To Do, In Progress, Done)
- **`KanbanCard`** - Draggable task cards with delete functionality
- **`ProjectModal`** - Create/Edit project dialog
- **`TaskModal`** - Create task dialog with priority and project selection

## Expected API Responses

The application expects the following response shapes from your backend:

### Authentication

**POST /auth/login**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**POST /auth/register**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**GET /auth/me**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Projects

**GET /projects**
```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "description": "Optional description",
      "createdAt": "2024-05-02T00:00:00Z",
      "updatedAt": "2024-05-02T00:00:00Z"
    }
  ]
}
```

### Tasks

**GET /tasks** or **GET /tasks?projectId={projectId}**
```json
{
  "tasks": [
    {
      "id": "task-id",
      "title": "Task Title",
      "description": "Optional description",
      "status": "todo",
      "priority": "medium",
      "projectId": "project-id",
      "createdAt": "2024-05-02T00:00:00Z",
      "updatedAt": "2024-05-02T00:00:00Z"
    }
  ],
  "grouped": {
    "todo": [],
    "in_progress": [],
    "done": []
  }
}
```

**PATCH /tasks/{id}/status**
```json
{
  "id": "task-id",
  "status": "in_progress"
}
```

### Task Stats

**GET /tasks/stats**
```json
{
  "stats": {
    "total": 10,
    "completed": 3,
    "inProgress": 2,
    "todo": 5
  }
}
```

## Key Implementation Details

### Optimistic Updates

All mutations (create, update, delete) implement optimistic updates:

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData(queryKey)
  // Update UI instantly
  queryClient.setQueryData(queryKey, oldData => updateData(oldData, newData))
  return { previous }
},
onError: (err, _, context) => {
  // Rollback on error
  queryClient.setQueryData(queryKey, context.previous)
}
```

### ProtectRoute Redirect Logic

- ✅ Prevents repeated redirects with `hasCheckedAuth` flag
- ✅ Never redirects while `isLoading` is true
- ✅ Shows loading spinner during auth check
- ✅ Uses `router.replace()` only once

### Error Handling

All errors are normalized via `normalizeError()`:
- Backend error messages are extracted and returned as clean strings
- No error objects are passed to the UI
- UI handles errors with toast notifications

## Customization

### Dark Mode

Dark mode is enabled by default in Tailwind config. Toggle it in the header:
```typescript
// Switch to dark
document.documentElement.classList.add('dark')

// Switch to light
document.documentElement.classList.remove('dark')
```

### Color Scheme

Update the design tokens in `tailwind.config.ts`:
- Primary color: `indigo-600`
- Status colors: Gray, Blue, Green for To Do, In Progress, Done
- Priority colors: Gray, Yellow, Orange, Red

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Tech Stack

- **Framework:** Next.js 16 with Turbopack
- **Language:** TypeScript
- **State Management:** React Query (@tanstack/react-query)
- **HTTP Client:** Axios
- **UI Components:** shadcn/ui
- **Drag & Drop:** @dnd-kit
- **Notifications:** Sonner
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Development Tips

1. **Enable React Query DevTools** (optional):
   ```bash
   pnpm add -D @tanstack/react-query-devtools
   ```

2. **Monitor API Calls** - Check browser DevTools Network tab

3. **Test Auth Flow** - Use localStorage in DevTools Console:
   ```javascript
   localStorage.getItem('auth_token')
   localStorage.getItem('auth_user')
   ```

4. **Clear Cache** - Hard refresh or clear app data in DevTools

## Troubleshooting

### CORS Issues
- Ensure backend allows requests from `http://localhost:3000`
- Add `Access-Control-Allow-Origin: *` to backend responses

### Auth Token Not Persisting
- Check if `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify token is returned in login response
- Check localStorage in DevTools Application tab

### Tasks Not Loading
- Ensure `/tasks` endpoint returns `tasks` and `grouped` fields
- Check API base URL in `.env.local`
- Verify token is being sent in Authorization header

## License

MIT
