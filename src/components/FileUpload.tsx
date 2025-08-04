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
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors card bg-base-100 shadow-xl
          ${dragActive ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'}
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
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-sm font-medium text-base-content/70">{progress}</p>
            </div>
          ) : (
            <>
              <FileText className="mx-auto h-16 w-16 text-primary/60" />
              <div className="space-y-2">
                <p className="text-xl font-semibold text-base-content">
                  Upload your ChatGPT conversations.json file
                </p>
                <p className="text-base text-base-content/60">
                  Drag and drop or click to select your ChatGPT export file
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-lg mt-6">
        <div className="card-body">
          <h3 className="card-title text-lg">How to get your ChatGPT data:</h3>
          <ol className="list-decimal list-inside space-y-2 text-base-content/80">
            <li>Go to ChatGPT Settings → Data controls</li>
            <li>Click "Export data"</li>
            <li>Wait for the email with your data export</li>
            <li>Extract the ZIP file and upload the conversations.json file here</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default FileUpload