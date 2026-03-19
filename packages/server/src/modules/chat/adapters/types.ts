/**
 * ChatAdapter interface
 *
 * Pluggable adapter pattern for different chat backends.
 * Types align with @eval/shared ChatAdapter types.
 */
import type {
  ChatMessage,
  ChatRequest,
  ChatStreamCallbacks,
  ChatResponse,
  ChatAdapterType,
  ChatAdapterConfig,
} from '@eval/shared'

export type { ChatMessage, ChatRequest, ChatStreamCallbacks, ChatResponse, ChatAdapterType, ChatAdapterConfig }

/**
 * All chat adapters must implement this interface.
 * Each adapter handles a specific way to connect to an LLM backend.
 */
export interface ChatAdapter {
  /** Adapter type identifier */
  readonly type: ChatAdapterType

  /**
   * Send a chat request and stream the response via SSE.
   * @param request - The chat request payload
   * @param callbacks - Stream event callbacks
   */
  stream(request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void>

  /**
   * Send a chat request and return the full response (non-streaming).
   * @param request - The chat request payload
   */
  chat(request: ChatRequest): Promise<ChatResponse>

  /**
   * Check if the adapter is properly configured and ready to use.
   */
  isConfigured(): boolean
}
