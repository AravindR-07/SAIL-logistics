import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LiveMap, { Route } from '../components/LiveMap';
import {
    Ship,
    Anchor,
    TrainFront,
    Factory,
    AlertTriangle,
    TrendingDown,

    MapPin,
    Wind,
    X,
    ArrowRight,
    Database,
    RefreshCw,
    Sparkles,
    Thermometer,
    CloudRain,
    Shield,

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
import { api } from '../services/api';

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
    coordinates: [number, number]; // [lat, lng]
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

// --- Constants ---
// Global Supply Routes (Source -> Port)

// Static Port->Plant Routes
const MOCK_ROUTES_STATIC: Record<string, Route[]> = {
    'Bhilai': [
        // Paradip -> Bhilai
        {
            id: 'r1', fromId: 'Paradip', toId: 'Bhilai', type: 'Rail', cost: 1200, time: '14h', isOptimal: true,
            coordinates: [[86.67, 20.26], [85.8, 20.5], [84.5, 21.2], [82.5, 21.5], [81.3, 21.2], [81.4, 21.19]]
        }
    ],
    'Rourkela': [
        // Paradip -> Rourkela
        {
            id: 'r3', fromId: 'Paradip', toId: 'Rourkela', type: 'Rail', cost: 850, time: '8h', isOptimal: true,
            coordinates: [[86.67, 20.26], [85.5, 21.0], [84.8, 22.2], [84.85, 22.25]]
        }
    ]
};

// Global Supply Routes (Source -> Port)
const GLOBAL_ROUTES: Route[] = [
    {
        id: 'g1', fromId: 'Australia', toId: 'Paradip', type: 'Sea-Rail', cost: 0, time: '10d', isOptimal: true,
        coordinates: [[115.0, -20.0], [95.0, 0.0], [90.0, 10.0], [86.67, 20.26]]
    },
    {
        id: 'g2', fromId: 'Indonesia', toId: 'Haldia', type: 'Sea-Rail', cost: 0, time: '5d', isOptimal: true,
        coordinates: [[108.0, -2.0], [92.0, 12.0], [88.06, 22.02]]
    }
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
    let color = 'bg-black';
    let textColor = 'text-black';

    if (['Low', 'En-route', 'Discharging', 'Green'].includes(status)) {
        color = 'bg-emerald-500';
        textColor = 'text-emerald-700';
    } else if (['Medium', 'Loading', 'Waiting', 'Yellow'].includes(status)) {
        color = 'bg-amber-500';
        textColor = 'text-amber-700';
    } else if (['High', 'Red'].includes(status)) {
        color = 'bg-rose-500';
        textColor = 'text-rose-700';
    }

    if (type === 'dot') return <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />;

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color} bg-opacity-20 ${textColor} border border-${color.replace('bg-', '')}/30`}>
            {status}
        </span>
    );
};

const Card = ({ children, className, onClick }: any) => (
    <motion.div
        whileHover={onClick ? { scale: 1.01 } : {}}
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-hidden relative group ${className} ${onClick ? 'cursor-pointer transition-colors hover:border-blue-300' : ''}`}
    >
        {children}
    </motion.div>
);

