import React, { useCallback, useState } from 'react'
import { FileText, AlertCircle, Settings, Download, Mail, FolderOpen, ExternalLink } from 'lucide-react'
import type { Conversation, ConversationData } from '../types'
import { initializeDuckDB, processConversationsWithDuckDB } from '../utils/duckdb'

interface FileUploadProps {
  onDataLoaded: (data: ConversationData) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file')
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress('Reading file...')

    try {
      const text = await file.text()
      setProgress('Parsing JSON...')
      
      let conversations: Conversation[]
      try {
        conversations = JSON.parse(text) as Conversation[]
      } catch {
        throw new Error('Invalid JSON format. Please ensure you uploaded a valid conversations.json file.')
      }

      if (!Array.isArray(conversations)) {
        throw new Error('File does not contain a valid conversations array')
      }

      setProgress('Initializing database...')
      await initializeDuckDB()

      setProgress('Processing conversations...')
      const data = await processConversationsWithDuckDB(conversations)

      setProgress('Complete!')
      onDataLoaded(data)
    } catch (err) {
      console.error('Error processing file:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file')
    } finally {
      setIsLoading(false)
      setProgress('')
    }
  }, [onDataLoaded, setIsLoading])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 bg-white shadow-sm hover:shadow-md
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".json"
          onChange={handleInputChange}
          disabled={isLoading}
        />
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">{progress}</p>
            </div>
          ) : (
            <>
              <FileText className="mx-auto h-16 w-16 text-blue-400" />
              <div className="space-y-3">
                <p className="text-xl font-semibold text-gray-900">
                  Upload your ChatGPT conversations.json file
                </p>
                <p className="text-base text-gray-500 leading-relaxed">
                  Drag and drop or click to select your ChatGPT export file
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How to get your ChatGPT data:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">1</span>
                <h4 className="font-medium text-gray-900">Access Settings</h4>
                <p className="text-sm text-gray-600">Go to ChatGPT Settings → Data controls</p>
                <a 
                  href="https://chatgpt.com/#settings/DataControls" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Open Settings <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-semibold">2</span>
                <h4 className="font-medium text-gray-900">Export Data</h4>
                <p className="text-sm text-gray-600">Click "Export data" button</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">3</span>
                <h4 className="font-medium text-gray-900">Wait for Email</h4>
                <p className="text-sm text-gray-600">Check your inbox for the data export email</p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <FolderOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">4</span>
                <h4 className="font-medium text-gray-900">Extract & Upload</h4>
                <p className="text-sm text-gray-600">Extract ZIP and upload conversations.json here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload