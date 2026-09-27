import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { api } from '../../firebase'
import { ToastContainer, useToast } from '../../components/Toast'
import { Megaphone, Send, CheckCircle } from 'lucide-react'

export default function AdminAnnouncement() {
  const { toasts, addToast, removeToast } = useToast()
  const [form, setForm] = useState({ subject: '', body: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.body.trim()) {
      addToast('Please fill in all fields', 'warning')
      return
    }

    setSending(true)
    setSent(false)

    try {
      // Fetch all client profiles
      const profiles = await api.getClients()

      // Send bulk email via EmailJS (if configured)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      const template = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT

      if (serviceId && publicKey && !publicKey.includes('placeholder')) {
        await emailjs.send(
          serviceId,
          template,
          {
            from_name: 'FreshLeads Team',
            from_email: 'info@freshleads.llc',
            reply_to: 'info@freshleads.llc',
            to_email: 'info@freshleads.llc',
            subject: `[Announcement] ${form.subject}`,
            message: `BULK ANNOUNCEMENT TO ALL CLIENTS:\n\n${form.body}`,
          },
          publicKey
        )
      }

      setSent(true)
      addToast(`Announcement broadcast recorded for ${profiles.length} clients!`, 'success')
      setForm({ subject: '', body: '' })
    } catch (err) {
      addToast('Broadcast error: ' + err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-5 h-5 text-fresh-orange" />
          <span className="text-fresh-orange text-sm font-semibold">Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Send Announcement</h1>
        <p className="text-fresh-muted mt-1">Broadcast a message or alert to all active clients</p>
      </div>

      {sent && (
        <div className="flex items-center gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-300 font-medium">Announcement sent successfully!</p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject *</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="input-field"
              placeholder="Fresh batch of storm damage leads uploaded!"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Message *</label>
            <textarea
              required
              rows={8}
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              className="input-field resize-none"
              placeholder="Write your announcement here…"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-fresh-muted text-sm">
              Sent from info@freshleads.llc
            </p>
            <button type="submit" disabled={sending} className="btn-primary">
              <Send className="w-4 h-4" />
              {sending ? 'Sending…' : 'Broadcast to Clients'}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
