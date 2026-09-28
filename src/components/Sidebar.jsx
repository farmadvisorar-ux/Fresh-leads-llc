import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, User,
  LogOut, Zap, ChevronRight, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const clientLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Lead Dashboard' },
  { to: '/messages', icon: MessageSquare, label: 'Contact Support' },
  { to: '/profile', icon: User, label: 'My Account' },
]

export default function Sidebar() {
  const { profile, isAdmin, signOut, switchAccount } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className="w-64 bg-fresh-card border-r border-fresh-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Logo */}
      <div className="p-6 border-b border-fresh-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-fresh-orange rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-fresh-orange/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-tight">FreshLeads</p>
            <p className="text-fresh-muted text-xs">Client CRM Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="text-fresh-muted text-[11px] font-bold uppercase tracking-wider px-3 py-1.5">
          Workspace
        </p>

        {clientLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={isActive(to) ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
            {isActive(to) && <ChevronRight className="w-4 h-4 ml-auto text-fresh-orange" />}
          </Link>
        ))}

        {/* Discrete Admin Console access (only if authenticated as Admin or for quick testing) */}
        {isAdmin && (
          <div className="pt-6 mt-4 border-t border-fresh-border/60">
            <p className="text-fresh-muted text-[10px] font-bold uppercase tracking-wider px-3 mb-1">
              Internal Access
            </p>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-fresh-orange/10 hover:bg-fresh-orange/20 text-fresh-orange border border-fresh-orange/30 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-fresh-border bg-fresh-card/40">
        <div className="flex items-center gap-3 px-1 py-1.5 mb-2">
          <div className="w-9 h-9 rounded-full bg-fresh-orange/20 border border-fresh-orange/30 flex items-center justify-center flex-shrink-0">
            <span className="text-fresh-orange font-bold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">
              {profile?.full_name || 'Client'}
            </p>
            <p className="text-xs text-fresh-muted truncate">
              {profile?.company || 'Contractor'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-950/20 text-xs py-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
