/**
 * Direct API Adapter (placeholder)
 *
 * Directly calls LLM providers (OpenAI, Anthropic) without an SSE proxy.
 * This adapter is for scenarios where the server has direct API access.
 */
import type { ChatAdapter, ChatRequest, ChatStreamCallbacks, ChatResponse } from './types'

export class DirectAPIAdapter implements ChatAdapter {
  readonly type = 'direct-api' as const

  isConfigured(): boolean {
    // TODO: Check if direct API credentials are configured
    return false
  }

  async stream(_request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    // TODO: Implement direct API streaming via OpenAI/Anthropic SDK
    callbacks.onError(new Error('Direct API adapter is not yet implemented'))
  }

  async chat(_request: ChatRequest): Promise<ChatResponse> {
    // TODO: Implement direct API non-streaming call
    throw new Error('Direct API adapter is not yet implemented')
  }
}
