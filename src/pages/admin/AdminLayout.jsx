import { Outlet, Link, useLocation } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { ShieldCheck, Plus, Sparkles, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { profile } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#07080B] text-slate-100 overflow-hidden font-sans">
      {/* Separate Admin Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Admin Workspace Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Operations Header Bar */}
        <header className="h-16 border-b border-fresh-border bg-fresh-card/70 backdrop-blur-md px-8 flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-slate-200">FreshLeads Dispatch System:</span>{' '}
              <span className="text-emerald-400 font-medium">Ready for Lead & Audio Injection</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/leads/new"
              className="btn-primary text-xs py-2 px-3.5 shadow-md shadow-fresh-orange/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Load Single Lead
            </Link>

            <Link
              to="/admin/upload"
              className="btn-secondary text-xs py-2 px-3.5"
            >
              Bulk CSV
            </Link>

            <div className="h-4 w-px bg-fresh-border mx-1" />

            <div className="flex items-center gap-2 text-xs text-fresh-muted">
              <ShieldCheck className="w-4 h-4 text-fresh-orange" />
              <span className="font-medium text-slate-300">Admin Mode</span>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page View */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
