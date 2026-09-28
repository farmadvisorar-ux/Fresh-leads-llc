import { useState } from 'react'
import { format } from 'date-fns'
import {
  Volume2, Play, ChevronDown, StickyNote, ShieldCheck,
  Calendar, Phone, MapPin, Search
} from 'lucide-react'
import AudioPlayerModal from './AudioPlayerModal'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead' },
  { value: 'called', label: 'Called' },
  { value: 'appointment_set', label: 'Appointment Confirmed' },
  { value: 'closed', label: 'Deal Closed 🎉' },
  { value: 'dead', label: 'Dead / Inactive' },
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
  appointment_set: 'Appt. Confirmed',
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
  const [activeAudioLead, setActiveAudioLead] = useState(null)

  const filtered = leads
    .filter(l => filter === 'all' || l.status === filter)
    .filter(l => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        l.homeowner_name?.toLowerCase().includes(s) ||
        l.address?.toLowerCase().includes(s) ||
        l.phone?.toLowerCase().includes(s) ||
        l.insurance_carrier?.toLowerCase().includes(s)
      )
    })
    .sort((a, b) => {
      const va = a[sortField] || ''
      const vb = b[sortField] || ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
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
    <>
      <div className="card p-0 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-fresh-border flex flex-wrap gap-3 items-center justify-between">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-fresh-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search homeowner, address, insurer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
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
                {s === 'all' ? 'All Leads' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <span className="text-fresh-muted text-xs font-medium">
            Showing {filtered.length} of {leads.length} leads
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fresh-border bg-fresh-border/20">
                {[
                  { label: 'Homeowner', field: 'homeowner_name' },
                  { label: 'Address & Phone', field: 'address' },
                  { label: 'Insurance Carrier', field: 'insurance_carrier' },
                  { label: 'Storm Date', field: 'storm_date' },
                  { label: 'Pre-Set Inspection', field: 'appointment_date' },
                  { label: 'Call Recording', field: null },
                  { label: 'Pipeline Status', field: 'status' },
                  { label: 'Notes', field: null },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={`px-4 py-3.5 text-left text-fresh-muted font-semibold text-xs uppercase tracking-wider ${
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
                  <td colSpan={8} className="px-4 py-16 text-center text-fresh-muted">
                    No leads found matching your criteria
                  </td>
                </tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-fresh-border/30 transition-colors">
                    {/* Homeowner Name */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-100">{lead.homeowner_name}</p>
                      <p className="text-xs text-fresh-muted">
                        Added {lead.created_at ? format(new Date(lead.created_at), 'MMM d') : ''}
                      </p>
                    </td>

                    {/* Address & Phone */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-fresh-muted flex-shrink-0" />
                        <span className="truncate max-w-[190px]">{lead.address || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-fresh-orange mt-0.5">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <a href={`tel:${lead.phone}`} className="hover:underline">
                          {lead.phone || '—'}
                        </a>
                      </div>
                    </td>

                    {/* Insurance Carrier */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {lead.insurance_carrier || 'Active Confirmed'}
                      </span>
                    </td>

                    {/* Storm Date */}
                    <td className="px-4 py-3.5 text-fresh-muted text-xs">
                      {lead.storm_date ? format(new Date(lead.storm_date), 'MM/dd/yyyy') : '—'}
                    </td>

                    {/* Pre-set Appointment */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-800/30">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{lead.appointment_date || 'Pre-Set'}</span>
                      </div>
                    </td>

                    {/* Audio Recording */}
                    <td className="px-4 py-3.5">
                      {lead.audio_url ? (
                        <button
                          onClick={() => setActiveAudioLead(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fresh-orange/15 hover:bg-fresh-orange/25 text-fresh-orange border border-fresh-orange/30 text-xs font-semibold transition-all group"
                        >
                          <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                          <span>Play Audio</span>
                        </button>
                      ) : (
                        <span className="text-fresh-muted text-xs">No audio</span>
                      )}
                    </td>

                    {/* Pipeline Status Dropdown */}
                    <td className="px-4 py-3.5">
                      {readOnly ? (
                        <span className={STATUS_BADGE[lead.status]}>{STATUS_LABEL[lead.status]}</span>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={lead.status}
                            onChange={e => onStatusChange?.(lead.id, e.target.value)}
                            className="appearance-none bg-fresh-border border border-fresh-border hover:border-fresh-orange/40 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 pr-7 cursor-pointer focus:outline-none focus:border-fresh-orange transition-colors"
                          >
                            {STATUS_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-fresh-muted" />
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3.5">
                      {editingNotes === lead.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={e => setNotesDraft(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveNotes(lead.id)}
                            autoFocus
                            className="input-field py-1 text-xs w-48"
                            placeholder="Add adjuster note..."
                          />
                          <button onClick={() => saveNotes(lead.id)} className="text-green-400 text-xs font-medium hover:text-green-300">Save</button>
                          <button onClick={() => setEditingNotes(null)} className="text-fresh-muted text-xs hover:text-slate-300">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => !readOnly && openNotes(lead)}
                          className="flex items-center gap-1.5 text-fresh-muted hover:text-slate-200 text-xs transition-colors text-left group"
                          title="Click to edit notes"
                        >
                          <StickyNote className="w-3.5 h-3.5 flex-shrink-0 text-fresh-muted group-hover:text-fresh-orange" />
                          <span className="max-w-[140px] truncate">
                            {lead.notes || (readOnly ? '—' : '+ Add inspection note')}
                          </span>
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

      {/* Audio Recording Modal */}
      {activeAudioLead && (
        <AudioPlayerModal
          lead={activeAudioLead}
          onClose={() => setActiveAudioLead(null)}
        />
      )}
    </>
  )
}
