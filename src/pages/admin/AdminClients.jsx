import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import {
  Users, UserPlus, Search, Mail, Phone, ExternalLink,
  Building2, TrendingUp, Calendar, CheckCircle, Shield
} from 'lucide-react'
import { ToastContainer, useToast } from '../../components/Toast'

export default function AdminClients() {
  const { switchAccount } = useAuth()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const [clients, setClients] = useState([])
  const [leadCounts, setLeadCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // New Client Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClient, setNewClient] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [cList, lList] = await Promise.all([
        api.getClients(),
        api.getLeads(null, true)
      ])
      setClients(cList || [])

      const counts = {}
      ;(lList || []).forEach(l => {
        counts[l.client_id] = (counts[l.client_id] || 0) + 1
      })
      setLeadCounts(counts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleImpersonateClient(client) {
    // Switch active session to this client and navigate to their dashboard
    localStorage.setItem('freshleads_current_user', JSON.stringify({
      user: { uid: client.id, email: client.email, displayName: client.full_name },
      profile: client,
    }))
    addToast(`Entering ${client.company || client.full_name}'s CRM…`, 'info')
    setTimeout(() => {
      navigate('/dashboard')
    }, 400)
  }

  async function handleCreateClient(e) {
    e.preventDefault()
    if (!newClient.email || !newClient.fullName) {
      addToast('Please provide full name and email', 'warning')
      return
    }

    setCreating(true)
    try {
      const created = await api.createClientAccount(newClient)
      setClients(prev => [created, ...prev])
      addToast(`Client account for ${newClient.company || newClient.fullName} created!`, 'success')
      setShowAddModal(false)
      setNewClient({ fullName: '', company: '', email: '', phone: '' })
    } catch (err) {
      addToast('Error creating client: ' + err.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const filtered = clients.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      c.full_name?.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.phone?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-fresh-orange" />
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
              Client Accounts
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            Roofing Contractors Directory
          </h1>
          <p className="text-fresh-muted text-xs mt-1">
            Manage subscribed contractors, inspect client CRM portals, and register new accounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2.5 px-4 shadow-md shadow-fresh-orange/20 flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-display font-bold text-fresh-orange">{clients.length}</p>
          <p className="text-xs text-fresh-muted mt-0.5">Total Clients Registered</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-display font-bold text-emerald-400">
            {Object.values(leadCounts).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-xs text-fresh-muted mt-0.5">Total Leads Dispatched</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-display font-bold text-blue-400">
            {clients.length > 0
              ? (Object.values(leadCounts).reduce((a, b) => a + b, 0) / clients.length).toFixed(1)
              : 0}
          </p>
          <p className="text-xs text-fresh-muted mt-0.5">Avg Leads Per Client</p>
        </div>
        <div className="card p-4 flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-fresh-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-fresh-border/30 text-fresh-muted uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5 text-left">Contractor / Company</th>
                <th className="px-5 py-3.5 text-left">Contact Email & Phone</th>
                <th className="px-5 py-3.5 text-left">Leads Assigned</th>
                <th className="px-5 py-3.5 text-left">Account Created</th>
                <th className="px-5 py-3.5 text-right">Portal Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fresh-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-fresh-muted">
                    Loading client roster…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-fresh-muted">
                    No clients found
                  </td>
                </tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id} className="hover:bg-fresh-border/20 transition-colors">
                    {/* Contractor */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-fresh-orange/20 border border-fresh-orange/30 text-fresh-orange flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {client.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 text-sm">{client.company || 'Roofing Contractor'}</p>
                          <p className="text-fresh-muted text-xs">{client.full_name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-fresh-muted" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-fresh-orange mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{client.phone || 'No direct phone'}</span>
                      </div>
                    </td>

                    {/* Lead Counts */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-fresh-orange font-bold text-sm bg-fresh-orange/10 px-2.5 py-1 rounded-md border border-fresh-orange/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {leadCounts[client.id] || 0} Leads
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-3.5 text-fresh-muted">
                      {client.created_at ? format(new Date(client.created_at), 'MMM d, yyyy') : '—'}
                    </td>

                    {/* View Client CRM */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleImpersonateClient(client)}
                        className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5 text-slate-200 hover:text-fresh-orange hover:border-fresh-orange/40"
                        title="Open this client's portal in read/manage mode"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-fresh-orange" />
                        <span>View Client CRM</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-md border-fresh-orange/40 shadow-2xl animate-slide-up">
            <h2 className="text-lg font-display font-bold text-white mb-1">
              Register New Roofing Contractor
            </h2>
            <p className="text-fresh-muted text-xs mb-4">
              Add a client account so you can immediately load leads into their CRM.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newClient.company}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="input-field py-2 text-xs"
                  placeholder="e.g. Lone Star Roofing Solutions"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Owner / Primary Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newClient.fullName}
                  onChange={e => setNewClient({ ...newClient, fullName: e.target.value })}
                  className="input-field py-2 text-xs"
                  placeholder="e.g. Jason Reynolds"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Login Email *</label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="input-field py-2 text-xs"
                  placeholder="jason@lonestarroofing.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                  className="input-field py-2 text-xs"
                  placeholder="(214) 555-7890"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {creating ? 'Registering…' : 'Create Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
