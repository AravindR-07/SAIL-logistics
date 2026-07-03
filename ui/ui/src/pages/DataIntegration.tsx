import { useState } from 'react'
import { RefreshCw, Plus, Database, FileSpreadsheet, Radio, Upload, AlertCircle, CheckCircle } from 'lucide-react'

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

  const [uploadType, setUploadType] = useState('vessels')
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus('idle')
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.")
      setUploadStatus('error')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', uploadType)

    try {
      setUploadStatus('uploading')
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: {
          'X-API-KEY': 'dev-api-key-123'
        },
        body: formData,
      })
      const result = await response.json()

      if (response.ok) {
        setUploadStatus('success')
        setMessage(result.message || "Upload successful")
        setFile(null)
      } else {
        setUploadStatus('error')
        setMessage(result.error || "Upload failed")
      }
    } catch (error) {
      setUploadStatus('error')
      setMessage("Network error occurred")
      console.error(error)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black mb-2">Data Integration & Sources</h1>
          <p className="text-gray-400 text-sm">Manage connections and monitor data quality</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium text-sm cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-blue-600-dark hover:shadow-md">
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
                <Icon size={24} className="text-blue-600" />
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

      {/* Manual Upload Section */}
      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-blue-600" />
          Manual Data Upload
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-4">
            <p className="text-sm text-gray-600">
              Upload CSV or Excel files to manually update the Digital Twin state.
              Supported types: <strong>Vessels</strong> (ETA, Draft, Cargo), <strong>Rakes</strong> (Arrivals, Capacity).
            </p>

            <div className="flex gap-4 items-center">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-gray-500">Data Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5 outline-none"
                >
                  <option value="vessels">Vessels</option>
                  <option value="rakes">Rakes</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold uppercase text-gray-500">File</label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading' || !file}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all
                            ${uploadStatus === 'uploading' || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-600-dark shadow-md'}
                        `}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Data'}
              </button>

              {uploadStatus === 'success' && (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle size={16} /> {message}
                </span>
              )}
              {uploadStatus === 'error' && (
                <span className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle size={16} /> {message}
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Sample Data Files</h4>
            <ul className="space-y-2 text-sm text-blue-600 underline">
              <li><a href="/samples/sample_vessels.csv" download>Download Sample Vessels (CSV)</a></li>
              <li><a href="/samples/sap_bulk_export_2024.csv" download>Download Full SAP Export (2k Rows)</a></li>
              <li><a href="/samples/sample_rakes.xlsx" download>Download Sample Rakes (Excel)</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              *Note: Files are served from <code>/public/samples/</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataIntegration

