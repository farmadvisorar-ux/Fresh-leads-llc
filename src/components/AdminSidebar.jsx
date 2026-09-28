import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UserPlus, Upload, Database,
  Users, MessageSquare, Megaphone, LogOut, Zap,
  ExternalLink, ChevronRight, ShieldAlert, PlusCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const adminNavItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Ops Overview' },
  { to: '/admin/leads/new', icon: PlusCircle, label: 'Add Lead & Audio', badge: 'New' },
  { to: '/admin/upload', icon: Upload, label: 'Bulk CSV Uploader' },
  { to: '/admin/leads', icon: Database, label: 'Master Leads Table' },
  { to: '/admin/clients', icon: Users, label: 'Client Accounts' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Support Desk' },
  { to: '/admin/announce', icon: Megaphone, label: 'Broadcast Alerts' },
]

export default function AdminSidebar() {
  const { profile, signOut, switchAccount } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function handleOpenClientCRM() {
    switchAccount('client')
    navigate('/dashboard')
  }

  const isActive = (path) => location.pathname === path

  return (
    <aside className="w-64 bg-[#0A0C10] border-r border-fresh-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand & Admin Badge */}
      <div className="p-5 border-b border-fresh-border bg-gradient-to-b from-fresh-card to-transparent">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-fresh-orange rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-fresh-orange/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-white text-base tracking-tight">FreshLeads</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-fresh-orange/20 text-fresh-orange px-1.5 py-0.5 rounded border border-fresh-orange/40">
                OPS
              </span>
            </div>
            <p className="text-fresh-muted text-xs">Admin Control Center</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-fresh-muted flex items-center justify-between">
          <span>Lead Operations</span>
          <ShieldAlert className="w-3.5 h-3.5 text-fresh-orange" />
        </div>

        {adminNavItems.map(({ to, icon: Icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              isActive(to)
                ? 'bg-fresh-orange text-white shadow-md shadow-fresh-orange/20'
                : 'text-slate-400 hover:text-white hover:bg-fresh-card border border-transparent hover:border-fresh-border'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {badge && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                {badge}
              </span>
            )}
            {isActive(to) && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white" />}
          </Link>
        ))}

        {/* Quick Shortcut to Switch / Preview Client Portal */}
        <div className="pt-5 mt-4 border-t border-fresh-border/60">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-fresh-muted">
            Client Portal Switcher
          </div>
          <button
            onClick={handleOpenClientCRM}
            className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-fresh-card hover:bg-fresh-border text-slate-300 hover:text-white border border-fresh-border transition-colors group mt-1"
          >
            <ExternalLink className="w-4 h-4 text-fresh-orange group-hover:scale-110 transition-transform" />
            <span>Open Client CRM</span>
          </button>
        </div>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3.5 border-t border-fresh-border bg-fresh-card/40">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-fresh-orange/20 border border-fresh-orange/40 flex items-center justify-center flex-shrink-0">
            <span className="text-fresh-orange font-bold text-xs">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">
              {profile?.full_name || 'Administrator'}
            </p>
            <p className="text-[10px] text-fresh-muted truncate">
              {profile?.email || 'admin@freshleads.llc'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  )
}
