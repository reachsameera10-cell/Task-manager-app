import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CircleOff,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Pencil,
  PlusSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Toaster, toast } from 'sonner';

import { useAuth } from './context/AuthContext';
import { taskService } from './services/taskService';

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};

const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  MEDIUM: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  HIGH: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
};

const formatDate = (value) => {
  if (!value) return 'No deadline';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatLongDate = (value) => {
  if (!value) return 'No deadline';

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusLabel = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const priorityLabel = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <CircleDashed className="h-5 w-5 animate-spin" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard },
    { to: '/app/tasks', label: 'My Tasks', icon: ListTodo },
    { to: '/app/profile', label: 'Profile', icon: UserCircle2 },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <div className="mb-8 flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-3 text-white shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Workspace</p>
              <h1 className="text-lg font-semibold">TaskFlow</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => navigate('/app/tasks?mode=create')}
              className="mt-2 flex w-full items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <PlusSquare className="h-4 w-4" />
              Create Task
            </button>
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Account</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{location.pathname === '/app' ? 'Overview' : 'Workspace'}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{location.pathname === '/app' ? 'Dashboard' : 'TaskFlow'}</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="p-5 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Portfolio Ready</p>
              <h1 className="text-lg font-semibold">TaskFlow</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={user ? '/app' : '/login'} className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5">
              {user ? 'Open Dashboard' : 'Login'}
            </Link>
            {!user && (
              <Link to="/register" className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400">
                Get Started
              </Link>
            )}
          </div>
        </header>

        <section className="grid items-center gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm text-violet-200">
              <ShieldCheck className="h-4 w-4" />
              Secure task operations with real-world workflow design
            </div>

            <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Smarter task management for modern teams.
            </h2>

            <p className="mt-5 max-w-xl text-base text-slate-300">
              TaskFlow brings together authentication, project planning, responsive UI, and clean API architecture into one polished full-stack experience.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={user ? '/app' : '/register'} className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                {user ? 'Continue to Dashboard' : 'Create your account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-violet-950/40 backdrop-blur-sm">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Weekly performance</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">+18.4%</span>
                </div>
                <div className="flex items-end gap-2">
                  {[40, 62, 50, 80, 90, 78, 96].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-violet-500 to-indigo-400" style={{ height: `${height}px` }} />
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200">Tasks completed</p>
                  <p className="mt-2 text-3xl font-semibold text-white">87%</p>
                </div>
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <p className="text-sm text-violet-200">Projects tracked</p>
                  <p className="mt-2 text-3xl font-semibold text-white">24</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();
  const isLogin = location.pathname === '/login';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
        toast.success('Welcome back!');
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
        toast.success('Your account is ready.');
      }

      navigate('/app');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Welcome</p>
            <h3 className="text-xl font-semibold text-slate-900">{isLogin ? 'Sign in to TaskFlow' : 'Create your account'}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Jane Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="jane@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isLogin ? "Need an account?" : 'Already have an account?'}{' '}
          <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-violet-600 hover:text-violet-500">
            {isLogin ? 'Create one' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, helper, accent, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-slate-300 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{task.title}</h4>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description || 'No description added.'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEdit(task)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-white">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDelete(task)} className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
          {statusLabel[task.status]}
        </span>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
          {priorityLabel[task.priority]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(task.dueDate)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Updated {formatLongDate(task.updatedAt)}</span>
        <span>Created {formatLongDate(task.createdAt)}</span>
      </div>
    </div>
  );
}

function TaskFormModal({ open, onClose, editingTask, onSave, loading }) {
  const initialForm = {
    title: editingTask?.title ?? '',
    description: editingTask?.description ?? '',
    status: editingTask?.status ?? 'PENDING',
    priority: editingTask?.priority ?? 'MEDIUM',
    dueDate: editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().slice(0, 10) : '',
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [editingTask, open]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      description: form.description || '',
      dueDate: form.dueDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Task editor</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{editingTask ? 'Update task' : 'Create task'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70">
              {loading ? 'Saving...' : editingTask ? 'Update task' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, completionRate: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [{ data: statsData }, { data: taskData }] = await Promise.all([
          taskService.getStats(),
          taskService.getTasks({ page: 1, limit: 5, sortBy: 'updatedAt', order: 'desc' }),
        ]);

        setStats(statsData.stats);
        setTasks(taskData.tasks || []);
      } catch (error) {
        toast.error('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total tasks" value={stats.total} helper="All tracked work" accent="bg-slate-100 text-slate-700" icon={ListTodo} />
        <StatCard title="Pending" value={stats.pending} helper="Waiting to start" accent="bg-amber-100 text-amber-700" icon={CircleOff} />
        <StatCard title="In progress" value={stats.inProgress} helper="Currently active" accent="bg-blue-100 text-blue-700" icon={CircleDashed} />
        <StatCard title="Completed" value={stats.completed} helper="Closed items" accent="bg-emerald-100 text-emerald-700" icon={CheckCircle2} />
        <StatCard title="Overdue" value={stats.overdue} helper="Past due" accent="bg-rose-100 text-rose-700" icon={CalendarDays} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Completion rate</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">{stats.completionRate}%</h3>
          </div>
          <div className="h-3 w-56 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500" style={{ width: `${Math.min(stats.completionRate, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Recent activity</p>
            <h3 className="text-xl font-semibold text-slate-900">Latest tasks</h3>
          </div>
          <Link to="/app/tasks" className="text-sm font-medium text-violet-600 transition hover:text-violet-500">
            View all tasks
          </Link>
        </div>

        <div className="space-y-3">
          {tasks.length ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={() => {}} onDelete={() => {}} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No tasks yet. Create your first task to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    overdue: false,
    dueDate: '',
    sortBy: 'updatedAt',
    order: 'desc',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });

  const loadTasks = async (nextFilters = filters) => {
    try {
      const { data } = await taskService.getTasks(nextFilters);
      setTasks(data.tasks || []);
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1, limit: nextFilters.limit });
    } catch (error) {
      toast.error('Unable to load tasks.');
    }
  };

  useEffect(() => {
    loadTasks(filters);
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFilters((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    await loadTasks(nextFilters);
  };

  const handleCreateOrUpdateTask = async (payload) => {
    setSaving(true);

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
        toast.success('Task updated successfully.');
      } else {
        await taskService.createTask(payload);
        toast.success('Task created successfully.');
      }

      setTaskModalOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (!confirmed) return;

    try {
      await taskService.deleteTask(task.id);
      toast.success('Task deleted.');
      await loadTasks();
    } catch (error) {
      toast.error('Unable to delete task.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Workspace</p>
          <h3 className="text-2xl font-semibold text-slate-900">All tasks</h3>
        </div>
        <button type="button" onClick={() => { setEditingTask(null); setTaskModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          <PlusSquare className="h-4 w-4" />
          New task
        </button>
      </div>

      <form onSubmit={applyFilters} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <SlidersHorizontal className="h-4 w-4" />
          Filters and search
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Search by title</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search tasks"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select name="status" value={filters.status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <select name="priority" value={filters.priority} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
            <input type="date" name="dueDate" value={filters.dueDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sort by</label>
            <select name="sortBy" value={filters.sortBy} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              <option value="updatedAt">Recently updated</option>
              <option value="createdAt">Creation date</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Order</label>
            <select name="order" value={filters.order} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <input type="checkbox" name="overdue" checked={filters.overdue} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
              Overdue only
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Apply filters
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(selectedTask) => {
                setEditingTask(selectedTask);
                setTaskModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No tasks match the current filters.
          </div>
        )}
      </div>

      <TaskFormModal
        open={taskModalOpen}
        editingTask={editingTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleCreateOrUpdateTask}
        loading={saving}
      />
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await taskService.getStats();
        setStats(data.stats);
      } catch (error) {
        console.error('Could not load profile stats');
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Account profile</p>
            <h3 className="text-2xl font-semibold text-slate-900">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total tasks" value={stats.total} helper="All tasks tracked" accent="bg-slate-100 text-slate-700" icon={ListTodo} />
        <StatCard title="Pending" value={stats.pending} helper="Not started yet" accent="bg-amber-100 text-amber-700" icon={CircleOff} />
        <StatCard title="Completed" value={stats.completed} helper="Done this cycle" accent="bg-emerald-100 text-emerald-700" icon={CheckCircle2} />
        <StatCard title="Overdue" value={stats.overdue} helper="Needs attention" accent="bg-rose-100 text-rose-700" icon={CalendarDays} />
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">404</p>
        <h3 className="mt-2 text-3xl font-semibold text-slate-900">Page not found</h3>
        <p className="mt-3 text-slate-500">The page you requested does not exist.</p>
        <Link to="/" className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          Back home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
