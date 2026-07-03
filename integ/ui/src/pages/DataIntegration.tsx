import { RefreshCw, Plus, Database, FileSpreadsheet, Radio } from 'lucide-react'

const DataIntegration = () => {
  const sources = [
    {
      name: 'SAP System',
      icon: Database,
      status: 'connected',
      lastSync: '5 minutes ago',
      records: '2,340',
      frequency: 'Every 15 minutes',
      quality: 94
    },
    {
      name: 'Excel Files',
      icon: FileSpreadsheet,
      status: 'connected',
      lastSync: '2 hours ago',
      files: '12',
      autoImport: true,
      errors: 0
    },
    {
      name: 'Vessel Tracking API',
      icon: Radio,
      status: 'connected',
      vessels: '24',
      uptime: '99.8%',
      freshness: 'Real-time'
    }
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Data Integration & Sources</h1>
          <p className="text-gray-400 text-sm">Manage connections and monitor data quality</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-primary-dark hover:shadow-md">
            <RefreshCw size={16} className="text-white" />
            Sync All Data
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-gray-50">
            <Plus size={16} className="text-gray-700" />
            Add New Connection
          </button>
          <button className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-sm cursor-pointer transition-all hover:bg-gray-50">
            View Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {sources.map((source, idx) => {
          const Icon = source.icon
          return (
            <div key={idx} className="bg-white rounded-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Icon size={24} className="text-primary" />
                <div>
                  <h3 className="font-semibold text-gray-900">{source.name}</h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                    Connected
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="text-gray-900">{source.lastSync}</span>
                </div>
                {source.records && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Records Synced:</span>
                    <span className="text-gray-900 font-semibold">{source.records}</span>
                  </div>
                )}
                {source.files && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Files Monitored:</span>
                    <span className="text-gray-900 font-semibold">{source.files}</span>
                  </div>
                )}
                {source.vessels && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Vessels:</span>
                    <span className="text-gray-900 font-semibold">{source.vessels}</span>
                  </div>
                )}
                {source.quality && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Data Quality:</span>
                      <span className="text-gray-900 font-semibold">{source.quality}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${source.quality}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DataIntegration

