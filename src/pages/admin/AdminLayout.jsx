import { Outlet, Link, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { Users, Upload, Megaphone } from 'lucide-react'

const adminNav = [
  { to: '/admin/users', icon: Users, label: 'Client List' },
  { to: '/admin/upload', icon: Upload, label: 'Upload Leads' },
  { to: '/admin/announce', icon: Megaphone, label: 'Announcements' },
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-fresh-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Admin Sub-Nav */}
        <div className="bg-fresh-card border-b border-fresh-border px-8 py-3">
          <div className="flex items-center gap-1">
            {adminNav.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-fresh-orange/10 text-fresh-orange border border-fresh-orange/20'
                    : 'text-fresh-muted hover:text-slate-100 hover:bg-fresh-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
