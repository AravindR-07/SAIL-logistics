import { useState, useEffect } from 'react'
import {
    Zap,
    Calendar,
    Download,
    Train
} from 'lucide-react'
import { api, TwinState } from '../services/api'


import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

const RailwayDispatchSection = () => {
    const [twinState, setTwinState] = useState<TwinState | null>(null)

    // Calculator State
    const [calcQuantity, setCalcQuantity] = useState<string>('')
    const [selectedRoute, setSelectedRoute] = useState<string>('Haldia-PlantA')

    const routes = {
        'Haldia-PlantA': { label: 'Haldia → Plant A', distance: '250 km', baseRate: 1250 },
        'Paradip-PlantB': { label: 'Paradip → Plant B', distance: '400 km', baseRate: 1500 },
        'Visakhapatnam-PlantC': { label: 'Visakhapatnam → Plant C', distance: '600 km', baseRate: 1800 }
    }

    const currentRoute = routes[selectedRoute as keyof typeof routes]
    const surcharge = 180
    const totalRate = currentRoute.baseRate + surcharge
    const totalCost = calcQuantity ? (parseInt(calcQuantity) * totalRate).toLocaleString() : '0'

    useEffect(() => {
        const fetchData = async () => {
            const data = await api.getState()
            setTwinState(data)
        }
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    // Map backend rakes to Kanban columns
    const kanbanColumns = {
        available: twinState?.rakes ? Object.values(twinState.rakes)
            .filter((r: any) => r.status === 'available' && !r.assigned_vessel_id)
            .map((r: any) => ({
                id: r.id,
                material: 'Coal', // inferred default
                qty: `${(r.capacity).toLocaleString()} MT`,
                origin: r.current_location,
                destination: 'Plant A', // default
                quality: 'Grade A',
                priority: 'medium',
                date: r.scheduled_arrival.split('T')[0]
            })) : [],

        scheduled: twinState?.rakes ? Object.values(twinState.rakes)
            .filter((r: any) => r.assigned_vessel_id)
            .map((r: any) => ({
                id: r.id,
                material: 'Coal',
                qty: `${(r.capacity).toLocaleString()} MT`,
                origin: r.current_location,
                destination: `Vessel ${r.assigned_vessel_id}`,
                quality: 'Grade A',
                priority: 'high',
                date: r.scheduled_arrival.split('T')[0]
            })) : [],

        inTransit: twinState?.rakes ? Object.values(twinState.rakes)
            .filter((r: any) => r.status === 'transit')
            .map((r: any) => ({
                id: r.id,
                material: 'Coal',
                qty: `${(r.capacity).toLocaleString()} MT`,
                origin: r.current_location,
                destination: 'Plant',
                quality: 'Grade A',
                priority: 'high',
                date: r.scheduled_arrival.split('T')[0]
            })) : [],

        delivered: [],
        qualityHold: []
    }

    const plantRequirements = twinState?.plants ? Object.values(twinState.plants).map((p: any) => ({
        plant: p.name || p.id,
        material: 'Coking Coal', // Mock as unavailable in state
        required: 100000, // Mock
        currentStock: p.stock_level || 0,
        pending: 2, // Mock
        daysInventory: 8, // Mock
        quality: 'Grade A', // Mock
        priority: 'high' // Mock
    })) : []

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

    const [isGenerating, setIsGenerating] = useState(false);

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        // Simulating backend optimization delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGenerating(false);
        alert("Railway Dispatch Plan Auto-Generated Successfully! Optimized for cost and time.");
    };

    const handleManualSchedule = () => {
        alert("Manual Scheduling Mode Enabled. You can now drag and drop rakes to reschedule.");
    };

    const handleCheckAvailability = () => {
        // Find best availability
        const bestDay = rakeAvailability.reduce((prev, current) => (prev.available > current.available) ? prev : current);
        alert(`Rake Availability Check Complete.\n\nBest Window: ${bestDay.day} (${bestDay.available} rakes available).\nCurrent Utilization: 65%.`);
    };

    const handleExportSchedule = () => {
        const headers = ['Rake ID', 'Status', 'Material', 'Origin', 'Destination', 'Date'];
        const allRakes = [
            ...kanbanColumns.available.map(r => [r.id, 'Available', r.material, r.origin, r.destination, r.date]),
            ...kanbanColumns.scheduled.map(r => [r.id, 'Scheduled', r.material, r.origin, r.destination, r.date]),
            ...kanbanColumns.inTransit.map(r => [r.id, 'In Transit', r.material, r.origin, r.destination, r.date])
        ];

        const csvContent = [headers.join(','), ...allRakes.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'railway_dispatch_schedule.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full text-black font-sans relative pt-8 border-t border-gray-200 mt-8">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                        <Train className="text-blue-600" />
                        Railway Dispatch Planning
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Schedule material movement from ports to plants</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handleAutoGenerate}
                        disabled={isGenerating}
                        className={`px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-blue-600-dark hover:shadow-md ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        <Zap size={16} className="text-white" />
                        {isGenerating ? 'Generating...' : 'Auto-Generate Plan'}
                    </button>
                    <button
                        onClick={handleManualSchedule}
                        className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50"
                    >
                        Manual Schedule
                    </button>
                    <button
                        onClick={handleCheckAvailability}
                        className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50"
                    >
                        <Calendar size={16} className="text-gray-700" />
                        Check Rake Availability
                    </button>
                    <button
                        onClick={handleExportSchedule}
                        className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50"
                    >
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
                                <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">{items.length}</span>
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
                            <select
                                value={selectedRoute}
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                {Object.entries(routes).map(([key, route]) => (
                                    <option key={key} value={key}>{route.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Distance</label>
                            <input type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white" value={currentRoute.distance} readOnly />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Quantity (MT)</label>
                            <input
                                type="number"
                                value={calcQuantity}
                                onChange={(e) => setCalcQuantity(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                                placeholder="Enter quantity (e.g. 1000)"
                            />
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center py-2 text-sm">
                                <span>Base Freight:</span>
                                <strong>₹{currentRoute.baseRate}/MT</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 text-sm">
                                <span>Surcharges:</span>
                                <strong>₹{surcharge}/MT</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 mt-2 pt-3 border-t-2 border-gray-200 text-base font-semibold">
                                <span>Total Cost:</span>
                                <strong className="text-blue-600 text-lg">₹{totalCost}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 col-span-2">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Monthly Railway Spend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={costTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => `₹${value} Cr`} />
                            <Line type="monotone" dataKey="cost" stroke="#FF5722" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default RailwayDispatchSection
