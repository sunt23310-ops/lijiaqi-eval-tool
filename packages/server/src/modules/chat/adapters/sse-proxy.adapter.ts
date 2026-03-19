/**
 * SSE Proxy Adapter
 *
 * Wraps the existing SSE proxy logic into the ChatAdapter interface.
 * This is the default adapter that forwards requests to an upstream SSE API.
 */
import type { ChatAdapter, ChatRequest, ChatStreamCallbacks, ChatResponse } from './types'
import { getConfig } from '../../../config'
import { v4 as uuidv4 } from 'uuid'

export class SSEProxyAdapter implements ChatAdapter {
  readonly type = 'sse-proxy' as const

  isConfigured(): boolean {
    const config = getConfig()
    return !!config.sseApiBaseUrl
  }

  async stream(request: ChatRequest, callbacks: ChatStreamCallbacks): Promise<void> {
    const config = getConfig()

    if (!config.sseApiBaseUrl) {
      callbacks.onError(new Error('SSE API base URL is not configured'))
      return
    }

    const url = `${config.sseApiBaseUrl}/chat/api/sse`
    const traceId = uuidv4()

    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'platform': 'c-wx',
          'trace-id': traceId,
          'token': config.sseApiToken,
        },
        body: JSON.stringify({
          conversationId: request.conversationId,
          messageType: request.messageType,
          content: request.content,
        }),
      })

      if (!upstream.ok) {
        callbacks.onError(new Error(`SSE upstream error: ${upstream.statusText}`))
        return
      }

      const reader = upstream.body?.getReader()
      if (!reader) {
        callbacks.onDone()
        return
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Parse SSE data lines
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5)
            if (data === '[Done]') {
              callbacks.onDone()
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                callbacks.onChunk(parsed.content)
              }
            } catch {
              // Not JSON, pass raw
              callbacks.onChunk(data)
            }
          }
        }
      }

      callbacks.onDone()
    } catch (err: any) {
      callbacks.onError(err)
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    let content = ''
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      this.stream(request, {
        onChunk: (text) => {
          content += text
        },
        onDone: () => {
          resolve({
            content,
            latencyMs: Date.now() - startTime,
          })
        },
        onError: (error) => {
          reject(error)
        },
      })
    })
  }
}
