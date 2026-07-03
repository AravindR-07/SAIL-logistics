import { Calendar,AlertTriangle, Download, FileText, Filter, TrendingUp, DollarSign, Activity } from 'lucide-react'
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts'

import { useState } from 'react'
// import { api, TwinState } from '../services/api' // Keeping for future use if needed, but commenting out to clear lint

const AnalyticsReports = () => {
  // const [twinState, setTwinState] = useState<TwinState | null>(null)
  const [timeRange] = useState('This Month')

  /*
  useEffect(() => {
    const fetchState = async () => {
      try {
        const state = await api.getState()
        setTwinState(state)
      } catch (error) {
        console.error('Failed to fetch twin state:', error)
      }
    }
    fetchState()
  }, [])
  */

  // --- MOCK DATA GENERATION (To be replaced with real backend data later) ---

  // 1. Performance Radar Data (Comparing Ports)
  const radarData = [
    { subject: 'Turnaround Time', A: 120, B: 110, fullMark: 150 },
    { subject: 'Cost Efficiency', A: 98, B: 130, fullMark: 150 },
    { subject: 'Safety Score', A: 86, B: 130, fullMark: 150 },
    { subject: 'Reliability', A: 99, B: 100, fullMark: 150 },
    { subject: 'Capacity Util', A: 85, B: 90, fullMark: 150 },
    { subject: 'Sustainability', A: 65, B: 85, fullMark: 150 },
  ];

  // 2. Spend vs Volume Data (Composed Chart)
  const spendData = [
    { name: 'Jan', volume: 4000, cost: 2400, amt: 2400 },
    { name: 'Feb', volume: 3000, cost: 1398, amt: 2210 },
    { name: 'Mar', volume: 2000, cost: 9800, amt: 2290 },
    { name: 'Apr', volume: 2780, cost: 3908, amt: 2000 },
    { name: 'May', volume: 1890, cost: 4800, amt: 2181 },
    { name: 'Jun', volume: 2390, cost: 3800, amt: 2500 },
    { name: 'Jul', volume: 3490, cost: 4300, amt: 2100 },
  ];

  // 3. Heatmap Data (Congestion Risk)
  // Mocking a grid of ports vs days
  const heatmapData = [
    { port: 'Paradip', d1: 1, d2: 2, d3: 4, d4: 2, d5: 1 }, // 1=Low, 4=Critical
    { port: 'Haldia', d1: 2, d2: 3, d3: 2, d4: 1, d5: 2 },
    { port: 'Visakhapatnam', d1: 3, d2: 4, d3: 4, d4: 3, d5: 2 },
    { port: 'Dhamra', d1: 1, d2: 1, d3: 1, d4: 1, d5: 1 },
  ];

  const getRiskColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-emerald-100 text-emerald-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-orange-100 text-orange-700';
      case 4: return 'bg-red-100 text-red-700 font-bold';
      default: return 'bg-gray-100';
    }
  }


  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-500">Deep dive into operational performance and financial insights.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Calendar size={16} />
            {timeRange}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Top Cards Row - Strategic KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Total Spend</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={16} /></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">₹42.5 Cr</div>
          <div className="text-xs text-green-600 flex items-center gap-1"><TrendingUp size={12} /> +12% vs last month</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Avg Cost/Ton</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Activity size={16} /></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">₹1,240</div>
          <div className="text-xs text-green-600 flex items-center gap-1"><TrendingUp size={12} /> -5% efficiency gain</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Avg Turnaround</span>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Activity size={16} /></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">3.2 Days</div>
          <div className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> +0.5 days delayed</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-500">Risk Score</span>
            <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={16} /></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">Low (12)</div>
          <div className="text-xs text-gray-400">Stable vs last week</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* 1. Spend vs Volume Analyzer (Composed Chart) - Takes up 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Spend vs Volume Analysis</h2>
              <p className="text-sm text-gray-500">Correlation between cargo volume and total logistics cost.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">Monthly</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-full">Quarterly</button>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={spendData}>
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="name" scale="band" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="volume" barSize={30} fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume (MT)" />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Cost (₹)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Performance Radar (Square) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Port Performance Radar</h2>
            <p className="text-sm text-gray-500">Benchmarking Paradip vs Haldia</p>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Paradip" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Haldia" dataKey="B" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                <Legend />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Heatmap & Data Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* 3. Congestion Heatmap */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Congestion Heatmap</h2>
              <p className="text-sm text-gray-500">Port congestion levels over the last 5 days.</p>
            </div>
            <Filter size={16} className="text-gray-400 cursor-pointer hover:text-blue-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Port Name</th>
                  <th className="px-2 py-3 text-center">Mon</th>
                  <th className="px-2 py-3 text-center">Tue</th>
                  <th className="px-2 py-3 text-center">Wed</th>
                  <th className="px-2 py-3 text-center">Thu</th>
                  <th className="px-2 py-3 text-center rounded-r-lg">Fri</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">{row.port}</td>
                    {[row.d1, row.d2, row.d3, row.d4, row.d5].map((val, i) => (
                      <td key={i} className="px-2 py-2 text-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-xs font-semibold ${getRiskColor(val)}`}>
                          {val}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Interactive Data Explorer (Placeholder for "Pivot" capability) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Data Explorer</h2>
            <p className="text-sm text-gray-500">Create custom views and download reports.</p>
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3">
              <FileText size={24} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Custom Report Builder</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-[200px]">Drag and drop metrics to create pivot tables and custom charts.</p>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm">
              Launch Builder
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnalyticsReports
