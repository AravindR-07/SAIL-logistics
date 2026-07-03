import { useState } from 'react'
import {
  Ship,
  Anchor,
  TrendingDown,
  Train,
  Filter,
  Download,
  Zap,
  AlertCircle,
  ChevronRight,
  MoreHorizontal,
  Calendar
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend
} from 'recharts'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Data matching the design system structure
  const metrics = [
    {
      title: 'Total Vessels',
      value: '24',
      subValue: 'In Transit / Arriving',
      percentage: '+5%',
      trend: 'up',
      color: 'bg-primary',
      textColor: 'text-white',
      subTextColor: 'text-white/70',
      icon: Ship,
      iconBg: 'bg-white/20',
      pillColor: 'bg-white/20 text-white'
    },
    {
      title: 'Predicted Delays',
      value: '3',
      subValue: 'High-Risk Ports',
      percentage: '+10%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-text-primary',
      subTextColor: 'text-text-tertiary',
      icon: AlertCircle,
      iconBg: 'bg-purple-100 text-primary',
      pillColor: 'bg-green-100 text-green-700'
    },
    {
      title: 'Total Cost',
      value: '$45k',
      subValue: 'Today / This Week',
      percentage: '+2%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-text-primary',
      subTextColor: 'text-text-tertiary',
      icon: TrendingDown,
      iconBg: 'bg-purple-100 text-primary',
      pillColor: 'bg-green-100 text-green-700'
    },
    {
      title: 'Monthly Savings',
      value: '$120k',
      subValue: 'Estimated',
      percentage: '+1.5%',
      trend: 'up',
      color: 'bg-white',
      textColor: 'text-text-primary',
      subTextColor: 'text-text-tertiary',
      icon: Zap,
      iconBg: 'bg-purple-100 text-primary',
      pillColor: 'bg-green-100 text-green-700'
    },
    {
      title: 'Critical Alerts',
      value: '5',
      subValue: 'Requires Attention',
      percentage: '-2',
      trend: 'down',
      color: 'bg-white',
      textColor: 'text-text-primary',
      subTextColor: 'text-text-tertiary',
      icon: AlertCircle,
      iconBg: 'bg-purple-100 text-primary',
      pillColor: 'bg-red-100 text-red-700'
    }
  ]

  const upcomingVessels = [
    { name: 'MV Ocean Star', time: '10:15-10:30 am', status: 'In Transit' },
    { name: 'MV Steel Carrier', time: '10:30-10:45 am', status: 'Approaching' },
    { name: 'MV Bulk Express', time: '10:45-11:00 am', status: 'Active', active: true },
    { name: 'Team Meeting', time: '11:00-11:30 am', status: 'Internal' },
    { name: 'MV Cargo Master', time: '11:30-11:45 am', status: 'Delayed' },
  ]

  const logisticsCostData = [
    { name: 'Mon', demurrage: 4000, fuel: 2400, portOps: 2400, cargo: 2000, others: 1000, total: 11800 },
    { name: 'Tue', demurrage: 3000, fuel: 1398, portOps: 2210, cargo: 2000, others: 1000, total: 9608 },
    { name: 'Wed', demurrage: 2000, fuel: 9800, portOps: 2290, cargo: 2000, others: 1000, total: 17090 },
    { name: 'Thu', demurrage: 2780, fuel: 3908, portOps: 2000, cargo: 2000, others: 1000, total: 11688 },
    { name: 'Fri', demurrage: 1890, fuel: 4800, portOps: 2181, cargo: 2000, others: 1000, total: 11871 },
    { name: 'Sat', demurrage: 2390, fuel: 3800, portOps: 2500, cargo: 2000, others: 1000, total: 11690 },
    { name: 'Sun', demurrage: 3490, fuel: 4300, portOps: 2100, cargo: 2000, others: 1000, total: 12890 },
  ]

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Left Main Column */}
      <div className="flex-1 min-w-0">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Dashboard</h1>
            {/* <p className="text-text-tertiary">Your today's shift: 8:00 am - 4:00 pm</p> */}
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
                {/* <div className={`text-xs ${metric.subTextColor}`}>{metric.subValue}</div> */}
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
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                Total Logistics Cost Today
                <ChevronRight size={16} className="text-text-tertiary" />
              </h2>
              <div className="flex gap-1 mt-1">
                <p className="text-sm  text-text-tertiary">Savings: <span className="text-green-600 font-medium">$12,450</span></p>
                <p className="text-sm  text-text-tertiary">vs Last Week: <span className="text-green-600 font-medium">-5.2%</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Legend is handled by Recharts, but we can add custom controls here if needed */}
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

                <Bar dataKey="demurrage" stackId="a" fill="#312E81" name="Demurrage" radius={[0, 0, 4, 4]} />
                <Bar dataKey="fuel" stackId="a" fill="#4338CA" name="Fuel Cost" />
                <Bar dataKey="portOps" stackId="a" fill="#6366F1" name="Port Ops Cost" />
                <Bar dataKey="cargo" stackId="a" fill="#818CF8" name="Cargo Handling" />
                <Bar dataKey="others" stackId="a" fill="#E0E7FF" name="Others" radius={[4, 4, 0, 0]} />

                <Line type="monotone" dataKey="total" stroke="black" strokeWidth={3} dot={{ r: 4, fill: 'black', strokeWidth: 0 }} name="Total Cost" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Phases */}
        <div className="bg-white rounded-card p-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Operational Phases</h3>
              <p className="text-sm text-text-tertiary">Current status of 44 active vessels</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-status-earlyStage"></span>
                <span className="text-text-secondary">Loading</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-status-ongoing"></span>
                <span className="text-text-secondary">Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-status-maintenance"></span>
                <span className="text-text-secondary">Unloading</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 h-3 w-full rounded-full overflow-hidden">
            <div className="bg-status-earlyStage w-[30%]"></div>
            <div className="bg-status-ongoing w-[50%]"></div>
            <div className="bg-status-maintenance w-[20%]"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-tertiary font-medium">
            <span className="w-[30%]">13 vessels</span>
            <span className="w-[50%] text-center">26 vessels</span>
            <span className="w-[20%] text-right">5 vessels</span>
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
                <h3 className="text-base font-semibold text-text-primary">Upcoming Vessels</h3>
                <p className="text-xs text-text-tertiary">9 arrivals left today</p>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">+ Schedule</button>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between mb-8">
              {['19', '20', '21', '22', '23', '24'].map((day, i) => (
                <div key={i} className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${i === 0 ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-50'}`}>
                  <span className="text-sm font-bold">{day}</span>
                  <span className="text-[10px] opacity-80">Jul</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Vertical Line */}
              <div className="absolute left-[60px] top-0 bottom-0 w-px bg-gray-100"></div>

              <div className="space-y-6">
                {upcomingVessels.map((vessel, idx) => (
                  <div key={idx} className="relative flex items-start group">
                    <div className="w-[50px] text-xs text-text-tertiary pt-3 text-right pr-4">
                      {vessel.time.split('-')[0]}
                    </div>

                    {/* Timeline Dot */}
                    <div className={`absolute left-[56px] top-4 w-2 h-2 rounded-full border-2 border-white z-10 ${vessel.active ? 'bg-primary w-3 h-3 -left-[58.5px]' : 'bg-gray-300'}`}></div>

                    {/* Card */}
                    <div className={`flex-1 ml-4 p-3 rounded-xl border transition-all cursor-pointer ${vessel.active
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-sm font-medium ${vessel.active ? 'text-primary' : 'text-text-primary'}`}>
                          {vessel.name}
                        </h4>
                        <ChevronRight size={14} className="text-text-tertiary" />
                      </div>
                      <div className="text-xs text-text-tertiary mb-2">{vessel.time}</div>

                      {/* Avatars/Status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${vessel.status === 'In Transit' ? 'bg-blue-400' :
                          vessel.status === 'Approaching' ? 'bg-orange-400' :
                            vessel.status === 'Delayed' ? 'bg-red-400' : 'bg-green-400'
                          }`}></div>
                        <span className="text-xs text-text-secondary">{vessel.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* High-Risk Ports & Delays Card */}
          <div className="bg-[#1e1e2d] rounded-card p-5 shadow-card text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                High Risk Ports Today
                <AlertCircle size={14} className="text-red-400" />
              </h3>
              <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-white">Haldia</span>
                  <a href="#" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    View alert rule <ChevronRight size={10} />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
                  <AlertCircle size={12} />
                  Delay 8 hrs (High)
                </div>
                <div className="text-[10px] text-gray-400 mt-1 pl-5">
                  &gt; 1 instance
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-white">Kolkata</span>
                  <a href="#" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    View alert rule <ChevronRight size={10} />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
                  <AlertCircle size={12} />
                  Delay 2 days (High)
                </div>
                <div className="text-[10px] text-gray-400 mt-1 pl-5">
                  &gt; 25 instances
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
