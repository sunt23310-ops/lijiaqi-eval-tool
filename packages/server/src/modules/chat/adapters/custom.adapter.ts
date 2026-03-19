/**
 * Custom Adapter (placeholder)
 *
 * Connects to a user-provided custom model endpoint.
 * Supports configurable auth (bearer, header, none) and custom headers.
 */
import type { ChatAdapter, ChatRequest, ChatStreamCallbacks, ChatResponse, ChatAdapterConfig } from './types'

export class CustomAdapter implements ChatAdapter {
  readonly type = 'custom' as const
  private config: ChatAdapterConfig | null = null

  configure(config: ChatAdapterConfig): void {
    this.config = config
  }

  isConfigured(): boolean {
    return !!(this.config?.customEndpoint)
  }

  async stream(_request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    if (!this.isConfigured()) {
      callbacks.onError(new Error('Custom adapter is not configured. Set customEndpoint first.'))
      return
    }
    // TODO: Implement custom endpoint streaming
    callbacks.onError(new Error('Custom adapter streaming is not yet implemented'))
  }

  async chat(_request: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('Custom adapter is not configured. Set customEndpoint first.')
    }
    // TODO: Implement custom endpoint non-streaming call
    throw new Error('Custom adapter non-streaming is not yet implemented')
  }
}
