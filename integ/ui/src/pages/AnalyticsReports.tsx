import { Calendar, Download, FileText, BarChart3 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AnalyticsReports = () => {
  const kpis = [
    { name: 'Total Logistics Cost', value: '₹9.2 Cr', change: '+2.3%', trend: 'up' },
    { name: 'Cost per MT Delivered', value: '₹1,450', change: '-5.2%', trend: 'down' },
    { name: 'Avg Port Turnaround', value: '3.2 days', change: '-8%', trend: 'down' },
    { name: 'On-Time Delivery Rate', value: '87%', change: '+3%', trend: 'up' },
    { name: 'Port Utilization %', value: '82%', change: '+5%', trend: 'up' },
    { name: 'Demurrage Costs', value: '₹0.3 Cr', change: '-12%', trend: 'down' },
    { name: 'Railway Efficiency', value: '94%', change: '+2%', trend: 'up' },
    { name: 'Optimization Savings', value: '₹2.4 Cr', change: '+18%', trend: 'up', highlight: true },
  ]

  const trendData = [
    { month: 'Jan', ocean: 45, port: 12, railway: 28, demurrage: 5, total: 90 },
    { month: 'Feb', ocean: 48, port: 14, railway: 30, demurrage: 4, total: 96 },
    { month: 'Mar', ocean: 52, port: 15, railway: 32, demurrage: 6, total: 105 },
    { month: 'Apr', ocean: 50, port: 13, railway: 31, demurrage: 5, total: 99 },
    { month: 'May', ocean: 55, port: 16, railway: 34, demurrage: 7, total: 112 },
    { month: 'Jun', ocean: 58, port: 17, railway: 35, demurrage: 6, total: 116 },
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Analytics & Reports</h1>
          <p className="text-gray-400 text-sm">Track performance and generate insights</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Calendar size={16} className="text-gray-700" />
            Date Range
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} className="text-gray-700" />
            Export Report
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Schedule Report
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Custom Report Builder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${kpi.highlight ? 'bg-gradient-to-br from-primary to-primary-light text-white' : ''
              }`}
          >
            <div className="text-xs text-gray-600 mb-2 uppercase tracking-wide">{kpi.name}</div>
            <div className={`text-2xl font-bold mb-1 ${kpi.highlight ? 'text-white' : 'text-gray-900'}`}>
              {kpi.value}
            </div>
            <div className={`text-xs font-semibold ${kpi.trend === 'up' ? 'text-success' : 'text-error'
              } ${kpi.highlight ? 'text-white/90' : ''}`}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Trends Analysis</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ocean" stroke="#FF5722" name="Ocean Freight" />
            <Line type="monotone" dataKey="port" stroke="#FF9800" name="Port Costs" />
            <Line type="monotone" dataKey="railway" stroke="#2196F3" name="Railway Freight" />
            <Line type="monotone" dataKey="demurrage" stroke="#F44336" name="Demurrage" />
            <Line type="monotone" dataKey="total" stroke="#212121" strokeWidth={3} name="Total Cost" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AnalyticsReports

