import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import { MessageSquare, Calendar, TrendingUp, Brain, RotateCcw, Download } from 'lucide-react'
import type { ConversationData } from '../types'
import { saveAs } from 'file-saver'

interface DashboardProps {
  data: ConversationData
  onReset: () => void
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4']

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  const exportData = () => {
    const csvData = [
      ['Date', 'Conversations', 'Messages', 'User Messages', 'Assistant Messages'],
      ...data.dailyStats.map(stat => [
        stat.date,
        stat.conversations,
        stat.messages,
        stat.userMessages,
        stat.assistantMessages
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, 'chatgpt-analytics-summary.csv')
  }

  const exportMessages = () => {
    const csvData = [
      ['Conversation ID', 'Conversation Title', 'Message ID', 'Timestamp', 'Author', 'Model', 'Content Type', 'Content Length', 'Message Index', 'Is Archived', 'Content'],
      ...data.conversations.flatMap(conv => 
        Object.values(conv.mapping)
          .filter(node => {
            if (!node.message || !node.message.author || !node.message.content) return false
            
            const message = node.message
            const content = message.content.parts?.join(' ') || message.content.text || ''
            
            // Only include messages with actual content and valid timestamps
            return content.trim().length > 0 && 
                   message.create_time && 
                   message.create_time > 0 &&
                   (message.author.role === 'user' || message.author.role === 'assistant')
          })
          .map((node, index) => {
            const message = node.message!
            const timestamp = message.create_time 
              ? new Date(message.create_time * 1000).toISOString()
              : ''
            
            const content = message.content.parts?.join(' ') || message.content.text || ''
            const cleanContent = content
              .replace(/"/g, '""')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\t/g, ' ')
              .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
              .trim()
            
            const cleanTitle = (conv.title || 'Untitled')
              .replace(/"/g, '""')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\t/g, ' ')
              .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
              .trim()
            
            return [
              conv.id,
              `"${cleanTitle}"`,
              message.id,
              timestamp,
              message.author.role,
              conv.default_model_slug || 'unknown',
              message.content.content_type || 'text',
              cleanContent.length,
              index + 1,
              conv.is_archived ? 'true' : 'false',
              `"${cleanContent}"`
            ]
          })
      )
    ].map(row => row.join(',')).join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, 'chatgpt-messages.csv')
  }

  // Prepare model data for pie chart
  const modelData = Object.entries(data.modelStats).map(([model, count]) => ({
    name: model,
    value: count
  }))

  // Get recent activity (last 30 days)
  const recentActivity = data.dailyStats.slice(-30)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your ChatGPT Analytics</h2>
          <p className="text-gray-600 text-lg mt-2">
            Data from {data.dateRange.earliest.toLocaleDateString()} to {data.dateRange.latest.toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="group">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2">
                  <button
                    onClick={exportData}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Summary Report
                  </button>
                  <button
                    onClick={exportMessages}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Message Dataset
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Upload New File
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalConversations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Messages/Conv</p>
              <p className="text-2xl font-bold text-gray-900">{data.averageMessagesPerConversation.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg flex-shrink-0">
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Longest Conversation</p>
              <p className="text-2xl font-bold text-gray-900">{data.longestConversation.messageCount}</p>
              <p className="text-xs text-gray-400 truncate mt-1 max-w-full" title={data.longestConversation.title}>
                {data.longestConversation.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Activity (Last 30 Days)</h3>
          <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                formatter={(value, name) => [value, name === 'messages' ? 'Messages' : 'Conversations']}
              />
              <Area
                type="monotone"
                dataKey="messages"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="conversations"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => formatMonth(label)}
                  formatter={(value, name) => [
                    value,
                    name === 'conversations' ? 'Conversations' :
                    name === 'userMessages' ? 'Your Messages' :
                    name === 'assistantMessages' ? 'Assistant Messages' : 'Total Messages'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="conversations"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Message Distribution and Model Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Message Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Your Messages', value: data.totalUserMessages },
                      { name: 'Assistant Messages', value: data.totalAssistantMessages }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Model Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Model Usage</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => (percent ?? 0) > 5 ? `${name}: ${((percent ?? 0) * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Conversations']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Pattern */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">User vs Assistant Messages Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => formatMonth(label)}
                  formatter={(value, name) => [
                    value.toLocaleString(),
                    name === 'userMessages' ? 'Your Messages' : 'Assistant Messages'
                  ]}
                />
                <Bar dataKey="userMessages" stackId="a" fill="#3B82F6" />
                <Bar dataKey="assistantMessages" stackId="a" fill="#10B981" />
                <Legend 
                  formatter={(value) => value === 'userMessages' ? 'Your Messages' : 'Assistant Messages'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard