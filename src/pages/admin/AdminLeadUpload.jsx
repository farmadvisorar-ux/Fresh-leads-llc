import { useState } from 'react'
import { api } from '../../firebase'
import { sendNewLeadsNotification } from '../../emailService'
import CsvUploader from '../../components/CsvUploader'
import { ToastContainer, useToast } from '../../components/Toast'
import { Upload, CheckCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminLeadUpload() {
  const { toasts, addToast, removeToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  async function handleUpload(rows) {
    setUploading(true)
    setLastResult(null)

    try {
      // Group rows by client_email
      const byClient = {}
      for (const row of rows) {
        const email = row.client_email?.trim().toLowerCase()
        if (!email) continue
        if (!byClient[email]) byClient[email] = []
        byClient[email].push(row)
      }

      let totalInserted = 0
      const notifiedClients = []

      for (const [email, clientRows] of Object.entries(byClient)) {
        // Look up client profile by email
        let profile = await api.findProfileByEmail(email)

        if (!profile) {
          // Auto-create client profile if not existing
          profile = await api.createClientAccount({
            email,
            fullName: email.split('@')[0],
            company: 'Roofing Contractor',
            phone: '',
          })
        }

        const leadsToInsert = clientRows.map(row => ({
          client_id: profile.id,
          homeowner_name: row.homeowner_name?.trim() || '',
          address: row.address?.trim() || '',
          phone: row.phone?.trim() || '',
          insurance_carrier: row.insurance_carrier || row.insurance || 'State Farm',
          storm_date: row.storm_date || null,
          appointment_date: row.appointment_date || row.appointment || 'Pre-Set Inspection',
          audio_url: row.audio_url?.trim() || row.audio?.trim() || null,
          audio_filename: `${(row.homeowner_name || 'lead').replace(/\s+/g, '_')}_call.mp3`,
          notes: row.notes?.trim() || 'Homeowner confirmed inspection appointment and active homeowner policy.',
          status: 'new',
        }))

        const { error } = await api.bulkInsertLeads(leadsToInsert)

        if (error) {
          addToast(`Failed to insert for ${email}: ${error.message}`, 'error')
        } else {
          totalInserted += leadsToInsert.length
          notifiedClients.push({ email, name: profile.full_name, count: leadsToInsert.length })
        }
      }

      // Send notifications
      for (const { email, name, count } of notifiedClients) {
        try {
          await sendNewLeadsNotification({ toName: name, toEmail: email, leadCount: count })
        } catch (e) {
          console.warn('Notification email failed for', email, e)
        }
      }

      setLastResult({ inserted: totalInserted, clients: notifiedClients.length })
      addToast(`✅ ${totalInserted} leads uploaded across ${notifiedClients.length} clients. Notification emails triggered.`, 'success')
    } catch (err) {
      addToast('Upload failed: ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-12">
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
              <Upload className="w-4 h-4 text-fresh-orange" />
              <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
                Bulk Dispatch
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">
              Bulk CSV Lead Uploader
            </h1>
          </div>
        </div>

        <Link
          to="/admin/leads/new"
          className="btn-secondary text-xs py-2 px-3"
        >
          Single Lead Form
        </Link>
      </div>

      {lastResult && (
        <div className="flex items-start gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium">Batch Upload Successful</p>
            <p className="text-green-400/80 text-xs mt-0.5">
              {lastResult.inserted} leads inserted & assigned · {lastResult.clients} clients notified via email
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-3 bg-fresh-border/40 rounded-xl p-4">
          <div className="w-5 h-5 border-2 border-fresh-border border-t-fresh-orange rounded-full animate-spin flex-shrink-0" />
          <p className="text-fresh-muted text-xs">Parsing file, matching clients, and dispatching leads…</p>
        </div>
      )}

      <CsvUploader onUpload={handleUpload} />

      <div className="card space-y-3">
        <h3 className="font-display font-bold text-white text-sm">Supported CSV Header Names</h3>
        <p className="text-fresh-muted text-xs leading-relaxed">
          Your CSV file can include the following columns:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-fresh-orange font-bold">client_email</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">Contractor's account email</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-fresh-orange font-bold">homeowner_name</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">Homeowner contact name</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-fresh-orange font-bold">address</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">Property address & city</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-fresh-orange font-bold">phone</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">Homeowner phone number</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-slate-300 font-bold">insurance_carrier</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">e.g. State Farm, Allstate</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-slate-300 font-bold">audio_url</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">Call recording URL (.mp3 / link)</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-slate-300 font-bold">storm_date</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">YYYY-MM-DD format</p>
          </div>
          <div className="bg-fresh-border/30 p-2 rounded">
            <code className="text-slate-300 font-bold">appointment_date</code>
            <p className="text-fresh-muted text-[11px] mt-0.5">e.g. "Tuesday 2:00 PM"</p>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
