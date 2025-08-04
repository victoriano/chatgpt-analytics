import React, { useCallback, useState } from 'react'
import { FileText, AlertCircle } from 'lucide-react'
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
      } catch (parseError) {
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
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">{progress}</p>
            </div>
          ) : (
            <>
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Upload your ChatGPT conversations.json file
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop or click to select your ChatGPT export file
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <h3 className="font-medium text-gray-900 mb-2">How to get your ChatGPT data:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to ChatGPT Settings → Data controls</li>
          <li>Click "Export data"</li>
          <li>Wait for the email with your data export</li>
          <li>Extract the ZIP file and upload the conversations.json file here</li>
        </ol>
      </div>
    </div>
  )
}

export default FileUpload