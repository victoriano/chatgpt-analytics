import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import { MessageSquare, Calendar, TrendingUp, Brain, RotateCcw, Download } from 'lucide-react'
import type { ConversationData } from '../types'
import { saveAs } from 'file-saver'

interface DashboardProps {
  data: ConversationData
  onReset: () => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

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
    saveAs(blob, 'chatgpt-analytics.csv')
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your ChatGPT Analytics</h2>
          <p className="text-gray-600">
            Data from {data.dateRange.earliest.toLocaleDateString()} to {data.dateRange.latest.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Upload New File
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalConversations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Messages/Conv</p>
              <p className="text-2xl font-bold text-gray-900">{data.averageMessagesPerConversation.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Longest Conversation</p>
              <p className="text-2xl font-bold text-gray-900">{data.longestConversation.messageCount}</p>
              <p className="text-xs text-gray-500 truncate">{data.longestConversation.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 30 Days)</h3>
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
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="conversations"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
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
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Message Distribution and Model Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message Distribution</h3>
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
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Usage */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Model Usage</h3>
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

      {/* Weekly Pattern */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User vs Assistant Messages Over Time</h3>
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
              <Bar dataKey="userMessages" stackId="a" fill="#0088FE" />
              <Bar dataKey="assistantMessages" stackId="a" fill="#00C49F" />
              <Legend 
                formatter={(value) => value === 'userMessages' ? 'Your Messages' : 'Assistant Messages'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard