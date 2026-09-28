import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../firebase'
import {
  Users, Database, Headphones, PlusCircle, Upload,
  TrendingUp, Calendar, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react'
import AudioPlayerModal from '../../components/AudioPlayerModal'

export default function AdminDashboard() {
  const [clients, setClients] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeAudioLead, setActiveAudioLead] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [cList, lList] = await Promise.all([
          api.getClients(),
          api.getLeads(null, true)
        ])
        setClients(cList || [])
        setLeads(lList || [])
      } catch (err) {
        console.error('Admin dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const leadsWithAudio = leads.filter(l => Boolean(l.audio_url)).length
  const apptsSet = leads.filter(l => l.status === 'appointment_set' || l.status === 'closed').length
  const newLeadsCount = leads.filter(l => l.status === 'new').length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-fresh-card via-[#131722] to-fresh-card p-6 rounded-2xl border border-fresh-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-fresh-orange" />
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
              FreshLeads Operations Control
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            Lead Dispatch & Audio Hub
          </h1>
          <p className="text-fresh-muted text-sm mt-1">
            Load verified inspection leads, attach homeowner call recordings, and assign to client pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/admin/leads/new"
            className="btn-primary text-sm py-2.5 px-4 shadow-lg shadow-fresh-orange/20"
          >
            <PlusCircle className="w-4 h-4" />
            Load Single Lead
          </Link>
          <Link
            to="/admin/upload"
            className="btn-secondary text-sm py-2.5 px-4"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-fresh-orange">
          <div className="flex items-center justify-between text-fresh-muted text-xs font-semibold mb-2">
            <span>TOTAL LEADS LOADED</span>
            <Database className="w-4 h-4 text-fresh-orange" />
          </div>
          <p className="text-3xl font-display font-bold text-white">{leads.length}</p>
          <p className="text-xs text-fresh-muted mt-1">{newLeadsCount} waiting on client call</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-fresh-muted text-xs font-semibold mb-2">
            <span>CALL RECORDINGS ATTACHED</span>
            <Headphones className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-display font-bold text-white">{leadsWithAudio}</p>
          <p className="text-xs text-emerald-400/80 mt-1">
            {leads.length > 0 ? Math.round((leadsWithAudio / leads.length) * 100) : 100}% verified audio coverage
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-fresh-muted text-xs font-semibold mb-2">
            <span>PRE-SET APPOINTMENTS</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-display font-bold text-white">{apptsSet}</p>
          <p className="text-xs text-purple-300/80 mt-1">Confirmed inspections</p>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-fresh-muted text-xs font-semibold mb-2">
            <span>ACTIVE ROOFING CLIENTS</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-display font-bold text-white">{clients.length}</p>
          <p className="text-xs text-blue-300/80 mt-1">Subscribed contractors</p>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/leads/new"
          className="card hover:border-fresh-orange/50 transition-all p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-fresh-orange/10 border border-fresh-orange/20 flex items-center justify-center text-fresh-orange mb-4 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-white text-base flex items-center gap-1.5">
            Load Lead & Audio
            <ArrowRight className="w-4 h-4 ml-auto text-fresh-orange opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-fresh-muted text-xs mt-1.5 leading-relaxed">
            Quickly inject a new pre-set homeowner inspection lead with audio recording, insurance carrier, and storm dates directly into any client's CRM.
          </p>
        </Link>

        <Link
          to="/admin/upload"
          className="card hover:border-fresh-orange/50 transition-all p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-white text-base flex items-center gap-1.5">
            Bulk CSV Importer
            <ArrowRight className="w-4 h-4 ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-fresh-muted text-xs mt-1.5 leading-relaxed">
            Upload an entire batch of leads for multiple roofing clients at once. Automatically matches client emails and dispatches instant notification alerts.
          </p>
        </Link>

        <Link
          to="/admin/clients"
          className="card hover:border-fresh-orange/50 transition-all p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-white text-base flex items-center gap-1.5">
            Client Accounts & CRM View
            <ArrowRight className="w-4 h-4 ml-auto text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-fresh-muted text-xs mt-1.5 leading-relaxed">
            Manage roofing contractor accounts, inspect what each client sees in their portal, or add new client credentials on the fly.
          </p>
        </Link>
      </div>

      {/* Recent Leads Activity */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-fresh-border flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-white text-base">Recently Loaded Leads</h2>
            <p className="text-fresh-muted text-xs mt-0.5">Most recent leads added across all clients</p>
          </div>
          <Link
            to="/admin/leads"
            className="text-xs text-fresh-orange hover:text-fresh-orange-light font-semibold flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-fresh-border/20 text-fresh-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Homeowner</th>
                <th className="px-4 py-3 text-left">Client Assigned</th>
                <th className="px-4 py-3 text-left">Insurance</th>
                <th className="px-4 py-3 text-left">Pre-Set Time</th>
                <th className="px-4 py-3 text-left">Audio Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fresh-border">
              {leads.slice(0, 5).map(lead => {
                const client = clients.find(c => c.id === lead.client_id)
                return (
                  <tr key={lead.id} className="hover:bg-fresh-border/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      {lead.homeowner_name}
                      <p className="text-[11px] text-fresh-muted font-normal">{lead.address}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <span className="font-medium text-fresh-orange">{client?.full_name || 'Client'}</span>
                      <p className="text-[11px] text-fresh-muted">{client?.company || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      {lead.insurance_carrier || 'State Farm'}
                    </td>
                    <td className="px-4 py-3 text-amber-300 font-medium">
                      {lead.appointment_date || 'Pre-Set'}
                    </td>
                    <td className="px-4 py-3">
                      {lead.audio_url ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Audio Ready
                        </span>
                      ) : (
                        <span className="text-fresh-muted text-[11px]">No audio</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.audio_url && (
                        <button
                          onClick={() => setActiveAudioLead(lead)}
                          className="text-fresh-orange hover:text-fresh-orange-light font-bold flex items-center gap-1"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          Listen
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeAudioLead && (
        <AudioPlayerModal
          lead={activeAudioLead}
          onClose={() => setActiveAudioLead(null)}
        />
      )}
    </div>
  )
}
