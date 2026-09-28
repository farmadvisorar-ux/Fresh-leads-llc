import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../firebase'
import { format } from 'date-fns'
import {
  Database, Search, Headphones, Trash2, Edit3,
  ExternalLink, UserCheck, ShieldCheck, MapPin, Phone,
  PlusCircle, Calendar, RefreshCw
} from 'lucide-react'
import AudioPlayerModal from '../../components/AudioPlayerModal'
import { ToastContainer, useToast } from '../../components/Toast'

export default function AdminLeadsList() {
  const { toasts, addToast, removeToast } = useToast()
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClientFilter, setSelectedClientFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeAudioLead, setActiveAudioLead] = useState(null)

  // Edit / Reassign modal state
  const [editingLead, setEditingLead] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [cList, lList] = await Promise.all([
        api.getClients(),
        api.getLeads(null, true)
      ])
      setClients(cList || [])
      setLeads(lList || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteLead(leadId, homeownerName) {
    if (!window.confirm(`Are you sure you want to delete lead "${homeownerName}"?`)) return
    try {
      await api.deleteLead(leadId)
      setLeads(prev => prev.filter(l => l.id !== leadId))
      addToast(`Lead for ${homeownerName} deleted`, 'info')
    } catch (err) {
      addToast('Failed to delete lead: ' + err.message, 'error')
    }
  }

  function openEditModal(lead) {
    setEditingLead(lead)
    setEditForm({
      homeowner_name: lead.homeowner_name || '',
      phone: lead.phone || '',
      address: lead.address || '',
      insurance_carrier: lead.insurance_carrier || 'State Farm',
      appointment_date: lead.appointment_date || '',
      status: lead.status || 'new',
      client_id: lead.client_id || '',
      notes: lead.notes || '',
    })
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    try {
      await api.updateLead(editingLead.id, editForm)
      setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...editForm } : l))
      addToast('Lead updated successfully', 'success')
      setEditingLead(null)
    } catch (err) {
      addToast('Update failed: ' + err.message, 'error')
    }
  }

  const filtered = leads
    .filter(l => selectedClientFilter === 'all' || l.client_id === selectedClientFilter)
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l => {
      if (!search) return true
      const s = search.toLowerCase()
      const client = clients.find(c => c.id === l.client_id)
      return (
        l.homeowner_name?.toLowerCase().includes(s) ||
        l.address?.toLowerCase().includes(s) ||
        l.phone?.toLowerCase().includes(s) ||
        l.insurance_carrier?.toLowerCase().includes(s) ||
        client?.company?.toLowerCase().includes(s) ||
        client?.full_name?.toLowerCase().includes(s)
      )
    })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-fresh-orange" />
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
              Master Lead Inventory
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            All Client Leads & Recordings
          </h1>
          <p className="text-fresh-muted text-xs mt-1">
            Manage, listen to, reassign, or edit leads across all contractor accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Refresh database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/leads/new"
            className="btn-primary text-xs py-2 px-4 shadow-md shadow-fresh-orange/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Single Lead</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between bg-fresh-card/80">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-fresh-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search homeowner, address, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Client Filter */}
          <select
            value={selectedClientFilter}
            onChange={e => setSelectedClientFilter(e.target.value)}
            className="input-field py-2 text-xs w-48 cursor-pointer"
          >
            <option value="all">All Clients ({clients.length})</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.company || c.full_name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field py-2 text-xs w-36 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="called">Called</option>
            <option value="appointment_set">Appt. Set</option>
            <option value="closed">Closed</option>
            <option value="dead">Dead</option>
          </select>

          <span className="text-fresh-muted text-xs">
            {filtered.length} leads
          </span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-fresh-border/30 text-fresh-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-3.5 text-left">Homeowner & Address</th>
                <th className="px-4 py-3.5 text-left">Assigned Client</th>
                <th className="px-4 py-3.5 text-left">Insurance</th>
                <th className="px-4 py-3.5 text-left">Pre-Set Appt</th>
                <th className="px-4 py-3.5 text-left">Status</th>
                <th className="px-4 py-3.5 text-left">Audio</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fresh-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-fresh-muted">
                    Loading master inventory…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-fresh-muted">
                    No leads found matching filters
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  const client = clients.find(c => c.id === lead.client_id)
                  return (
                    <tr key={lead.id} className="hover:bg-fresh-border/20 transition-colors">
                      {/* Homeowner & Address */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-100 text-sm">{lead.homeowner_name}</p>
                        <p className="text-fresh-muted text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{lead.address}</span>
                        </p>
                        <p className="text-fresh-orange text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{lead.phone}</span>
                        </p>
                      </td>

                      {/* Assigned Client */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-fresh-orange/20 text-fresh-orange flex items-center justify-center font-bold text-[10px]">
                            {client?.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{client?.company || client?.full_name || 'Unassigned'}</p>
                            <p className="text-[10px] text-fresh-muted">{client?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Insurance */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          {lead.insurance_carrier || 'State Farm'}
                        </span>
                      </td>

                      {/* Pre-set Appointment */}
                      <td className="px-4 py-3.5 text-amber-300 font-medium">
                        {lead.appointment_date || 'Pre-Set'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === 'closed' ? 'bg-green-900/40 text-green-300 border border-green-800/40' :
                          lead.status === 'appointment_set' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/40' :
                          lead.status === 'called' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/40' :
                          lead.status === 'dead' ? 'bg-slate-800 text-slate-400' :
                          'bg-blue-900/40 text-blue-300 border border-blue-800/40'
                        }`}>
                          {lead.status?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Audio */}
                      <td className="px-4 py-3.5">
                        {lead.audio_url ? (
                          <button
                            onClick={() => setActiveAudioLead(lead)}
                            className="inline-flex items-center gap-1 text-fresh-orange hover:text-fresh-orange-light font-bold"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Play</span>
                          </button>
                        ) : (
                          <span className="text-fresh-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(lead)}
                            className="p-1.5 rounded hover:bg-fresh-border text-fresh-muted hover:text-white transition-colors"
                            title="Edit or Reassign Lead"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.homeowner_name)}
                            className="p-1.5 rounded hover:bg-red-950/40 text-fresh-muted hover:text-red-400 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Reassign Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg border-fresh-orange/40 shadow-2xl animate-slide-up">
            <h2 className="text-lg font-display font-bold text-white mb-1">
              Edit / Reassign Lead: {editingLead.homeowner_name}
            </h2>
            <p className="text-fresh-muted text-xs mb-4">
              Update homeowner details, change assigned roofing contractor, or alter status.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reassign To Client</label>
                <select
                  value={editForm.client_id}
                  onChange={e => setEditForm({ ...editForm, client_id: e.target.value })}
                  className="input-field py-2 text-xs"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Homeowner Name</label>
                  <input
                    type="text"
                    value={editForm.homeowner_name}
                    onChange={e => setEditForm({ ...editForm, homeowner_name: e.target.value })}
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="input-field py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Insurance Carrier</label>
                  <input
                    type="text"
                    value={editForm.insurance_carrier}
                    onChange={e => setEditForm({ ...editForm, insurance_carrier: e.target.value })}
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pre-Set Appointment</label>
                  <input
                    type="text"
                    value={editForm.appointment_date}
                    onChange={e => setEditForm({ ...editForm, appointment_date: e.target.value })}
                    className="input-field py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pipeline Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="input-field py-2 text-xs"
                >
                  <option value="new">New Lead</option>
                  <option value="called">Called</option>
                  <option value="appointment_set">Appointment Confirmed</option>
                  <option value="closed">Closed Deal</option>
                  <option value="dead">Dead</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="input-field py-2 text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audio Player Modal */}
      {activeAudioLead && (
        <AudioPlayerModal
          lead={activeAudioLead}
          onClose={() => setActiveAudioLead(null)}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
