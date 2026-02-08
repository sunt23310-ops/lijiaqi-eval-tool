export interface Message {
  id: number
  sessionId: number
  role: 'user' | 'assistant'
  content: string
  messageType: number
  rawResponse?: Record<string, any>
  latencyMs?: number
  ttftMs?: number
  createdAt: string
}

export interface StreamingState {
  isStreaming: boolean
  currentContent: string
  startTime: number
  firstTokenTime?: number
}
