import { useState } from 'react'
import {
  Zap,
  Play,
  Save,
  Download,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'
import {
  Sankey,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const OptimizationEngine = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle')
  const [objective, setObjective] = useState('minimize-cost')
  const [timeHorizon, setTimeHorizon] = useState('1-month')
  const [constraints, setConstraints] = useState({
    capacity: true,
    quality: true,
    sequential: true,
    rake: true,
    maxPortCalls: true
  })
  const [costWeights, setCostWeights] = useState({
    ocean: 40,
    port: 30,
    railway: 20,
    demurrage: 10
  })

  const results = {
    totalCost: 8.45,
    currentCost: 9.2,
    savings: 0.75,
    executionTime: '12.3s',
    feasible: true
  }

  const comparison = [
    { metric: 'Total Cost', current: '₹9.2 Cr', optimized: '₹8.45 Cr', change: '-8.2%', improvement: true },
    { metric: 'Ocean Freight', current: '₹5.8 Cr', optimized: '₹5.4 Cr', change: '-6.9%', improvement: true },
    { metric: 'Port Costs', current: '₹1.7 Cr', optimized: '₹1.6 Cr', change: '-5.9%', improvement: true },
    { metric: 'Railway Costs', current: '₹1.4 Cr', optimized: '₹1.3 Cr', change: '-7.1%', improvement: true },
    { metric: 'Demurrage', current: '₹0.3 Cr', optimized: '₹0.15 Cr', change: '-50%', improvement: true },
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Optimization Engine</h1>
          <p className="text-gray-400 text-sm">Generate least-cost logistics plans</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-base cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-primary-dark hover:shadow-md">
            <Play size={20} className="text-white" />
            Run Optimization
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Save size={16} className="text-gray-700" />
            Load Scenario
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Save Scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        <div className="bg-white rounded-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Optimization Settings</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Objective Function</label>
            <div className="space-y-2">
              {[
                { value: 'minimize-cost', label: 'Minimize Total Cost' },
                { value: 'maximize-utilization', label: 'Maximize Port Utilization' },
                { value: 'balanced', label: 'Balanced Approach' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="objective"
                    value={opt.value}
                    checked={objective === opt.value}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1-week">1 Week</option>
              <option value="2-weeks">2 Weeks</option>
              <option value="1-month">1 Month</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Constraints</label>
            <div className="space-y-2">
              {Object.entries(constraints).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setConstraints({ ...constraints, [key]: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Cost Weights</label>
            {Object.entries(costWeights).map(([key, value]) => (
              <div key={key} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setCostWeights({ ...costWeights, [key]: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          {status === 'running' && (
            <div className="bg-blue-50 border border-blue-200 rounded-card p-4 mb-6 flex items-center gap-3">
              <Loader className="animate-spin text-blue-600" size={20} />
              <div>
                <div className="font-semibold text-blue-900">Optimization in Progress...</div>
                <div className="text-sm text-blue-700">This may take a few minutes</div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-card p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <div className="font-semibold text-green-900">Optimization Complete</div>
                <div className="text-sm text-green-700">Completed at {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-card p-5 shadow-sm">
              <div className="text-xs text-gray-600 mb-2">Total Optimized Cost</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">₹{results.totalCost} Cr</div>
              <div className="text-xs text-gray-600">vs ₹{results.currentCost} Cr</div>
            </div>
            <div className="bg-gray-200 rounded-card p-5 shadow-sm border-2 border-primary">
              <div className="text-xs text-gray-600 mb-2">Cost Savings</div>
              <div className="text-2xl font-bold text-primary mb-1">₹{results.savings} Cr</div>
              <div className="text-xs text-success font-semibold">+{((results.savings / results.currentCost) * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-card p-5 shadow-sm">
              <div className="text-xs text-gray-600 mb-2">Execution Time</div>
              <div className="text-2xl font-bold text-gray-900">{results.executionTime}</div>
            </div>
            <div className="bg-white rounded-card p-5 shadow-sm">
              <div className="text-xs text-gray-600 mb-2">Solution Feasibility</div>
              <div className="flex items-center gap-2 mt-2">
                {results.feasible ? (
                  <>
                    <CheckCircle className="text-success" size={20} />
                    <span className="text-lg font-semibold text-success">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-error" size={20} />
                    <span className="text-lg font-semibold text-error">No</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card p-6 shadow-sm mb-6">
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {['Vessel-Port Flow', 'Port-Plant Flow', 'Cost Analysis', 'Constraints'].map((tab, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${idx === 0
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Visualization will appear here</p>
            </div>
          </div>

          <div className="bg-white rounded-card p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparison: Current vs Optimized</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Metric</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Current Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Optimized Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{row.metric}</td>
                      <td className="px-4 py-3 text-sm">{row.current}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{row.optimized}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${row.improvement ? 'text-success' : 'text-error'}`}>
                          {row.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-card p-4 shadow-sm sticky bottom-0 flex gap-3">
            <button className="flex-1 px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all hover:bg-primary-dark hover:shadow-md">
              Accept & Implement
            </button>
            <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
              Modify Parameters
            </button>
            <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
              <Download size={16} className="text-gray-700" />
              Export Report
            </button>
            <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
              Run Sensitivity Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptimizationEngine

