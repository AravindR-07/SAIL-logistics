import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  Anchor,
  Navigation,
  TrainFront,
  Factory,
  AlertTriangle,
  TrendingDown,
  Clock,
  MapPin,
  Wind,
  X,
  ArrowRight,
  Database,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// --- Types ---
type VesselType = 'Coal' | 'Limestone';
type Status = 'Loading' | 'En-route' | 'Waiting' | 'Discharging';

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: VesselType;
  supplier: string;
  status: Status;
  eta: string;
  loadPct: number;
  speed: number;
  coordinates: string;
  destination: string;
}

interface Port {
  id: string;
  name: string;
  etaCountdown: string;
  yardOccupancy: number;
  berthFree: number;
  cranes: number;
  rakesAvailable: number;
  weather: 'Low' | 'Medium' | 'High';
}

interface Plant {
  id: string;
  name: string;
  consumption: number;
  stockDays: number;
  unloadingCap: number;
  enRouteRakes: number;
  risk: 'Low' | 'Medium' | 'High';
}

// --- Mock Data ---
const INBOUND_VESSELS: Vessel[] = [
  { id: 'v1', name: 'MV Titan', imo: '9876543', type: 'Coal', supplier: 'Australia', status: 'En-route', eta: '2 Days', loadPct: 100, speed: 14.5, coordinates: '12.4N, 88.2E', destination: 'Paradip' },
  { id: 'v2', name: 'MV Gaia', imo: '1234567', type: 'Limestone', supplier: 'UAE', status: 'Loading', eta: '5 Days', loadPct: 65, speed: 0, coordinates: 'Docked', destination: 'Haldia' },
  { id: 'v3', name: 'MV Helios', imo: '5566778', type: 'Coal', supplier: 'Mozambique', status: 'Waiting', eta: 'Arrived', loadPct: 100, speed: 0, coordinates: 'Anchorage', destination: 'Vizag' },
  { id: 'v4', name: 'MV Oceanus', imo: '9988776', type: 'Coal', supplier: 'Indonesia', status: 'En-route', eta: '3 Days', loadPct: 100, speed: 12.8, coordinates: '10.1N, 90.5E', destination: 'Dhamra' },
];

const PORTS: Port[] = [
  { id: 'p1', name: 'Paradip Port', etaCountdown: '12h 30m', yardOccupancy: 85, berthFree: 1, cranes: 4, rakesAvailable: 12, weather: 'Medium' },
  { id: 'p2', name: 'Haldia Dock', etaCountdown: '4h 15m', yardOccupancy: 60, berthFree: 2, cranes: 3, rakesAvailable: 8, weather: 'Low' },
  { id: 'p3', name: 'Vishakapatnam', etaCountdown: '1d 2h', yardOccupancy: 45, berthFree: 3, cranes: 5, rakesAvailable: 15, weather: 'Low' },
  { id: 'p4', name: 'Dhamra Port', etaCountdown: '8h 00m', yardOccupancy: 92, berthFree: 0, cranes: 2, rakesAvailable: 5, weather: 'High' },
  { id: 'p5', name: 'Gangavaram', etaCountdown: '3d 10h', yardOccupancy: 30, berthFree: 4, cranes: 6, rakesAvailable: 20, weather: 'Low' },
  { id: 'p6', name: 'Kolkata Port', etaCountdown: '10h 45m', yardOccupancy: 78, berthFree: 1, cranes: 2, rakesAvailable: 6, weather: 'Medium' },
];

const PLANTS: Plant[] = [
  { id: 'pl1', name: 'Bhilai Steel Plant (BSP)', consumption: 45000, stockDays: 4, unloadingCap: 50000, enRouteRakes: 5, risk: 'Medium' },
  { id: 'pl2', name: 'Durgapur Steel Plant (DSP)', consumption: 22000, stockDays: 12, unloadingCap: 25000, enRouteRakes: 2, risk: 'Low' },
  { id: 'pl3', name: 'Rourkela Steel Plant (RSP)', consumption: 38000, stockDays: 2, unloadingCap: 40000, enRouteRakes: 8, risk: 'High' },
  { id: 'pl4', name: 'Bokaro Steel Plant (BSL)', consumption: 41000, stockDays: 6, unloadingCap: 45000, enRouteRakes: 4, risk: 'Low' },
  { id: 'pl5', name: 'IISCO Steel Plant (ISP)', consumption: 28000, stockDays: 5, unloadingCap: 30000, enRouteRakes: 3, risk: 'Medium' },
];

