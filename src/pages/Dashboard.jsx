import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useColonies } from '../hooks/useColonies'
import { useAllCats } from '../hooks/useCats'
import { useTraps } from '../hooks/useTraps'
import { Badge } from '../components/UI/Badge'
import { Button } from '../components/UI/Button'
import { CardSkeleton } from '../components/UI/Skeleton'
import { exportColoniesCSV } from '../lib/exportCSV'
import { openVetSummary } from '../lib/vetExport'
import toast from 'react-hot-toast'

function StatCard({ value, label, icon, color = 'green' }) {
  const colors = {
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    teal: 'bg-teal-50 text-teal-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center text-sm font-bold mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { colonies, loading: coloniesLoading } = useColonies()
  const { cats, loading: catsLoading } = useAllCats()
  const { traps } = useTraps()

  const loading = coloniesLoading || catsLoading
  const totalCats = cats.length
  const totalNeutered = cats.filter(cat => cat.neutered).length
  const neuteredPct = totalCats > 0 ? Math.round((totalNeutered / totalCats) * 100) : 0
  const activeTraps = traps.filter(trap => trap.status === 'in_use').length

  const chartData = colonies.map(colony => {
    const colonyCats = cats.filter(cat => cat.colony_id === colony.id)
    const neutered = colonyCats.filter(cat => cat.neutered).length
    return {
      name: colony.name.length > 15 ? `${colony.name.slice(0, 12)}...` : colony.name,
      neutered,
      intact: colonyCats.length - neutered,
      total: colonyCats.length,
    }
  }).sort((a, b) => b.total - a.total).slice(0, 10)

  function handleExport() {
    exportColoniesCSV(colonies, cats)
    toast.success('CSV downloaded')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of all colonies and cats</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openVetSummary(cats, colonies)}>
            🏥 Vet Summary
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard value={colonies.length} label="Total colonies" icon="MAP" color="blue" />
          <StatCard value={totalCats} label="Total cats" icon="CAT" color="amber" />
          <StatCard value={totalNeutered} label="Neutered" icon="TNR" color="green" />
          <StatCard value={`${neuteredPct}%`} label="Neutered rate" icon="%" color="teal" />
          <StatCard value={activeTraps} label="Active traps" icon="TRAP" color="red" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Neutering Progress by Colony</h2>
        {loading || chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            {loading ? 'Loading chart...' : 'No data yet. Add some colonies to get started.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="neutered" fill="#16a34a" name="Neutered" radius={[4, 4, 0, 0]} />
              <Bar dataKey="intact" fill="#f59e0b" name="Intact" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Colony Overview</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
          </div>
        ) : colonies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-sm font-bold tracking-wide text-gray-400 mb-2">MAP</div>
            <p className="text-gray-500 text-sm">No colonies yet. Head to the map to add one.</p>
            <Link to="/">
              <Button size="sm" className="mt-3">Go to Map</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                  <th className="px-5 py-3">Colony</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Cats</th>
                  <th className="px-5 py-3">Neutered</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {colonies.map(colony => {
                  const colonyCats = cats.filter(cat => cat.colony_id === colony.id)
                  const neutered = colonyCats.filter(cat => cat.neutered).length
                  const pct = colonyCats.length > 0 ? Math.round((neutered / colonyCats.length) * 100) : 0

                  return (
                    <tr key={colony.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900 text-sm">{colony.name}</span>
                      </td>
                      <td className="px-5 py-3.5"><Badge status={colony.status} /></td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{colonyCats.length}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{neutered}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/colony/${colony.id}`} className="text-xs text-green-700 hover:text-green-800 font-medium hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
