import { useState, useEffect, useMemo } from 'react'
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
import { CatOfTheDay } from '../components/UI/CatOfTheDay'

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

/**
 * Main Dashboard page component.
 * Renders high-level metrics, spay/neuter progress charts, municipal quarterly reporting,
 * and a listing of all active colonies in a clean tabular view.
 */
export default function Dashboard() {
  const { colonies, loading: coloniesLoading } = useColonies()
  const { cats, loading: catsLoading } = useAllCats()
  const { traps } = useTraps()

  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [reportQuarter, setReportQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3))

  useEffect(() => {
    document.title = 'TNR Tracker — Dashboard'
  }, [])

  const loading = coloniesLoading || catsLoading
  const totalCats = cats.length
  const totalNeutered = cats.filter(cat => cat.neutered).length
  const neuteredPct = totalCats > 0 ? Math.round((totalNeutered / totalCats) * 100) : 0
  const activeTraps = traps.filter(trap => trap.status === 'in_use').length

  const quarterlyReport = useMemo(() => {
    if (cats.length === 0) return { totalLogged: 0, totalTnr: 0, successRate: 0, funding: 0 }
    
    const qMonths = {
      1: { start: 0, end: 2 },
      2: { start: 3, end: 5 },
      3: { start: 6, end: 8 },
      4: { start: 9, end: 11 }
    }
    const { start, end } = qMonths[reportQuarter]
    const startOfQuarter = new Date(reportYear, start, 1)
    const endOfQuarter = new Date(reportYear, end + 1, 0, 23, 59, 59, 999)

    const catsLoggedInQuarter = cats.filter(cat => {
      const d = new Date(cat.created_at)
      return d >= startOfQuarter && d <= endOfQuarter
    })

    const tnrdInQuarter = catsLoggedInQuarter.filter(cat => cat.neutered).length
    const successRate = catsLoggedInQuarter.length > 0 
      ? Math.round((tnrdInQuarter / catsLoggedInQuarter.length) * 100) 
      : 0
    const funding = tnrdInQuarter * 75 // $75 standard grant subsidy per spay/neuter

    return {
      totalLogged: catsLoggedInQuarter.length,
      totalTnr: tnrdInQuarter,
      successRate,
      funding
    }
  }, [cats, reportYear, reportQuarter])

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col h-full">
          <h2 className="font-semibold text-gray-900 mb-4">Neutering Progress by Colony</h2>
          {loading ? (
            <div className="flex-1 min-h-[280px] flex items-end gap-3 pb-8 px-4 animate-pulse">
              <div className="bg-gray-100 rounded-t-lg w-full h-[60%]" />
              <div className="bg-gray-200 rounded-t-lg w-full h-[80%]" />
              <div className="bg-gray-100 rounded-t-lg w-full h-[40%]" />
              <div className="bg-gray-200 rounded-t-lg w-full h-[90%]" />
              <div className="bg-gray-100 rounded-t-lg w-full h-[55%]" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex-1 min-h-[280px] flex items-center justify-center text-gray-400">
              No data yet. Add some colonies to get started.
            </div>
          ) : (
            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          )}
        </div>
        <div className="lg:col-span-1 min-h-[350px]">
          <CatOfTheDay />
        </div>
      </div>

      {/* Municipal Grant & Quarterly TNR Report Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> Municipal Grant & Quarterly TNR Report
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Generate municipal reporting metrics for Trap-Neuter-Return funding</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={reportYear}
              onChange={e => setReportYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <select
              value={reportQuarter}
              onChange={e => setReportQuarter(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1">Q1 (Jan - Mar)</option>
              <option value="2">Q2 (Apr - Jun)</option>
              <option value="3">Q3 (Jul - Sep)</option>
              <option value="4">Q4 (Oct - Dec)</option>
            </select>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => {
                const reportText = `TNR Tracker - Quarterly Grant Report\nPeriod: Q${reportQuarter} ${reportYear}\n----------------------------------\nTotal Cats Logged: ${quarterlyReport.totalLogged}\nTotal TNR Operations Completed: ${quarterlyReport.totalTnr}\nNeutering/TNR Success Rate: ${quarterlyReport.successRate}%\nEstimated Grant Subsidy ($75/cat): $${quarterlyReport.funding}\n----------------------------------\nGenerated on: ${new Date().toLocaleDateString()}`
                navigator.clipboard.writeText(reportText)
                toast.success('Report copied to clipboard!')
              }}
            >
              Copy Report
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center">
              <div className="text-xl font-bold text-gray-900">{quarterlyReport.totalLogged}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Cats Logged</div>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
              <div className="text-xl font-bold text-emerald-800">{quarterlyReport.totalTnr}</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">TNR Operations</div>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center">
              <div className="text-xl font-bold text-amber-800">{quarterlyReport.successRate}%</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Success Rate</div>
            </div>
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 text-center">
              <div className="text-xl font-bold text-green-800">${quarterlyReport.funding}</div>
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-0.5">Est. Funding</div>
            </div>
          </div>
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
