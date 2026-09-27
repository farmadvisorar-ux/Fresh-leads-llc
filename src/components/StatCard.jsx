export default function StatCard({ label, value, icon: Icon, color = 'orange', sub }) {
  const colorMap = {
    orange: 'text-fresh-orange bg-fresh-orange/10 border-fresh-orange/20',
    blue: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
    green: 'text-green-400 bg-green-900/20 border-green-800/30',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
    slate: 'text-slate-400 bg-slate-800/40 border-slate-700/30',
  }

  return (
    <div className="card flex items-center gap-4 hover:border-fresh-orange/20 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-fresh-muted text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        {sub && <p className="text-xs text-fresh-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
