import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { sendNewLeadsNotification } from '../../emailService'
import CsvUploader from '../../components/CsvUploader'
import { ToastContainer, useToast } from '../../components/Toast'
import { Upload, CheckCircle } from 'lucide-react'

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
        // Look up client profile by email via auth
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id',
            // Get profile via auth user lookup
            (await supabase.rpc('get_user_id_by_email', { user_email: email })).data
          )
          .single()

        if (!profile) {
          addToast(`Client not found: ${email}`, 'warning')
          continue
        }

        const leadsToInsert = clientRows.map(row => ({
          client_id: profile.id,
          homeowner_name: row.homeowner_name?.trim() || '',
          address: row.address?.trim() || '',
          phone: row.phone?.trim() || '',
          storm_date: row.storm_date || null,
          audio_url: row.audio_url?.trim() || null,
          status: 'new',
        }))

        const { error } = await supabase.from('leads').insert(leadsToInsert)

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
      addToast(`✅ ${totalInserted} leads uploaded across ${notifiedClients.length} clients. Notification emails sent.`, 'success')
    } catch (err) {
      addToast('Upload failed: ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-5 h-5 text-fresh-orange" />
          <span className="text-fresh-orange text-sm font-semibold">Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Upload Leads</h1>
        <p className="text-fresh-muted mt-1">
          Upload a CSV to assign leads to clients. Notification emails are sent automatically.
        </p>
      </div>

      {lastResult && (
        <div className="flex items-start gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium">Upload Successful</p>
            <p className="text-green-400/80 text-sm">
              {lastResult.inserted} leads inserted · {lastResult.clients} clients notified via email
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-3 bg-fresh-border/40 rounded-xl p-4 mb-6">
          <div className="w-5 h-5 border-2 border-fresh-border border-t-fresh-orange rounded-full animate-spin flex-shrink-0" />
          <p className="text-fresh-muted text-sm">Processing and uploading leads…</p>
        </div>
      )}

      <CsvUploader onUpload={handleUpload} />

      <div className="mt-8 card">
        <h3 className="font-display font-bold text-white mb-3">How it works</h3>
        <ol className="space-y-2 text-fresh-muted text-sm list-decimal list-inside">
          <li>Prepare your CSV with the required columns listed above</li>
          <li>Each <code className="text-slate-300 bg-fresh-border px-1 rounded">client_email</code> must match a registered CRM account</li>
          <li>Upload the file and preview the data</li>
          <li>Click "Upload Leads" to insert and notify clients</li>
          <li>Clients receive an email: "You have X new leads in your dashboard!"</li>
        </ol>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
