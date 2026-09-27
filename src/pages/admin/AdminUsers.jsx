import { useState, useEffect } from 'react'
import { api } from '../../firebase'
import { format } from 'date-fns'
import { Users, Search, Mail, Calendar, TrendingUp } from 'lucide-react'

export default function AdminUsers() {
  const [clients, setClients] = useState([])
  const [leadCounts, setLeadCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    try {
      const clientProfiles = await api.getClients()
      setClients(clientProfiles || [])

      // Fetch all leads to compute counts
      const allLeads = await api.getLeads(null, true)
      if (allLeads) {
        const counts = {}
        allLeads.forEach(({ client_id }) => {
          counts[client_id] = (counts[client_id] || 0) + 1
        })
        setLeadCounts(counts)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = clients.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      c.full_name?.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-fresh-orange" />
          <span className="text-fresh-orange text-sm font-semibold">Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Client Management</h1>
        <p className="text-fresh-muted mt-1">{clients.length} registered clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-display font-bold text-fresh-orange">{clients.length}</p>
          <p className="text-fresh-muted text-sm mt-1">Total Clients</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display font-bold text-blue-400">
            {Object.values(leadCounts).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-fresh-muted text-sm mt-1">Total Leads Assigned</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display font-bold text-green-400">
            {clients.length > 0
              ? Math.round(Object.values(leadCounts).reduce((a, b) => a + b, 0) / clients.length)
              : 0}
          </p>
          <p className="text-fresh-muted text-sm mt-1">Avg. Leads / Client</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fresh-muted" />
        <input
          type="text"
          placeholder="Search by name, email, or company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 w-80"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fresh-border">
              <th className="px-5 py-3 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider">Leads</th>
              <th className="px-5 py-3 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fresh-border">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-fresh-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-fresh-muted">No clients found</td></tr>
            ) : (
              filtered.map(client => (
                <tr key={client.id} className="hover:bg-fresh-border/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-fresh-orange/10 border border-fresh-orange/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-fresh-orange text-xs font-bold">
                          {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{client.full_name || '—'}</p>
                        <p className="text-fresh-muted text-xs">{client.company || 'No company'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={`mailto:${client.email}`}
                      className="text-fresh-muted hover:text-fresh-orange transition-colors flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{client.email || 'No email'}</span>
                    </a>
                  </td>
                  <td className="px-5 py-3 text-fresh-muted">{client.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-fresh-orange font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {leadCounts[client.id] || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-fresh-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {client.created_at ? format(new Date(client.created_at), 'MMM d, yyyy') : '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
