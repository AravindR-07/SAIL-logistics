import { useState } from 'react'
import {
  Zap,
  Calendar,
  Download
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const RailwayDispatch = () => {
  const [kanbanColumns] = useState({
    available: [
      { id: 1, material: 'Coking Coal', qty: '45,000 MT', origin: 'Haldia', destination: 'Plant A', quality: 'Grade A', priority: 'high', date: '2024-01-20' },
      { id: 2, material: 'Limestone', qty: '32,000 MT', origin: 'Paradip', destination: 'Plant B', quality: 'Grade B', priority: 'medium', date: '2024-01-22' },
    ],
    scheduled: [
      { id: 3, material: 'Coking Coal', qty: '50,000 MT', origin: 'Visakhapatnam', destination: 'Plant A', quality: 'Grade A', priority: 'high', date: '2024-01-18' },
    ],
    inTransit: [
      { id: 4, material: 'Limestone', qty: '28,000 MT', origin: 'Haldia', destination: 'Plant C', quality: 'Grade A', priority: 'low', date: '2024-01-15' },
    ],
    delivered: [
      { id: 5, material: 'Coking Coal', qty: '40,000 MT', origin: 'Paradip', destination: 'Plant A', quality: 'Grade A', priority: 'high', date: '2024-01-12' },
    ],
    qualityHold: []
  })

  const plantRequirements = [
    { plant: 'Plant A', material: 'Coking Coal', required: 120000, currentStock: 45000, pending: 2, daysInventory: 8, quality: 'Grade A', priority: 'high' },
    { plant: 'Plant B', material: 'Limestone', required: 80000, currentStock: 32000, pending: 1, daysInventory: 12, quality: 'Grade B', priority: 'medium' },
    { plant: 'Plant C', material: 'Coking Coal', required: 100000, currentStock: 28000, pending: 0, daysInventory: 5, quality: 'Grade A', priority: 'high' },
  ]

  const rakeAvailability = [
    { day: 'Mon 15', available: 8, total: 10 },
    { day: 'Tue 16', available: 6, total: 10 },
    { day: 'Wed 17', available: 9, total: 10 },
    { day: 'Thu 18', available: 7, total: 10 },
    { day: 'Fri 19', available: 5, total: 10 },
    { day: 'Sat 20', available: 8, total: 10 },
    { day: 'Sun 21', available: 10, total: 10 },
  ]

  const costTrend = [
    { month: 'Jan', cost: 2.4 },
    { month: 'Feb', cost: 2.6 },
    { month: 'Mar', cost: 2.5 },
    { month: 'Apr', cost: 2.7 },
    { month: 'May', cost: 2.8 },
    { month: 'Jun', cost: 2.9 },
  ]

  const columnLabels: Record<string, string> = {
    available: 'Available at Port',
    scheduled: 'Scheduled',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    qualityHold: 'Quality Hold'
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Railway Dispatch Planning</h1>
          <p className="text-gray-400 text-sm">Schedule material movement from ports to plants</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-primary-dark hover:shadow-md">
            <Zap size={16} className="text-white" />
            Auto-Generate Plan
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Manual Schedule
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Calendar size={16} className="text-gray-700" />
            Check Rake Availability
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} className="text-gray-700" />
            Export Schedule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Dispatch Planning Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 overflow-x-auto">
          {Object.entries(kanbanColumns).map(([columnId, items]) => (
            <div key={columnId} className="min-w-[250px] bg-gray-50 rounded-lg p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 capitalize">{columnLabels[columnId] || columnId}</h3>
                <span className="bg-primary text-white px-2.5 py-1 rounded-full text-xs font-semibold">{items.length}</span>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm cursor-move transition-all hover:-translate-y-0.5 hover:shadow-md" draggable>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${item.material === 'Coking Coal'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                        {item.material}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' :
                          item.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="text-base font-bold text-gray-900">{item.qty}</div>
                      <div><span className="text-gray-600">From:</span> {item.origin}</div>
                      <div><span className="text-gray-600">To:</span> {item.destination}</div>
                      <div><span className="text-gray-600">Quality:</span> {item.quality}</div>
                      <div><span className="text-gray-600">Date:</span> {item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plant Requirements</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plant Name</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Material Type</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Required Qty (MT)</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Stock</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending Dispatches</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days of Inventory</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quality Specs</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody>
              {plantRequirements.map((plant, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm"><strong>{plant.plant}</strong></td>
                  <td className="px-3 py-3 text-sm">
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-900">
                      {plant.material}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">{plant.required.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(plant.currentStock / plant.required) * 100}%`,
                            background: plant.daysInventory < 7 ? '#F44336' : plant.daysInventory < 14 ? '#FF9800' : '#4CAF50'
                          }}
                        />
                      </div>
                      <span>{plant.currentStock.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm">{plant.pending}</td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${plant.daysInventory < 7
                        ? 'bg-red-100 text-red-700'
                        : plant.daysInventory < 14
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                      {plant.daysInventory} days
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">{plant.quality}</td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${plant.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : plant.priority === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                      {plant.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rake Availability Calendar</h2>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {rakeAvailability.map((day, idx) => {
              const availability = day.available / day.total
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow border-2 ${availability > 0.7
                      ? 'bg-green-50 border-green-500'
                      : availability > 0.5
                        ? 'bg-orange-50 border-orange-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                >
                  <div className="text-xs font-semibold text-gray-900 mb-2">{day.day}</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {day.available} / {day.total}
                  </div>
                  <div className="text-xs text-gray-600">Rakes Available</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Railway Cost Calculator</h2>
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Route</label>
              <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option>Haldia → Plant A</option>
                <option>Paradip → Plant B</option>
                <option>Visakhapatnam → Plant C</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Distance</label>
              <input type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white" value="1,250 km" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Quantity (MT)</label>
              <input type="number" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white" placeholder="Enter quantity" />
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center py-2 text-sm">
                <span>Base Freight:</span>
                <strong>₹1,250/MT</strong>
              </div>
              <div className="flex justify-between items-center py-2 text-sm">
                <span>Surcharges:</span>
                <strong>₹180/MT</strong>
              </div>
              <div className="flex justify-between items-center py-2 mt-2 pt-3 border-t-2 border-gray-200 text-base font-semibold">
                <span>Total Cost:</span>
                <strong className="text-primary text-lg">₹1,430/MT</strong>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Monthly Railway Spend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={costTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value} Cr`} />
                <Line type="monotone" dataKey="cost" stroke="#FF5722" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RailwayDispatch
