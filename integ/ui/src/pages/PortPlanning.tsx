import { useState } from 'react'
import {
  Zap,
  RefreshCw,
  Download,
  MapPin,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const PortPlanning = () => {
  const [vessels] = useState([
    { id: 1, name: 'MV Ocean Star', cargo: 'Coking Coal', parcel: '45,000 MT', assignedPort: null },
    { id: 2, name: 'MV Steel Carrier', cargo: 'Limestone', parcel: '32,000 MT', assignedPort: null },
    { id: 3, name: 'MV Bulk Express', cargo: 'Coking Coal', parcel: '50,000 MT', assignedPort: null },
    { id: 4, name: 'MV Cargo Master', cargo: 'Limestone', parcel: '28,000 MT', assignedPort: null },
  ])

  const ports = [
    {
      name: 'Haldia',
      currentStock: 185000,
      capacity: 200000,
      scheduled: 2,
      handlingCost: 450,
      storageCost: 25,
      qualityMix: '60% Coking Coal, 40% Limestone'
    },
    {
      name: 'Paradip',
      currentStock: 142000,
      capacity: 180000,
      scheduled: 1,
      handlingCost: 420,
      storageCost: 22,
      qualityMix: '70% Coking Coal, 30% Limestone'
    },
    {
      name: 'Visakhapatnam',
      currentStock: 165000,
      capacity: 220000,
      scheduled: 1,
      handlingCost: 480,
      storageCost: 28,
      qualityMix: '55% Coking Coal, 45% Limestone'
    },
  ]

  const costMatrix = [
    { vessel: 'MV Ocean Star', haldia: 2450000, paradip: 2380000, vizag: 2520000, optimal: 'paradip' },
    { vessel: 'MV Steel Carrier', haldia: 1820000, paradip: 1750000, vizag: 1890000, optimal: 'paradip' },
    { vessel: 'MV Bulk Express', haldia: 2720000, paradip: 2650000, vizag: 2800000, optimal: 'paradip' },
    { vessel: 'MV Cargo Master', haldia: 1680000, paradip: 1620000, vizag: 1750000, optimal: 'paradip' },
  ]

  const [constraintViolations] = useState<string[]>([])

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Port Planning & Allocation</h1>
          <p className="text-gray-400 text-sm">Optimize vessel-to-port assignments and manage capacity</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-primary-dark hover:shadow-md">
            <Zap size={16} className="text-white" />
            Run Optimization
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Manual Override
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-700" />
            Refresh
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} className="text-gray-700" />
            Export Plan
          </button>
        </div>
      </div>

      {constraintViolations.length > 0 && (
        <div className="bg-gray-50 border-l-4 border-gray-400 rounded-card p-4 mb-6 flex gap-3 items-start">
          <AlertTriangle size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Sequential Discharge Constraint: Haldia must be 2nd discharge port</strong>
            <div className="mt-2 flex flex-wrap gap-2">
              {constraintViolations.map((v, idx) => (
                <span key={idx} className="bg-white px-2 py-1 rounded text-xs">{v}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Port Selection Matrix</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 mt-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Incoming Vessels</h3>
            {vessels.map((vessel) => (
              <div
                key={vessel.id}
                className={`p-3 rounded-lg cursor-move transition-all hover:-translate-y-0.5 hover:shadow-md border-2 ${vessel.cargo === 'Coking Coal'
                  ? 'bg-gray-200 border-gray-400'
                  : 'bg-blue-100 border-info'
                  }`}
                draggable
              >
                <div className="text-sm font-semibold text-gray-900 mb-1">{vessel.name}</div>
                <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                  <span>{vessel.cargo}</span>
                  <span>{vessel.parcel}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ports.map((port, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} />
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{port.name}</h3>
                </div>
                <div className="min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col gap-2 transition-all hover:border-primary hover:bg-gray-100">
                  {vessels
                    .filter(v => v.assignedPort === port.name)
                    .map(vessel => (
                      <div
                        key={vessel.id}
                        className={`p-3 rounded-lg ${vessel.cargo === 'Coking Coal'
                          ? 'bg-gray-200 border-gray-400'
                          : 'bg-blue-100 border-info'
                          } border-2`}
                      >
                        <div className="text-sm font-semibold text-gray-900 mb-1">{vessel.name}</div>
                        <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                          <span>{vessel.cargo}</span>
                          <span>{vessel.parcel}</span>
                        </div>
                      </div>
                    ))}
                  <div className="flex-1 flex items-center justify-center text-gray-500 text-sm italic">
                    Drop vessels here
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
          <div className="text-sm text-gray-600">Total Estimated Cost:</div>
          <div className="text-2xl font-bold text-primary">₹8.65 Cr</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {ports.map((port, idx) => (
          <div key={idx} className="bg-white rounded-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={20} />
              <h3 className="text-lg font-semibold text-gray-900">{port.name}</h3>
            </div>
            <div className="flex justify-center mb-5">
              <div className="relative w-32 h-32">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${port.currentStock / port.capacity > 0.9 ? '#F44336' :
                      port.currentStock / port.capacity > 0.75 ? '#FF9800' : '#4CAF50'
                      } 0deg ${(port.currentStock / port.capacity) * 360}deg, #E0E0E0 ${(port.currentStock / port.capacity) * 360}deg 360deg)`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((port.currentStock / port.capacity) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Utilization</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Current Stock:', value: `${port.currentStock.toLocaleString()} MT` },
                { label: 'Available Capacity:', value: `${(port.capacity - port.currentStock).toLocaleString()} MT` },
                { label: 'Scheduled Arrivals:', value: `${port.scheduled}` },
                { label: 'Handling Cost:', value: `₹${port.handlingCost}/MT` },
                { label: 'Storage Cost:', value: `₹${port.storageCost}/day` },
                { label: 'Quality Mix:', value: port.qualityMix },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-sm pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <span className="text-gray-600">{stat.label}</span>
                  <strong className="text-gray-900">{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vessel</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Haldia</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paradip</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visakhapatnam</th>
              </tr>
            </thead>
            <tbody>
              {costMatrix.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm font-medium">{row.vessel}</td>
                  <td className={`px-3 py-4 ${row.optimal === 'haldia' ? 'bg-green-50' : ''}`}>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      ₹{(row.haldia / 100000).toFixed(2)}L
                      {row.optimal === 'haldia' && <CheckCircle size={16} className="text-success" />}
                    </div>
                  </td>
                  <td className={`px-3 py-4 ${row.optimal === 'paradip' ? 'bg-green-50' : ''}`}>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      ₹{(row.paradip / 100000).toFixed(2)}L
                      {row.optimal === 'paradip' && <CheckCircle size={16} className="text-success" />}
                    </div>
                  </td>
                  <td className={`px-3 py-4 ${row.optimal === 'vizag' ? 'bg-green-50' : ''}`}>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      ₹{(row.vizag / 100000).toFixed(2)}L
                      {row.optimal === 'vizag' && <CheckCircle size={16} className="text-success" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PortPlanning
