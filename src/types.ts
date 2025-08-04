export interface Message {
  id: string
  author: {
    role: 'user' | 'assistant' | 'system' | 'tool'
    name?: string
    metadata?: Record<string, unknown>
  }
  create_time?: number
  update_time?: number
  content: {
    content_type: string
    parts?: string[]
    text?: string
  }
  status?: string
  end_turn?: boolean
  weight?: number
  metadata?: Record<string, unknown>
  recipient?: string
  channel?: string
}

export interface MessageNode {
  id: string
  message: Message | null
  parent: string | null
  children: string[]
}

export interface Conversation {
  id: string
  title: string
  create_time: number
  update_time: number
  mapping: Record<string, MessageNode>
  current_node: string
  conversation_id: string
  is_archived: boolean
  is_starred?: boolean
  default_model_slug?: string
  conversation_origin?: string
  gizmo_id?: string
  moderation_results?: Record<string, unknown>[]
}

export interface ConversationData {
  conversations: Conversation[]
  totalConversations: number
  totalMessages: number
  totalUserMessages: number
  totalAssistantMessages: number
  dateRange: {
    earliest: Date
    latest: Date
  }
  dailyStats: Array<{
    date: string
    conversations: number
    messages: number
    userMessages: number
    assistantMessages: number
  }>
  monthlyStats: Array<{
    month: string
    conversations: number
    messages: number
    userMessages: number
    assistantMessages: number
  }>
  modelStats: Record<string, number>
  averageMessagesPerConversation: number
  longestConversation: {
    title: string
    messageCount: number
  }
}