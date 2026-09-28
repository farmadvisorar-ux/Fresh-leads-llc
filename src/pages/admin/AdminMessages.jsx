import { useState, useEffect } from 'react'
import { api } from '../../firebase'
import { format } from 'date-fns'
import {
  MessageSquare, Send, Reply, User, Mail, ArrowUpRight,
  ArrowDownLeft, Clock, CheckCircle
} from 'lucide-react'
import { ToastContainer, useToast } from '../../components/Toast'

export default function AdminMessages() {
  const { toasts, addToast, removeToast } = useToast()
  const [messages, setMessages] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [mList, cList] = await Promise.all([
        api.getAllMessages(),
        api.getClients()
      ])
      setMessages(mList || [])
      setClients(cList || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReply(e) {
    e.preventDefault()
    if (!replyText.trim() || !replyingTo) return

    setSending(true)
    try {
      const saved = await api.saveMessage({
        clientId: replyingTo.client_id,
        subject: `Re: ${replyingTo.subject}`,
        body: replyText.trim(),
        direction: 'inbound', // inbound to client from FreshLeads
      })

      setMessages(prev => [saved, ...prev])
      addToast('Reply dispatched to client CRM portal!', 'success')
      setReplyingTo(null)
      setReplyText('')
    } catch (err) {
      addToast('Failed to dispatch reply: ' + err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-fresh-orange" />
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
            Support Desk & Inquiries
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
          Client Messages to info@freshleads.llc
        </h1>
        <p className="text-fresh-muted text-xs mt-1">
          Review incoming client inquiries, schedule adjustments, and reply directly to client dashboards.
        </p>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="card text-center py-12 text-fresh-muted text-xs">
            Loading client messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="card text-center py-12 text-fresh-muted text-xs">
            No support messages received yet
          </div>
        ) : (
          messages.map(msg => {
            const client = clients.find(c => c.id === msg.client_id)
            const isClientToFreshLeads = msg.direction === 'outbound'

            return (
              <div
                key={msg.id}
                className={`card transition-colors ${
                  isClientToFreshLeads
                    ? 'border-fresh-orange/30 bg-[#0C0E14]'
                    : 'border-fresh-border/60 bg-fresh-card/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isClientToFreshLeads
                        ? 'bg-fresh-orange/20 text-fresh-orange'
                        : 'bg-emerald-950/40 text-emerald-400'
                    }`}>
                      {isClientToFreshLeads ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {isClientToFreshLeads ? (client?.company || client?.full_name || 'Client') : 'FreshLeads Support'}
                        </span>
                        <span className="text-[10px] bg-fresh-border px-1.5 py-0.5 rounded text-fresh-muted">
                          {isClientToFreshLeads ? `Sent to info@freshleads.llc` : `Sent to ${client?.full_name || 'Client'}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-fresh-muted">
                        {client?.email} {client?.phone ? `• ${client.phone}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-fresh-muted text-[11px] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {msg.sent_at ? format(new Date(msg.sent_at), 'MMM d, h:mm a') : ''}
                  </span>
                </div>

                <div className="pl-11 mt-1">
                  <h4 className="font-semibold text-slate-200 text-xs">{msg.subject}</h4>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                    {msg.body}
                  </p>

                  {isClientToFreshLeads && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setReplyingTo(msg)
                          setReplyText('')
                        }}
                        className="btn-secondary text-[11px] py-1 px-3 inline-flex items-center gap-1.5"
                      >
                        <Reply className="w-3 h-3 text-fresh-orange" />
                        <span>Reply to {client?.full_name?.split(' ')[0] || 'Client'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg border-fresh-orange/40 shadow-2xl animate-slide-up">
            <h2 className="text-base font-display font-bold text-white mb-1">
              Reply to: {replyingTo.subject}
            </h2>
            <p className="text-fresh-muted text-xs mb-4">
              Dispatches from FreshLeads Support into the client's CRM portal thread.
            </p>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body *</label>
                <textarea
                  required
                  rows={6}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="input-field text-xs resize-none"
                  placeholder="Type your response to the roofing contractor here…"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending…' : 'Send Reply'}</span>
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