const COST_DATA = [
  { name: 'Mon', Demurrage: 4000, Freight: 2400, Rail: 2400 },
  { name: 'Tue', Demurrage: 3000, Freight: 1398, Rail: 2210 },
  { name: 'Wed', Demurrage: 2000, Freight: 9800, Rail: 2290 },
  { name: 'Thu', Demurrage: 2780, Freight: 3908, Rail: 2000 },
  { name: 'Fri', Demurrage: 1890, Freight: 4800, Rail: 2181 },
  { name: 'Sat', Demurrage: 2390, Freight: 3800, Rail: 2500 },
  { name: 'Sun', Demurrage: 3490, Freight: 4300, Rail: 2100 },
];

// --- Components ---

const StatusBadge = ({ status, type = 'text' }: { status: string; type?: 'text' | 'dot' }) => {
  let color = 'bg-gray-500';
  let textColor = 'text-gray-200';

  if (['Low', 'En-route', 'Discharging', 'Green'].includes(status)) {
    color = 'bg-emerald-500';
    textColor = 'text-emerald-400';
  } else if (['Medium', 'Loading', 'Waiting', 'Yellow'].includes(status)) {
    color = 'bg-amber-500';
    textColor = 'text-amber-400';
  } else if (['High', 'Red'].includes(status)) {
    color = 'bg-rose-500';
    textColor = 'text-rose-400';
  }

  if (type === 'dot') return <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />;

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color} bg-opacity-20 ${textColor} border border-${color}/30`}>
      {status}
    </span>
  );
};

const Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <motion.div
    whileHover={onClick ? { scale: 1.01, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' } : {}}
    onClick={onClick}
    className={`bg-white backdrop-blur-xl border border-black/5 rounded-2xl p-4 shadow-card overflow-hidden relative group ${className} ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

