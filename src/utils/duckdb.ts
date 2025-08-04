import * as duckdb from '@duckdb/duckdb-wasm'
import type { Conversation, ConversationData, Message } from '../types'

let db: duckdb.AsyncDuckDB | null = null
let conn: duckdb.AsyncDuckDBConnection | null = null

export const initializeDuckDB = async (): Promise<void> => {
  if (db) return

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)
  
  // Fetch the worker script to avoid CORS issues
  const workerResponse = await fetch(bundle.mainWorker!)
  const workerScript = await workerResponse.text()
  const workerBlob = new Blob([workerScript], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(workerBlob)
  
  const worker = new Worker(workerUrl)
  const logger = new duckdb.ConsoleLogger()
  db = new duckdb.AsyncDuckDB(logger, worker)
  await db.instantiate(bundle.mainModule)
  conn = await db.connect()
  
  URL.revokeObjectURL(workerUrl)
}

export const processConversationsWithDuckDB = async (
  conversations: Conversation[]
): Promise<ConversationData> => {
  if (!conn) throw new Error('DuckDB not initialized')

  // Create tables
  await conn.query(`
    CREATE TABLE conversations (
      id VARCHAR,
      title VARCHAR,
      create_time DOUBLE,
      update_time DOUBLE,
      is_archived BOOLEAN,
      default_model_slug VARCHAR
    )
  `)

  await conn.query(`
    CREATE TABLE messages (
      id VARCHAR,
      conversation_id VARCHAR,
      author_role VARCHAR,
      create_time DOUBLE,
      content_type VARCHAR,
      content_text VARCHAR,
      message_index INTEGER
    )
  `)

  // Insert conversation data using prepared statements
  const insertConvStmt = await conn.prepare(`
    INSERT INTO conversations VALUES ($1, $2, $3, $4, $5, $6)
  `)
  
  const insertMsgStmt = await conn.prepare(`
    INSERT INTO messages VALUES ($1, $2, $3, $4, $5, $6, $7)
  `)

  for (const conv of conversations) {
    await insertConvStmt.query(
      conv.id,
      conv.title || '',
      conv.create_time,
      conv.update_time,
      conv.is_archived,
      conv.default_model_slug || ''
    )

    // Extract and insert messages
    let messageIndex = 0
    for (const nodeId of Object.keys(conv.mapping)) {
      const node = conv.mapping[nodeId]
      if (node.message && node.message.author && node.message.content) {
        const message = node.message
        const contentText = extractMessageContent(message)
        
        if (contentText && message.author.role !== 'system') {
          await insertMsgStmt.query(
            message.id,
            conv.id,
            message.author.role,
            message.create_time || 0,
            message.content.content_type,
            contentText,
            messageIndex++
          )
        }
      }
    }
  }
  
  await insertConvStmt.close()
  await insertMsgStmt.close()

  // Calculate statistics using SQL
  const totalConversationsResult = await conn.query('SELECT COUNT(*) as count FROM conversations')
  const totalMessagesResult = await conn.query('SELECT COUNT(*) as count FROM messages')
  const userMessagesResult = await conn.query(`SELECT COUNT(*) as count FROM messages WHERE author_role = 'user'`)
  const assistantMessagesResult = await conn.query(`SELECT COUNT(*) as count FROM messages WHERE author_role = 'assistant'`)

  const dateRangeResult = await conn.query(`
    SELECT 
      MIN(create_time) as earliest,
      MAX(create_time) as latest
    FROM conversations
    WHERE create_time > 0
  `)

  const dailyStatsResult = await conn.query(`
    SELECT 
      strftime('%Y-%m-%d', datetime(c.create_time, 'unixepoch')) as date,
      COUNT(DISTINCT c.id) as conversations,
      COUNT(m.id) as messages,
      COUNT(CASE WHEN m.author_role = 'user' THEN 1 END) as user_messages,
      COUNT(CASE WHEN m.author_role = 'assistant' THEN 1 END) as assistant_messages
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.create_time > 0
    GROUP BY strftime('%Y-%m-%d', datetime(c.create_time, 'unixepoch'))
    ORDER BY date
  `)

  const monthlyStatsResult = await conn.query(`
    SELECT 
      strftime('%Y-%m', datetime(c.create_time, 'unixepoch')) as month,
      COUNT(DISTINCT c.id) as conversations,
      COUNT(m.id) as messages,
      COUNT(CASE WHEN m.author_role = 'user' THEN 1 END) as user_messages,
      COUNT(CASE WHEN m.author_role = 'assistant' THEN 1 END) as assistant_messages
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.create_time > 0
    GROUP BY strftime('%Y-%m', datetime(c.create_time, 'unixepoch'))
    ORDER BY month
  `)

  const modelStatsResult = await conn.query(`
    SELECT 
      default_model_slug,
      COUNT(*) as count
    FROM conversations
    WHERE default_model_slug IS NOT NULL AND default_model_slug != ''
    GROUP BY default_model_slug
    ORDER BY count DESC
  `)

  const avgMessagesResult = await conn.query(`
    SELECT AVG(message_count) as avg_count
    FROM (
      SELECT conversation_id, COUNT(*) as message_count
      FROM messages
      GROUP BY conversation_id
    )
  `)

  const longestConvResult = await conn.query(`
    SELECT c.title, COUNT(m.id) as message_count
    FROM conversations c
    JOIN messages m ON c.id = m.conversation_id
    GROUP BY c.id, c.title
    ORDER BY message_count DESC
    LIMIT 1
  `)

  // Process results
  const totalConversations = totalConversationsResult.get(0)?.count || 0
  const totalMessages = totalMessagesResult.get(0)?.count || 0
  const totalUserMessages = userMessagesResult.get(0)?.count || 0
  const totalAssistantMessages = assistantMessagesResult.get(0)?.count || 0

  const dateRange = dateRangeResult.get(0)
  const earliest = dateRange?.earliest ? new Date(dateRange.earliest * 1000) : new Date()
  const latest = dateRange?.latest ? new Date(dateRange.latest * 1000) : new Date()

  const dailyStats = dailyStatsResult.toArray().map(row => ({
    date: row.date,
    conversations: row.conversations || 0,
    messages: row.messages || 0,
    userMessages: row.user_messages || 0,
    assistantMessages: row.assistant_messages || 0
  }))

  const monthlyStats = monthlyStatsResult.toArray().map(row => ({
    month: row.month,
    conversations: row.conversations || 0,
    messages: row.messages || 0,
    userMessages: row.user_messages || 0,
    assistantMessages: row.assistant_messages || 0
  }))

  const modelStats: Record<string, number> = {}
  modelStatsResult.toArray().forEach(row => {
    if (row.default_model_slug) {
      modelStats[row.default_model_slug] = row.count
    }
  })

  const averageMessagesPerConversation = avgMessagesResult.get(0)?.avg_count || 0
  const longestConv = longestConvResult.get(0)
  const longestConversation = {
    title: longestConv?.title || 'N/A',
    messageCount: longestConv?.message_count || 0
  }

  return {
    conversations,
    totalConversations,
    totalMessages,
    totalUserMessages,
    totalAssistantMessages,
    dateRange: { earliest, latest },
    dailyStats,
    monthlyStats,
    modelStats,
    averageMessagesPerConversation,
    longestConversation
  }
}

const extractMessageContent = (message: Message): string => {
  if (message.content.parts && message.content.parts.length > 0) {
    return message.content.parts.join(' ')
  }
  if (message.content.text) {
    return message.content.text
  }
  return ''
}

export const cleanupDuckDB = async (): Promise<void> => {
  if (conn) {
    await conn.close()
    conn = null
  }
  if (db) {
    await db.terminate()
    db = null
  }
}