const KPICard = ({ title, value, unit, trend, icon: Icon, color = 'cyan' }: any) => (
    <Card className="flex flex-col justify-between h-28 relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-2 opacity-10 text-${color}-600`}>
            <Icon size={64} />
        </div>
        <div className="z-10 flex justify-between items-start">
            <span className="text-text-secondary text-sm font-medium">{title}</span>
            <Icon className={`text-${color}-600`} size={20} />
        </div>
        <div className="z-10 mt-2">
            <div className="text-2xl font-bold text-text-blue-600 tracking-tight">
                {value} <span className="text-sm text-text-muted font-normal">{unit}</span>
            </div>
            {trend && (
                <div className="flex items-center mt-1 text-xs text-emerald-600">
                    <TrendingDown size={12} className="mr-1" />
                    {trend}
                </div>
            )}
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-${color}-500/0 via-${color}-500/50 to-${color}-500/0 opacity-50`} />
    </Card>
);

// --- Main Page ---
const LogisticControlTower = () => {
    const { user } = useAuth();
    const canControl = ['admin', 'corporate_logistics', 'ai_analyst'].includes(user?.role || '');

    const [selectedPort, setSelectedPort] = useState<Port | null>(null);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [displayRoutes, setDisplayRoutes] = useState<Route[]>(GLOBAL_ROUTES);

    // Data State
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [pipelineStatus, setPipelineStatus] = useState<'healthy' | 'error'>('healthy');
    const [pipelineError, setPipelineError] = useState<string | null>(null);
    const [healingActive, setHealingActive] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<any>(null);
    const [showProposal, setShowProposal] = useState(false);
    const [llmExplanation, setLlmExplanation] = useState<string | null>(null);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [excludedModels, setExcludedModels] = useState<string[]>([]);
    const [costHistory, setCostHistory] = useState<any[]>(COST_DATA);

    useEffect(() => {
        const fetchState = async () => {
            const state = await api.getState();
            if (!state) return;

            // Map Backend Vessels
            const vesselList: Vessel[] = state.vessels ? Object.values(state.vessels).map((v: any) => ({
                id: v.id,
                name: v.name,
                imo: v.id,
                type: v.cargo_type as VesselType,
                supplier: 'International',
                status: mapStatus(v.status),
                eta: new Date(v.eta).toLocaleDateString(),
                loadPct: v.capacity ? 80 : 0,
                speed: 12,
                coordinates: 'En Route',
                destination: 'Paradip'
            })) : [];
            setVessels(vesselList);

            // Map Backend Ports
            // Map Backend Ports
            const mappedPorts: Port[] = state.ports ? Object.values(state.ports).map((p: any) => {
                // Dynamic attributes from backend
                const berthOcc = Object.values(p.berths || {}).filter((b: any) => b.current_vessel_id).length;
                const totalBerths = Object.keys(p.berths || {}).length;
                const berthFree = totalBerths - berthOcc;

                return {
                    id: p.id,
                    name: p.name || p.id,
                    etaCountdown: '2h', // Could be calculated from Vessel ETA in queue
                    yardOccupancy: Math.floor(Math.random() * 20) + 40, // TODO: Add to backend
                    berthFree: berthFree,
                    cranes: 4,
                    rakesAvailable: 10,
                    weather: 'Low',
                    coordinates: p.coordinates || [20, 85]
                };
            }) : [];
            setPorts(mappedPorts);

            // Map Backend Plants
            // Map Backend Plants
            const mappedPlants: Plant[] = state.plants ? Object.values(state.plants).map((p: any) => {
                return {
                    id: p.id,
                    name: p.name || p.id,
                    consumption: p.processing_rate || 30000,
                    stockDays: p.stock_days !== undefined ? p.stock_days : 5,
                    unloadingCap: 40000,
                    enRouteRakes: 0,
                    risk: p.risk as 'Low' | 'Medium' | 'High' || 'Low'
                };
            }) : [];
            setPlants(mappedPlants);

            // --- Auto-Monitoring & Self-Healing Logic ---
            if (state.evaluation_report?.mistake_detected) {
                setPipelineStatus('error');
                setPipelineError(state.evaluation_report.wrong_decision); // Fixed proeprty name

                // Auto-Trigger Optimization if not already done/doing
                if (!healingActive && !optimizationResult) {
                    console.log("Risk Detected! Triggering Auto-Healing...");
                    setHealingActive(true);

                    // Trigger Optimization
                    const result = await api.runOptimization();
                    if (result) {
                        setOptimizationResult({
                            risk: state.evaluation_report.wrong_decision,
                            cause: state.evaluation_report.root_cause,
                            solution: result.explanation || "Re-optimization complete. New schedule generated.",
                            assignments: result.assignments,
                            fusion: result.fusion_evidence, // Capture MMDAS evidence
                            evaluation_report: result.evaluation_report // CRITICAL: Include full eval report for LLM
                        });
                    }
                    setHealingActive(false);
                }
            } else {
                if (pipelineStatus === 'error') {
                    // Auto-clear if resolved
                    setPipelineStatus('healthy');
                    setPipelineError(null);
                    setOptimizationResult(null);
                    setShowProposal(false);
                }
            }

            // Map History for Graph
            if (state.history && state.history.length > 0) {
                const newHistory = state.history.map((h: any) => ({
                    name: h.timestamp,
                    Demurrage: h.demurrage,
                    Freight: h.freight,
                    Rail: h.rail
                }));
                setCostHistory(newHistory);
            }
        };

        fetchState();
        const interval = setInterval(fetchState, 3000); // Polling faster for responsiveness
        return () => clearInterval(interval);
    }, [pipelineStatus, healingActive, optimizationResult]);

    const mapStatus = (s: string): Status => {
        if (s === 'en_route') return 'En-route';
        if (s === 'at_berth') return 'Discharging';
        if (s === 'waiting') return 'Waiting';
        return 'En-route';
    }

    // Update routes when plant is selected
    React.useEffect(() => {
        let newRoutes = [...GLOBAL_ROUTES];
        if (selectedPlant) {
            const plantKey = Object.keys(MOCK_ROUTES_STATIC).find(k => selectedPlant.id.includes(k) || selectedPlant.name.includes(k));
            if (plantKey && MOCK_ROUTES_STATIC[plantKey]) {
                newRoutes = [...newRoutes, ...MOCK_ROUTES_STATIC[plantKey]];
            }
        }
        setDisplayRoutes(newRoutes);
    }, [selectedPlant]);

    const handleReset = async () => {
        try {
            await fetch('http://localhost:8000/api/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'dev-api-key-123'
                },
                body: JSON.stringify({ event_type: 'reset', apply: true })
            });
            // Optimistic update
            setPipelineStatus('healthy');
            setPipelineError(null);
            setOptimizationResult(null);
            setShowProposal(false);
            setRetryAttempt(0);
            setExcludedModels([]);
        } catch (e) {
            console.error(e);
        }
    };

    const handleExplainDecision = async () => {
        if (!optimizationResult) return;

        try {
            const response = await fetch('http://localhost:8000/api/explain-decision', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'dev-api-key-123'
                },
                body: JSON.stringify({
                    evaluation_report: optimizationResult.evaluation_report || {},
                    fusion_evidence: optimizationResult.fusion
                })
            });

            const data = await response.json();
            setLlmExplanation(data.explanation);
        } catch (e) {
            console.error("Failed to get explanation:", e);
        }
    };

    const handleRetryOptimization = async () => {
        if (!optimizationResult) return;

        const currentModel = optimizationResult.fusion.selected_source;
        const newExcluded = [...excludedModels, currentModel];

        console.log(`Excluding ${currentModel}, trying different solver...`);
        setHealingActive(true);

        try {
            const response = await fetch('http://localhost:8000/api/optimize-retry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'dev-api-key-123'
                },
                body: JSON.stringify({
                    exclude_models: newExcluded,
                    attempt_number: retryAttempt
                })
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || "Max retries reached");
                setHealingActive(false);
                return;
            }

            const result = await response.json();
            console.log("Retry result:", result);

            setOptimizationResult({
                risk: result.evaluation_report?.wrong_decision,
                cause: result.evaluation_report?.root_cause,
                solution: result.explanation,
                assignments: result.assignments,
                fusion: result.fusion_evidence,
                evaluation_report: result.evaluation_report
            });
            setExcludedModels(newExcluded);
            setRetryAttempt(result.attempt_number || retryAttempt + 1);
            setLlmExplanation(null);
        } catch (e) {
            console.error("Retry failed:", e);
            alert("Failed to retry optimization. Check console for details.");
        } finally {
            setHealingActive(false);
        }
    };

    return (
        <div className="min-h-screen font-sans text-black p-6 overflow-x-hidden">

            {/* 1. TOP KPI HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black flex items-center gap-3">
                    {/* <Navigation className="text-blue-400" /> */}
                    Logistics Control Tower
                </h1>
                <div className="flex gap-3">
                    {canControl && (
                        <>
                            <button
                                onClick={async () => {
                                    await api.triggerEvent('load_scenario', 'system', {});
                                }}
                                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-4 py-2 rounded-lg transition-colors border border-amber-500/30 text-sm"
                            >
                                <AlertTriangle size={16} />
                                Load Risky Scenario
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-text-black hover:text-black transition-all"
                            >
                                <RefreshCw size={16} />
                                Clear Errors
                            </button>
                        </>
                    )}
                    {/* Trigger Button */}
                    {optimizationResult && !showProposal && (
                        <button
                            onClick={() => setShowProposal(true)}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg transition-colors shadow-lg animate-pulse font-bold text-sm"
                        >
                            <Sparkles size={16} />
                            AI Solution Ready
                        </button>
                    )}
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <KPICard title="Inbound Vessels" value={vessels.length} unit="Ships" icon={Ship} color="indigo" trend="+2 due" />
                <KPICard title="Cargo in Transit" value="450k" unit="Tons" icon={Anchor} color="blue" />
                <KPICard title="Port Storage" value="1.2M" unit="Tons Left" icon={Database} color="emerald" />
                <KPICard title="Rake Availability" value="85%" unit="Operational" icon={TrainFront} color="amber" />
                <KPICard title="Plant Stock Risk" value="Low" unit="Stable" icon={Factory} color="purple" />
                <KPICard title="Est. Demurrage" value="₹2.4L" unit="Today" icon={AlertTriangle} color="rose" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">

                {/* 2. VESSEL LOADING SIMULATION (Left) */}
                <div className="xl:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-black flex items-center gap-2"><Ship size={18} className="text-blue-400" /> Vessel Monitor</h2>
                    <div className="flex gap-2 mb-2">
                        <button className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-600/50 py-1 rounded-lg text-sm text-center font-medium">Coal</button>
                        <button className="flex-1 bg-white/5 text-gray-600 border border-white/10 py-1 rounded-lg text-sm text-center hover:bg-white/10">Limestone</button>
                    </div>

                    <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {vessels.map((vessel) => (
                            <Card key={vessel.id} className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-black font-bold text-sm">{vessel.name}</h3>
                                        <p className="text-xs text-gray-600 uppercase tracking-wider">{vessel.supplier}</p>
                                    </div>
                                    <StatusBadge status={vessel.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-2">
                                    <div className="bg-white/5 text-gray-600 p-1.5 rounded-lg">
                                        <span className="block text-gray-600 text-[10px]">ETA</span> {vessel.eta}
                                    </div>
                                    <div className="bg-white/5 text-gray-600 p-1.5 rounded-lg">
                                        <span className="block text-gray-600 text-[10px]">Speed</span> {vessel.speed} kn
                                    </div>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-full" style={{ width: `${vessel.loadPct}%` }} />
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
                {/* 1 (Cont). DIGITAL TWIN MAP (Center) */}
                <div className="xl:col-span-2 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-black flex items-center gap-2"><MapPin size={18} className="text-blue-400" /> Live Network Twin</h2>
                        <div className="flex gap-2">
                            <span className="text-sm font-normal text-text-tertiary bg-white/10 px-3 py-1 rounded-full border border-white/5">Live Data</span>
                        </div>
                    </div>

                    {/* Integrated LiveMap with Pipeline Visualization */}
                    <div className="flex-grow rounded-xl overflow-hidden">
                        <LiveMap
                            vessels={vessels}
                            ports={ports}
                            routes={displayRoutes}
                            pipelineStatus={pipelineStatus}
                            errorReason={pipelineError}
                        />
                    </div>
                </div>

                {/* 2 (Cont). ALERTS & UPDATES - Now inside the grid properly */}
                <div className="xl:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-400" /> Critical Alerts
                    </h2>

                    {/* New Comprehensive Port Risks Card */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-transparent">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="text-rose-500" size={18} />
                                <h4 className="text-slate-900 font-bold text-sm">Live Port Risks & Weather</h4>
                            </div>
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">LIVE UPDATES</span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {[
                                { name: 'Paradip', temp: '34°C', wind: '45 km/h', weather: 'Storm', risk: 'High', msg: 'Cyclone Warning', civil: 'Normal' },
                                { name: 'Haldia', temp: '31°C', wind: '28 km/h', weather: 'Rain', risk: 'Med', msg: 'Heavy Rain', civil: 'Dock Strike Risk' },
                                { name: 'Vizag', temp: '29°C', wind: '12 km/h', weather: 'Cloudy', risk: 'Low', msg: 'Clear', civil: 'Normal' },
                                { name: 'Dhamra', temp: '33°C', wind: '38 km/h', weather: 'Windy', risk: 'High', msg: 'High Swell', civil: 'Local Protests' },
                                { name: 'Gangavaram', temp: '30°C', wind: '15 km/h', weather: 'Clear', risk: 'Low', msg: 'Calm', civil: 'Normal' },
                                { name: 'Kolkata', temp: '32°C', wind: '20 km/h', weather: 'Humid', risk: 'Med', msg: 'Visibility Low', civil: 'Political Rally' },
                            ].map((p, i) => (
                                <div key={i} className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                                        {p.civil !== 'Normal' ? (
                                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                                <Shield className="w-3 h-3" /> {p.civil}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                No Civil Unrest
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                                        <div className="flex flex-col items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                                            <Thermometer size={12} className="text-amber-500 mb-1" />
                                            <span className="font-bold text-slate-700">{p.temp}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                                            <Wind size={12} className="text-blue-500 mb-1" />
                                            <span className="font-bold text-slate-700">{p.wind}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                                            <CloudRain size={12} className="text-slate-500 mb-1" />
                                            <span className="font-bold text-slate-700">{p.weather}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-3">
                        <div className="flex gap-3">
                            <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="text-black font-semibold font-medium text-sm">Port Congestion: Dhamra</h4>
                                <p className="text-xs text-text-tertiary mt-1">High yard occupancy (92%). Delay expected for incoming Limestone vessels.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 3. HEADING TO THE PORTS */}
            < div className="mb-8" >
                <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                    <Anchor className="text-blue-400" /> Port Operations & Logistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {ports.map((port) => (
                        <Card key={port.id} onClick={() => setSelectedPort(port)} className="cursor-pointer hover:border-blue-600 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <span className="font-bold text-black truncate">{port.name}</span>
                                <StatusBadge status={port.weather === 'High' ? 'Red' : port.weather === 'Medium' ? 'Yellow' : 'Green'} type="dot" />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-text-tertiary">
                                    <span>ETA Next</span>
                                    <span className="text-blue-400 font-mono">{port.etaCountdown}</span>
                                </div>
                                <div className="flex justify-between text-text-tertiary">
                                    <span>Yard Occ</span>
                                    <span className={`${port.yardOccupancy > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>{port.yardOccupancy}%</span>
                                </div>
                                <div className="flex justify-between text-text-tertiary">
                                    <span>Berths</span>
                                    <span className="text-blue-400">{port.berthFree} Free</span>
                                </div>
                                <div className="flex justify-between text-text-tertiary">
                                    <span>Rakes</span>
                                    <span className="text-blue-400">{port.rakesAvailable}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/10 flex justify-center text-xs text-blue-400 font-medium group-hover:underline">
                                View Details
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* 4. RAIL -> PLANT INTEGRATION */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                    <Factory className="text-blue-400" /> Plant Stock & Consumption
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {plants.map((plant) => (
                        <Card key={plant.id} onClick={() => setSelectedPlant(plant)} className="cursor-pointer">
                            <h3 className="text-black font-bold text-lg mb-1">{plant.name.split('(')[1] ? plant.name.split('(')[1].replace(')', '') : plant.name}</h3>
                            <p className="text-xs text-text-tertiary mb-4">{plant.name.split('(')[0]}</p>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-text-tertiary">Stock Available</span>
                                        <span className="text-black font-medium">{plant.stockDays} Days</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${plant.stockDays < 3 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(plant.stockDays / 15) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-text-tertiary mb-0.5">Consumption</div>
                                        <div className="text-blue-400 font-medium">{plant.consumption / 1000}k <span className="text-[9px]">TPD</span></div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-text-tertiary mb-0.5">En Route</div>
                                        <div className="text-blue-400 font-medium">{plant.enRouteRakes} <span className="text-[9px]">Rakes</span></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div >

            {/* 6. OVERALL COST DASHBOARD */}
            < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
                <Card className="lg:col-span-2">
                    <h3 className="text-black font-bold mb-4 flex items-center gap-2"><TrendingDown className="text-emerald-400" /> Cost Trends & Demurrage Analysis</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costHistory}>
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
                        {(() => {
                            const last = costHistory[costHistory.length - 1] || { Freight: 0, Rail: 0, Demurrage: 0 };
                            const total = (last.Freight + last.Rail + last.Demurrage) || 1;
                            const freightPct = Math.round((last.Freight / total) * 100);
                            const railPct = Math.round((last.Rail / total) * 100);
                            const demPct = Math.round((last.Demurrage / total) * 100);

                            return [
                                { l: 'Sea Freight', v: `${freightPct}%`, w: freightPct, c: 'bg-sky-500' },
                                { l: 'Rail Freight', v: `${railPct}%`, w: railPct, c: 'bg-indigo-500' },
                                { l: 'Demurrage', v: `${demPct}%`, w: demPct, c: 'bg-rose-500' }
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">{item.l}</span>
                                        <span className="text-slate-900 font-medium">{item.v}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div className={`h-full ${item.c}`} style={{ width: `${item.w}%` }}></div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                    <div className="mt-6 bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Total Daily Cost</span>
                        <span className="text-xl font-bold text-slate-900">
                            $ {((costHistory[costHistory.length - 1]?.Freight + costHistory[costHistory.length - 1]?.Rail + costHistory[costHistory.length - 1]?.Demurrage) / 1000).toFixed(1)}k
                        </span>
                    </div>
                </Card>
            </div >

            {/* --- SLIDE OVERS --- */}
            <AnimatePresence>
                {
                    selectedPort && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#1e1e2d] border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">{selectedPort.name}</h2>
                                <button onClick={() => setSelectedPort(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} className="text-white" /></button>
                            </div>

                            <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-4">Port Parameters</h3>
                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <div className="text-white text-xs mb-1">Berthing Capacity</div>
                                        <div className="text-white text-lg font-bold">8 Vessels</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <div className="text-white text-xs mb-1">Current Stock</div>
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
                                        <span className="text-white">{item.l}</span>
                                        <div className="text-right">
                                            <div className="text-white font-medium">{item.v}</div>
                                            <div className={`text-xs ${item.c}`}>{item.s}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )
                }

                {
                    selectedPlant && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#1e1e2d] border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">{selectedPlant.name}</h2>
                                <button onClick={() => setSelectedPlant(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} className="text-white" /></button>
                            </div>

                            <div className={`p-4 rounded-lg mb-6 ${selectedPlant.risk === 'High' ? 'bg-rose-500/10 border border-rose-500/50' : 'bg-emerald-500/10 border border-emerald-500/50'}`}>
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className={selectedPlant.risk === 'High' ? 'text-rose-500' : 'text-emerald-500'} />
                                    <div>
                                        <div className="text-white font-bold">Stock Risk: {selectedPlant.risk}</div>
                                        <div className="text-white text-xs">Probabilty of stockout in next 48h: {selectedPlant.risk === 'High' ? '85%' : '12%'}</div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-4">Plant Logistics Data</h3>
                            <div className="space-y-4 mb-8">
                                {/* Detailed Stats */}
                                {[
                                    { l: 'Daily Consumption', v: `${selectedPlant.consumption.toLocaleString()} Tons/Day` },
                                    { l: 'Available Stock', v: `${selectedPlant.stockDays} Days` },
                                    { l: 'Unloading Capacity', v: `${selectedPlant.unloadingCap.toLocaleString()} TPD` },
                                    { l: 'Inbound Rakes', v: `${selectedPlant.enRouteRakes} Trains` },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-white">{item.l}</span>
                                        <span className="text-white font-medium">{item.v}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/5 p-4 rounded-lg">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2"><ArrowRight size={16} className="text-blue-400" /> Recommendation</h4>
                                <p className=" text-sm text-white">
                                    Redirect 2 rakes from Paradip to {selectedPlant.name.split('(')[1] ? selectedPlant.name.split('(')[1].replace(')', '') : selectedPlant.name} to maintain buffer stock.
                                </p>
                            </div>
                        </motion.div>
                    )
                }
                {
                    optimizationResult && showProposal && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="fixed bottom-6 right-6 w-[400px] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="bg-slate-900 px-4 py-3 flex justify-between items-center">
                                <h3 className="text-black font-bold flex items-center gap-2">
                                    <Sparkles size={18} className="text-emerald-400" />
                                    AI Resolution Proposal
                                </h3>
                                <button onClick={() => setShowProposal(false)} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={16} className="text-white" /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                                    <div className="text-rose-600 text-xs font-bold uppercase mb-1">Detected Issue</div>
                                    <div className="text-slate-800 text-sm font-medium">{optimizationResult.risk}</div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                    <div className="text-emerald-600 text-xs font-bold uppercase mb-1">Proposed Solution</div>
                                    <div className="text-slate-800 text-sm font-medium">{optimizationResult.solution}</div>
                                </div>

                                {/* MMDAS Evidence Block */}
                                {optimizationResult.fusion && (
                                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="text-blue-600 text-xs font-bold uppercase mb-1">Decision Assurance</div>
                                            <div className="text-slate-600 text-xs">Based on {optimizationResult.fusion.selected_source}</div>
                                        </div>
                                        {optimizationResult.fusion.consensus_met ?
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded border border-emerald-200 font-medium">High Consensus</span> :
                                            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded border border-amber-200 font-medium">Heuristic Fallback</span>
                                        }
                                    </div>
                                )}

                                {canControl ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setOptimizationResult(null);
                                                setShowProposal(false);
                                                setPipelineStatus('healthy'); // optimistically
                                                setPipelineError(null);
                                                setLlmExplanation(null);
                                                setRetryAttempt(0);
                                                setExcludedModels([]);
                                            }}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition-colors shadow-lg"
                                        >
                                            Apply Optimization
                                        </button>

                                        {/* Iterative Refinement Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleExplainDecision}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 py-2 rounded-lg transition-colors text-xs font-bold"
                                            >
                                                Why Did This Fail?
                                            </button>
                                            <button
                                                onClick={handleRetryOptimization}
                                                disabled={retryAttempt >= 3}
                                                className="flex-1 bg-white hover:bg-slate-50 text-amber-600 border border-amber-200 py-2 rounded-lg transition-colors text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Try Different Solver
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                                        <div className="text-slate-500 text-xs italic">Read-Only Mode: Authorization Required to Apply Changes</div>
                                    </div>
                                )}

                                {/* LLM Explanation Display */}
                                {llmExplanation && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                                        <div className="text-indigo-600 text-xs font-bold uppercase mb-2">AI Explanation</div>
                                        <div className="text-slate-800 text-sm">{llmExplanation}</div>
                                    </div>
                                )}

                                {/* Retry Counter */}
                                {retryAttempt > 0 && (
                                    <div className="text-xs text-slate-400 text-center">
                                        Attempt {retryAttempt}/3 {excludedModels.length > 0 && `(Excluded: ${excludedModels.join(', ')})`}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div >
    );
};

export default LogisticControlTower;