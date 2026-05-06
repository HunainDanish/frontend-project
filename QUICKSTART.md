# Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Make Sure Backend is Running
```bash
# In a terminal, start your backend API
npm start
# Should be running on http://localhost:5000
```

### Step 2: Start Frontend Dev Server
```bash
cd /vercel/share/v0-project
pnpm dev
```

### Step 3: Open in Browser
```
http://localhost:3000
```

## ✅ Verify Everything Works

1. **See the home page** with redirect to login
2. **Register a new account** - fill in name, email, password
3. **Login** with your credentials
4. **View dashboard** with empty stats
5. **Create a project** - click "New Project" button
6. **Create tasks** - add tasks to your project
7. **Drag tasks** between "To Do", "In Progress", "Done" columns
8. **See stats update** with real data

## 📋 What to Test

- [ ] Registration works
- [ ] Login persists across page refresh
- [ ] Creating project works
- [ ] Dashboard shows stats from backend
- [ ] Creating task works
- [ ] Drag-and-drop updates task status
- [ ] Deleting task works
- [ ] Logout clears session

## 🔧 If Something Doesn't Work

### Backend Connection Issues
```bash
# Check backend is running
curl http://localhost:5000/api/projects

# Should return error (401) but not connection refused
```

### No Data Showing
1. Check browser console for errors
2. Verify you're logged in (token in localStorage)
3. Verify backend is returning data

### Port Conflicts
If port 3000 is taken:
```bash
pnpm dev -- -p 3001
```

## 📁 Key Files to Know

- `.env.local` - Backend API URL
- `lib/api-client.ts` - API communication setup
- `hooks/useAuth.ts` - Login/logout logic
- `hooks/useProjects.ts` - Project CRUD
- `hooks/useTasks.ts` - Task CRUD
- `app/projects/[id]/page.tsx` - Kanban board

## 🎯 Next Steps

After verifying it works:

1. **Deploy backend** to production server
2. **Update `NEXT_PUBLIC_API_BASE_URL`** in `.env.local` to production URL
3. **Deploy frontend** to Vercel/Netlify/AWS
4. **Share with users!**

## 💡 Tips

- All data is **real** - comes from your backend API
- **No hardcoded data** anywhere
- **Optimistic updates** make UI feel fast
- **Drag and drop** is fully functional
- **Comments system** is ready to use

## 🆘 Need Help?

Check these files for more info:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `FRONTEND_COMPLETE.md` - Implementation details

---

**That's it! Your task management system is ready to use.** 🎉
