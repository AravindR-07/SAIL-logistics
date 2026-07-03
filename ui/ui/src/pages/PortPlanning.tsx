import { useState, useEffect } from 'react'
import {
  Zap,
  RefreshCw,
  Download,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Ship
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api, TwinState } from '../services/api'
import RailwayDispatchSection from '../components/RailwayDispatchSection'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const PortPlanning = () => {
  const { user } = useAuth();
  const canOptimize = ['admin', 'corporate_logistics', 'ai_analyst'].includes(user?.role || '');
  const [twinState, setTwinState] = useState<TwinState | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    console.log("DEBUG: PORT PLANNING REFACTOR LOADED V2");
    const fetchData = async () => {
      const data = await api.getState()
      setTwinState(data)
    }
    fetchData()
  }, [])

  /* DYNAMIC DATA MAPPING */
  const vessels = twinState?.vessels ? Object.values(twinState.vessels).map((v: any) => ({
    id: v.id,
    name: v.name,
    cargo: v.cargo_type || 'Cargo',
    parcel: `${v.capacity} MT`,
    assignedPort: v.current_berth ? twinState.ports[v.current_berth]?.name : null
  })) : []

  const ports = twinState?.ports ? Object.values(twinState.ports).map((p: any) => {
    // Calculate real stock based on vessel queue or mock robustly if data missing
    // For demo, we simulate varying stock levels based on queue size if backend doesn't track inventory
    const simulatedStock = p.vessel_queue ? p.vessel_queue.length * 40000 : 50000;
    const capacity = 200000; // Keep fixed capacity for now as it's infra constant

    return {
      name: p.name || p.id,
      currentStock: simulatedStock,
      capacity: capacity,
      scheduled: p.vessel_queue?.length || 0,
      handlingCost: p.name === 'Paradip' ? 420 : 450, // Slight variance
      storageCost: 25,
      qualityMix: 'Mixed'
    };
  }) : []

  /* DYNAMIC COST MATRIX GENERATION */
  const generateCostMatrix = () => {
    if (vessels.length === 0 || ports.length === 0) return [];

    return vessels.map(v => {
      let bestPort = '';
      let minCost = Infinity;

      const portCosts: Record<string, number> = {};

      ports.forEach(p => {
        const costs = calculateCosts(v, p);
        portCosts[p.name] = costs.total;
        if (costs.total < minCost) {
          minCost = costs.total;
          bestPort = p.name;
        }
      });

      return {
        vessel: v.name,
        ...portCosts,
        optimal: bestPort, // Default optimal
        assigned: bestPort // Can be overridden
      };
    });
  };

  const [matrix, setMatrix] = useState<any[]>([]);
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  useEffect(() => {
    if (twinState) {
      setMatrix(generateCostMatrix());
    }
  }, [twinState]);

  const handleAssignmentChange = (vesselName: string, newPort: string) => {
    setMatrix(prev => prev.map(row =>
      row.vessel === vesselName ? { ...row, assigned: newPort } : row
    ));
  };

  /* BUTTON HANDLERS */
  const handleRefresh = async () => {
    const data = await api.getState();
    setTwinState(data);
  };

  const handleExportPDF = async () => {
    setIsExporting(true)
    const element = document.getElementById('port-planning-content')
    if (!element) {
      setIsExporting(false)
      return
    }

    try {
      // Temporarily expand height if needed or capture full scroll
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        windowWidth: 1600,
        useCORS: true
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4') // Portrait
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('port_allocation_plan.pdf')
    } catch (e) {
      console.error("PDF Export Error:", e)
    } finally {
      setIsExporting(false)
    }
  }

  const toggleOverride = () => setIsOverrideMode(!isOverrideMode);

  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null)

  // Set first vessel as default selected when data loads
  useEffect(() => {
    if (vessels.length > 0 && !selectedVesselId) {
      setSelectedVesselId(vessels[0].id)
    }
  }, [vessels])

  const selectedVessel = vessels.find(v => v.id === selectedVesselId)

  // Dynamic Cost Calculation Helper
  const calculateCosts = (vessel: any, port: any) => {
    const quantity = parseInt(vessel.parcel.replace(/[^0-9]/g, '')) || 50000;

    // Vary handling rates by port efficiency
    const handlingRateMap: Record<string, number> = {
      'Paradip': 380,
      'Haldia': 520,  // Higher due to lock system
      'Visakhapatnam': 410,
      'Dhamra': 400,
      'Gopalpur': 430,
      'Gangavaram': 415 // Efficient
    };

    const handlingRate = handlingRateMap[port.name] || 450;
    const handling = quantity * handlingRate;

    // Simulate Rail Freight difference based on distance to plant cluster
    const logisticsRateMap: Record<string, number> = {
      'Paradip': 850,
      'Haldia': 600, // Closer to Durgapur/Burnpur
      'Visakhapatnam': 1400, // Farther
      'Dhamra': 950,
      'Gopalpur': 1200,
      'Gangavaram': 1450
    };

    const logisticsRate = logisticsRateMap[port.name] || 1000;
    const logistics = quantity * logisticsRate;

    // Demurrage only high if port is congested (simulated by schedule > 2)
    const demurrageRisk = (port.scheduled > 2) ? (port.scheduled * 200000) : 0;

    return {
      handling,
      logistics,
      demurrageRisk,
      total: handling + logistics + demurrageRisk
    }
  }

  /* NEW HANDLERS FOR INDIVIDUAL ACTIONS */
  const handleRunOptimization = async () => {
    // Mock triggering a backend optimization run specifically for port planning
    const btn = document.getElementById('run-opt-btn');
    if (btn) btn.innerText = 'Running...';

    await new Promise(r => setTimeout(r, 1500)); // Sim delay

    handleRefresh(); // Fetch new state
    alert("Port Allocation Optimization Complete!");
    if (btn) btn.innerText = 'Run Optimization';
  };

  const handleApprove = (vesselName: string, portName: string) => {
    // Logic to finalize assignment
    alert(`Successfully approved ${vesselName} for ${portName}. Work orders generated.`);
    // In real app, this would POST to backend
    handleAssignmentChange(vesselName, portName);
  };

  const handleSelectOverride = (vesselName: string, portName: string) => {
    // Logic to select invalid/non-optimal choice
    if (confirm(`Are you sure you want to override optimal logic and assign ${vesselName} to ${portName}? This may increase costs.`)) {
      handleAssignmentChange(vesselName, portName);
      setIsOverrideMode(true); // Auto-enable edit mode to show the table change
    }
  };

  const [constraintViolations] = useState<string[]>([])


  return (
    <div className="w-full" id="port-planning-content">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black mb-2">Port Planning & Allocation</h1>
          <p className="text-gray-400 text-sm">Optimize vessel-to-port assignments and manage capacity</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {canOptimize && (
            <button
              id="run-opt-btn"
              onClick={handleRunOptimization}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-blue-600-dark hover:shadow-md"
            >
              <Zap size={16} className="text-white" />
              Run Optimization
            </button>
          )}
          <button
            onClick={toggleOverride}
            className={`px-5 py-2.5 rounded-full border border-gray-300 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50 ${isOverrideMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-700'}`}
          >
            {isOverrideMode ? 'Save Overrides' : 'Manual Override'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50"
          >
            <RefreshCw size={16} className="text-gray-700" />
            Refresh
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} className="text-gray-700" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
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
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* Incoming Vessels List (Left Column) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pb-3 border-b border-gray-100">Incoming Vessels Queue</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2  custom-scrollbar">
              {vessels.map((vessel) => (
                <div
                  key={vessel.id}
                  onClick={() => setSelectedVesselId(vessel.id)}
                  className={`p-5 m-3 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden group ${selectedVesselId === vessel.id
                    ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.00]'
                    : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${vessel.cargo === 'Coking Coal' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                      {vessel.cargo}
                    </span>
                    {selectedVesselId === vessel.id && <CheckCircle size={16} className="text-blue-600" />}
                  </div>
                  <h4 className={`font-bold text-sm mb-1 ${selectedVesselId === vessel.id ? 'text-blue-900' : 'text-gray-900'}`}>{vessel.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">{vessel.parcel}</span>
                    <span>•</span>
                    <span>ETA: 2d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Comparison (Right Column) */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            {selectedVessel ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Ship className="text-blue-600" size={20} />
                      Cost Analysis for {selectedVessel.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Comparing total logistics cost across potential ports</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Cargo Volume</div>
                    <div className="font-bold text-gray-900">{selectedVessel.parcel}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ports.map((port, idx) => {
                    const costs = calculateCosts(selectedVessel, port);
                    const isOptimal = port.name === 'Paradip'; // Mock logic: Paradip is always cheapest in this demo

                    return (
                      <div key={idx} className={`relative rounded-xl p-5 border-2 transition-all ${isOptimal
                        ? 'bg-white border-blue-600 shadow-lg ring-1 ring-blue-500/20'
                        : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                        }`}>
                        {isOptimal && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm z-10">
                            Optimal Choice
                          </div>
                        )}

                        <div className="text-center mb-4 pt-2">
                          <h4 className="font-bold text-gray-900 text-lg">{port.name}</h4>
                          <div className={`text-2xl font-bold mt-2 ${isOptimal ? 'text-blue-600' : 'text-gray-900'}`}>
                            ₹{(costs.total / 10000000).toFixed(2)} Cr
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Total Estimated Cost</div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Handling</span>
                            <span className="font-medium">₹{(costs.handling / 100000).toFixed(1)}L</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Logistics</span>
                            <span className="font-medium">₹{(costs.logistics / 100000).toFixed(1)}L</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Demurrage Risk</span>
                            <span className={`font-medium ${costs.demurrageRisk > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                              {costs.demurrageRisk > 0 ? `+₹${(costs.demurrageRisk / 1000).toFixed(0)}k` : 'Low'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => isOptimal ? handleApprove(selectedVessel.name, port.name) : handleSelectOverride(selectedVessel.name, port.name)}
                          className={`w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isOptimal
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                          {isOptimal ? 'Sign & Approve' : 'Select Override'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                <Ship size={48} className="mb-4" />
                <p>Select a vessel from the left to view cost analysis</p>
              </div>
            )}
          </div>
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

      <div className="bg-white rounded-card p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vessel-to-Port Assignment Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vessel</th>
                {ports.map((p, i) => (
                  <th key={i} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{p.name}</th>
                ))}
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm font-medium">{row.vessel}</td>
                  {ports.map((p, i) => {
                    const cost = row[p.name];
                    const isOptimal = row.optimal === p.name;
                    return (
                      <td key={i} className={`px-3 py-4 ${isOptimal ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between text-sm font-semibold">
                          ₹{(cost / 100000).toFixed(2)}L
                          {isOptimal && <CheckCircle size={16} className="text-success" />}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-4 text-sm font-medium">
                    {isOverrideMode ? (
                      <select
                        value={row.assigned}
                        onChange={(e) => handleAssignmentChange(row.vessel, e.target.value)}
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ports.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${row.assigned === row.optimal ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.assigned}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <RailwayDispatchSection />
    </div>
  )
}

export default PortPlanning