const KPICard = ({ title, value, unit, trend, icon: Icon, color = 'cyan' }: any) => (
  <Card className="flex flex-col justify-between h-28 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-2 opacity-10 text-${color}-400`}>
      <Icon size={64} />
    </div>
    <div className="z-10 flex justify-between items-start">
      <span className="text-slate-400 text-sm font-medium">{title}</span>
      <Icon className={`text-${color}-400`} size={20} />
    </div>
    <div className="z-10 mt-2">
      <div className="text-2xl font-bold text-black tracking-tight">
        {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
      </div>
      {trend && (
        <div className="flex items-center mt-1 text-xs text-emerald-400">
          <TrendingDown size={12} className="mr-1" />
          {trend}
        </div>
      )}
    </div>
    {/* Animated bottom border */}
    <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-${color}-500/0 via-${color}-500/50 to-${color}-500/0 opacity-50`} />
  </Card>
);

// --- Digital Twin Map ---
const DigitalTwinMap = () => (
  <div className="relative w-full h-[500px] bg-[#1e1e2d] rounded-2xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
    {/* Background Grid */}
    <div className="absolute inset-0" style={{
      backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)',
      backgroundSize: '30px 30px',
      opacity: 0.1
    }}></div>

    {/* Map Content - Abstract Representation of East Coast India */}
    <svg viewBox="0 0 800 500" className="w-full h-full pointer-events-none">
      {/* Coastline (Abstract) */}
      <path d="M 600,0 Q 550,150 450,250 T 300,500" fill="none" stroke="#4F46E5" strokeWidth="2" strokeDasharray="5,5" strokeOpacity="0.3" />

      {/* Connection Lines (Rail/Sea) */}
      <motion.path
        d="M 650,400 L 520,300 L 350,200 L 200,150"
        fill="none"
        stroke="#6366F1"
        strokeWidth="2"
        strokeOpacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />
      <motion.path
        d="M 600,450 L 520,300 L 380,250"
        fill="none"
        stroke="#6366F1"
        strokeWidth="2"
        strokeOpacity="0.4"
      />

      {/* Nodes */}
      {/* Ports (Primary Color) */}
      <g transform="translate(520, 300)">
        <circle r="6" fill="#4338CA" stroke="#818CF8" strokeWidth="2" />
        <text x="10" y="5" fill="#9CA3AF" fontSize="10">Paradip</text>
      </g>
      <g transform="translate(560, 260)">
        <circle r="6" fill="#4338CA" stroke="#818CF8" strokeWidth="2" />
        <text x="10" y="5" fill="#9CA3AF" fontSize="10">Haldia</text>
      </g>
      <g transform="translate(480, 380)">
        <circle r="6" fill="#4338CA" stroke="#818CF8" strokeWidth="2" />
        <text x="10" y="5" fill="#9CA3AF" fontSize="10">Vizag</text>
      </g>

      {/* Plants (Warning/Amber for contrast) */}
      <g transform="translate(350, 200)">
        <rect x="-6" y="-6" width="12" height="12" fill="#F59E0B" rx="2" />
        <text x="-15" y="-12" fill="#CBD5E1" fontSize="12" fontWeight="bold">RSP</text>
      </g>
      <g transform="translate(200, 150)">
        <rect x="-6" y="-6" width="12" height="12" fill="#F59E0B" rx="2" />
        <text x="-15" y="-12" fill="#CBD5E1" fontSize="12" fontWeight="bold">BSP</text>
      </g>

      {/* Moving Vessels */}
      <motion.g animate={{ x: [600, 520], y: [400, 300] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
        <path d="M-5,-5 L5,0 L-5,5 Z" fill="#E0E7FF" />
        <text x="8" y="4" fill="#E0E7FF" fontSize="9">MV Titan</text>
      </motion.g>
    </svg>

    <div className="absolute bottom-4 left-4 bg-[#1e1e2d]/90 p-3 rounded-xl border border-white/10 text-xs text-text-tertiary">
      <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-primary-light"></span> Port Node</div>
      <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded bg-status-ongoing"></span> Steel Plant</div>
      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span> Inbound Vessel</div>
    </div>
  </div>
);

// --- Main Page ---
const VesselScheduling = () => {
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  return (
    <div className="min-h-screen font-sans text-white p-6 overflow-x-hidden">

      {/* 1. TOP KPI HEADER */}
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Navigation className="text-primary-light" />
        Logistics Control Tower
        <span className="text-sm font-normal text-text-tertiary bg-white/10 px-3 py-1 rounded-full border border-white/5">Live Operations</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KPICard title="Inbound Vessels" value="12" unit="Ships" icon={Ship} color="indigo" trend="+2 due" />
        <KPICard title="Cargo in Transit" value="450k" unit="Tons" icon={Anchor} color="blue" />
        <KPICard title="Port Storage" value="1.2M" unit="Tons Left" icon={Database} color="emerald" />
        <KPICard title="Rake Availability" value="85%" unit="Operational" icon={TrainFront} color="amber" />
        <KPICard title="Plant Stock Risk" value="Low" unit="Stable" icon={Factory} color="purple" />
        <KPICard title="Est. Demurrage" value="₹2.4L" unit="Today" icon={AlertTriangle} color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">

        {/* 2. VESSEL LOADING SIMULATION (Left) */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Ship size={18} className="text-primary-light" /> Vessel Monitor</h2>
          <div className="flex gap-2 mb-2">
            <button className="flex-1 bg-primary/20 text-primary-light border border-primary/50 py-1 rounded-lg text-sm text-center font-medium">Coal</button>
            <button className="flex-1 bg-white/5 text-text-tertiary border border-white/10 py-1 rounded-lg text-sm text-center hover:bg-white/10">Limestone</button>
          </div>

          <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {INBOUND_VESSELS.map((vessel) => (
              <Card key={vessel.id} className="p-3 border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-black font-bold text-sm">{vessel.name}</h3>
                    <p className="text-xs text-text-tertiary uppercase tracking-wider">{vessel.supplier}</p>
                  </div>
                  <StatusBadge status={vessel.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-2">
                  <div className="bg-white/5 p-1.5 rounded-lg">
                    <span className="block text-text-tertiary text-[10px]">ETA</span> {vessel.eta}
                  </div>
                  <div className="bg-white/5 p-1.5 rounded-lg">
                    <span className="block text-text-tertiary text-[10px]">Speed</span> {vessel.speed} kn
                  </div>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-gradient-to-r from-primary to-blue-500 h-full" style={{ width: `${vessel.loadPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                  <span>Loading</span>
                  <span>{vessel.loadPct}%</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 1 (Cont). DIGITAL TWIN MAP (Center) */}
        <div className="xl:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><MapPin size={18} className="text-primary-light" /> Live Network Twin</h2>
            <div className="flex gap-2">
              <span className="flex items-center text-xs text-text-tertiary gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Data</span>
            </div>
          </div>
          <DigitalTwinMap />
        </div>

        {/* 2 (Cont). ALERTS & UPDATES (Right - simplified from prompt to fit layout) */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> Critical Alerts</h2>
          <Card className="border-l-4 border-l-rose-500 p-3">
            <div className="flex gap-3">
              <AlertTriangle className="text-rose-500 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-black font-semibold font-medium text-sm">Port Congestion: Dhamra</h4>
                <p className="text-xs text-text-tertiary mt-1">High yard occupancy (92%). Delay expected for incoming Limestone vessels.</p>
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-l-amber-500 p-3">
            <div className="flex gap-3">
              <Wind className="text-amber-500 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-black font-semibold font-medium text-sm">Cyclone Alert</h4>
                <p className="text-xs text-text-tertiary mt-1">Wind speeds increasing near Paradip. Crane operations may pause.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. HEADING TO THE PORTS */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Anchor className="text-primary-light" /> Port Operations & Logistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {PORTS.map((port) => (
            <Card key={port.id} onClick={() => setSelectedPort(port)} className="cursor-pointer hover:border-primary transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-black truncate">{port.name}</span>
                <StatusBadge status={port.weather === 'High' ? 'Red' : port.weather === 'Medium' ? 'Yellow' : 'Green'} type="dot" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-tertiary">
                  <span>ETA Next</span>
                  <span className="text-primary-light font-mono">{port.etaCountdown}</span>
                </div>
                <div className="flex justify-between text-text-tertiary">
                  <span>Yard Occ</span>
                  <span className={`${port.yardOccupancy > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>{port.yardOccupancy}%</span>
                </div>
                <div className="flex justify-between text-text-tertiary">
                  <span>Berths</span>
                  <span className="text-white">{port.berthFree} Free</span>
                </div>
                <div className="flex justify-between text-text-tertiary">
                  <span>Rakes</span>
                  <span className="text-white">{port.rakesAvailable}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-center text-xs text-primary-light font-medium group-hover:underline">
                View Details
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. PORT -> RAIL INTEGRATION */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <TrainFront className="text-primary-light" /> Port-Rail Integration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, idx) => (
            <Card key={idx} className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg"><TrainFront size={20} className="text-amber-400" /></div>
                  <div>
                    <h3 className="text-black font-semibold">Paradip Dispatch</h3>
                    <p className="text-xs text-text-tertiary">Allocated: 12 Rakes</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">45k</div>
                  <div className="text-xs text-text-tertiary">Tons Ready</div>
                </div>
              </div>
              {/* Timeline Viz */}
              <div className="space-y-2">
                <div className="flex items-center text-xs text-text-tertiary gap-2">
                  <Clock size={12} />
                  <span>08:00 - 12:00</span>
                  <div className="h-2 flex-grow bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4"></div>
                  </div>
                  <span className="text-white">Active</span>
                </div>
                <div className="flex items-center text-xs text-text-tertiary gap-2">
                  <Clock size={12} />
                  <span>12:00 - 16:00</span>
                  <div className="h-2 flex-grow bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-600 w-0"></div>
                  </div>
                  <span>Scheduled</span>
                </div>
              </div>

              <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-2 flex items-start gap-2">
                <Database size={14} className="text-primary-light mt-0.5" />
                <p className="text-xs text-indigo-200">AI Suggestion: Allocate 2 additional rakes to clear rising yard stock by 18:00.</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. RAIL -> PLANT INTEGRATION */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Factory className="text-primary-light" /> Plant Stock & Consumption
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANTS.map((plant) => (
            <Card key={plant.id} onClick={() => setSelectedPlant(plant)} className={`cursor-pointer border-t-4 ${plant.risk === 'High' ? 'border-t-rose-500' : plant.risk === 'Medium' ? 'border-t-amber-500' : 'border-t-emerald-500'}`}>
              <h3 className="text-black font-bold text-lg mb-1">{plant.name.split('(')[1].replace(')', '')}</h3>
              <p className="text-xs text-text-tertiary mb-4">{plant.name.split('(')[0]}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-tertiary">Stock Available</span>
                    <span className="text-white font-medium">{plant.stockDays} Days</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${plant.stockDays < 3 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(plant.stockDays / 15) * 100}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-text-tertiary mb-0.5">Consumption</div>
                    <div className="text-white font-medium">{plant.consumption / 1000}k <span className="text-[9px]">TPD</span></div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-text-tertiary mb-0.5">En Route</div>
                    <div className="text-white font-medium">{plant.enRouteRakes} <span className="text-[9px]">Rakes</span></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 6. OVERALL COST DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-black font-bold mb-4 flex items-center gap-2"><TrendingDown className="text-emerald-400" /> Cost Trends & Demurrage Analysis</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="Freight" stackId="a" fill="#0ea5e9" />
                <Bar dataKey="Rail" stackId="a" fill="#6366f1" />
                <Bar dataKey="Demurrage" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-black font-bold mb-4">Cost Distribution</h3>
          <div className="space-y-4">
            {[{ l: 'Sea Freight', v: '45%', c: 'bg-sky-500' }, { l: 'Rail Freight', v: '30%', c: 'bg-indigo-500' }, { l: 'Handling', v: '15%', c: 'bg-emerald-500' }, { l: 'Demurrage', v: '10%', c: 'bg-rose-500' }].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.l}</span>
                  <span className="text-white font-medium">{item.v}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.c}`} style={{ width: item.v }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-white/5 p-3 rounded-lg flex items-center justify-between">
            <span className="text-text-tertiary text-sm">Total Daily Cost</span>
            <span className="text-xl font-bold text-white">₹ 4.2 Cr</span>
          </div>
        </Card>
      </div>

      {/* --- SLIDE OVERS --- */}
      <AnimatePresence>
        {selectedPort && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#1e1e2d] border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">{selectedPort.name}</h2>
              <button onClick={() => setSelectedPort(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} className="text-text-tertiary" /></button>
            </div>

            <h3 className="text-primary-light text-sm font-bold uppercase tracking-wider mb-4">Port Parameters</h3>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="text-text-tertiary text-xs mb-1">Berthing Capacity</div>
                  <div className="text-white text-lg font-bold">8 Vessels</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="text-text-tertiary text-xs mb-1">Current Stock</div>
                  <div className="text-white text-lg font-bold">850k Tons</div>
                </div>
              </div>
              {/* List Items */}
              {[
                { l: 'Yard Capacity Used', v: `${selectedPort.yardOccupancy}%`, s: selectedPort.yardOccupancy > 80 ? 'Critical' : 'Normal', c: selectedPort.yardOccupancy > 80 ? 'text-rose-400' : 'text-emerald-400' },
                { l: 'Cranes Operational', v: `${selectedPort.cranes}/8`, s: 'Optimal', c: 'text-emerald-400' },
                { l: 'Exp. Vessel Demurrage', v: '₹ 1.5 Lakhs', s: 'High Risk', c: 'text-amber-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-text-tertiary">{item.l}</span>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.v}</div>
                    <div className={`text-xs ${item.c}`}>{item.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedPlant && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#1e1e2d] border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">{selectedPlant.name}</h2>
              <button onClick={() => setSelectedPlant(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} className="text-text-tertiary" /></button>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${selectedPlant.risk === 'High' ? 'bg-rose-500/10 border border-rose-500/50' : 'bg-emerald-500/10 border border-emerald-500/50'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={selectedPlant.risk === 'High' ? 'text-rose-500' : 'text-emerald-500'} />
                <div>
                  <div className="text-white font-bold">Stock Risk: {selectedPlant.risk}</div>
                  <div className="text-text-tertiary text-xs">Probabilty of stockout in next 48h: {selectedPlant.risk === 'High' ? '85%' : '12%'}</div>
                </div>
              </div>
            </div>

            <h3 className="text-primary-light text-sm font-bold uppercase tracking-wider mb-4">Plant Logistics Data</h3>
            <div className="space-y-4 mb-8">
              {/* Detailed Stats */}
              {[
                { l: 'Daily Consumption', v: `${selectedPlant.consumption.toLocaleString()} Tons/Day` },
                { l: 'Available Stock', v: `${selectedPlant.stockDays} Days` },
                { l: 'Unloading Capacity', v: `${selectedPlant.unloadingCap.toLocaleString()} TPD` },
                { l: 'Inbound Rakes', v: `${selectedPlant.enRouteRakes} Trains` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-text-tertiary">{item.l}</span>
                  <span className="text-white font-medium">{item.v}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2"><ArrowRight size={16} className="text-primary-light" /> Recommendation</h4>
              <p className="text-text-tertiary text-sm">
                Redirect 2 rakes from Paradip to {selectedPlant.name.split('(')[1].replace(')', '')} to maintain buffer stock.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VesselScheduling;
