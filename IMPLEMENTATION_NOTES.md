# Task Manager - Implementation Notes

## What Was Built

A complete task management system frontend with the following components:

### Pages
1. **Login Page** (`/login`) - User authentication
2. **Register Page** (`/register`) - User registration
3. **Dashboard Page** (`/dashboard`) - Overview with stats and quick links
4. **Projects Page** (`/projects`) - List and manage projects
5. **Project Detail Page** (`/projects/[id]`) - Project-specific Kanban board
6. **Tasks Page** (`/tasks`) - Global Kanban board for all tasks

### Core Libraries Used
- `@tanstack/react-query` - Server state management with caching
- `axios` - HTTP client with error normalization
- `@dnd-kit` - Drag-and-drop for Kanban board
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `shadcn/ui` - UI components

## Critical Implementation Details

### 1. QueryClient Setup (app/layout-client.tsx)
```typescript
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
    },
  },
}))
```
**Why:** Prevents QueryClient recreation on re-renders

### 2. Error Normalization (lib/api-error.ts)
```typescript
export function normalizeError(error: any): string {
  return error.response?.data?.message || error.message || 'Something went wrong'
}
```
**Why:** All errors become clean strings in the UI (no manual extraction)

### 3. useAuth Hook - Token-First Check
```typescript
// Only fetch user if token exists
const { data: user } = useQuery({
  enabled: !!token,
  queryFn: async () => {
    const res = await apiClient.get('/auth/me')
    return res.user
  },
})
```
**Why:** Prevents unnecessary API calls if not authenticated

### 4. ProtectRoute - Safe Redirects
```typescript
useEffect(() => {
  if (hasCheckedAuth && !isLoading && !user && !hasRedirected) {
    setHasRedirected(true)
    router.replace('/login')
  }
}, [hasCheckedAuth, isLoading, user, hasRedirected])
```
**Why:** 
- `hasCheckedAuth` prevents redirect loops
- `!isLoading` ensures auth check is complete
- `setHasRedirected` ensures redirect happens only once

### 5. Post-Login Flow (hooks/useAuth.ts)
```typescript
onSuccess: (res) => {
  setAuthToken(res.token)
  setAuthUser(res.user)
  // Invalidate ALL related queries
  queryClient.invalidateQueries({ queryKey: ['auth'] })
  queryClient.invalidateQueries({ queryKey: ['projects'] })
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
}
```
**Why:** Clears all caches to avoid stale data after login

### 6. Optimistic Updates Pattern
All mutations use this pattern:
```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData(queryKey)
  queryClient.setQueryData(queryKey, (old) => updateData(old, newData))
  return { previous }
},
onError: (err, _, context) => {
  queryClient.setQueryData(queryKey, context.previous)
},
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey })
}
```
**Why:** Makes the UI feel instant (like Trello)

### 7. Kanban Board with @dnd-kit
The Kanban board uses the `res.grouped` response directly:
```typescript
const { grouped } = useTasks() // { todo, in_progress, done }

<KanbanBoard tasks={grouped} />
```
**Why:** API already groups tasks, no manual filtering needed

### 8. Global Layout Container
All pages wrap content with:
```typescript
<div className="max-w-7xl mx-auto px-4 py-6">
  {/* page content */}
</div>
```
**Why:** Prevents UI from stretching on ultra-wide screens (1400px+)

## Response Shape Expectations

The app expects these exact response structures (no nested `data.data`):

```typescript
// Auth responses
{ token: string, user: { id, email, name } }

// Get Me
{ user: { id, email, name } }

// Projects
{ projects: Project[] }

// Tasks
{
  tasks: Task[],
  grouped: {
    todo: Task[],
    in_progress: Task[],
    done: Task[]
  }
}

// Task Stats
{ stats: { total, completed, inProgress, todo } }
```

## File Structure

```
app/
├── layout.tsx              # Root layout with metadata
├── layout-client.tsx       # Client component with QueryClientProvider
├── page.tsx               # Home (redirects to /login or /dashboard)
├── login/
│   └── page.tsx          # Login page
├── register/
│   └── page.tsx          # Register page
├── dashboard/
│   ├── layout.tsx        # Dashboard layout with sidebar
│   ├── page.tsx          # Dashboard overview
│   └── [id]/
│       └── page.tsx      # Project detail
├── projects/
│   └── page.tsx          # Projects list
└── tasks/
    └── page.tsx          # Kanban board

components/
├── protect-route.tsx      # ProtectRoute component
├── dashboard-header.tsx   # Header with dark mode toggle
├── dashboard-sidebar.tsx  # Navigation sidebar
├── project-modal.tsx      # Create/Edit project
├── task-modal.tsx        # Create task
├── kanban-board.tsx      # Main Kanban board
├── kanban-column.tsx     # Individual column
└── kanban-card.tsx       # Draggable task card

hooks/
├── useAuth.ts            # Authentication hook
├── useProjects.ts        # Projects CRUD
├── useTasks.ts           # Tasks CRUD with optimistic updates
└── useTaskStats.ts       # Dashboard stats

lib/
├── api-client.ts         # Axios instance
├── api-error.ts          # Error normalizer
└── storage.ts            # localStorage utilities
```

## Known Limitations & Future Improvements

1. **localStorage** - Currently uses localStorage for persistence. In production, consider:
   - HttpOnly cookies for better security
   - Secure token refresh mechanism

2. **Offline Support** - No offline queue. Consider:
   - Service workers for offline detection
   - Queue for mutations when offline

3. **Real-time Updates** - Currently uses polling via React Query. Consider:
   - WebSockets for real-time task updates
   - Server-sent events (SSE)

4. **Search/Filter** - Debounced but not implemented in UI yet. Add to:
   - Task search in Kanban
   - Project search in list

5. **Pagination** - All items loaded at once. Consider for large datasets:
   - Infinite scroll for projects
   - Pagination for task lists

## Debugging Tips

1. **Check Auth State:**
   ```javascript
   // In browser console
   localStorage.getItem('auth_token')
   localStorage.getItem('auth_user')
   ```

2. **Monitor API Calls:**
   - Open DevTools → Network tab
   - Filter by XHR/fetch
   - Check Authorization header

3. **Check React Query Cache:**
   - Install React Query DevTools (optional)
   - Or inspect IndexedDB in DevTools

4. **Test Optimistic Updates:**
   - Open DevTools → Network
   - Slow down requests with throttling
   - Watch UI update before API response

5. **Test Dark Mode:**
   - Click moon icon in header
   - Check DevTools: `document.documentElement.classList`

## Testing Checklist

- [ ] Login/Register flow works
- [ ] Token is saved to localStorage
- [ ] Dashboard stats load correctly
- [ ] Create project modal works
- [ ] Create task modal works
- [ ] Kanban drag-and-drop works
- [ ] Task status updates optimistically
- [ ] Delete operations work with confirmation
- [ ] Dark mode toggle works
- [ ] Logout clears auth and redirects
- [ ] Refresh page maintains session
- [ ] Navigate between pages works
- [ ] Empty states display correctly
- [ ] Toast notifications appear

## Production Checklist

- [ ] Update NEXT_PUBLIC_API_BASE_URL to production API
- [ ] Test with actual backend
- [ ] Enable HTTPS
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (PostHog)
- [ ] Review security headers
- [ ] Test cross-browser compatibility
- [ ] Optimize images
- [ ] Set up CD/CI pipeline
