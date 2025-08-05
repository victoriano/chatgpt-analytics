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
              <a 
                href="https://github.com/victoriano/chatgpt-analytics" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 hover:opacity-80 transition-opacity"
                title="View source code on GitHub"
              >
                <svg className="w-4 h-4 text-gray-600 hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
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
      
      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Brought to you by{" "}
              <span className="font-semibold text-gray-900">Victoriano Izquierdo</span>
              {" "}(
              <a 
                href="https://x.com/victorianoi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                X
              </a>
              {" & "}
              <a 
                href="https://www.linkedin.com/in/victorianoizquierdo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                LinkedIn
              </a>
              ) from{" "}
              <a 
                href="https://www.graphext.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Graphext
              </a>
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <span>
                <a 
                  href="https://opensource.org/licenses/MIT" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-700"
                >
                  MIT Licensed
                </a>
              </span>
              <span>·</span>
              <a 
                href="https://github.com/victoriano/chatgpt-analytics" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-gray-700"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Fork us on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
