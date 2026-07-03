import { useEffect, useState } from 'react';
import { Ship, TrainFront, MapPin, Factory, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';

// --- CONFIGURATION ---
const MAP_WIDTH = 800;
const MAP_HEIGHT = 500;

// Coordinate Mapping (Schematic)
const NODES: Record<string, { x: number; y: number; label: string; type: 'port' | 'plant' | 'origin' }> = {
    // International Load Ports
    'Australia': { x: 100, y: 450, label: 'Australia (Hay Point)', type: 'origin' },
    'USA': { x: 50, y: 100, label: 'USA (Newport News)', type: 'origin' },
    'Indonesia': { x: 300, y: 480, label: 'Indonesia', type: 'origin' },
    'Russia': { x: 150, y: 50, label: 'Russia (Ust-Luga)', type: 'origin' },

    // Indian Discharge Ports
    'Paradip': { x: 600, y: 300, label: 'Paradip', type: 'port' },
    'Haldia': { x: 650, y: 250, label: 'Haldia', type: 'port' },
    'Visakhapatnam': { x: 580, y: 400, label: 'Visakhapatnam', type: 'port' },
    'Dhamra': { x: 620, y: 280, label: 'Dhamra', type: 'port' },

    // Plants
    'Plant A': { x: 720, y: 220, label: 'Durgapur', type: 'plant' },
    'Plant B': { x: 720, y: 350, label: 'Bokaro', type: 'plant' },
    'Plant C': { x: 750, y: 300, label: 'Rourkela', type: 'plant' },
};

const SEA_ROUTES = [
    { from: 'Australia', to: 'Paradip', control: { x: 350, y: 400 } },
    { from: 'Australia', to: 'Visakhapatnam', control: { x: 350, y: 450 } },
    { from: 'Australia', to: 'Haldia', control: { x: 400, y: 400 } },
    { from: 'USA', to: 'Paradip', control: { x: 300, y: 150 } },
    { from: 'USA', to: 'Haldia', control: { x: 320, y: 120 } },
    { from: 'Indonesia', to: 'Visakhapatnam', control: { x: 450, y: 450 } },
];

const RAIL_ROUTES = [
    { from: 'Paradip', to: 'Plant B' },
    { from: 'Paradip', to: 'Plant C' },
    { from: 'Haldia', to: 'Plant A' },
    { from: 'Visakhapatnam', to: 'Plant B' }, // Long haul
];

interface LogisticsMapProps {
    twinState: any; // Type as TwinState if imported
}

const LogisticsMap = ({ twinState }: LogisticsMapProps) => {
    const [agents, setAgents] = useState<any[]>([]);

    // Simulation Loop for smooth interpolation if backend updates are slow
    // For MVP, we map directly from state
    useEffect(() => {
        if (!twinState) return;

        const newAgents: any[] = [];

        // 1. Map Vessels
        if (twinState.vessels) {
            Object.values(twinState.vessels).forEach((v: any) => {
                // Simple logic to place vessels on lines
                // If status is 'en_route', we pick a random spot on the route for visual effect
                // Real implementation would calculate progress based on ETA

                let position = { x: 0, y: 0 };
                const origin = NODES['Australia']; // Default origin
                const destName = v.assignedPort || v.current_berth || 'Paradip';
                const dest = NODES[destName] || NODES['Paradip'];

                if (v.status === 'at_berth' || v.status === 'Discharging') {
                    position = { x: dest.x, y: dest.y };
                } else if (v.status === 'en_route' || v.status === 'Waiting') {
                    // Mock progress: Hash ID to get a stable random % along the path
                    const progress = ((parseInt(v.id) * 17) % 100) / 100;
                    // Linear interpolation for simple straight line (Curve support needs Bezier math)
                    // Using simple midpoint logic for curve approx if needed, but straight for now
                    position = {
                        x: origin.x + (dest.x - origin.x) * progress,
                        y: origin.y + (dest.y - origin.y) * progress,
                    };
                }

                newAgents.push({
                    id: `vessel-${v.id}`,
                    type: 'vessel',
                    x: position.x,
                    y: position.y,
                    name: v.name,
                    status: v.status
                });
            });
        }

        // 2. Map Rakes
        if (twinState.rakes) {
            Object.values(twinState.rakes).forEach((r: any) => {
                const originName = r.current_location || 'Paradip';
                const origin = NODES[originName] || NODES['Paradip'];
                const destName = 'Plant A'; // Default
                const dest = NODES[destName];

                let position = { x: origin.x, y: origin.y };

                if (r.status === 'transit') {
                    // Random progress
                    const progress = ((parseInt(r.id) * 31) % 100) / 100;
                    position = {
                        x: origin.x + (dest.x - origin.x) * progress,
                        y: origin.y + (dest.y - origin.y) * progress,
                    };
                }

                newAgents.push({
                    id: `rake-${r.id}`,
                    type: 'rake',
                    x: position.x,
                    y: position.y,
                    name: `Rake ${r.id}`,
                    status: r.status
                });
            })
        }

        // Fallback Mock Agents if empty state for demo
        if (newAgents.length === 0) {
            newAgents.push({ id: 'm1', type: 'vessel', x: 300, y: 350, name: 'MV Star', status: 'en_route' });
            newAgents.push({ id: 'm2', type: 'vessel', x: 500, y: 200, name: 'MV Ocean', status: 'en_route' });
            newAgents.push({ id: 'r1', type: 'rake', x: 630, y: 270, name: 'Rake 101', status: 'transit' });
        }

        setAgents(newAgents);

    }, [twinState]);

    return (
        <div className="w-full h-[550px] bg-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700">

            {/* Title Overlay */}
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <MapPin className="text-blue-400" size={20} />
                    Live Logistics Network
                </h3>
                <p className="text-slate-400 text-xs">Real-time tracking: Sea & Rail</p>
            </div>

            <svg width="100%" height="100%" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-full">
                <defs>
                    <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                    </marker>
                </defs>

                {/* Background */}
                <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGradient)" />

                {/* World Map Outlines (Abstract) - Could be path but using circles/lines for schematic cleanliness */}

                {/* SEA ROUTES */}
                {SEA_ROUTES.map((route, i) => {
                    const start = NODES[route.from];
                    const end = NODES[route.to];
                    if (!start || !end) return null;

                    // Bezier curve
                    const control = route.control || { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
                    const d = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

                    return (
                        <g key={`sea-${i}`}>
                            <path d={d} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.4" />
                        </g>
                    );
                })}

                {/* RAIL ROUTES */}
                {RAIL_ROUTES.map((route, i) => {
                    const start = NODES[route.from];
                    const end = NODES[route.to];
                    if (!start || !end) return null;

                    return (
                        <line
                            key={`rail-${i}`}
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={end.y}
                            stroke="#f97316" strokeWidth="3" opacity="0.6"
                        />
                    );
                })}

                {/* NODES */}
                {Object.values(NODES).map((node, i) => (
                    <g key={i} transform={`translate(${node.x}, ${node.y})`}>
                        <circle r={node.type === 'plant' ? 6 : 8} fill={node.type === 'port' ? '#3b82f6' : node.type === 'origin' ? '#94a3b8' : '#f97316'} stroke="white" strokeWidth="2" />
                        <text
                            y={node.type === 'port' ? -15 : 20}
                            x={0}
                            textAnchor="middle"
                            fill="#e2e8f0"
                            fontSize="10"
                            fontWeight="bold"
                            className="pointer-events-none select-none"
                            style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                        >
                            {node.label}
                        </text>
                    </g>
                ))}

                {/* AGENTS (Vessels/Rakes) */}
                {agents.map((agent) => (
                    <motion.g
                        key={agent.id}
                        initial={{ x: agent.x, y: agent.y }}
                        animate={{ x: agent.x, y: agent.y }}
                        transition={{ duration: 2, ease: "linear" }}
                    >
                        {agent.type === 'vessel' ? (
                            <g transform="translate(-12, -12)">
                                <circle r="14" fill="#60a5fa" fillOpacity="0.2" />
                                <foreignObject width="24" height="24">
                                    <div className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                                        <Ship size={24} fill="#1e293b" />
                                    </div>
                                </foreignObject>
                            </g>
                        ) : (
                            <g transform="translate(-10, -10)">
                                <rect width="20" height="20" fill="#fb923c" rx="4" fillOpacity="0.2" />
                                <foreignObject width="20" height="20">
                                    <div className="text-orange-400 p-0.5">
                                        <TrainFront size={18} fill="#1e293b" />
                                    </div>
                                </foreignObject>
                            </g>
                        )}

                        {/* Tooltip on Hover (Simplification: Always show ID for now) */}
                        <text y={-15} x={0} textAnchor="middle" fill="white" fontSize="9" opacity="0.8">{agent.name}</text>
                    </motion.g>
                ))}

                {/* Legend */}
                <g transform="translate(15, 450)">
                    <rect width="140" height="40" fill="rgba(0,0,0,0.5)" rx="8" />
                    <Ship x="10" y="10" size={16} className="text-blue-400" />
                    <text x="35" y="22" fill="#cbd5e1" fontSize="10">Vessel (En route)</text>

                    <TrainFront x="10" y="26" size={16} className="text-orange-400" />
                    <text x="35" y="38" fill="#cbd5e1" fontSize="10">Rake (Transit)</text>
                </g>
            </svg>
        </div>
    );
};

export default LogisticsMap;
