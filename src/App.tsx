import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import type { ConversationData } from './types'
import './App.css'

function App() {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            ChatGPT Analytics
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Upload your ChatGPT conversations.json file to visualize your usage statistics and gain insights into your AI interactions. 
            <span className="font-semibold text-gray-800"> Your data never leaves your browser</span> — all analysis is performed locally using open-source code.
          </p>
          <div className="flex justify-center items-center mt-4 space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              100% Local Processing
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Open Source
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Privacy First
            </div>
          </div>
        </div>

        {!conversationData ? (
          <FileUpload 
            onDataLoaded={setConversationData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <Dashboard 
            data={conversationData}
            onReset={() => setConversationData(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App
