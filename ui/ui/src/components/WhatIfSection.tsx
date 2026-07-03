import React, { useState, useEffect } from 'react';
import {
    Ship, Anchor, Train, Factory,
    BarChart3, TrendingUp, RefreshCw, Zap
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { api } from '../services/api';

// --- Types & Interfaces ---

type SimulationLevel = 'Vessel' | 'Port' | 'Rail' | 'Plant';

interface SimulationParams {
    // Vessel Level
    vesselDelay: number; // hours
    badWeather: 'None' | 'Storm' | 'Cyclone';
    reducedSpeed: number; // MT/hr reduction
    reducedDischarge: number; // MT/hr reduction

    // Port Level
    portCongestion: 'Low' | 'Medium' | 'High';
    craneDrop: number; // % drop
    rakeAllocationDrop: number; // % drop
    tideDelay: number; // hours

    // Rail Level
    railCongestion: number; // hours
    railSpeedDrop: number; // %
    railShutdown: number; // hours/day

    // Plant Level
    consumptionIncrease: number; // %
    plantShutdown: number; // hours
    unloadingCapDrop: number; // %
}

const DEFAULT_PARAMS: SimulationParams = {
    vesselDelay: 0,
    badWeather: 'None',
    reducedSpeed: 0,
    reducedDischarge: 0,
    portCongestion: 'Low',
    craneDrop: 0,
    rakeAllocationDrop: 0,
    tideDelay: 0,
    railCongestion: 0,
    railSpeedDrop: 0,
    railShutdown: 0,
    consumptionIncrease: 0,
    plantShutdown: 0,
    unloadingCapDrop: 0
};

// --- Helper Components ---
const InputGroup = ({ label, value, children }: { label: string, value: string | number, children: React.ReactNode }) => (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 transition-colors hover:border-slate-200">
        <div className="flex justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="text-sm text-slate-900 font-bold">{value}</span>
        </div>
        {children}
    </div>
);

const WhatIfSection = () => {
    const [ports, setPorts] = useState<any[]>([]);

    const [plants, setPlants] = useState<any[]>([]);
    const [vessels, setVessels] = useState<any[]>([]);

    useEffect(() => {
        const fetchState = async () => {
            const state = await api.getState();
            if (state) {
                setPorts(Object.values(state.ports || {}).map((p: any) => ({ id: p.id, name: p.name || p.id })));
                setPlants(Object.values(state.plants || {}).map((p: any) => ({ id: p.id, name: p.name || p.id })));
                setVessels(Object.values(state.vessels || {}).map((v: any) => ({ id: v.id, name: v.name || v.id })));
            }
        };
        fetchState();
    }, []);

    const [activeTab, setActiveTab] = useState<SimulationLevel>('Vessel');
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

    // Selection State
    const [selectedPortId, setSelectedPortId] = useState('p1');
    const [selectedPlantId, setSelectedPlantId] = useState('pl1');

    // Derived active ID for calculation variance
    const activeId = activeTab === 'Port' ? selectedPortId : activeTab === 'Plant' ? selectedPlantId : 'V001';

    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Run Simulation on Backend
    const runSimulation = async () => {
        setIsLoading(true);
        try {
            // Map params to backend events
            let eventType = 'vessel_delay';
            let payload: any = {};
            let targetId = activeId;

            if (activeTab === 'Vessel') {
                eventType = 'vessel_delay';
                // Use first available vessel or fallback
                targetId = vessels.length > 0 ? vessels[0].id : 'V001';
                payload = { hours: params.vesselDelay + (params.badWeather === 'Storm' ? 12 : params.badWeather === 'Cyclone' ? 48 : 0) };
            } else if (activeTab === 'Rail') {
                eventType = 'rake_breakdown';
                targetId = 'R001';
                payload = {};
            }

            const res = await api.triggerEvent(eventType, targetId, payload);
            setSimulationResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const displayResults = simulationResult ? {
        totalCost: simulationResult.impact_analysis?.new_cost || 0,
        baselineCost: simulationResult.impact_analysis?.original_cost || 0,
        costDelta: simulationResult.impact_analysis?.cost_delta || 0,
        demurrageDelta: simulationResult.impact_analysis?.demurrage_delta || 0,
        delayDelta: simulationResult.impact_analysis?.delay_delta || 0,
        costs: [
            { name: 'Projected Cost', value: simulationResult.impact_analysis?.new_cost || 0, fill: '#ef4444' },
            { name: 'Baseline', value: simulationResult.impact_analysis?.original_cost || 0, fill: '#3b82f6' }
        ],
        recommendations: simulationResult.proposed_actions
    } : {
        totalCost: 0,
        baselineCost: 0,
        costDelta: 0,
        demurrageDelta: 0,
        delayDelta: 0,
        costs: [],
        recommendations: null
    };


    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        setSimulationResult(null);
    };

    const updateParam = (key: keyof SimulationParams, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="w-full text-black font-sans relative pt-8 border-t border-gray-200 mt-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                        <Zap className="text-blue-600" />
                        What-If Analysis & Simulation
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Simulate scenarios across the logistics chain to predict costs and delays.
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
                >
                    <RefreshCw size={16} /> Reset Scenario
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT PANEL: CONFIGURATION */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Tabs */}
                    <div className="flex bg-white p-1 rounded-lg w-fit border border-gray-200">
                        {(['Vessel', 'Port', 'Rail', 'Plant'] as SimulationLevel[]).map(level => (
                            <button
                                key={level}
                                onClick={() => setActiveTab(level)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === level
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                    }`}
                            >
                                {level} Level
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[400px] bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                                {activeTab === 'Vessel' && <Ship className="text-blue-500" />}
                                {activeTab === 'Port' && <Anchor className="text-emerald-500" />}
                                {activeTab === 'Rail' && <Train className="text-amber-500" />}
                                {activeTab === 'Plant' && <Factory className="text-purple-500" />}
                                Configure Parameters
                            </h2>
                            {activeTab === 'Port' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Simulating: {ports.find(p => p.id === selectedPortId)?.name || selectedPortId}</span>}
                            {activeTab === 'Plant' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">Simulating: {plants.find(p => p.id === selectedPlantId)?.name || selectedPlantId}</span>}
                        </div>

                        {/* Sub-Selection for Limit Updates */}
                        {activeTab === 'Port' && (
                            <div className="mb-6 p-1 bg-slate-100 rounded-lg flex overflow-x-auto no-scrollbar gap-1">
                                {ports.length > 0 ? ports.map(port => (
                                    <button
                                        key={port.id}
                                        onClick={() => setSelectedPortId(port.id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${selectedPortId === port.id
                                            ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {port.name}
                                    </button>
                                )) : (
                                    <span className="text-xs text-slate-400 p-2">Loading ports...</span>
                                )}
                            </div>
                        )}

                        {activeTab === 'Plant' && (
                            <div className="mb-6 p-1 bg-slate-100 rounded-lg flex overflow-x-auto no-scrollbar gap-1">
                                {plants.length > 0 ? plants.map(plant => (
                                    <button
                                        key={plant.id}
                                        onClick={() => setSelectedPlantId(plant.id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${selectedPlantId === plant.id
                                            ? 'bg-white text-purple-600 shadow-sm border border-purple-100'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {plant.name}
                                    </button>
                                )) : (
                                    <span className="text-xs text-slate-400 p-2">Loading plants...</span>
                                )}
                            </div>
                        )}


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                            {/* VESSEL LEVEL INPUTS */}
                            {activeTab === 'Vessel' && (
                                <>
                                    <InputGroup label="Delay During Voyage" value={`${params.vesselDelay} hrs`}>
                                        <input
                                            type="range" min="0" max="72" step="1"
                                            value={params.vesselDelay}
                                            onChange={(e) => updateParam('vesselDelay', parseInt(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Bad Weather Condition" value={params.badWeather}>
                                        <div className="flex gap-2">
                                            {['None', 'Storm', 'Cyclone'].map(w => (
                                                <button
                                                    key={w}
                                                    onClick={() => updateParam('badWeather', w)}
                                                    className={`flex-1 py-1.5 text-xs rounded-md border font-medium transition-colors ${params.badWeather === w
                                                        ? 'bg-blue-100 border-blue-200 text-blue-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {w}
                                                </button>
                                            ))}
                                        </div>
                                    </InputGroup>

                                    <InputGroup label="Reduced Speed Impact" value={`${params.reducedSpeed} MT/hr`}>
                                        <input
                                            type="range" min="0" max="500" step="10"
                                            value={params.reducedSpeed}
                                            onChange={(e) => updateParam('reducedSpeed', parseInt(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Discharge Rate Reduction" value={`${params.reducedDischarge} MT/hr`}>
                                        <input
                                            type="range" min="0" max="1000" step="50"
                                            value={params.reducedDischarge}
                                            onChange={(e) => updateParam('reducedDischarge', parseInt(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </InputGroup>
                                </>
                            )}

                            {/* PORT LEVEL INPUTS */}
                            {activeTab === 'Port' && (
                                <>
                                    <InputGroup label="Port Congestion Level" value={params.portCongestion}>
                                        <div className="flex gap-2">
                                            {['Low', 'Medium', 'High'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => updateParam('portCongestion', c)}
                                                    className={`flex-1 py-1.5 text-xs rounded-md border font-medium transition-colors ${params.portCongestion === c
                                                        ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </InputGroup>

                                    <InputGroup label="Crane Availability Drop" value={`${params.craneDrop}%`}>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={params.craneDrop}
                                            onChange={(e) => updateParam('craneDrop', parseInt(e.target.value))}
                                            className="w-full accent-emerald-500"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Reduced Rake Allocation" value={`${params.rakeAllocationDrop}%`}>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={params.rakeAllocationDrop}
                                            onChange={(e) => updateParam('rakeAllocationDrop', parseInt(e.target.value))}
                                            className="w-full accent-emerald-500"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Tide Window Delay" value={`${params.tideDelay} hrs`}>
                                        <input
                                            type="range" min="0" max="12" step="1"
                                            value={params.tideDelay}
                                            onChange={(e) => updateParam('tideDelay', parseInt(e.target.value))}
                                            className="w-full accent-emerald-500"
                                        />
                                    </InputGroup>
                                </>
                            )}

                            {/* RAIL LEVEL INPUTS */}
                            {activeTab === 'Rail' && (
                                <>
                                    <InputGroup label="Rail Congestion Delay" value={`${params.railCongestion} hrs`}>
                                        <input
                                            type="range" min="0" max="24" step="1"
                                            value={params.railCongestion}
                                            onChange={(e) => updateParam('railCongestion', parseInt(e.target.value))}
                                            className="w-full accent-amber-500"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Rail Speed Reduction" value={`${params.railSpeedDrop}%`}>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={params.railSpeedDrop}
                                            onChange={(e) => updateParam('railSpeedDrop', parseInt(e.target.value))}
                                            className="w-full accent-amber-500"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Temporary Shutdown" value={`${params.railShutdown} hrs/day`}>
                                        <input
                                            type="range" min="0" max="24" step="1"
                                            value={params.railShutdown}
                                            onChange={(e) => updateParam('railShutdown', parseInt(e.target.value))}
                                            className="w-full accent-amber-500"
                                        />
                                    </InputGroup>
                                </>
                            )}

                            {/* PLANT LEVEL INPUTS */}
                            {activeTab === 'Plant' && (
                                <>
                                    <InputGroup label="Consumption Increase" value={`+${params.consumptionIncrease}%`}>
                                        <input
                                            type="range" min="0" max="50" step="1"
                                            value={params.consumptionIncrease}
                                            onChange={(e) => updateParam('consumptionIncrease', parseInt(e.target.value))}
                                            className="w-full accent-purple-500"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Unexpected Shutdown" value={`${params.plantShutdown} hrs`}>
                                        <input
                                            type="range" min="0" max="48" step="1"
                                            value={params.plantShutdown}
                                            onChange={(e) => updateParam('plantShutdown', parseInt(e.target.value))}
                                            className="w-full accent-purple-500"
                                        />
                                    </InputGroup>

                                    <InputGroup label="Unloading Cap Reduction" value={`${params.unloadingCapDrop}%`}>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            value={params.unloadingCapDrop}
                                            onChange={(e) => updateParam('unloadingCapDrop', parseInt(e.target.value))}
                                            className="w-full accent-purple-500"
                                        />
                                    </InputGroup>
                                </>
                            )}

                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={runSimulation}
                                disabled={isLoading}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                            >
                                {isLoading ? <RefreshCw className="animate-spin" /> : <Zap />}
                                Run {activeTab} Simulation
                            </button>
                        </div>
                    </div>

                    {/* Scenario Summary (Mock/Legacy view - Optional) */}
                    {/* <Card> ... </Card> */}
                </div>

                {/* RIGHT PANEL: SIMULATION RESULTS */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Total Cost Card */}
                    {/* Impact Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* 1. Total Cost */}
                        <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                            <h3 className="text-white text-xs font-medium mb-1">Total Projected Cost</h3>
                            <div className="text-2xl font-bold">₹ {(displayResults.totalCost / 1000).toFixed(1)}k</div>
                        </div>

                        {/* 2. Extra Cost (Delta) */}
                        <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <h3 className="text-slate-500 text-xs font-medium mb-1">Extra Cost Impact</h3>
                            <div className="text-2xl font-bold text-red-600">
                                +₹ {(displayResults.costDelta / 1000).toFixed(1)}k
                            </div>
                        </div>

                        {/* 3. Demurrage Impact */}
                        <div className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm">
                            <h3 className="text-slate-500 text-xs font-medium mb-1">Demurrage Penalty</h3>
                            <div className="text-2xl font-bold text-orange-600">
                                +₹ {(displayResults.demurrageDelta / 1000).toFixed(1)}k
                            </div>
                        </div>

                        {/* 4. Time Delay Impact */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <h3 className="text-slate-500 text-xs font-medium mb-1">Added Fleet Delay</h3>
                            <div className="text-2xl font-bold text-slate-700">
                                +{displayResults.delayDelta.toFixed(1)} <span className="text-sm font-normal text-slate-500">hrs</span>
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown Chart */}
                    <div className="h-[350px] bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2">
                            <BarChart3 size={18} className="text-blue-600" /> Impact Analysis
                        </h3>
                        {simulationResult ? (
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={displayResults.costs} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(val: number) => [`₹ ${(val).toFixed(0)}`, 'Cost']}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <BarChart3 size={48} className="mb-4 opacity-50" />
                                <p>Run simulation to view impact cost analysis</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                        <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-500" /> System Actions
                        </h3>
                        {displayResults.recommendations ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <div className="text-xs font-bold text-emerald-800 uppercase mb-1">Recommended Strategy</div>
                                    <p className="text-sm text-emerald-900">{displayResults.recommendations.explanation || "Optimization complete."}</p>
                                </div>

                                {displayResults.recommendations.best_candidate?.actions?.vessel_berth && (
                                    <div className="mt-2 text-xs text-slate-600">
                                        <strong>Berth Reassignments:</strong>
                                        <ul className="list-disc pl-4 mt-1">
                                            {Object.entries(displayResults.recommendations.best_candidate.actions.vessel_berth).map(([v, b]: any) => (
                                                <li key={v}>{v} → {b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm italic">No actions generated yet.</div>
                        )}
                    </div>

                </div>
            </div >

        </div >
    );
};

export default WhatIfSection;
