import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import type { ConversationData } from './types'
import './App.css'

function App() {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-6">
            ChatGPT Analytics Dashboard
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Upload your ChatGPT conversations.json file to visualize your usage statistics
          </p>
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
