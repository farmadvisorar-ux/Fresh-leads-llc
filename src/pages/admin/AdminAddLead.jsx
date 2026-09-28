import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../firebase'
import { sendNewLeadsNotification } from '../../emailService'
import { ToastContainer, useToast } from '../../components/Toast'
import {
  PlusCircle, Headphones, ShieldCheck, Calendar,
  MapPin, Phone, User, CheckCircle, Upload, Play, Pause,
  FileAudio, ArrowLeft, ExternalLink, Sparkles
} from 'lucide-react'

const COMMON_INSURERS = [
  'State Farm',
  'Allstate',
  'Travelers',
  'Liberty Mutual',
  'Farmers Insurance',
  'USAA',
  'Nationwide',
  'American Family',
  'Chubb',
  'Other / Unlisted'
]

export default function AdminAddLead() {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Audio state
  const [audioType, setAudioType] = useState('url') // 'url' | 'file'
  const [audioUrl, setAudioUrl] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [audioFilename, setAudioFilename] = useState('')
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const previewAudioRef = useRef(null)

  // Form State
  const [form, setForm] = useState({
    client_id: '',
    homeowner_name: '',
    phone: '',
    address: '',
    city_state_zip: '',
    insurance_carrier: 'State Farm',
    storm_date: new Date().toISOString().split('T')[0],
    appointment_date: 'Tomorrow, 2:00 PM',
    status: 'new',
    notes: '',
    notify_client: true,
  })

  useEffect(() => {
    async function fetchClients() {
      try {
        const cList = await api.getClients()
        setClients(cList || [])
        if (cList?.length > 0) {
          setForm(prev => ({ ...prev, client_id: cList[0].id }))
        }
      } catch (err) {
        console.error('Failed to load clients:', err)
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  // Audio file selection handler
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setAudioFile(file)
    setAudioFilename(file.name)

    // Convert to Data URL for playback and persistence
    const reader = new FileReader()
    reader.onload = () => {
      setAudioUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Audio preview toggle
  function toggleAudioPreview() {
    if (!previewAudioRef.current) return
    if (isPlayingPreview) {
      previewAudioRef.current.pause()
      setIsPlayingPreview(false)
    } else {
      previewAudioRef.current.play().then(() => setIsPlayingPreview(true)).catch(e => {
        console.warn('Playback error:', e)
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.client_id) {
      addToast('Please select a target client', 'warning')
      return
    }
    if (!form.homeowner_name || !form.phone || !form.address) {
      addToast('Please fill in homeowner name, phone, and address', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const fullAddress = form.city_state_zip
        ? `${form.address}, ${form.city_state_zip}`
        : form.address

      const leadPayload = {
        client_id: form.client_id,
        homeowner_name: form.homeowner_name.trim(),
        phone: form.phone.trim(),
        address: fullAddress.trim(),
        insurance_carrier: form.insurance_carrier,
        storm_date: form.storm_date,
        appointment_date: form.appointment_date.trim(),
        status: form.status,
        audio_url: audioUrl.trim() || null,
        audio_filename: audioFilename || `${form.homeowner_name.replace(/\s+/g, '_')}_call.mp3`,
        notes: form.notes.trim(),
      }

      const created = await api.createSingleLead(leadPayload)

      // Send email notification to client if enabled
      if (form.notify_client) {
        const client = clients.find(c => c.id === form.client_id)
        if (client?.email) {
          try {
            await sendNewLeadsNotification({
              toName: client.full_name || 'Valued Client',
              toEmail: client.email,
              leadCount: 1,
            })
          } catch (emailErr) {
            console.warn('Email notification send error:', emailErr)
          }
        }
      }

      addToast(`🎉 Lead for ${form.homeowner_name} loaded successfully into client CRM!`, 'success')
      
      // Reset form for next entry or offer redirect
      setTimeout(() => {
        navigate('/admin/leads')
      }, 1500)

    } catch (err) {
      addToast('Failed to create lead: ' + err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedClient = clients.find(c => c.id === form.client_id)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="w-9 h-9 rounded-lg bg-fresh-card hover:bg-fresh-border border border-fresh-border flex items-center justify-center text-fresh-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fresh-orange" />
              <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
                Lead Injection Form
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">
              Load Lead & Audio Into Client CRM
            </h1>
          </div>
        </div>

        <Link
          to="/admin/upload"
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Switch to Bulk CSV</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Assign to Client */}
        <div className="card border-fresh-orange/20 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-fresh-orange" />
            <h2 className="text-base font-display font-bold text-white">1. Select Target Roofing Client</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Assign Lead To Client *
              </label>
              {loadingClients ? (
                <div className="input-field text-fresh-muted text-sm">Loading clients…</div>
              ) : (
                <select
                  value={form.client_id}
                  onChange={e => setForm({ ...form, client_id: e.target.value })}
                  className="input-field cursor-pointer"
                  required
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} (${c.full_name})` : c.full_name} — {c.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedClient && (
              <div className="bg-fresh-border/30 rounded-lg p-3 text-xs border border-fresh-border/60 flex flex-col justify-center">
                <p className="text-slate-400">Recipient Pipeline:</p>
                <p className="font-bold text-white text-sm">{selectedClient.company || selectedClient.full_name}</p>
                <p className="text-fresh-orange text-xs">{selectedClient.email} • {selectedClient.phone || 'No phone'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Homeowner Details */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-fresh-orange" />
            <h2 className="text-base font-display font-bold text-white">2. Homeowner & Property Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Homeowner Full Name *
              </label>
              <input
                type="text"
                required
                value={form.homeowner_name}
                onChange={e => setForm({ ...form, homeowner_name: e.target.value })}
                className="input-field"
                placeholder="e.g. Thomas & Linda Sterling"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Homeowner Phone Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="e.g. (214) 555-8932"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="input-field"
                placeholder="e.g. 5214 Oak Forest Drive"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                City, State, ZIP
              </label>
              <input
                type="text"
                value={form.city_state_zip}
                onChange={e => setForm({ ...form, city_state_zip: e.target.value })}
                className="input-field"
                placeholder="e.g. Plano, TX 75024"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Insurance & Inspection Details */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-display font-bold text-white">3. Verified Insurance & Inspection Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Insurance Carrier *
              </label>
              <select
                value={form.insurance_carrier}
                onChange={e => setForm({ ...form, insurance_carrier: e.target.value })}
                className="input-field cursor-pointer"
              >
                {COMMON_INSURERS.map(ins => (
                  <option key={ins} value={ins}>{ins}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Storm Event Date
              </label>
              <input
                type="date"
                value={form.storm_date}
                onChange={e => setForm({ ...form, storm_date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pre-Set Appointment Window *
              </label>
              <input
                type="text"
                required
                value={form.appointment_date}
                onChange={e => setForm({ ...form, appointment_date: e.target.value })}
                className="input-field"
                placeholder="e.g. Wednesday at 11:00 AM"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Call Audio Recording */}
        <div className="card border-fresh-orange/30 bg-[#0B0D12]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-fresh-orange" />
              <h2 className="text-base font-display font-bold text-white">4. Call Audio Recording Attachment</h2>
            </div>

            {/* Toggle URL vs File */}
            <div className="flex bg-fresh-border rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setAudioType('url')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  audioType === 'url' ? 'bg-fresh-orange text-white' : 'text-fresh-muted hover:text-white'
                }`}
              >
                Recording URL
              </button>
              <button
                type="button"
                onClick={() => setAudioType('file')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  audioType === 'file' ? 'bg-fresh-orange text-white' : 'text-fresh-muted hover:text-white'
                }`}
              >
                Upload Audio File
              </button>
            </div>
          </div>

          {audioType === 'url' ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Call Recording Link (CallRail, S3, Google Drive, Dropbox, MP3 URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={audioUrl}
                  onChange={e => {
                    setAudioUrl(e.target.value)
                    setAudioFilename('hosted_call_recording.mp3')
                  }}
                  className="input-field flex-1"
                  placeholder="https://storage.freshleads.llc/recordings/lead_7482.mp3"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
                    setAudioFilename('sample_verified_recording.mp3')
                  }}
                  className="btn-secondary text-xs px-3 whitespace-nowrap"
                  title="Insert sample audio to test"
                >
                  <Sparkles className="w-3.5 h-3.5 text-fresh-orange" />
                  Use Demo Audio
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Choose MP3, WAV, or M4A Audio File from Your Device
              </label>
              <div className="flex items-center gap-3">
                <label className="btn-secondary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-fresh-orange" />
                  <span>{audioFilename || 'Select Audio File...'}</span>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {audioFilename && (
                  <span className="text-xs text-emerald-400 font-medium">✓ File Loaded ({audioFilename})</span>
                )}
              </div>
            </div>
          )}

          {/* In-Form Audio Player Preview */}
          {audioUrl && (
            <div className="mt-4 p-3 bg-fresh-card border border-fresh-border rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleAudioPreview}
                  className="w-9 h-9 rounded-full bg-fresh-orange text-white flex items-center justify-center hover:bg-fresh-orange-light shadow-md"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {isPlayingPreview ? 'Playing Recording Preview…' : 'Audio Attached & Ready'}
                  </p>
                  <p className="text-[11px] text-fresh-muted font-mono truncate max-w-sm">
                    {audioFilename || audioUrl}
                  </p>
                </div>
              </div>

              <audio
                ref={previewAudioRef}
                src={audioUrl}
                onEnded={() => setIsPlayingPreview(false)}
              />

              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                Verified Sound
              </span>
            </div>
          )}
        </div>

        {/* Step 5: Adjuster Notes */}
        <div className="card">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Inspection Notes, Damage Summary & Homeowner Details
          </label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="input-field resize-none text-xs leading-relaxed"
            placeholder="e.g. 1.75 inch hail impact on north & east slopes. Homeowner confirmed deductible is $1,000. Husband & wife will both be home for 2 PM inspection. Active State Farm policy confirmed on recorded line."
          />
        </div>

        {/* Notification toggle & Submit Button */}
        <div className="card flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-fresh-card to-[#12151D]">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
            <input
              type="checkbox"
              checked={form.notify_client}
              onChange={e => setForm({ ...form, notify_client: e.target.checked })}
              className="w-4 h-4 accent-fresh-orange rounded"
            />
            <span className="text-slate-300 font-medium">
              Send immediate email alert to client: <span className="text-fresh-orange">"You have 1 new lead in your dashboard!"</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary py-3 px-8 text-sm shadow-xl shadow-fresh-orange/20 w-full md:w-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            {submitting ? 'Injecting Lead…' : 'Load Lead Into Client CRM'}
          </button>
        </div>
      </form>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
