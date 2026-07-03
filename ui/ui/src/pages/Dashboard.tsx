import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Ship,
  TrendingDown,
  Zap,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend
} from 'recharts'
import { api, TwinState } from '../services/api'
import { useEffect, useState } from 'react'

const Dashboard = () => {
  const [twinState, setTwinState] = useState<TwinState | null>(null)
  const [selectedDate, setSelectedDate] = useState(0) // Index of selected date
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.getState()
      setTwinState(data)
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate dynamic values
  const totalCost = twinState?.kpis?.total_cost || 0
  const totalVessels = twinState?.vessels ? Object.keys(twinState.vessels).length : 0
  const demurrage = twinState?.kpis?.demurrage || 0
  const delayedVessels = twinState?.kpis?.delayed_vessels || 0
  const riskScore = twinState?.kpis?.risk_score || 0

  // --- SCOPE FILTERING ---
  const { user } = useAuth(); // Assuming useAuth imported
  const userScope = user?.scope || 'global';

  // Helper to check if item matches scope
  const checkScope = (itemName: string) => {
    if (userScope === 'global') return true;
    return itemName.includes(userScope); // e.g. "Paradip" in "Paradip Port"
  };

  // Operational Phases Calculation
  const vesselListGlobal = twinState?.vessels ? Object.values(twinState.vessels) : [];

  // Filter Vessel List
  const vesselList = vesselListGlobal.filter((v: any) => {
    if (user?.role === 'port_manager') return checkScope(v.assignedPort || v.current_berth || '');
    return true;
  });

  const loadingCount = vesselList.filter((v: any) => v.status === 'Loading' || v.status === 'at_berth').length;
  const transitCount = vesselList.filter((v: any) => v.status === 'en_route' || v.status === 'Waiting').length;
  const unloadingCount = vesselList.filter((v: any) => v.status === 'Discharging').length;

  const totalActive = loadingCount + transitCount + unloadingCount || 1;

  // High Risk Ports Calculation
  const portListGlobal = twinState?.ports ? Object.values(twinState.ports) : [];

  // Filter Ports
  const portList = portListGlobal.filter((p: any) => checkScope(p.id));

  const highRiskPorts = portList.filter((p: any) => (p.vessel_queue?.length || 0) > 0).map((p: any) => ({
    name: p.id,
    reason: 'High Queue',
    delay: `${p.vessel_queue.length * 4} hrs`,
    count: p.vessel_queue.length
  }));

  const alertsCount = highRiskPorts.length + (riskScore > 50 ? 1 : 0);

  // Data matching the design system structure
  let metrics = [
    {
      title: 'Total Vessels',
      value: totalVessels.toString(),
      subValue: 'In Transit / Arriving',
      percentage: '+5%',
      trend: 'up',
      color: 'bg-blue-600',
      textColor: 'text-white',
      subTextColor: 'text-white/70',
      icon: Ship,
      iconBg: 'bg-white/20',
      pillColor: 'bg-white/20 text-white'
    },
    {
      title: 'Predicted Delays',
      value: delayedVessels.toString(),
      subValue: 'High-Risk Ports',
      percentage: riskScore > 0 ? `+${riskScore}%` : '0%',
      trend: riskScore > 0 ? 'up' : 'neutral',
      color: 'bg-white',
      textColor: 'text-blue-600',
      subTextColor: 'text-text-tertiary',
      icon: AlertCircle,
      iconBg: 'bg-blue-100 text-blue-600',
      pillColor: riskScore > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    },
    {
      title: 'Total Cost',
      value: `$${totalCost.toLocaleString()}`,
      subValue: 'Today / This Week',
      percentage: '+2%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-blue-600',
      subTextColor: 'text-text-tertiary',
      icon: TrendingDown,
      iconBg: 'bg-blue-100 text-blue-600',
      pillColor: 'bg-green-100 text-green-700'
    },
    {
      title: 'Demurrage',
      value: `$${demurrage.toLocaleString()}`,
      subValue: 'Estimated',
      percentage: '+1.5%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-blue-600',
      subTextColor: 'text-text-tertiary',
      icon: Zap,
      iconBg: 'bg-blue-100 text-blue-600',
      pillColor: 'bg-green-100 text-green-700'
    },
    {
      title: 'Critical Alerts',
      value: alertsCount.toString(),
      subValue: 'Requires Attention',
      percentage: highRiskPorts.length > 0 ? '+2' : '0',
      trend: 'down',
      color: 'bg-white',
      textColor: 'text-blue-600',
      subTextColor: 'text-text-tertiary',
      icon: AlertCircle,
      iconBg: 'bg-blue-100 text-blue-600',
      pillColor: 'bg-red-100 text-red-700'
    }
  ];

  // Role-Specific Metric Overrides
  if (user?.role === 'finance') {
    metrics = metrics.filter(m => ['Total Cost', 'Demurrage'].includes(m.title));
    metrics.push({
      title: 'Cost Efficiency',
      value: '94%',
      subValue: 'vs Budget',
      percentage: '+1%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-blue-600',
      subTextColor: 'text-text-tertiary',
      icon: TrendingDown,
      iconBg: 'bg-green-100 text-green-600',
      pillColor: 'bg-green-100 text-green-700'
    });
    metrics.push({
      title: 'Savings',
      value: '$45k',
      subValue: 'AI Optimized',
      percentage: '12%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-blue-600',
      subTextColor: 'text-text-tertiary',
      icon: Zap,
      iconBg: 'bg-purple-100 text-purple-600',
      pillColor: 'bg-purple-100 text-purple-700'
    });
  } else if (user?.role === 'railway_officer') {
    // Replace Vessel metrics with Rail metrics
    metrics = [
      {
        title: 'Active Rakes',
        value: '18',
        subValue: 'On Network',
        percentage: '+2',
        trend: 'up',
        color: 'bg-blue-600',
        textColor: 'text-white',
        subTextColor: 'text-white/70',
        icon: Ship, // TODO: distinct icon
        iconBg: 'bg-white/20',
        pillColor: 'bg-white/20 text-white'
      },
      {
        title: 'Rake Utilization',
        value: '88%',
        subValue: 'Capacity Used',
        percentage: '-2%',
        trend: 'down',
        color: 'bg-white',
        textColor: 'text-blue-600',
        subTextColor: 'text-text-tertiary',
        icon: TrendingDown,
        iconBg: 'bg-blue-100 text-blue-600',
        pillColor: 'bg-yellow-100 text-yellow-700'
      },
      metrics[2], // Keep Cost
      metrics[4]  // Keep Alerts
    ]
  }

  // Transform history for Recharts
  const logisticsCostData = twinState?.history ? twinState.history.map((h: any) => ({
    name: h.timestamp,
    demurrage: h.demurrage || 0,
    total: h.total_cost || 0,
    risk: h.risk_score || 0
  })) : []

  // --- CHART DATA GENERATION ---

  // 1. Operational Status (Radial Data)
  const vesselStatusData = [
    { name: 'Loading', value: loadingCount, fill: '#3B82F6' }, // Blue
    { name: 'Transit', value: transitCount, fill: '#10B981' }, // Green
    { name: 'Unloading', value: unloadingCount, fill: '#F59E0B' } // Orange
  ];

  // 2. Port Stock Levels (Bar Data)
  const portStockData = portList.map((p: any) => ({
    name: p.name || p.id,
    stock: p.currentStock || (p.vessel_queue?.length || 0) * 40000 + 20000, // Mock if missing
    capacity: 200000
  })).sort((a: any, b: any) => b.stock - a.stock);

  // 3. Cost Composition (Pie Data)
  const costCompositionData = [
    { name: 'Handling', value: totalCost * 0.35, fill: '#6366F1' }, // Indigo
    { name: 'Logistics', value: totalCost * 0.45, fill: '#10B981' }, // Emerald
    { name: 'Demurrage', value: demurrage, fill: '#EF4444' }, // Red
    { name: 'Overheads', value: totalCost * 0.1, fill: '#94A3B8' }  // Slate
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Left Main Column */}
      <div className="flex-1 min-w-0">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black mb-2">Dashboard</h1>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className={`${metric.color} rounded-card p-5 shadow-card transition-all hover:shadow-elevated relative overflow-hidden group flex flex-col justify-between h-[160px]`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${metric.subTextColor} leading-tight max-w-[70%]`}>{metric.title}</span>
                <div className={`p-2 rounded-full ${metric.iconBg}`}>
                  <metric.icon size={18} />
                </div>
              </div>

              <div>
                <div className={`text-2xl font-bold ${metric.textColor} mb-1`}>{metric.value}</div>
              </div>

              <div className="mt-auto">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${metric.pillColor}`}>
                  {metric.percentage}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart Section */}
        <div className="bg-white rounded-card p-6 shadow-card mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                Total Logistics Cost Today
                <ChevronRight size={16} className="text-text-tertiary" />
              </h2>
              <div className="flex gap-1 mt-1">
                <p className="text-sm  text-text-tertiary">Savings: <span className="text-green-600 font-medium">$12,450</span></p>
                <p className="text-sm  text-text-tertiary">vs Last Week: <span className="text-green-600 font-medium">-5.2%</span></p>
              </div>
            </div>
            <div className="flex gap-2">
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={logisticsCostData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name) => [`$${value}`, name]}
                />
                <Legend iconType="circle" />

                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDemurrage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="total" stroke="#2563eb" fillOpacity={1} fill="url(#colorTotal)" name="Total Cost" />
                <Area type="monotone" dataKey="demurrage" stroke="#dc2626" fillOpacity={1} fill="url(#colorDemurrage)" name="Demurrage" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- NEW ATTRACTIVE VISUALIZATION GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* 1. Operational Status (Radial Bar) */}
          <div className="bg-white rounded-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Ship className="text-blue-600" size={20} />
              Fleet Operational Status
            </h2>
            <p className="text-sm text-gray-500 mb-4">Real-time status of {totalActive} active vessels</p>

            <div className="h-[250px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="30%"
                  outerRadius="100%"
                  data={vesselStatusData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    label={{ fill: '#666', position: 'insideStart' }}
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Legend
                    iconSize={10}
                    width={120}
                    height={140}
                    layout="vertical"
                    verticalAlign="middle"
                    wrapperStyle={{
                      top: '50%',
                      right: 0,
                      transform: 'translate(0, -50%)',
                      lineHeight: '24px'
                    }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Center Metric */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-8">
                <div className="text-3xl font-bold text-gray-900">{totalActive}</div>
                <div className="text-xs text-gray-500 uppercase">Active</div>
              </div>
            </div>
          </div>

          {/* 2. Port Stock Inventory (Bar Chart) */}
          <div className="bg-white rounded-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingDown className="text-green-600" size={20} />
              Port Inventory Levels
            </h2>
            <p className="text-sm text-gray-500 mb-4">Current stock vs total capacity (MT)</p>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portStockData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: '#4B5563' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="stock" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} name="Stock Level">
                    {portStockData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.stock > 150000 ? '#EF4444' : entry.stock > 100000 ? '#F59E0B' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Cost Composition (Donut Chart) */}
          <div className="bg-white rounded-card p-6 shadow-card lg:col-span-2 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Cost Structure Analysis</h2>
              <p className="text-sm text-gray-500 mb-6">Breakdown of operational expenses across key drivers.</p>

              <div className="grid grid-cols-2 gap-4">
                {costCompositionData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">${(item.value / 1000).toFixed(1)}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-[300px] h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costCompositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {costCompositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Right Sidebar Column */}
      <div className="w-full lg:w-[320px] flex-shrink-0">
        <div className="flex flex-col gap-16 h-full">
          {/* Upcoming Vessels - Reduced Height */}
          <div className="bg-white rounded-card p-4 shadow-card flex-1 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-semibold text-blue-600">Upcoming Vessels</h3>
                <p className="text-xs text-text-tertiary">9 arrivals left today</p>
              </div>
              <button
                onClick={() => navigate('/port-planning')}
                className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
              >
                + Schedule
              </button>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between mb-6 border-b border-gray-100 pb-4">
              {['19', '20', '21', '22', '23', '24'].map((day, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${i === selectedDate
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                >
                  <span className="text-sm font-bold">{day}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-80">Jul</span>
                </div>
              ))}
            </div>

            {/* Vessels List */}
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
              {vesselList
                .filter((v: any) => v.status === 'en_route' || v.status === 'Waiting' || v.status === 'at_berth')
                .slice(0, 6)
                .map((vessel: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${vessel.status === 'at_berth' ? 'bg-green-100 text-green-600' :
                      vessel.status === 'Waiting' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      <Ship size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{vessel.name || `Vessel ${vessel.id}`}</h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {vessel.status === 'at_berth' ? 'BERTHED' : 'ETA 4h'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 truncate">{vessel.cargo_type || 'Thermal Coal'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-xs text-gray-500">{(vessel.capacity / 1000).toFixed(0)}k MT</span>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))}

              {vesselList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No upcoming vessels</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
