import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../hooks/useMessages'
import { sendContactMessage, sendAutoReply } from '../emailService'
import Sidebar from '../components/Sidebar'
import MessageThread from '../components/MessageThread'
import LoadingSpinner from '../components/LoadingSpinner'
import { ToastContainer, useToast } from '../components/Toast'
import { MessageSquare, Send, PenSquare } from 'lucide-react'

export default function Messages() {
  const { profile, user } = useAuth()
  const { messages, loading, saveMessage } = useMessages()
  const { toasts, addToast, removeToast } = useToast()

  const [composing, setComposing] = useState(false)
  const [form, setForm] = useState({ subject: '', body: '' })
  const [sending, setSending] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.body.trim()) {
      addToast('Please fill in subject and message', 'warning')
      return
    }

    setSending(true)
    try {
      // 1) Send via EmailJS to info@freshleads.llc
      await sendContactMessage({
        fromName: profile?.full_name || 'Client',
        fromEmail: user?.email,
        subject: form.subject,
        body: form.body,
      })

      // 2) Send auto-reply to client
      await sendAutoReply({
        toName: profile?.full_name || 'there',
        toEmail: user?.email,
        subject: form.subject,
      })

      // 3) Save to Supabase for thread display
      await saveMessage({ subject: form.subject, body: form.body, direction: 'outbound' })

      addToast('Message sent! We\'ll reply within 24 hours.', 'success')
      setForm({ subject: '', body: '' })
      setComposing(false)
    } catch (err) {
      addToast('Failed to send message. Please try again.', 'error')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading messages…" />

  return (
    <div className="flex h-screen bg-fresh-black overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-fresh-orange" />
                <span className="text-fresh-orange text-sm font-semibold">Messages</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white">Contact Support</h1>
              <p className="text-fresh-muted mt-1">Send a message to our team at info@freshleads.llc</p>
            </div>
            {!composing && (
              <button onClick={() => setComposing(true)} className="btn-primary">
                <PenSquare className="w-4 h-4" />
                New Message
              </button>
            )}
          </div>

          {/* Compose Form */}
          {composing && (
            <div className="card mb-6 animate-slide-up">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-fresh-orange" />
                New Message
              </h3>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">To</label>
                  <input
                    type="text"
                    value="info@freshleads.llc"
                    readOnly
                    className="input-field opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">From</label>
                  <input
                    type="text"
                    value={`${profile?.full_name || ''} <${user?.email}>`}
                    readOnly
                    className="input-field opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                    placeholder="Question about my leads…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Type your message here…"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={sending} className="btn-primary">
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                  <button type="button" onClick={() => setComposing(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Thread */}
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-4">Message History</h2>
            <MessageThread messages={messages} />
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
