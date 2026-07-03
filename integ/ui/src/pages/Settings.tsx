import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [companyName, setCompanyName] = useState('Steel Logistics Co.')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [currency, setCurrency] = useState('INR')

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'optimization', label: 'Optimization Parameters' },
    { id: 'cost', label: 'Cost Configuration' },
    { id: 'constraints', label: 'Constraints' },
    { id: 'ai', label: 'AI/ML Models' },
    { id: 'users', label: 'Users & Permissions' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'audit', label: 'Audit Logs' },
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4 sticky top-0 bg-background-page z-10 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Settings & Configuration</h1>
          <p className="text-gray-400 text-sm">Configure system parameters and preferences</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-primary-dark hover:shadow-md">
            <Save size={16} className="text-white" />
            Save Changes
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] gap-6">
        <div className="bg-white rounded-card p-4 shadow-sm">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-all ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-card p-6 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Unit</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>Steel Division</option>
                      <option>Logistics Division</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'general' && (
            <div className="text-center py-12 text-gray-500">
              <p>Settings for {tabs.find(t => t.id === activeTab)?.label} will be available here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

