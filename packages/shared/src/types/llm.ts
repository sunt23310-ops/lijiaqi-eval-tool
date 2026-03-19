/**
 * Chat adapter types for pluggable LLM interface
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  conversationId: string | number
  messages: ChatMessage[]
  messageType: number
  content: string // latest user message
  stream: boolean
}

export interface ChatStreamCallbacks {
  onChunk: (text: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

export interface ChatResponse {
  content: string
  model?: string
  usage?: { promptTokens: number; completionTokens: number }
  latencyMs?: number
}

export type ChatAdapterType = 'sse-proxy' | 'direct-api' | 'custom'

export interface ChatAdapterConfig {
  type: ChatAdapterType
  // SSE Proxy (current behavior)
  sseApiBaseUrl?: string
  sseApiToken?: string
  // Direct API
  provider?: 'openai' | 'anthropic'
  apiKey?: string
  model?: string
  baseUrl?: string
  // Custom (user's own model service)
  customEndpoint?: string
  customHeaders?: Record<string, string>
  customAuthType?: 'bearer' | 'header' | 'none'
  customAuthValue?: string
}
