import { useState } from 'react'
import { format } from 'date-fns'
import { ExternalLink, ChevronDown, StickyNote } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'called', label: 'Called' },
  { value: 'appointment_set', label: 'Appointment Set' },
  { value: 'closed', label: 'Closed' },
  { value: 'dead', label: 'Dead' },
]

const STATUS_BADGE = {
  new: 'badge-new',
  called: 'badge-called',
  appointment_set: 'badge-appointment',
  closed: 'badge-closed',
  dead: 'badge-dead',
}

const STATUS_LABEL = {
  new: 'New',
  called: 'Called',
  appointment_set: 'Appt. Set',
  closed: 'Closed',
  dead: 'Dead',
}

export default function LeadTable({ leads, onStatusChange, onNotesChange, readOnly = false }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [editingNotes, setEditingNotes] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')

  const filtered = leads
    .filter(l => filter === 'all' || l.status === filter)
    .filter(l => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        l.homeowner_name?.toLowerCase().includes(s) ||
        l.address?.toLowerCase().includes(s) ||
        l.phone?.toLowerCase().includes(s)
      )
    })
    .sort((a, b) => {
      const va = a[sortField] || ''
      const vb = b[sortField] || ''
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function openNotes(lead) {
    setEditingNotes(lead.id)
    setNotesDraft(lead.notes || '')
  }

  function saveNotes(leadId) {
    onNotesChange?.(leadId, notesDraft)
    setEditingNotes(null)
  }

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-fresh-muted">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="card p-0 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-fresh-border flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-48 py-2 text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'called', 'appointment_set', 'closed', 'dead'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-fresh-orange text-white'
                  : 'bg-fresh-border text-fresh-muted hover:text-slate-100'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <span className="text-fresh-muted text-sm ml-auto">{filtered.length} leads</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fresh-border">
              {[
                { label: 'Homeowner', field: 'homeowner_name' },
                { label: 'Address', field: 'address' },
                { label: 'Phone', field: 'phone' },
                { label: 'Storm Date', field: 'storm_date' },
                { label: 'Status', field: 'status' },
                { label: 'Audio', field: null },
                { label: 'Notes', field: null },
              ].map(({ label, field }) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider ${
                    field ? 'cursor-pointer hover:text-slate-300' : ''
                  }`}
                  onClick={() => field && toggleSort(field)}
                >
                  {label}
                  {field && <SortIcon field={field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-fresh-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-fresh-muted">
                  No leads found
                </td>
              </tr>
            ) : (
              filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-fresh-border/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-100">
                    {lead.homeowner_name}
                  </td>
                  <td className="px-4 py-3 text-fresh-muted max-w-[200px] truncate">
                    {lead.address}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <a href={`tel:${lead.phone}`} className="hover:text-fresh-orange transition-colors">
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-fresh-muted">
                    {lead.storm_date
                      ? format(new Date(lead.storm_date), 'MM/dd/yyyy')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {readOnly ? (
                      <span className={STATUS_BADGE[lead.status]}>{STATUS_LABEL[lead.status]}</span>
                    ) : (
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          onChange={e => onStatusChange?.(lead.id, e.target.value)}
                          className="appearance-none bg-fresh-border border border-fresh-border rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 pr-7 cursor-pointer focus:outline-none focus:border-fresh-orange"
                        >
                          {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-fresh-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.audio_url ? (
                      <a
                        href={lead.audio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-fresh-orange hover:text-fresh-orange-light text-xs font-medium transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Listen
                      </a>
                    ) : (
                      <span className="text-fresh-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingNotes === lead.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={notesDraft}
                          onChange={e => setNotesDraft(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveNotes(lead.id)}
                          autoFocus
                          className="input-field py-1 text-xs w-40"
                          placeholder="Add note..."
                        />
                        <button onClick={() => saveNotes(lead.id)} className="text-green-400 text-xs hover:text-green-300">Save</button>
                        <button onClick={() => setEditingNotes(null)} className="text-fresh-muted text-xs hover:text-slate-300">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => !readOnly && openNotes(lead)}
                        className="flex items-center gap-1.5 text-fresh-muted hover:text-slate-300 text-xs transition-colors group"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                        <span className="max-w-[100px] truncate">{lead.notes || (readOnly ? '—' : 'Add note')}</span>
                      </button>
                    )}
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
