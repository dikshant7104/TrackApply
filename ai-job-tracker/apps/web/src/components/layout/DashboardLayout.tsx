import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  BarChart3,
  UserCircle,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth.store'
import { useLogout } from '../../hooks/useApi'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/applications', icon: BriefcaseBusiness, label: 'Applications' },
  { to: '/dashboard/resumes', icon: FileText, label: 'Resumes' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()

  const handleLogout = () => {
    logout(undefined, { onSettled: () => navigate('/login') })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-card border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">TrackApply</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 sidebar-scroll overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-primary')} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-primary/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-border lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">TrackApply</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
