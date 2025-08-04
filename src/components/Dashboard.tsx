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
          <h2 className="text-3xl font-bold text-primary">Your ChatGPT Analytics</h2>
          <p className="text-base-content/70 text-lg">
            Data from {data.dateRange.earliest.toLocaleDateString()} to {data.dateRange.latest.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportData}
            className="btn btn-outline btn-primary"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary"
          >
            <RotateCcw className="h-4 w-4" />
            Upload New File
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center">
              <MessageSquare className="h-10 w-10 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-base-content/60">Total Conversations</p>
                <p className="text-3xl font-bold text-base-content">{data.totalConversations.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center">
              <Calendar className="h-10 w-10 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-base-content/60">Total Messages</p>
                <p className="text-3xl font-bold text-base-content">{data.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center">
              <TrendingUp className="h-10 w-10 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-base-content/60">Avg Messages/Conv</p>
                <p className="text-3xl font-bold text-base-content">{data.averageMessagesPerConversation.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center">
              <Brain className="h-10 w-10 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-base-content/60">Longest Conversation</p>
                <p className="text-3xl font-bold text-base-content">{data.longestConversation.messageCount}</p>
                <p className="text-xs text-base-content/50 truncate">{data.longestConversation.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Daily Activity (Last 30 Days)</h3>
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Monthly Trends</h3>
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
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">Message Distribution</h3>
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
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">Model Usage</h3>
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">User vs Assistant Messages Over Time</h3>
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