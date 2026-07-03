import { useState } from 'react'
import { Plus, Download, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const SensitivityAnalysis = () => {
  const [scenarioName, setScenarioName] = useState('')

  const tornadoData = [
    { parameter: 'Railway Freight', impact: 15 },
    { parameter: 'Port Capacity', impact: 12 },
    { parameter: 'Ocean Freight', impact: 10 },
    { parameter: 'Demurrage Rate', impact: 8 },
    { parameter: 'Port Handling', impact: 5 },
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Sensitivity & What-If Analysis</h1>
          <p className="text-gray-400 text-sm">Test scenarios and analyze cost impacts</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-primary-dark hover:shadow-md">
            <Plus size={16} className="text-white" />
            New Scenario
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Compare Scenarios
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Load Template
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} className="text-gray-700" />
            Export Analysis
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenario Builder</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Name</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Ocean Freight Rate', 'Railway Freight Rate', 'Port Handling Costs', 'Demurrage Rate'].map((param, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{param}</label>
                <input type="range" min="-50" max="50" defaultValue="0" className="w-full" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>
            ))}
          </div>
          <button className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all hover:bg-primary-dark hover:shadow-md">
            Run Simulation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensitivity Analysis</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tornadoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="parameter" type="category" />
              <Tooltip />
              <Bar dataKey="impact" fill="#FF5722" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default SensitivityAnalysis

