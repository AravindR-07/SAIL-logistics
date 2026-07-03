import { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  Play,
  Save,
  Download,
  CheckCircle,
  XCircle,
  Loader,
  BrainCircuit,
  MessageSquare,
  Bot,
  ChevronDown,
  AlertTriangle,
  Map
} from 'lucide-react'
import { motion } from 'framer-motion'
import WhatIfSection from '../components/WhatIfSection'
import RouteTraceVisualization from '../components/RouteTraceVisualization'


const OptimizationEngine = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle')
  const [objective, setObjective] = useState('minimize-cost')
  const [timeHorizon, setTimeHorizon] = useState('1-month')
  const [constraints, setConstraints] = useState({
    capacity: true,
    quality: true,
    sequential: true,
    rake: true,
    maxPortCalls: true
  })
  const [costWeights, setCostWeights] = useState({
    ocean: 40,
    port: 30,
    railway: 20,
    demurrage: 10
  })

  const [results, setResults] = useState<{
    score: number;
    status: string;
    vesselAssignments: number;
    rakeAssignments: number;
    assignments: {
      vessel_berth: Record<string, string>;
      rake_vessel: Record<string, string>;
    }
    explanation?: string;
    timeline?: any[];
    cost_analysis?: any[];
  } | null>(null)

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Mock AI Response Logic
    setTimeout(() => {
      let botResponse = "I'm not sure about that. Try asking about optimization score, costs, or vessel assignments.";
      const lowerInput = userMsg.toLowerCase();

      if (lowerInput.includes('score') || lowerInput.includes('points')) {
        botResponse = `The current optimization score is ${results?.score || 0} points, reflecting the efficiency of the assigned schedule.`;
      } else if (lowerInput.includes('vessel') || lowerInput.includes('ship')) {
        botResponse = `We have successfully assigned ${results?.vesselAssignments || 0} vessels to berths based on the defined constraints.`;
      } else if (lowerInput.includes('cost') || lowerInput.includes('price')) {
        botResponse = `The solution minimizes total logistics cost with a weight of ${costWeights.ocean + costWeights.demurrage}%.`;
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = "Hello! I'm CatBot, your logistics AI assistant. Ask me about the optimization results.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const [notification, setNotification] = useState<{ title: string, message: string, type: 'success' | 'info' } | null>(null);

  const showNotification = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveScenario = () => {
    // Save current settings to LocalStorage
    localStorage.setItem('sail_saved_scenario', JSON.stringify({ objective, timeHorizon, constraints, costWeights }));
    showNotification('Scenario Saved', 'Current parameters have been saved locally.');
  };

  const handleLoadScenario = () => {
    const saved = localStorage.getItem('sail_saved_scenario');
    if (saved) {
      const data = JSON.parse(saved);
      setObjective(data.objective);
      setTimeHorizon(data.timeHorizon);
      setConstraints(data.constraints);
      setCostWeights(data.costWeights);
      showNotification('Scenario Loaded', 'Parameters restored from save.');
    } else {
      showNotification('No Save Found', 'Please save a scenario first.', 'info');
    }
  };

  const handleExportReport = () => {
    const reportContent = `SAIL LOGISTICS OPTIMIZATION REPORT\nDate: ${new Date().toLocaleString()}\nScore: ${results?.score}\nStatus: ${results?.status}`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimization_report.txt';
    a.click();
    showNotification('Report Downloaded', 'Analysis exported successfully.');
  };

  const handleAcceptPlan = async () => {
    // Trigger backend event (mocked for now or real if API exists)
    await api.triggerEvent('plan_implemented', 'optimization_engine', { plan_id: 'opt_123' });
    showNotification('Plan Implemented', 'Digital Twin has been updated with new schedule.', 'success');
  };

  const handleRunOptimization = async () => {
    setStatus('running')
    // Simulate slight delay for UX
    // await new Promise(r => setTimeout(r, 800));

    const data = await api.runOptimization()

    if (data) {
      setResults({
        score: data.objective_value,
        status: data.status,
        vesselAssignments: Object.keys(data.assignments?.vessel_berth || {}).length,
        rakeAssignments: Object.keys(data.assignments?.rake_vessel || {}).length,
        assignments: data.assignments || { vessel_berth: {}, rake_vessel: {} },
        explanation: data.explanation,
        timeline: data.timeline,
        cost_analysis: data.cost_analysis
      })
      setStatus('completed')
    } else {
      setStatus('idle') // Error handling simplified
    }
  }

  // Auto-run Baseline (Fastest Route) on Mount
  useEffect(() => {
    handleRunOptimization();
  }, []);

  // Tab State
  const [activeTab, setActiveTab] = useState('Vessel-Port Flow');

  return (
    <div className="w-full accent-blue-600">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black mb-2">Optimization Engine</h1>
          <p className="text-gray-400 text-sm">Generate least-cost logistics plans</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleRunOptimization}
            disabled={status === 'running'}
            className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-base cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-blue-600-dark hover:shadow-md disabled:opacity-50"
          >
            <Play size={20} className="text-white" />
            {status === 'running' ? 'Optimizing...' : 'Run Optimization'}
          </button>
          <button
            onClick={handleLoadScenario}
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50"
          >
            <Save size={16} className="text-gray-700" />
            Load Scenario
          </button>
          <button
            onClick={handleSaveScenario}
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50"
          >
            Save Scenario
          </button>
        </div>
      </div>

      {/* Global Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
            }`}
        >
          <CheckCircle size={20} />
          <div>
            <div className="font-semibold text-sm">{notification.title}</div>
            <div className="text-xs opacity-90">{notification.message}</div>
          </div>
          <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">
            <XCircle size={16} />
          </button>
        </motion.div>
      )}

      {/* Visualizer Launcher */}
      <div className="flex justify-end mb-4">
        <button
          onClick={async () => {
            showNotification('Launching Visualizer', 'Opening map window...', 'info');
            await api.launchVisualizer();
          }}
          className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200"
        >
          <Map size={16} />
          Track Package (Live Map)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        <div className="bg-white rounded-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Optimization Settings</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Objective Function</label>
            <div className="space-y-2">
              {[
                { value: 'minimize-cost', label: 'Minimize Total Cost' },
                { value: 'maximize-utilization', label: 'Maximize Port Utilization' },
                { value: 'balanced', label: 'Balanced Approach' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="objective"
                    value={opt.value}
                    checked={objective === opt.value}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1-week">1 Week</option>
              <option value="2-weeks">2 Weeks</option>
              <option value="1-month">1 Month</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Constraints</label>
            <div className="space-y-2">
              {Object.entries(constraints).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setConstraints({ ...constraints, [key]: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Cost Weights</label>
            {Object.entries(costWeights).map(([key, value]) => (
              <div key={key} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setCostWeights({ ...costWeights, [key]: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          {status === 'running' && (
            <div className="bg-blue-50 border border-blue-200 rounded-card p-4 mb-6 flex items-center gap-3">
              <Loader className="animate-spin text-blue-600" size={20} />
              <div>
                <div className="font-semibold text-blue-900">Optimization in Progress...</div>
                <div className="text-sm text-blue-700">This may take a few minutes</div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-card p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <div className="font-semibold text-green-900">Optimization Complete</div>
                <div className="text-sm text-green-700">Completed at {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {results && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-card p-5 shadow-sm">
                <div className="text-xs text-gray-600 mb-2">Optimization Score</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{results.score}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="bg-white rounded-card p-5 shadow-sm">
                <div className="text-xs text-gray-600 mb-2">Vessels Assigned</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{results.vesselAssignments}</div>
                <div className="text-xs text-success font-semibold">Berths Allocated</div>
              </div>
              <div className="bg-white rounded-card p-5 shadow-sm">
                <div className="text-xs text-gray-600 mb-2">Rakes Scheduled</div>
                <div className="text-2xl font-bold text-gray-900">{results.rakeAssignments}</div>
                <div className="text-xs text-success font-semibold">Ready for Dispatch</div>
              </div>
              <div className="bg-white rounded-card p-5 shadow-sm">
                <div className="text-xs text-gray-600 mb-2">Solution Status</div>
                <div className="flex items-center gap-2 mt-2">
                  {results.status === 'OPTIMAL' || results.status === 'FEASIBLE' ? (
                    <>
                      <CheckCircle className="text-success" size={20} />
                      <span className="text-lg font-semibold text-success">{results.status}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-error" size={20} />
                      <span className="text-lg font-semibold text-error">{results.status}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-card p-6 shadow-sm mb-6">
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {['Vessel-Port Flow', 'Port-Plant Flow', 'Cost Analysis', 'Constraints'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Replaced placeholder with Trace Visualization */}
            <RouteTraceVisualization results={results} activeTab={activeTab} />
          </div>

          {/* AI Recommendations Card (Relocated) */}
          <div className="bg-white rounded-card p-6 shadow-sm mb-6 relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> AI Recommendations
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent closing when clicking the button
                  setIsChatOpen(!isChatOpen);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-blue-600 font-medium transition-colors ${isChatOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
              >
                <Bot size={16} />
                <span className="text-sm">Ask ChatBot</span>
              </button>
            </div>
            <div className="space-y-3">
              {results && results.score < 500 && (
                <Alert text={`Low Optimization Score! Review constraints and cost weights.`} color="red" />
              )}
              {results && Object.keys(results.assignments?.vessel_berth || {}).length < 2 && (
                <Alert text="Unassigned vessels detected. Check berth availability." color="amber" />
              )}
              {results && results.status !== 'OPTIMAL' && (
                <Alert text={`Optimization status is ${results.status}. Feasibility check required.`} color="red" />
              )}
              {(!results || (results.score >= 500 && results.status === 'OPTIMAL')) && (
                <div className="text-center py-4 text-slate-400 text-sm">System stable. Optimization looks good.</div>
              )}
            </div>
          </div>


          {/* AI Explanation Card */}
          {results && results.explanation && (
            <div className="bg-blue-600 border border-blue-100 rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="text-white" size={24} />
                <h2 className="text-lg font-semibold text-white border-none">AI Optimization Analysis</h2>
              </div>
              <p className="text-white text-sm leading-relaxed font-medium">
                {results.explanation}
              </p>
            </div>
          )}

          {/* Dynamic Assignments Tables */}
          {results && results.assignments && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vessel Berthing Plan</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600 font-semibold">
                      <tr>
                        <th className="px-4 py-2">Vessel ID</th>
                        <th className="px-4 py-2">Assigned Berth</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(results.assignments.vessel_berth).length > 0 ? (
                        Object.entries(results.assignments.vessel_berth).map(([vesselId, berthId]) => (
                          <tr key={vesselId}>
                            <td className="px-4 py-3 font-medium text-gray-900">{vesselId}</td>
                            <td className="px-4 py-3 text-blue-600 font-bold">{berthId}</td>
                            <td className="px-4 py-3 text-xs text-success">Scheduled</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="px-4 py-3 text-gray-500 text-sm italic">No vessels assigned</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rake Dispatch Plan</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600 font-semibold">
                      <tr>
                        <th className="px-4 py-2">Rake ID</th>
                        <th className="px-4 py-2">Target Vessel</th>
                        <th className="px-4 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(results.assignments.rake_vessel).length > 0 ? (
                        Object.entries(results.assignments.rake_vessel).map(([rakeId, vesselId]) => (
                          <tr key={rakeId}>
                            <td className="px-4 py-3 font-medium text-gray-900">{rakeId}</td>
                            <td className="px-4 py-3 text-gray-700">{vesselId}</td>
                            <td className="px-4 py-3 text-xs text-blue-600 font-medium">Dispatch</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="px-4 py-3 text-gray-500 text-sm italic">No rakes assigned</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-card p-4 shadow-sm mt-8 flex gap-3 z-20 border-t border-gray-100">
            <button
              onClick={handleAcceptPlan}
              className="flex-1 px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium text-sm cursor-pointer transition-all hover:bg-blue-600-dark hover:shadow-md"
            >
              Accept & Implement
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50"
            >
              Modify Parameters
            </button>
            <button
              onClick={handleExportReport}
              className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50"
            >
              <Download size={16} className="text-gray-700" />
              Export Report
            </button>
            <button
              onClick={() => window.location.href = '/sensitivity-analysis'} // Using href for simplicity if Router Link unavailable
              className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50"
            >
              Run Sensitivity Analysis
            </button>
          </div>
        </div>
      </div>

      {/* ChatBot Pop-over */}
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-6 right-6 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[100] flex flex-col overflow-hidden font-sans"
          style={{ maxHeight: '500px', height: '400px' }}
        >
          {/* Header */}
          <div className="bg-indigo-600 p-3 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <span className="font-medium text-sm">ChatBot AI Assistant</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about risks, costs..."
                className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                autoFocus
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <MessageSquare size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <WhatIfSection />
    </div>
  )
}

const Alert = ({ text, color }: { text: string, color: 'red' | 'amber' }) => (
  <div className={`p-3 rounded-lg text-xs font-medium border flex items-start gap-2 ${color === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
    }`}>
    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
    {text}
  </div>
);

export default OptimizationEngine

