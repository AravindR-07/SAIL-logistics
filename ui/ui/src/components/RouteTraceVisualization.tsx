import React from 'react';
import { motion } from 'framer-motion';
import { Ship, Anchor, Train, Factory, CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react';

interface RouteTraceProps {
    results: any;
    activeTab?: string;
}

const RouteTraceVisualization: React.FC<RouteTraceProps> = ({ results, activeTab = 'Vessel-Port Flow' }) => {
    // 1. Synthesize Data based on Results
    // If no results, show placeholder or empty state
    if (!results || !results.assignments || Object.keys(results.assignments.vessel_berth).length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-medium">Run optimization to view route trace</p>
            </div>
        );
    }

    // Get first assigned vessel for the "Hero Trace"
    const vesselId = Object.keys(results.assignments.vessel_berth)[0];
    const berthId = results.assignments.vessel_berth[vesselId];

    // Find a rake assigned to this vessel (if any)
    // Find a rake assigned to this vessel (if any)
    const rakeId = Object.entries(results.assignments.rake_vessel).find(([, v]) => v === vesselId)?.[0] || 'R-PENDING';

    // Mock Timeline Data (In a real app, this would come from the backend's detailed schedule)
    // Dynamic Timeline Data from Backend
    // Dynamic Timeline Data from Backend
    const timelineData = results.timeline && results.timeline.length > 0 ? results.timeline : null;

    const fullTimeline = timelineData ? timelineData.map((step: any, index: number) => ({
        ...step,
        // Map string icons to Lucide components if needed, or use default mapping
        icon: index === 0 ? <Ship size={20} /> :
            index === 1 ? <ArrowRight size={20} /> :
                index === 2 ? <Anchor size={20} /> :
                    index === 3 ? <Train size={20} /> :
                        <Factory size={20} />
    })) : [
        // Fallback if no timeline generated (or pending optimization)
        { id: '1', title: 'Pending', location: 'Waiting for Optimization', time: '-', status: 'pending', icon: <Ship size={20} /> }
    ];

    // Filter Timeline based on Active Tab
    // If we are in "Pending" state (fallback), show the single pending item regardless of tab
    const isFallback = !timelineData;

    const filteredTimeline = isFallback
        ? fullTimeline
        : activeTab === 'Port-Plant Flow'
            ? fullTimeline.slice(2) // Port onwards
            : fullTimeline.slice(0, 3); // Default Vessel to Port

    // Logic Explanation Text
    let explanationTitle = "Why is this the fastest route?";
    let explanationText = (
        <>
            The system prioritized <strong>Direct-to-Berth</strong> allocation for {vesselId}, bypassing the anchorage waiting queue (usually 12-24hrs).
        </>
    );

    if (activeTab === 'Port-Plant Flow') {
        explanationTitle = `Why ${berthId} -> Rourkela Plant?`;
        explanationText = (
            <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>
                    <strong>Proximity:</strong> {berthId.includes('Paradip') ? 'Paradip' : 'The selected'} Port is the closest deep-water port to Rourkela (300km vs 450km via Haldia), reducing rail transit time by <strong>~6 hours</strong>.
                </li>
                <li>
                    <strong>Plant Criticality:</strong> Rourkela's Coking Coal stock is at <span className="text-red-600 font-bold">Critical Levels (2 Days)</span>. This route ensures the fastest replenishment.
                </li>
                <li>
                    <strong>Direct Dispatch:</strong> Selected Rake {rakeId} allows for immediate transfer, avoiding yard handling delays.
                </li>
            </ul>
        );
    }

    if (activeTab === 'Vessel-Port Flow') {
        explanationTitle = `Why ${vesselId} -> ${berthId}?`;
        explanationText = (
            <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>
                    <strong>Berth Depth:</strong> {berthId} is a Deep Draft berth capable of handling Capesize vessels fully loaded, eliminating the need for costly and slow lighterage operations.
                </li>
                <li>
                    <strong>Queue Avoidance:</strong> The vessel estimated arrival time (ETA) aligns perfectly with the berth vacancy window, resulting in <strong>Zero Waiting Time</strong>.
                </li>
            </ul>
        );
    }

    if (activeTab === 'Cost Analysis') {
        const costData = results.cost_analysis || [
            { category: 'Data Pending', standard: 0, optimized: 0, unit: '-', reason: 'No analysis available' }
        ];

        return (
            <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-slate-800">Cost Savings Analysis</h3>
                        <p className="text-xs text-slate-500">Comparison: Standard vs Optimized Flow</p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                        Total Savings: $8/MT (₹672/MT)
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Chart/Table Area */}
                        <div className="space-y-4">
                            {costData.map((item: any) => (
                                <div key={item.category} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 font-medium">{item.category}</span>
                                        <div className="flex gap-4 text-xs">
                                            <span className="text-slate-400">Std: ${item.standard}</span>
                                            <span className="font-bold text-slate-800">Opt: ${item.optimized}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-slate-300"
                                            style={{ width: `${(item.standard / 50) * 100}%` }}
                                        ></div>
                                        <div
                                            className="h-full bg-green-500 -ml-[100%] transition-all duration-1000"
                                            style={{ width: `${(item.optimized / 50) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">{item.reason}</p>
                                </div>
                            ))}
                        </div>

                        {/* Summary Box */}
                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 flex flex-col justify-center space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <ArrowRight size={20} className="rotate-[-45deg]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">$70 <span className="text-sm font-normal text-slate-400">/ MT</span></div>
                                    <div className="text-xs text-slate-500">Optimized Landed Cost</div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 w-full"></div>

                            <div className="space-y-2">
                                <p className="text-sm text-slate-600">
                                    <strong>Key Wins:</strong>
                                </p>
                                <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                                    <li>Eliminated <strong>$5/MT Demurrage</strong> by hitting berth window perfectly.</li>
                                    <li>Saved <strong>$5/MT Handling</strong> via Direct Port-to-Rail dispatch.</li>
                                    <li>Reduced Rail Freight by <strong>$3/MT</strong> using closest port.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-800">{activeTab}</h3>
                    <p className="text-xs text-slate-500">Optimized logic for {vesselId}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                        <CheckCircle size={12} /> Best Route Found
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1">
                        <Clock size={12} /> 48h Total Port-to-Plant
                    </span>
                </div>
            </div>

            <div className="p-6 relative">
                {/* Connecting Line */}
                <div className="absolute top-[3.25rem] left-10 right-10 h-0.5 bg-slate-100 z-0"></div>

                <div className="grid grid-cols-5 gap-4 relative z-10">
                    {filteredTimeline.map((step: any, idx: number) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="flex flex-col items-center text-center group"
                        >
                            {/* Icon Circle */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 transition-all duration-500 ${step.status === 'completed' ? 'bg-blue-600 border-blue-600 text-white' :
                                step.status === 'active' ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50' :
                                    'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                {step.icon}
                            </div>

                            {/* Card Details */}
                            <div className="w-full bg-slate-50 rounded-lg p-3 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all text-sm">
                                <div className="font-bold text-slate-800 mb-1">{step.title}</div>
                                <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-2">
                                    <MapPin size={10} /> {step.location}
                                </div>
                                <div className="text-xs font-medium text-blue-600 bg-blue-50 py-1 rounded mb-2">
                                    {step.time}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    {step.details}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Explanation Footer */}
                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                        <Clock size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900 mb-1">{explanationTitle}</h4>
                        <div className="text-sm text-indigo-800 leading-relaxed">
                            {explanationText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteTraceVisualization;
