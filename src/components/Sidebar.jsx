import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, User, Settings,
  Users, Upload, Megaphone, LogOut, Zap, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const clientLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const adminLinks = [
  { to: '/admin/users', icon: Users, label: 'Clients' },
  { to: '/admin/upload', icon: Upload, label: 'Upload Leads' },
  { to: '/admin/announce', icon: Megaphone, label: 'Announcements' },
]

export default function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className="w-64 bg-fresh-card border-r border-fresh-border flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-fresh-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-fresh-orange rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">FreshLeads</p>
            <p className="text-fresh-muted text-xs">CRM Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Client Section */}
        <p className="text-fresh-muted text-xs font-semibold uppercase tracking-wider px-4 py-2">
          My Account
        </p>
        {clientLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={isActive(to) ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {isActive(to) && <ChevronRight className="w-4 h-4 ml-auto text-fresh-orange" />}
          </Link>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-fresh-muted text-xs font-semibold uppercase tracking-wider px-4 py-2">
                Admin
              </p>
            </div>
            {adminLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={location.pathname.startsWith(to) ? 'sidebar-link-active' : 'sidebar-link'}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
                {location.pathname.startsWith(to) && (
                  <ChevronRight className="w-4 h-4 ml-auto text-fresh-orange" />
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-fresh-border">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-fresh-orange/20 border border-fresh-orange/30 flex items-center justify-center flex-shrink-0">
            <span className="text-fresh-orange font-bold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">
              {profile?.full_name || 'Client'}
            </p>
            <p className="text-xs text-fresh-muted truncate">{profile?.company || ''}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
