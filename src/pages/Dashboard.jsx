import { useAuth } from '../context/AuthContext'
import { useLeads } from '../hooks/useLeads'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import LeadTable from '../components/LeadTable'
import LoadingSpinner from '../components/LoadingSpinner'
import { ToastContainer, useToast } from '../components/Toast'
import {
  LayoutDashboard, TrendingUp, Phone, Calendar, CheckCircle, XCircle, Zap
} from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const { leads, stats, loading, updateLeadStatus, updateLeadNotes } = useLeads()
  const { toasts, addToast, removeToast } = useToast()

  async function handleStatusChange(leadId, status) {
    const { error } = await updateLeadStatus(leadId, status)
    if (error) addToast('Failed to update status', 'error')
    else addToast('Lead status updated', 'success')
  }

  async function handleNotesChange(leadId, notes) {
    const { error } = await updateLeadNotes(leadId, notes)
    if (error) addToast('Failed to save note', 'error')
    else addToast('Note saved', 'success')
  }

  if (loading) return <LoadingSpinner message="Loading your leads…" />

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex h-screen bg-fresh-black overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-fresh-orange fill-fresh-orange" />
              <span className="text-fresh-orange text-sm font-semibold">Dashboard</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white">
              {greeting}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-fresh-muted mt-1">
              Here's your current lead pipeline overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              label="Total Leads"
              value={stats.total}
              icon={LayoutDashboard}
              color="orange"
            />
            <StatCard
              label="New"
              value={stats.newLeads}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              label="Called"
              value={stats.called}
              icon={Phone}
              color="yellow"
            />
            <StatCard
              label="Appts. Set"
              value={stats.appointmentSet}
              icon={Calendar}
              color="purple"
            />
            <StatCard
              label="Closed"
              value={stats.closed}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              label="Dead"
              value={stats.dead}
              icon={XCircle}
              color="slate"
            />
          </div>

          {/* Close Rate Banner */}
          {stats.total > 0 && (
            <div className="bg-fresh-orange/5 border border-fresh-orange/20 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-fresh-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-fresh-orange" />
              </div>
              <div>
                <p className="text-slate-200 font-semibold">
                  Close Rate:{' '}
                  <span className="text-fresh-orange">
                    {stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
                  </span>
                </p>
                <p className="text-fresh-muted text-sm">
                  {stats.closed} closed out of {stats.total} total leads
                </p>
              </div>
            </div>
          )}

          {/* Lead Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-white">Your Leads</h2>
              <span className="text-fresh-muted text-sm">{leads.length} total</span>
            </div>
            <LeadTable
              leads={leads}
              onStatusChange={handleStatusChange}
              onNotesChange={handleNotesChange}
            />
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
