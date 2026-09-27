import { format } from 'date-fns'
import { Mail, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function MessageThread({ messages }) {
  if (!messages.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <Mail className="w-12 h-12 text-fresh-muted mb-4" />
        <p className="text-slate-400 font-medium">No messages yet</p>
        <p className="text-fresh-muted text-sm mt-1">Use the compose form to send your first message</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map(msg => (
        <div key={msg.id} className="card hover:border-fresh-orange/20 transition-colors">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.direction === 'outbound'
                ? 'bg-fresh-orange/10 text-fresh-orange'
                : 'bg-blue-900/20 text-blue-400'
            }`}>
              {msg.direction === 'outbound'
                ? <ArrowUpRight className="w-4 h-4" />
                : <ArrowDownLeft className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-fresh-muted">
                  {msg.direction === 'outbound' ? 'You → info@freshleads.llc' : 'FreshLeads → You'}
                </span>
                <span className="text-xs text-fresh-muted ml-auto">
                  {format(new Date(msg.sent_at), 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
              <p className="font-semibold text-slate-100 text-sm">{msg.subject}</p>
              <p className="text-fresh-muted text-sm mt-1 whitespace-pre-wrap">{msg.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
